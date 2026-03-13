import React, { useState } from 'react';
import { Card, Button, FormInput, Badge, Switch } from '@gamecp/ui';
import { HiTrash, HiPaperAirplane } from 'react-icons/hi';
import { EVENT_DEFINITIONS, type EventType, type WebhookConfig } from '../eventDefaults';

interface WebhookCardProps {
    webhook: WebhookConfig;
    onUpdate: (webhook: WebhookConfig) => void;
    onDelete: (id: string) => void;
    onTest: (url: string) => void;
    isLoading?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
    status: 'Server Status',
    players: 'Players',
    lifecycle: 'Lifecycle',
};

export function WebhookCard({ webhook, onUpdate, onDelete, onTest, isLoading }: WebhookCardProps) {
    const [expanded, setExpanded] = useState(!webhook.url);

    const toggleEvent = (eventType: EventType) => {
        const events = webhook.events || [];
        const newEvents = events.includes(eventType)
            ? events.filter(e => e !== eventType)
            : [...events, eventType];
        onUpdate({ ...webhook, events: newEvents });
    };

    const selectAll = () => {
        onUpdate({ ...webhook, events: EVENT_DEFINITIONS.map(d => d.key) });
    };

    const selectNone = () => {
        onUpdate({ ...webhook, events: [] });
    };

    // Group events by category
    const grouped = EVENT_DEFINITIONS.reduce((acc, def) => {
        if (!acc[def.category]) acc[def.category] = [];
        acc[def.category].push(def);
        return acc;
    }, {} as Record<string, typeof EVENT_DEFINITIONS>);

    const subscribedCount = (webhook.events || []).length;

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                            {webhook.label || 'Unnamed Channel'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate font-mono">
                            {webhook.url ? `...${webhook.url.slice(-30)}` : 'No URL set'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Badge variant="secondary" size="sm">
                        {subscribedCount} events
                    </Badge>
                    <button
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    >
                        <svg
                            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Expanded */}
            {expanded && (
                <div className="px-4 py-4 space-y-4 border-t border-border bg-background">
                    {/* Label */}
                    <FormInput
                        label="Channel Label"
                        name={`webhook-${webhook.id}-label`}
                        value={webhook.label}
                        onChange={(e) => onUpdate({ ...webhook, label: e.target.value })}
                        placeholder="e.g. Server Alerts, Player Activity"
                        description="A friendly name to identify this webhook"
                    />

                    {/* URL */}
                    <FormInput
                        label="Discord Webhook URL"
                        name={`webhook-${webhook.id}-url`}
                        type="url"
                        value={webhook.url}
                        onChange={(e) => onUpdate({ ...webhook, url: e.target.value })}
                        placeholder="https://discord.com/api/webhooks/..."
                        description="The full webhook URL from your Discord channel"
                    />

                    {/* Event subscriptions */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-foreground">
                                Subscribed Events
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="text-xs text-info hover:underline"
                                    onClick={selectAll}
                                >
                                    Select All
                                </button>
                                <span className="text-xs text-muted-foreground">|</span>
                                <button
                                    type="button"
                                    className="text-xs text-info hover:underline"
                                    onClick={selectNone}
                                >
                                    None
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(grouped).map(([category, events]) => (
                                <div key={category}>
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                                        {CATEGORY_LABELS[category] || category}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        {events.map((def) => {
                                            const isChecked = (webhook.events || []).includes(def.key);
                                            return (
                                                <div
                                                    key={def.key}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors border ${isChecked
                                                        ? 'bg-info/5 border-info/30'
                                                        : 'bg-muted/20 border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div
                                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: def.defaultConfig.color }}
                                                        />
                                                        <span className={`text-sm truncate ${isChecked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {def.label}
                                                        </span>
                                                    </div>
                                                    <Switch
                                                        checked={isChecked}
                                                        onChange={() => toggleEvent(def.key)}
                                                        size="sm"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(webhook.id)}
                            isLoading={isLoading}
                        >
                            <HiTrash className="w-3.5 h-3.5 mr-1" />
                            Remove
                        </Button>
                        {webhook.url && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onTest(webhook.url)}
                                isLoading={isLoading}
                            >
                                <HiPaperAirplane className="w-3.5 h-3.5 mr-1" />
                                Test
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
