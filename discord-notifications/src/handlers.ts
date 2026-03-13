import type {
  ExtensionContext,
  ApiRouteHandler,
  TypedEventHandler,
  ServerCrashPayload,
  ServerStartPayload,
  ServerStopPayload,
  PlayerJoinPayload,
  PlayerLeavePayload,
  ServerCreatedPayload,
  ServerDeletedPayload,
} from '@gamecp/types';

import {
  type AdminConfig,
  type ServerConfig,
  type EventType,
  type EventConfig,
  type WebhookConfig,
  getDefaultAdminConfig,
  interpolateTemplate,
  EVENT_DEFINITIONS,
} from './eventDefaults';

// ─── Helpers ───────────────────────────────────────────────────────────────

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  timestamp: string;
  fields?: Array<{ name: string; value: string; inline: boolean }>;
}

interface DiscordMessage {
  embeds: DiscordEmbed[];
}

/** Convert hex color string to integer for Discord */
function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

/** Get admin-level config from extension DB */
async function getAdminConfig(ctx: ExtensionContext): Promise<AdminConfig> {
  try {
    const doc = await ctx.db.collection('config').findOne({ _id: 'global' });
    if (doc) {
      return doc as AdminConfig;
    }
  } catch (e) {
    ctx.logger.error(`[getAdminConfig] Error: ${e}`);
  }
  return getDefaultAdminConfig();
}

/** Save admin-level config to extension DB */
async function saveAdminConfig(ctx: ExtensionContext, config: AdminConfig): Promise<void> {
  const existing = await ctx.db.collection('config').findOne({ _id: 'global' });
  if (existing) {
    const { _id, ...configWithoutId } = config as any;
    await ctx.db.collection('config').updateOne({ _id: 'global' }, { $set: configWithoutId });
  } else {
    await ctx.db.collection('config').insertOne({ _id: 'global', ...config });
  }
}

/** Get server-level config from extension DB (no loopback API needed) */
async function getServerConfig(ctx: ExtensionContext, serverId: string): Promise<ServerConfig> {
  try {
    // First try direct DB (works in event handlers where API might not be reachable)
    const doc = await ctx.db.collection('server_configs').findOne({ serverId });
    if (doc) {
      return doc as ServerConfig;
    }
  } catch (e) {
    ctx.logger.error(`[getServerConfig] DB fallback error: ${e}`);
  }

  // Fallback: try API (works when called from API routes with proper context)
  try {
    const response = await ctx.api.get(`/api/game-servers/${serverId}/extension-data/discord-notifications`);
    const data = response.data?.data || { webhooks: [] };
    return data as ServerConfig;
  } catch (e) {
    ctx.logger.warn(`[getServerConfig] API fallback also failed for ${serverId}: ${e}`);
  }

  return { webhooks: [] };
}

/** Save server-level config - saves to both extension DB and extensionData */
async function saveServerConfig(ctx: ExtensionContext, serverId: string, config: ServerConfig): Promise<void> {
  // Save to extension DB (used by event handlers)
  const existing = await ctx.db.collection('server_configs').findOne({ serverId });
  if (existing) {
    const { _id, ...configWithoutId } = config as any;
    await ctx.db.collection('server_configs').updateOne({ serverId }, { $set: { ...configWithoutId, serverId } });
  } else {
    await ctx.db.collection('server_configs').insertOne({ serverId, ...config });
  }

  // Also save to extensionData (used by server page)
  try {
    await ctx.api.put(`/api/game-servers/${serverId}/extension-data/discord-notifications`, {
      data: config,
    });
  } catch (e) {
    ctx.logger.warn(`[saveServerConfig] Could not sync to extensionData: ${e}`);
  }
}

/** Send a Discord embed message */
async function sendDiscordMessage(ctx: ExtensionContext, webhookUrl: string, payload: DiscordMessage): Promise<void> {
  const response = await ctx.http.post(webhookUrl, payload);
  if (response.status >= 400) {
    throw new Error(`Discord API error: ${response.status}`);
  }
}

/**
 * Resolve the final template for an event:
 * hardcoded defaults → admin template → server override
 */
function resolveTemplate(
  eventType: EventType,
  adminConfig: AdminConfig,
  serverConfig: ServerConfig
): EventConfig {
  const definition = EVENT_DEFINITIONS.find(d => d.key === eventType);
  const baseDefaults = definition?.defaultConfig || { enabled: true, title: '', description: '', color: '#ffffff' };
  const adminTemplate = adminConfig.eventTemplates?.[eventType] || {};
  const serverOverride = serverConfig.eventOverrides?.[eventType] || {};

  return {
    ...baseDefaults,
    ...adminTemplate,
    ...serverOverride,
  } as EventConfig;
}

