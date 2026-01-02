import type {
  ExtensionContext,
  ApiRouteHandler,
  TypedEventHandler,
  ServerCrashPayload,
  ServerStartPayload,
  ServerStopPayload
} from '@gamecp/types';

// Extension-specific types
interface Webhook {
  url: string;
  createdAt?: string;
}

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  timestamp: string;
  fields?: Array<{
    name: string;
    value: string;
    inline: boolean;
  }>;
}

interface DiscordMessage {
  embeds: DiscordEmbed[];
}

interface DiscordExtensionData {
  webhooks: Webhook[];
  logs?: Array<{
    event: string;
    timestamp: string;
    payload: any;
  }>;
}

/**
 * Get extension data for a server
 */
async function getExtensionData(ctx: ExtensionContext, serverId: string): Promise<DiscordExtensionData> {
  try {
    const response = await ctx.api.get(`/api/game-servers/${serverId}/extension-data/discord-notifications`);
    return response.data || { webhooks: [] };
  } catch (error) {
    return { webhooks: [] };
  }
}

/**
 * Save extension data for a server
 */
async function saveExtensionData(ctx: ExtensionContext, serverId: string, data: DiscordExtensionData): Promise<void> {
  await ctx.api.put(`/api/game-servers/${serverId}/extension-data/discord-notifications`, {
    data
  });
}

/**
 * Save Discord webhook URL
 * Stores in server.extensionData['discord-notifications']
 */
export const saveWebhook: ApiRouteHandler = async (ctx) => {
  const { serverId, webhookUrl } = ctx.request.body;

  // Validate webhook URL
  const trimmedUrl = webhookUrl ? webhookUrl.trim() : '';
  const isValid = trimmedUrl && (
    trimmedUrl.startsWith('https://discord.com/api/webhooks/') ||
    trimmedUrl.startsWith('https://canary.discord.com/api/webhooks/') ||
    trimmedUrl.startsWith('https://ptb.discord.com/api/webhooks/') ||
    trimmedUrl.startsWith('https://discordapp.com/api/webhooks/')
  );

  if (!isValid) {
    return {
      status: 400,
      body: {
        error: 'Invalid Discord webhook URL',
        details: `Received: ${trimmedUrl}`
      },
    };
  }

  // Get existing data
  const data = await getExtensionData(ctx, serverId);
  
  // Add new webhook
  data.webhooks = data.webhooks || [];
  data.webhooks.push({
    url: trimmedUrl,
    createdAt: new Date().toISOString()
  });
  
  // Save back
  await saveExtensionData(ctx, serverId, data);

  return {
    status: 200,
    body: { message: 'Webhook saved successfully' },
  };
};

/**
 * Remove configured webhook
 */
export const deleteWebhook: ApiRouteHandler = async (ctx) => {
  const { serverId, webhookUrl } = ctx.request.body;

  // Get existing data
  const data = await getExtensionData(ctx, serverId);
  
  // Remove webhook
  data.webhooks = (data.webhooks || []).filter(w => w.url !== webhookUrl);
  
  // Save back
  await saveExtensionData(ctx, serverId, data);

  return {
    status: 200,
    body: { message: 'Webhook removed successfully' },
  };
};

/**
 * Get configured webhooks
 */
export const getWebhooks: ApiRouteHandler = async (ctx) => {
  const { serverId } = ctx.request.query;
  
  const data = await getExtensionData(ctx, serverId);
  let webhooks = data.webhooks || [];

  // Legacy support: If no webhooks but we have a legacy config URL, return it
  if (webhooks.length === 0 && ctx.config.webhookUrl) {
    webhooks = [{
      url: ctx.config.webhookUrl,
      createdAt: new Date().toISOString()
    }];
  }

  return {
    status: 200,
    body: { webhooks }
  };
};

/**
 * Send test message to Discord
 */
export const testWebhook: ApiRouteHandler = async (ctx) => {
  const { serverId } = ctx.request.body;

  // Get webhooks
  const data = await getExtensionData(ctx, serverId);
  const webhooks = data.webhooks || [];

  if (webhooks.length === 0) {
    return {
      status: 404,
      body: { error: "No webhooks configured" }
    };
  }

  for (const webhook of webhooks) {
    await sendDiscordMessage(ctx, webhook.url, {
      embeds: [{
        title: "🧪 Test Message",
        description: "Discord notifications are working correctly!",
        color: 0x00ff00,
        timestamp: (new Date()).toISOString()
      }]
    });
  }

  return {
    status: 200,
    body: { message: "Test message sent" }
  };
};

/**
 * Handle server crash event
 */
export const handleCrash: TypedEventHandler<'server.status.crash'> = async (event, payload, ctx) => {
  const { serverId, serverName, crashReason } = payload;
  const data = await getExtensionData(ctx, serverId);
  const webhooks = data.webhooks || [];

  for (const webhook of webhooks) {
    await sendDiscordMessage(ctx, webhook.url, {
      embeds: [{
        title: "🔴 Server Crashed",
        description: `**${serverName}** has crashed`,
        fields: [
          { name: "Reason", value: crashReason || "Unknown", inline: false },
          { name: "Time", value: (new Date()).toLocaleString(), inline: true }
        ],
        color: 0xff0000,
        timestamp: (new Date()).toISOString()
      }]
    });
  }
};

/**
 * Handle server start event
 */
export const handleStart: TypedEventHandler<'server.status.started'> = async (event, payload, ctx) => {
  const { serverId, serverName } = payload;
  const data = await getExtensionData(ctx, serverId);
  const webhooks = data.webhooks || [];

  for (const webhook of webhooks) {
    await sendDiscordMessage(ctx, webhook.url, {
      embeds: [{
        title: "🟢 Server Started",
        description: `**${serverName}** is now online`,
        color: 0x00ff00,
        timestamp: (new Date()).toISOString()
      }]
    });
  }
};

/**
 * Handle server stop event
 */
export const handleStop: TypedEventHandler<'server.status.stopped'> = async (event, payload, ctx) => {
  const { serverId, serverName } = payload;
  const data = await getExtensionData(ctx, serverId);
  const webhooks = data.webhooks || [];

  for (const webhook of webhooks) {
    await sendDiscordMessage(ctx, webhook.url, {
      embeds: [{
        title: "🟡 Server Stopped",
        description: `**${serverName}** has been stopped`,
        color: 0xffa500,
        timestamp: (new Date()).toISOString()
      }]
    });
  }
};

/**
 * Helper: Send message to Discord webhook
 */
async function sendDiscordMessage(ctx: ExtensionContext, webhookUrl: string, payload: DiscordMessage): Promise<void> {
  // Use ctx.http (axios wrapper) which is permission-enforced
  const response = await ctx.http.post(webhookUrl, payload);

  if (response.status >= 400) {
    throw new Error(`Discord API error: ${response.status}`);
  }
}

