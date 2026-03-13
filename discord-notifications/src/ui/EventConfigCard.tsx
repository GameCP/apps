import React, { useState } from 'react';
import { FormInput, Switch } from '@gamecp/ui';
import type { EventConfig, EventDefinition } from '../eventDefaults';

interface EventConfigCardProps {
    definition: EventDefinition;
    config: EventConfig;
    onChange: (config: EventConfig) => void;
    isOverride?: boolean;
    adminDefault?: EventConfig;
}

const COLOR_PRESETS = [
    { label: 'Green', value: '#00ff00' },
    { label: 'Red', value: '#ff0000' },
    { label: 'Orange', value: '#ffa500' },
    { label: 'Blue', value: '#5865f2' },
    { label: 'Yellow', value: '#fee75c' },
    { label: 'Purple', value: '#9b59b6' },
    { label: 'Cyan', value: '#1abc9c' },
    { label: 'Gray', value: '#99aab5' },
    { label: 'White', value: '#ffffff' },
    { label: 'Pink', value: '#eb459e' },
];

export function EventConfigCard({ definition, config, onChange, isOverride, adminDefault }: EventConfigCardProps) {
    const [expanded, setExpanded] = useState(false);

    const update = (partial: Partial<EventConfig>) => {
        onChange({ ...config, ...partial });
    };

    // For override mode, show which fields differ from admin default
    const isDifferent = (field: keyof EventConfig) => {
        if (!isOverride || !adminDefault) return false;
        return config[field] !== adminDefault[field];
    };

    return (
        <div className="border border-border rounded-lg overflow-hidden transition-all">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-border"
                        style={{ backgroundColor: config.color }}
                    />
                    <span className="font-medium text-sm truncate">{definition.label}</span>
                    {!config.enabled && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            Disabled
                        </span>
                    )}
                    {isOverride && adminDefault && (
                        <span className="text-xs text-info bg-info/10 px-2 py-0.5 rounded">
                            Custom
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Switch
                        checked={config.enabled}
                        onChange={(checked: boolean) => update({ enabled: checked })}
                    />
                    <button
                        className="text-muted-foreground hover:text-foreground transition-colors"
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
                    {/* Title */}
                    <div>
                        <FormInput
                            label="Embed Title"
                            name={`${definition.key}-title`}
                            value={config.title}
                            onChange={(e) => update({ title: e.target.value })}
                            placeholder={adminDefault?.title || 'e.g. Server Started'}
                            description="Supports template variables like {{serverName}}"
                        />
                        {isDifferent('title') && (
                            <button
                                className="text-xs text-info hover:underline mt-1"
                                onClick={() => update({ title: adminDefault!.title })}
                            >
                                Reset to default
                            </button>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Embed Description
                        </label>
                        <textarea
                            value={config.description}
                            onChange={(e) => update({ description: e.target.value })}
                            placeholder={adminDefault?.description || 'e.g. **{{serverName}}** is now online'}
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Supports Discord markdown and {'{{variables}}'}
                        </p>
                        {isDifferent('description') && (
                            <button
                                className="text-xs text-info hover:underline mt-1"
                                onClick={() => update({ description: adminDefault!.description })}
                            >
                                Reset to default
                            </button>
                        )}
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Embed Color
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {COLOR_PRESETS.map((preset) => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => update({ color: preset.value })}
                                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${config.color === preset.value
                                        ? 'border-foreground scale-110 ring-2 ring-ring ring-offset-2 ring-offset-background'
                                        : 'border-transparent'
                                        }`}
                                    style={{ backgroundColor: preset.value }}
                                    title={preset.label}
                                />
                            ))}
                            <div className="flex items-center gap-1.5 ml-2">
                                <input
                                    type="color"
                                    value={config.color}
                                    onChange={(e) => update({ color: e.target.value })}
                                    className="w-7 h-7 rounded cursor-pointer border border-input"
                                />
                                <span className="text-xs text-muted-foreground font-mono">
                                    {config.color}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Available variables */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Available Variables
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {definition.availableVars.map((varName) => (
                                <span
                                    key={varName}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-mono cursor-pointer hover:bg-muted/80 transition-colors"
                                    title={`${definition.varDescriptions[varName]} - Click to copy`}
                                    onClick={() => navigator.clipboard.writeText(`{{${varName}}}`)}
                                >
                                    {`{{${varName}}}`}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Click to copy
                        </p>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Preview
                        </label>
                        <div className="rounded-md bg-[#2f3136] p-3 border-l-4" style={{ borderLeftColor: config.color }}>
                            <div className="text-white font-semibold text-sm">{config.title || 'No title'}</div>
                            <div className="text-[#dcddde] text-xs mt-1 whitespace-pre-wrap">
                                {config.description || 'No description'}
                            </div>
                            <div className="text-[#72767d] text-[10px] mt-2">
                                Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