/**
 * Core event dispatch: find all webhooks (admin + server) that subscribe to this event,
 * resolve the template, interpolate variables, and send.
 */
async function dispatchEvent(
  ctx: ExtensionContext,
  eventType: EventType,
  serverId: string,
  vars: Record<string, string>
): Promise<void> {
  const adminConfig = await getAdminConfig(ctx);
  const serverConfig = await getServerConfig(ctx, serverId);
  const template = resolveTemplate(eventType, adminConfig, serverConfig);

  if (!template.enabled) {
    ctx.logger.info(`[dispatchEvent] Event ${eventType} is disabled, skipping`);
    return;
  }

  // Collect all webhooks that subscribe to this event, deduplicating by URL
  // Server webhooks take priority over admin webhooks for the same URL
  const adminWebhooks = (adminConfig.webhooks || []).filter(w => w.events?.includes(eventType));
  const serverWebhooks = (serverConfig.webhooks || []).filter(w => w.events?.includes(eventType));
  const seen = new Set<string>();
  const allWebhooks: typeof adminWebhooks = [];

  // Add server webhooks first (higher priority)
  for (const w of serverWebhooks) {
    if (!seen.has(w.url)) {
      seen.add(w.url);
      allWebhooks.push(w);
    }
  }
  // Add admin webhooks only if URL not already covered
  for (const w of adminWebhooks) {
    if (!seen.has(w.url)) {
      seen.add(w.url);
      allWebhooks.push(w);
    }
  }

  if (allWebhooks.length === 0) {
    ctx.logger.info(`[dispatchEvent] No webhooks for ${eventType} on server ${serverId}`);
    return;
  }

  const title = interpolateTemplate(template.title, vars);
  const description = interpolateTemplate(template.description, vars);

  const message: DiscordMessage = {
    embeds: [{
      title,
      description,
      color: hexToInt(template.color),
      timestamp: new Date().toISOString(),
    }],
  };

  for (const webhook of allWebhooks) {
    try {
      await sendDiscordMessage(ctx, webhook.url, message);
    } catch (e) {
      ctx.logger.error(`[dispatchEvent] Failed to send to ${webhook.label}: ${e}`);
    }
  }
}

// ─── Admin Config API Routes ───────────────────────────────────────────────

/** GET /config - Get admin global config */
export const getConfig: ApiRouteHandler = async (ctx) => {
  const config = await getAdminConfig(ctx);
  return { status: 200, body: { config } };
};

/** PUT /config - Save admin global config */
export const saveConfig: ApiRouteHandler = async (ctx) => {
  const { config } = ctx.request.body;
  if (!config) {
    return { status: 400, body: { error: 'Missing config' } };
  }
  await saveAdminConfig(ctx, config);
  return { status: 200, body: { message: 'Configuration saved' } };
};

// ─── Webhook API Routes (per-server) ──────────────────────────────────────

/** GET /webhooks - Get server webhooks */
export const getWebhooks: ApiRouteHandler = async (ctx) => {
  const { serverId } = ctx.request.query;
  const config = await getServerConfig(ctx, serverId);
  return {
    status: 200,
    body: {
      webhooks: config.webhooks || [],
      eventOverrides: config.eventOverrides || {},
    },
  };
};

/** POST /webhooks - Add a webhook to a server */
export const saveWebhook: ApiRouteHandler = async (ctx) => {
  const { serverId, webhook } = ctx.request.body;

  // Validate URL
  const url = webhook?.url?.trim() || '';
  const isValid = url && (
    url.startsWith('https://discord.com/api/webhooks/') ||
    url.startsWith('https://canary.discord.com/api/webhooks/') ||
    url.startsWith('https://ptb.discord.com/api/webhooks/') ||
    url.startsWith('https://discordapp.com/api/webhooks/')
  );

  if (!isValid) {
    return { status: 400, body: { error: 'Invalid Discord webhook URL' } };
  }

  const config = await getServerConfig(ctx, serverId);
  config.webhooks = config.webhooks || [];

  // If webhook has an id, update it; otherwise add new
  if (webhook.id) {
    const idx = config.webhooks.findIndex((w: WebhookConfig) => w.id === webhook.id);
    if (idx >= 0) {
      config.webhooks[idx] = { ...config.webhooks[idx], ...webhook, url };
    } else {
      config.webhooks.push({ ...webhook, url, createdAt: new Date().toISOString() });
    }
  } else {
    const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    config.webhooks.push({ ...webhook, id, url, createdAt: new Date().toISOString() });
  }

  await saveServerConfig(ctx, serverId, config);
  return { status: 200, body: { message: 'Webhook saved' } };
};

