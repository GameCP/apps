import React, { useState, useEffect } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, Container, PageHeader, useConfirmDialog, SkeletonItem } from '@gamecp/ui';
import { RiDiscordLine, RiAddLine, RiSave2Line } from 'react-icons/ri';
import useSWR, { mutate } from 'swr';
import { EventConfigCard } from './EventConfigCard';
import { WebhookCard } from './WebhookCard';
import {
    EVENT_DEFINITIONS,
    getDefaultEventConfigs,
    type AdminConfig,
    type EventType,
    type EventConfig,
    type WebhookConfig,
    ALL_EVENT_TYPES,
} from '../eventDefaults';

interface ServerSettingsPageProps {
    serverId: string;
}

export function ServerSettingsPage({ serverId }: ServerSettingsPageProps) {
    const { api, toast } = useGameCP();
    const { confirm, dialog } = useConfirmDialog();
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [overrides, setOverrides] = useState<Partial<Record<EventType, Partial<EventConfig>>>>({});
    const [showOverrides, setShowOverrides] = useState(false);

    // Fetch server webhooks
    const webhooksKey = `/api/x/discord-notifications/webhooks?serverId=${serverId}`;
    const { data: serverData, isLoading: loadingServer } = useSWR(webhooksKey, () => api.get(webhooksKey));

    // Fetch admin config for default templates
    const configKey = '/api/x/discord-notifications/config';
    const { data: adminData, isLoading: loadingAdmin } = useSWR(configKey, () => api.get(configKey));

    const adminConfig: AdminConfig | null = adminData?.config || null;
    const adminTemplates = adminConfig?.eventTemplates || getDefaultEventConfigs();

    // Initialize from server data
    useEffect(() => {
        if (serverData && !hasChanges) {
            setWebhooks(serverData.webhooks || []);
            setOverrides(serverData.eventOverrides || {});
            if (serverData.eventOverrides && Object.keys(serverData.eventOverrides).length > 0) {
                setShowOverrides(true);
            }
        }
    }, [serverData]);

    const addWebhook = () => {
        const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        const newWebhook: WebhookConfig = {
            id,
            url: '',
            label: '',
            events: [...ALL_EVENT_TYPES],
            createdAt: new Date().toISOString(),
        };
        setWebhooks([...webhooks, newWebhook]);
        setHasChanges(true);
    };

    const updateWebhook = (webhook: WebhookConfig) => {
        setWebhooks(webhooks.map(w => w.id === webhook.id ? webhook : w));
        setHasChanges(true);
    };

    const deleteWebhook = async (id: string) => {
        const confirmed = await confirm({
            title: 'Remove Webhook',
            message: 'Remove this webhook? Notifications will no longer be sent to this channel for this server.',
            confirmText: 'Remove',
            confirmButtonColor: 'danger',
        });
        if (!confirmed) return;
        setWebhooks(webhooks.filter(w => w.id !== id));
        setHasChanges(true);
    };

    const testWebhook = async (url: string) => {
        try {
            await api.post('/api/x/discord-notifications/test', { webhookUrl: url });
            toast.success('Test message sent!');
        } catch (err: any) {
            toast.error(err.error || 'Failed to send test message');
        }
    };

    const updateOverride = (eventType: EventType, config: EventConfig) => {
        setOverrides({ ...overrides, [eventType]: config });
        setHasChanges(true);
    };

    const clearOverride = (eventType: EventType) => {
        const next = { ...overrides };
        delete next[eventType];
        setOverrides(next);
        setHasChanges(true);
    };

    const handleSave = async () => {
        // Validate
        const invalidWebhooks = webhooks.filter(w => !w.url.trim());
        if (invalidWebhooks.length > 0) {
            toast.warning('Some webhooks are missing URLs. Please fill them in or remove them.');
            return;
        }

        setSaving(true);
        try {
            // Save webhooks individually
            // Actually, let's save the whole config at once via overrides endpoint
            // First delete all existing webhooks
            if (serverData?.webhooks) {
                for (const w of serverData.webhooks) {
                    await api.delete('/api/x/discord-notifications/webhooks', {
                        serverId,
                        webhookId: w.id,
                    });
                }
            }

            // Add all current webhooks
            for (const w of webhooks) {
                await api.post('/api/x/discord-notifications/webhooks', {
                    serverId,
                    webhook: w,
                });
            }

            // Save overrides
            await api.put('/api/x/discord-notifications/overrides', {
                serverId,
                eventOverrides: showOverrides ? overrides : {},
            });

            toast.success('Server notification settings saved!');
            setHasChanges(false);
            mutate(webhooksKey);
        } catch (err: any) {
            toast.error(err.error || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const loading = loadingServer || loadingAdmin;

    // Group events by category
    const statusEvents = EVENT_DEFINITIONS.filter(d => d.category === 'status');
    const playerEvents = EVENT_DEFINITIONS.filter(d => d.category === 'players');
    const lifecycleEvents = EVENT_DEFINITIONS.filter(d => d.category === 'lifecycle');

    if (loading) {
        return (
            <Container padding="lg" className="space-y-6">
                <PageHeader
                    title="Discord Notifications"
                    subtitle="Configure notifications for this server"
                    size="md"
                />
                <div className="space-y-4">
                    <Card title="Your Webhooks" padding="lg">
                        <div className="space-y-3 mt-4">
                            {[1, 2].map(i => (
                                <SkeletonItem key={i} width="w-full" height="h-14" />
                            ))}
                        </div>
                    </Card>
                </div>
            </Container>
        );
    }

    return (
        <Container padding="lg" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <PageHeader
                    title="Discord Notifications"
                    subtitle="Configure Discord notifications for this server"
                    size="md"
                />
                <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={saving}
                    disabled={!hasChanges}
                >
                    <RiSave2Line className="w-4 h-4 mr-1.5" />
                    Save Changes
                </Button>
            </div>

            {/* Admin webhooks info */}
            {adminConfig && adminConfig.webhooks.length > 0 && (
                <div className="bg-info/5 border border-info/20 rounded-lg px-4 py-3 text-sm text-foreground">
                    <span className="font-medium">Global Webhooks Active:</span>{' '}
                    <span className="text-muted-foreground">
                        {adminConfig.webhooks.length} admin webhook{adminConfig.webhooks.length !== 1 ? 's' : ''} will also fire for this server.
                        Add server-specific webhooks below for additional channels.
                    </span>
                </div>
            )}

            {/* Server Webhooks */}
            <Card
                title="Server Webhooks"
                description="Add webhook channels specific to this server. These are in addition to any global admin webhooks."
                icon={RiDiscordLine}
                iconColor="info"
                padding="lg"
            >
                <div className="space-y-3 mt-4">
                    {webhooks.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                            <RiDiscordLine className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No server-specific webhooks</p>
                            <p className="text-xs mt-1">
                                {adminConfig && adminConfig.webhooks.length > 0
                                    ? 'Global webhooks are active. Add server-specific channels for additional routing.'
                                    : 'Add a channel to start receiving notifications for this server.'}
                            </p>
                        </div>
                    )}

                    {webhooks.map((webhook) => (
                        <WebhookCard
                            key={webhook.id}
                            webhook={webhook}
                            onUpdate={updateWebhook}
                            onDelete={deleteWebhook}
                            onTest={testWebhook}
                        />
                    ))}

                    <Button
                        variant="secondary"
                        onClick={addWebhook}
                        className="w-full"
                    >
                        <RiAddLine className="w-4 h-4 mr-1.5" />
                        Add Webhook Channel
                    </Button>
                </div>
            </Card>

            {/* Template Overrides */}
            <Card
                title="Template Overrides"
                description="Optionally customize how notifications look for this server. Unmodified events use the admin defaults."
                padding="lg"
            >
                <div className="mt-4">
                    {!showOverrides ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground mb-3">
                                Using default notification templates from admin settings
                            </p>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    // Initialize overrides with admin templates so user can edit
                                    const init: Record<string, EventConfig> = {};
                                    for (const def of EVENT_DEFINITIONS) {
                                        init[def.key] = { ...adminTemplates[def.key] };
                                    }
                                    setOverrides(init);
                                    setShowOverrides(true);
                                }}
                            >
                                Customize Templates
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setOverrides({});
                                        setShowOverrides(false);
                                        setHasChanges(true);
                                    }}
                                >
                                    Reset All to Defaults
                                </Button>
                            </div>

                            {/* Server Status */}
                            <div>
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                    Server Status
                                </h4>
                                <div className="space-y-2">
                                    {statusEvents.map(def => (
                                        <EventConfigCard
                                            key={def.key}
                                            definition={def}
                                            config={(overrides[def.key] as EventConfig) || adminTemplates[def.key]}
                                            onChange={(c) => updateOverride(def.key, c)}
                                            isOverride
                                            adminDefault={adminTemplates[def.key]}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Players */}
                            <div>
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                    Players
                                </h4>
                                <div className="space-y-2">
                                    {playerEvents.map(def => (
                                        <EventConfigCard
                                            key={def.key}
                                            definition={def}
                                            config={(overrides[def.key] as EventConfig) || adminTemplates[def.key]}
                                            onChange={(c) => updateOverride(def.key, c)}
                                            isOverride
                                            adminDefault={adminTemplates[def.key]}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Lifecycle */}
                            <div>
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                    Lifecycle
                                </h4>
                                <div className="space-y-2">
                                    {lifecycleEvents.map(def => (
                                        <EventConfigCard
                                            key={def.key}
                                            definition={def}
                                            config={(overrides[def.key] as EventConfig) || adminTemplates[def.key]}
                                            onChange={(c) => updateOverride(def.key, c)}
                                            isOverride
                                            adminDefault={adminTemplates[def.key]}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {dialog}
        </Container>
    );
}
