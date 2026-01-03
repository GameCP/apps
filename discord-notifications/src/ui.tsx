import React, { useState, useEffect } from 'react';
import { TbBrandDiscord } from 'react-icons/tb';
import { HiInformationCircle } from 'react-icons/hi';
import { lang } from './lang';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, FormInput, Container, Typography, Badge, useConfirmDialog } from '@gamecp/ui';

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
export function DiscordIcon({ serverId }: DiscordIconProps) {
    const { Link, t } = useGameCP();

    return (
        <Link
            href={`/ game - servers / ${serverId} /extensions/discord`}
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted hover:text-foreground transition-all duration-150 ease-in-out"
            title={t(lang.page.title)}
        >
            <TbBrandDiscord className="mr-3 h-5 w-5 transition-all duration-150 ease-in-out" />
            <span>{t(lang.nav.title)}</span>
        </Link>
    );
}

export function SettingsPage({ serverId }: SettingsPageProps) {
    const { api, t } = useGameCP();
    const { confirm, dialog } = useConfirmDialog();
    const [webhookUrl, setWebhookUrl] = useState<string>('');
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadWebhooks();
    }, [serverId]);

    const loadWebhooks = async () => {
        try {
            const data = await api.get(`/ api / x / discord - notifications / webhooks ? serverId = ${serverId} `);
            setWebhooks(data.webhooks || []);
        } catch (err) {
            console.error('Failed to load webhooks:', err);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError(null);

        try {
            await api.post('/api/x/discord-notifications/webhooks', { serverId, webhookUrl });

            setMessage(t(lang.messages.success));
            setWebhookUrl('');
            loadWebhooks();
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
            confirmButtonColor: 'red'
        });

        if (!confirmed) return;
        setLoading(true);
        setMessage('');

        try {
            await api.delete('/api/x/discord-notifications/webhooks', { serverId, webhookUrl: url });

            setMessage(t(lang.messages.removed));
            loadWebhooks();
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
        <Container className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <Typography as="h1" size="xl" className="sm:text-2xl font-bold">
                            {t(lang.page.title)}
                        </Typography>
                        <Typography variant="muted" size="sm" className="sm:text-base mt-1">
                            {t(lang.page.description)}
                        </Typography>
                    </div>
                </div>
            </div>

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
                    icon={TbBrandDiscord}
                    iconColor="blue"
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
                <Card
                    variant="filled"
                    padding="md"
                    title={t(lang.info.title)}
                >
                    <div className="flex items-start">
                        <HiInformationCircle className="w-5 h-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                        <div className="text-xs sm:text-sm text-muted-foreground">
                            <p>
                                {t(lang.info.description)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
            {dialog}
        </Container>
    );
}
