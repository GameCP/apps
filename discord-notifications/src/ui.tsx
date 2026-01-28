import React, { useState } from 'react';
import { RiDiscordLine } from 'react-icons/ri';
import { lang } from './lang';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, FormInput, Container, PageHeader, Badge, useConfirmDialog, SkeletonItem, SkeletonCard, Notice } from '@gamecp/ui';
import useSWR, { mutate } from 'swr';

interface Webhook {
    url: string;
    serverId?: string;
    isLegacy?: boolean;
}

interface DiscordIconProps {
    serverId: string;
}

interface SettingsPageProps {
    serverId: string;
}

// Client-side UI components
import { SidebarNavItem } from '@gamecp/ui';

export function DiscordIcon({ serverId }: DiscordIconProps) {
    const { t } = useGameCP();
    const href = `/game-servers/${serverId}/extensions/discord`;

    return (
        <SidebarNavItem
            href={href}
            icon={RiDiscordLine}
            title={t(lang.page.title)}
        >
            {t(lang.nav.title)}
        </SidebarNavItem>
    );
}

export function SettingsPage({ serverId }: SettingsPageProps) {
    const { api, t } = useGameCP();
    const { confirm, dialog } = useConfirmDialog();
    const [webhookUrl, setWebhookUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // SWR for data fetching
    const webhooksKey = `/api/x/discord-notifications/webhooks?serverId=${serverId}`;
    const { data: webhooksData, isLoading: initialLoading } = useSWR<{ webhooks: Webhook[] }>(webhooksKey, () => api.get(webhooksKey));
    const webhooks = webhooksData?.webhooks || [];

    // Loading skeleton - mirrors the final layout structure
    if (initialLoading) {
        return (
            <Container padding="lg" className="space-y-6">
                <PageHeader
                    title={t(lang.page.title)}
                    subtitle={t(lang.page.description)}
                    size="md"
                />

                <div className="space-y-4 sm:space-y-6">
                    {/* Configuration Card - Render card with static title, skeleton form fields */}
                    <Card
                        title={t(lang.config.title)}
                        description={t(lang.config.description)}
                        icon={RiDiscordLine}
                        iconColor="info"
                        padding="lg"
                    >
                        <div className="space-y-6 mt-4">
                            {/* Webhook URL Field */}
                            <div>
                                <SkeletonItem width="w-28" height="h-4" className="mb-2" />
                                <SkeletonItem width="w-full" height="h-10" />
                                <SkeletonItem width="w-48" height="h-3" className="mt-2" />
                            </div>
                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <SkeletonItem width="w-24" height="h-10" />
                                <SkeletonItem width="w-32" height="h-10" />
                            </div>
                        </div>
                    </Card>

                    {/* Webhooks List Skeleton */}
                    <Card
                        title={t(lang.integrations.title)}
                        padding="none"
                        headerClassName="p-4 sm:px-6 border-b border-border"
                    >
                        <div className="divide-y divide-border">
                            {[1, 2].map((i) => (
                                <div key={i} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                    <div className="flex items-center min-w-0 mr-4">
                                        <SkeletonItem width="w-14" height="h-5" rounded className="mr-3" />
                                        <SkeletonItem width="w-64" height="h-4" />
                                    </div>
                                    <SkeletonItem width="w-20" height="h-8" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Info Box - Static content, no skeleton needed */}
                <div className="mt-6 sm:mt-8">
                    <Notice title={t(lang.info.title)} variant="info">
                        <p>{t(lang.info.description)}</p>
                    </Notice>
                </div>
            </Container>
        );
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError(null);

        try {
            await api.post('/api/x/discord-notifications/webhooks', { serverId, webhookUrl });

            setMessage(t(lang.messages.success));
            setWebhookUrl('');
            mutate(webhooksKey);
        } catch (err: any) {
            setError(err.error || err.message || t(lang.errors.saveFailed));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (url: string) => {
        const confirmed = await confirm({
            title: t(lang.confirm.removeTitle),
            message: t(lang.confirm.removeMessage),
            confirmText: t(lang.buttons.remove),
            confirmButtonColor: 'danger'
        });

        if (!confirmed) return;
        setLoading(true);
        setMessage('');

        try {
            await api.delete('/api/x/discord-notifications/webhooks', { serverId, webhookUrl: url });

            setMessage(t(lang.messages.removed));
            mutate(webhooksKey);
        } catch (err: any) {
            setError(err.error || err.message || t(lang.errors.removeFailed));
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        setLoading(true);
        setMessage('');
        setError(null);

        try {
            await api.post('/api/x/discord-notifications/test', { serverId });
            setMessage(t(lang.messages.testSent));
        } catch (err: any) {
            setError(err.error || err.message || t(lang.errors.testFailed));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container padding="lg" className="space-y-6">
            <PageHeader
                title={t(lang.page.title)}
                subtitle={t(lang.page.description)}
                size="md"
            />

            {/* Status Messages */}
            {(error || message) && (
                <div className="mb-6">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-destructive text-sm font-medium">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-success-light/10 border border-success-light/20 rounded-md p-3 text-success-dark text-sm font-medium">
                            {message}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-4 sm:space-y-6">
                {/* Configuration Card */}
                <Card
                    title={t(lang.config.title)}
                    description={t(lang.config.description)}
                    icon={RiDiscordLine}
                    iconColor="info"
                    padding="lg"
                >
                    <form onSubmit={handleSave} className="space-y-6 mt-4">
                        <div className="space-y-4">
                            <FormInput
                                label={t(lang.form.webhookUrl)}
                                name="webhookUrl"
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder={t(lang.form.webhookPlaceholder)}
                                description={t(lang.form.webhookHint)}
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                type="submit"
                                isLoading={loading}
                                variant="primary"
                            >
                                {t(lang.buttons.save)}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleTest}
                                isLoading={loading}
                                disabled={webhooks.length === 0}
                                variant="secondary"
                            >
                                {t(lang.buttons.test)}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Webhooks List Card */}
                {webhooks.length > 0 && (
                    <Card
                        title={t(lang.integrations.title)}
                        padding="none"
                        headerClassName="p-4 sm:px-6 border-b border-border"
                    >
                        <div className="divide-y divide-border">
                            {webhooks.map((webhook, index) => (
                                <div key={index} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center min-w-0 mr-4">
                                        <Badge variant="success" size="sm" className="mr-3">
                                            {t(lang.integrations.active)}
                                        </Badge>
                                        <span className="font-mono text-xs sm:text-sm text-muted-foreground truncate">
                                            {webhook.url}
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => handleDelete(webhook.url)}
                                        variant="danger"
                                        size="sm"
                                        isLoading={loading}
                                    >
                                        {t(lang.buttons.remove)}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-6 sm:mt-8">
                <Notice title={t(lang.info.title)} variant="info">
                    <p>{t(lang.info.description)}</p>
                </Notice>
            </div>
            {dialog}
        </Container>
    );
}