/** DELETE /webhooks - Remove a webhook from a server */
export const deleteWebhook: ApiRouteHandler = async (ctx) => {
  const { serverId, webhookId } = ctx.request.body;
  const config = await getServerConfig(ctx, serverId);
  config.webhooks = (config.webhooks || []).filter((w: WebhookConfig) => w.id !== webhookId);
  await saveServerConfig(ctx, serverId, config);
  return { status: 200, body: { message: 'Webhook removed' } };
};

/** PUT /overrides - Save per-server event template overrides */
export const saveOverrides: ApiRouteHandler = async (ctx) => {
  const { serverId, eventOverrides } = ctx.request.body;
  const config = await getServerConfig(ctx, serverId);
  config.eventOverrides = eventOverrides || {};
  await saveServerConfig(ctx, serverId, config);
  return { status: 200, body: { message: 'Overrides saved' } };
};

/** POST /test - Send test message */
export const testWebhook: ApiRouteHandler = async (ctx) => {
  const { webhookUrl } = ctx.request.body;

  if (!webhookUrl) {
    return { status: 400, body: { error: 'No webhook URL provided' } };
  }

  await sendDiscordMessage(ctx, webhookUrl, {
    embeds: [{
      title: '🧪 Test Message',
      description: 'Discord notifications are working correctly!',
      color: 0x5865f2,
      timestamp: new Date().toISOString(),
    }],
  });

  return { status: 200, body: { message: 'Test message sent' } };
};

// ─── Event Handlers ────────────────────────────────────────────────────────

/**
 * Extract all available template vars from event payload
 * Automatically converts all fields to strings and builds composite vars
 */
function extractVars(payload: Record<string, any>): Record<string, string> {
  const vars: Record<string, string> = {};

  // Extract all string-coercible fields from the payload
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;
    if (value instanceof Date) {
      vars[key] = value.toLocaleString();
    } else if (typeof value === 'object') {
      continue; // Skip nested objects
    } else {
      vars[key] = String(value);
    }
  }

  // Build composite address var (ip:port)
  if (vars.ip && vars.port) {
    vars.address = `${vars.ip}:${vars.port}`;
  } else if (vars.ip) {
    vars.address = vars.ip;
  }

  // Ensure timestamp is always present
  if (!vars.timestamp) {
    vars.timestamp = new Date().toLocaleString();
  }

  return vars;
}

export const handleStart: TypedEventHandler<'server.status.started'> = async (event, payload, ctx) => {
  const vars = extractVars(payload as any);
  await dispatchEvent(ctx, 'server.status.started', payload.serverId, vars);
};

export const handleStop: TypedEventHandler<'server.status.stopped'> = async (event, payload, ctx) => {
  const vars = extractVars(payload as any);
  await dispatchEvent(ctx, 'server.status.stopped', payload.serverId, vars);
};

export const handleCrash: TypedEventHandler<'server.status.crash'> = async (event, payload, ctx) => {
  const vars = extractVars(payload as any);
  if (!vars.crashReason) vars.crashReason = 'Unknown';
  if (!vars.exitCode) vars.exitCode = 'N/A';
  await dispatchEvent(ctx, 'server.status.crash', payload.serverId, vars);
};

export const handlePlayerJoin: TypedEventHandler<'server.player.join'> = async (event, payload, ctx) => {
  const vars = extractVars(payload as any);
  await dispatchEvent(ctx, 'server.player.join', payload.serverId, vars);
};

export const handlePlayerLeave: TypedEventHandler<'server.player.leave'> = async (event, payload, ctx) => {
  const vars = extractVars(payload as any);
  await dispatchEvent(ctx, 'server.player.leave', payload.serverId, vars);
};

export const handleServerCreated: TypedEventHandler<'server.lifecycle.created'> = async (event, payload, ctx) => {
  const vars = extractVars(payload as any);
  await dispatchEvent(ctx, 'server.lifecycle.created', payload.serverId, vars);
};

export const handleServerDeleted: TypedEventHandler<'server.lifecycle.deleted'> = async (event, payload, ctx) => {
  const vars = extractVars(payload as any);
  await dispatchEvent(ctx, 'server.lifecycle.deleted', payload.serverId, vars);
};
