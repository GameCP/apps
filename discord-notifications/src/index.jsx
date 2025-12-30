import React, { useState, useEffect } from 'react';
import { TbBrandDiscord } from 'react-icons/tb';

// Client-side UI components
export function DiscordIcon({ serverId }) {
    const { Link } = window.GameCP_SDK;
    return (
        <Link
            href={`/game-servers/${serverId}/extensions/discord`}
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted hover:text-foreground transition-all duration-150 ease-in-out"
            title="Discord Notifications"
        >
            <TbBrandDiscord className="mr-3 h-5 w-5 transition-all duration-150 ease-in-out" />
            <span>Discord</span>
        </Link>
    );
}

export function SettingsPage({ serverId }) {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        loadWebhooks();
    }, [serverId]);

    const loadWebhooks = async () => {
        try {
            const response = await window.GameCP_API.fetch(`/api/x/discord-notifications/webhooks?serverId=${serverId}`);
            const data = await response.json();
            setWebhooks(data.webhooks || []);
        } catch (error) {
            console.error('Failed to load webhooks:', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError(null);

        try {
            const response = await window.GameCP_API.fetch('/api/x/discord-notifications/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serverId, webhookUrl }),
            });

            if (response.ok) {
                setMessage('Webhook saved successfully!');
                setWebhookUrl('');
                loadWebhooks();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to save webhook');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (url) => {
        const confirmed = await window.GameCP_SDK.confirm({
            title: 'Remove Webhook',
            message: 'Are you sure you want to remove this Discord webhook? You will stop receiving notifications in this channel.',
            confirmText: 'Remove',
            confirmButtonColor: 'red'
        });

        if (!confirmed) return;
        setLoading(true);
        setMessage('');

        try {
            const response = await window.GameCP_API.fetch('/api/x/discord-notifications/webhooks', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serverId, webhookUrl: url }),
            });

            if (response.ok) {
                setMessage('Webhook removed successfully');
                loadWebhooks();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to remove webhook');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        setLoading(true);
        setMessage('');
        setError(null);

        try {
            const response = await window.GameCP_API.fetch('/api/x/discord-notifications/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serverId }),
            });

            if (response.ok) {
                setMessage('Test message sent to Discord!');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to send test message');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const { Button, Card, Badge } = window.GameCP_SDK;

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                            Discord Notifications
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Configure Discord webhooks to receive notifications about your game server
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Messages replaced with native panel logic or simple alerts */}
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
                    title="Webhook Configuration"
                    description="Configure Discord webhooks to receive notifications about your game server events."
                    icon={TbBrandDiscord}
                    iconColor="blue"
                    padding="lg"
                >
                    <form onSubmit={handleSave} className="space-y-6 mt-4">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1">
                                Discord Webhook URL <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-muted-foreground mb-2">
                                Enter the full webhook URL from your Discord server integration settings.
                            </p>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder="https://discord.com/api/webhooks/..."
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                type="submit"
                                isLoading={loading}
                                variant="primary"
                            >
                                Save Webhook
                            </Button>
                            <Button
                                type="button"
                                onClick={handleTest}
                                isLoading={loading}
                                disabled={webhooks.length === 0}
                                variant="secondary"
                            >
                                Send Test Message
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Webhooks List Card */}
                {webhooks.length > 0 && (
                    <Card
                        title="Active Integrations"
                        padding="none"
                        headerClassName="p-4 sm:px-6 border-b border-border"
                    >
                        <div className="divide-y divide-border">
                            {webhooks.map((webhook, index) => (
                                <div key={index} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center min-w-0 mr-4">
                                        <Badge variant="success" size="sm" className="mr-3">
                                            Active
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
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* Info Box using native Card with status styling */}
            <div className="mt-6 sm:mt-8">
                <Card
                    variant="filled"
                    padding="md"
                    title="About Discord Webhooks"
                >
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                            <p>
                                Webhook URLs are unique to each Discord channel. You can create them in your
                                Discord server settings under Integrations &gt; Webhooks. Once configured,
                                events like server start, stop, and crashes will be sent directly to your channel.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

