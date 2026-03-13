import React, { useState, useEffect } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, Container, PageHeader, Badge, useConfirmDialog, SkeletonItem } from '@gamecp/ui';
import { RiDiscordLine, RiAddLine, RiSave2Line } from 'react-icons/ri';
import useSWR, { mutate } from 'swr';
import { EventConfigCard } from './EventConfigCard';
import { WebhookCard } from './WebhookCard';
import {
    EVENT_DEFINITIONS,
    getDefaultAdminConfig,
    type AdminConfig,
    type EventType,
    type EventConfig,
    type WebhookConfig,
    ALL_EVENT_TYPES,
} from '../eventDefaults';

export function AdminSettingsPage() {
    const { api, toast } = useGameCP();
    const { confirm, dialog } = useConfirmDialog();
    const [saving, setSaving] = useState(false);
    const [localConfig, setLocalConfig] = useState<AdminConfig | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch admin config
    const configKey = '/api/x/discord-notifications/config';
    const { data, isLoading } = useSWR<{ config: AdminConfig }>(configKey, () => api.get(configKey));

    // Initialize local state from fetched data
    useEffect(() => {
        if (data?.config && !localConfig) {
            // Merge with defaults to ensure all event types are present
            const defaults = getDefaultAdminConfig();
            const merged: AdminConfig = {
                eventTemplates: { ...defaults.eventTemplates, ...data.config.eventTemplates },
                webhooks: data.config.webhooks || [],
            };
            setLocalConfig(merged);
        }
    }, [data]);

    // Use defaults while loading
    const config = localConfig || getDefaultAdminConfig();

    const updateTemplate = (eventType: EventType, eventConfig: EventConfig) => {
        if (!localConfig) return;
        setLocalConfig({
            ...localConfig,
            eventTemplates: {
                ...localConfig.eventTemplates,
                [eventType]: eventConfig,
            },
        });
        setHasChanges(true);
    };

    const updateWebhook = (webhook: WebhookConfig) => {
        if (!localConfig) return;
        const webhooks = localConfig.webhooks.map(w => w.id === webhook.id ? webhook : w);
        setLocalConfig({ ...localConfig, webhooks });
        setHasChanges(true);
    };

    const addWebhook = () => {
        if (!localConfig) return;
        const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        const newWebhook: WebhookConfig = {
            id,
            url: '',
            label: '',
            events: [...ALL_EVENT_TYPES],
            createdAt: new Date().toISOString(),
        };
        setLocalConfig({
            ...localConfig,
            webhooks: [...localConfig.webhooks, newWebhook],
        });
        setHasChanges(true);
    };

    const deleteWebhook = async (id: string) => {
        const confirmed = await confirm({
            title: 'Remove Webhook',
            message: 'Are you sure you want to remove this webhook? Notifications will no longer be sent to this channel.',
            confirmText: 'Remove',
            confirmButtonColor: 'danger',
        });
        if (!confirmed || !localConfig) return;
        setLocalConfig({
            ...localConfig,
            webhooks: localConfig.webhooks.filter(w => w.id !== id),
        });
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

    const handleSave = async () => {
        if (!localConfig) return;

        // Validate webhooks have URLs
        const invalidWebhooks = localConfig.webhooks.filter(w => !w.url.trim());
        if (invalidWebhooks.length > 0) {
            toast.warning('Some webhooks are missing URLs. Please fill them in or remove them.');
            return;
        }

        setSaving(true);
        try {
            await api.put('/api/x/discord-notifications/config', { config: localConfig });
            toast.success('Configuration saved!');
            setHasChanges(false);
            mutate(configKey);
        } catch (err: any) {
            toast.error(err.error || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    // Group events by category for organized display
    const statusEvents = EVENT_DEFINITIONS.filter(d => d.category === 'status');
    const playerEvents = EVENT_DEFINITIONS.filter(d => d.category === 'players');
    const lifecycleEvents = EVENT_DEFINITIONS.filter(d => d.category === 'lifecycle');

    if (isLoading) {
        return (
            <Container padding="lg" className="space-y-6">
                <PageHeader
                    title="Discord Notifications"
                    subtitle="Configure global notification templates and webhook routing"
                    size="md"
                />
                <div className="space-y-4">
                    <Card title="Event Templates" padding="lg">
                        <div className="space-y-3 mt-4">
                            {[1, 2, 3].map(i => (
                                <SkeletonItem key={i} width="w-full" height="h-14" />
                            ))}
                        </div>
                    </Card>
                    <Card title="Webhook Channels" padding="lg">
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
                    subtitle="Configure global notification templates and webhook routing for all servers"
                    size="md"
                />
                <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={saving}
                    disabled={!hasChanges}
                >
                    <RiSave2Line className="w-4 h-4 mr-1.5" />
                    Save Configuration
                </Button>
            </div>

            {/* Webhook Channels */}
            <Card
                title="Webhook Channels"
                description="Add Discord webhook URLs and choose which events each channel receives. These fire for all servers."
                icon={RiDiscordLine}
                iconColor="info"
                padding="lg"
            >
                <div className="space-y-3 mt-4">
                    {config.webhooks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <RiDiscordLine className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No webhook channels configured yet</p>
                            <p className="text-xs mt-1">Add a channel to start receiving notifications</p>
                        </div>
                    )}

                    {config.webhooks.map((webhook) => (
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

            {/* Event Templates */}
            <Card
                title="Default Event Templates"
                description="Configure the default appearance for each notification type. Users can override these per-server."
                padding="lg"
            >
                <div className="space-y-4 mt-4">
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
                                    config={config.eventTemplates[def.key]}
                                    onChange={(c) => updateTemplate(def.key, c)}
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
                                    config={config.eventTemplates[def.key]}
                                    onChange={(c) => updateTemplate(def.key, c)}
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
                                    config={config.eventTemplates[def.key]}
                                    onChange={(c) => updateTemplate(def.key, c)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {dialog}
        </Container>
    );
}
