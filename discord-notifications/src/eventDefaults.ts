/**
 * Discord Notification Event Defaults & Types
 * Defines all supported events, their default templates, and available variables
 */

export interface EventConfig {
    enabled: boolean;
    title: string;
    description: string;
    color: string; // Hex color e.g. '#00ff00'
}

export type EventType =
    | 'server.status.started'
    | 'server.status.stopped'
    | 'server.status.crash'
    | 'server.player.join'
    | 'server.player.leave'
    | 'server.lifecycle.created'
    | 'server.lifecycle.deleted';

export interface WebhookConfig {
    id: string;
    url: string;
    label: string;
    events: EventType[];
    createdAt?: string;
}

export interface EventDefinition {
    key: EventType;
    label: string;
    category: 'status' | 'players' | 'lifecycle';
    defaultConfig: EventConfig;
    availableVars: string[];
    varDescriptions: Record<string, string>;
}

export interface AdminConfig {
    eventTemplates: Record<EventType, EventConfig>;
    webhooks: WebhookConfig[];
}

export interface ServerConfig {
    webhooks: WebhookConfig[];
    eventOverrides?: Partial<Record<EventType, Partial<EventConfig>>>;
}

/**
 * Template variable interpolation
 * Replaces {{varName}} with actual values from the payload
 */
export function interpolateTemplate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return vars[key] !== undefined ? vars[key] : match;
    });
}

/**
 * Generate a short random ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// ─── Common variable sets ──────────────────────────────────────────────────

const COMMON_SERVER_VARS = ['serverName', 'serverId', 'gameGroup', 'ip', 'port', 'address', 'nodeName', 'timestamp'];

const COMMON_SERVER_VAR_DESCRIPTIONS: Record<string, string> = {
    serverName: 'Name of the game server',
    serverId: 'Unique server identifier',
    gameGroup: 'Game type (e.g. minecraft-java, csgo)',
    ip: 'Server IP address',
    port: 'Server primary port',
    address: 'Full connection address (IP:Port)',
    nodeName: 'Name of the hosting node',
    timestamp: 'Time of the event',
};

/**
 * All supported events with defaults and variable definitions
 */
export const EVENT_DEFINITIONS: EventDefinition[] = [
    {
        key: 'server.status.started',
        label: 'Server Started',
        category: 'status',
        defaultConfig: {
            enabled: true,
            title: '🟢 Server Started',
            description: '**{{serverName}}** is now online\n\n**Address:** `{{address}}`',
            color: '#00ff00',
        },
        availableVars: COMMON_SERVER_VARS,
        varDescriptions: COMMON_SERVER_VAR_DESCRIPTIONS,
    },
    {
        key: 'server.status.stopped',
        label: 'Server Stopped',
        category: 'status',
        defaultConfig: {
            enabled: true,
            title: '🟡 Server Stopped',
            description: '**{{serverName}}** has been stopped',
            color: '#ffa500',
        },
        availableVars: COMMON_SERVER_VARS,
        varDescriptions: COMMON_SERVER_VAR_DESCRIPTIONS,
    },
    {
        key: 'server.status.crash',
        label: 'Server Crashed',
        category: 'status',
        defaultConfig: {
            enabled: true,
            title: '🔴 Server Crashed',
            description: '**{{serverName}}** has crashed\n\n**Reason:** {{crashReason}}\n**Exit Code:** {{exitCode}}',
            color: '#ff0000',
        },
        availableVars: [...COMMON_SERVER_VARS, 'crashReason', 'exitCode'],
        varDescriptions: {
            ...COMMON_SERVER_VAR_DESCRIPTIONS,
            crashReason: 'Reason for the crash',
            exitCode: 'Process exit code',
        },
    },
    {
        key: 'server.player.join',
        label: 'Player Joined',
        category: 'players',
        defaultConfig: {
            enabled: true,
            title: '📥 Player Joined',
            description: '**{{playerName}}** joined **{{serverName}}**',
            color: '#5865f2',
        },
        availableVars: [...COMMON_SERVER_VARS, 'playerName'],
        varDescriptions: {
            ...COMMON_SERVER_VAR_DESCRIPTIONS,
            playerName: 'Name of the player',
        },
    },
    {
        key: 'server.player.leave',
        label: 'Player Left',
        category: 'players',
        defaultConfig: {
            enabled: true,
            title: '📤 Player Left',
            description: '**{{playerName}}** left **{{serverName}}**',
            color: '#99aab5',
        },
        availableVars: [...COMMON_SERVER_VARS, 'playerName'],
        varDescriptions: {
            ...COMMON_SERVER_VAR_DESCRIPTIONS,
            playerName: 'Name of the player',
        },
    },
    {
        key: 'server.lifecycle.created',
        label: 'Server Created',
        category: 'lifecycle',
        defaultConfig: {
            enabled: true,
            title: '🆕 Server Created',
            description: 'A new server **{{serverName}}** has been created\n\n**Game:** {{gameName}}\n**Node:** {{nodeName}}',
            color: '#57f287',
        },
        availableVars: [...COMMON_SERVER_VARS, 'gameName', 'ownerName'],
        varDescriptions: {
            ...COMMON_SERVER_VAR_DESCRIPTIONS,
            gameName: 'Name of the game template',
            ownerName: 'Email/name of the server owner',
        },
    },
    {
        key: 'server.lifecycle.deleted',
        label: 'Server Deleted',
        category: 'lifecycle',
        defaultConfig: {
            enabled: true,
            title: '🗑️ Server Deleted',
            description: 'Server **{{serverName}}** has been deleted',
            color: '#ed4245',
        },
        availableVars: COMMON_SERVER_VARS,
        varDescriptions: COMMON_SERVER_VAR_DESCRIPTIONS,
    },
];

/**
 * Get default configs for all events as a Record
 */
export function getDefaultEventConfigs(): Record<EventType, EventConfig> {
    const configs: Record<string, EventConfig> = {};
    for (const def of EVENT_DEFINITIONS) {
        configs[def.key] = { ...def.defaultConfig };
    }
    return configs as Record<EventType, EventConfig>;
}

/**
 * All event type keys
 */
export const ALL_EVENT_TYPES: EventType[] = EVENT_DEFINITIONS.map(d => d.key);

/**
 * Default admin config
 */
export function getDefaultAdminConfig(): AdminConfig {
    return {
        eventTemplates: getDefaultEventConfigs(),
        webhooks: [],
    };
}
