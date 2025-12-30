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
  serverId: string;
  isLegacy?: boolean;
  createdAt?: Date;
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

/**
 * Save Discord webhook URL
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

  // Save to database
  await ctx.db.collection('webhooks').insertOne({
    serverId,
    url: webhookUrl,
    createdAt: new Date(),
  });

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

  await ctx.db.collection('webhooks').deleteOne({
    serverId,
    url: webhookUrl,
  });

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
  let webhooks: Webhook[] = await ctx.db.collection("webhooks").find({ serverId }).toArray();

  // Self-migration/Legacy support: If no webhooks in DB but we have a legacy config URL, return it
  if (webhooks.length === 0 && ctx.config.webhookUrl) {
    webhooks = [{
      url: ctx.config.webhookUrl,
      serverId,
      isLegacy: true
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

  // Get webhooks via our own helper logic to ensure we include legacy
  const webhooksRes = await getWebhooks({ ...ctx, request: { ...ctx.request, query: { serverId } } });
  const webhooks = webhooksRes.body.webhooks as Webhook[];

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
  const webhooksRes = await getWebhooks({ ...ctx, request: { ...ctx.request, query: { serverId } } });
  const webhooks = webhooksRes.body.webhooks as Webhook[];

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

  await ctx.db.collection("logs").insertOne({
    serverId,
    event: "crash",
    timestamp: new Date(),
    payload
  });
};

/**
 * Handle server start event
 */
export const handleStart: TypedEventHandler<'server.status.started'> = async (event, payload, ctx) => {
  const { serverId, serverName } = payload;
  const webhooksRes = await getWebhooks({ ...ctx, request: { ...ctx.request, query: { serverId } } });
  const webhooks = webhooksRes.body.webhooks as Webhook[];

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
  const webhooksRes = await getWebhooks({ ...ctx, request: { ...ctx.request, query: { serverId } } });
  const webhooks = webhooksRes.body.webhooks as Webhook[];

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
