import React from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, FormInput, Switch, Typography } from '@gamecp/ui';
import { lang } from '../lang';
import { RiDatabase2Line } from 'react-icons/ri';
import useSWR from 'swr';
import { DatabaseSource } from '../types';

interface GameDatabaseSettingsProps {
    gameId: string;
    extensionData: Record<string, any>;
    onChange: (extensionId: string, config: any) => void;
}

const TYPE_LABELS: Record<string, string> = {
    mysql: 'MySQL',
    postgresql: 'PostgreSQL',
    redis: 'Redis',
    mongodb: 'MongoDB',
};

export function GameDatabaseSettings({ gameId, extensionData, onChange }: GameDatabaseSettingsProps) {
    const { t, api } = useGameCP();

    // Get this extension's data from the extensionData object
    const EXTENSION_ID = 'database-manager';
    const config = extensionData[EXTENSION_ID] || {
        enabled: false,
        defaultType: 'mysql',
        maxDatabasesPerServer: 0,
        autoProvision: false,
        requiresDatabase: false,
        allowedSources: [],
    };

    // Fetch available sources when enabled
    const sourcesKey = '/api/x/database-manager/sources';
    const { data: sourcesData } = useSWR<{ sources: DatabaseSource[] }>(
        config.enabled ? sourcesKey : null,
        () => api.get(sourcesKey)
    );
    const sources = (sourcesData?.sources || []).filter(s => s.enabled);

    const handleChange = (field: string, value: any) => {
        onChange(EXTENSION_ID, {
            ...config,
            [field]: value,
        });
    };

    const toggleSource = (sourceId: string) => {
        const current: string[] = config.allowedSources || [];
        const updated = current.includes(sourceId)
            ? current.filter((id: string) => id !== sourceId)
            : [...current, sourceId];
        handleChange('allowedSources', updated);
    };

    // If allowedSources is empty/unset, all sources are available
    const allowedSources: string[] = config.allowedSources || [];
    const allSelected = allowedSources.length === 0;

    return (
        <Card padding="lg">
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <RiDatabase2Line className="w-6 h-6" />
                    </div>
                    <div>
                        <Typography as="h3" size="lg" className="font-bold">{t(lang.provisioning.title)}</Typography>
                        <Typography variant="muted" size="sm" className="mt-1">
                            {t(lang.provisioning.description)}
                        </Typography>
                    </div>
                </div>
                <Switch
                    checked={config.enabled || false}
                    onChange={(checked) => handleChange('enabled', checked)}
                />
            </div>

            {config.enabled && (
                <div className="space-y-4 mt-6">
                    {/* Source Selection */}
                    {sources.length > 0 && (
                        <div>
                            <Typography size="sm" className="font-medium mb-2">
                                {t(lang.provisioning.allowedSources)}
                            </Typography>
                            <Typography variant="muted" size="xs" className="mb-3">
                                {t(lang.provisioning.allowedSourcesDesc)}
                            </Typography>
                            <div className="space-y-2">
                                {sources.map((source) => {
                                    const isSelected = allSelected || allowedSources.includes(source._id);
                                    return (
                                        <div
                                            key={source._id}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isSelected
                                                ? 'border-primary/30 bg-primary/5'
                                                : 'border-border bg-card'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`text-xs font-mono px-2 py-0.5 rounded ${source.type === 'mysql' ? 'bg-info/10 text-info' :
                                                    source.type === 'redis' ? 'bg-danger/10 text-danger' :
                                                        source.type === 'postgresql' ? 'bg-purple/10 text-purple' :
                                                            'bg-success/10 text-success'
                                                    }`}>
                                                    {TYPE_LABELS[source.type] || source.type.toUpperCase()}
                                                </div>
                                                <div>
                                                    <Typography size="sm" className="font-medium">{source.name}</Typography>
                                                    <Typography variant="muted" size="xs">{source.host}:{source.port}</Typography>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={isSelected}
                                                onChange={() => toggleSource(source._id)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <FormInput
                        label={t(lang.provisioning.namePattern)}
                        name="namePattern"
                        type="text"
                        value={config.namePattern || ''}
                        onChange={(e) => handleChange('namePattern', e.target.value)}
                        placeholder={t(lang.provisioning.namePatternPlaceholder)}
                    />

                    <FormInput
                        label={t(lang.provisioning.usernamePattern)}
                        name="usernamePattern"
                        type="text"
                        value={config.usernamePattern || ''}
                        onChange={(e) => handleChange('usernamePattern', e.target.value)}
                        placeholder={t(lang.provisioning.usernamePatternPlaceholder)}
                    />

                    <FormInput
                        label={t(lang.provisioning.maxDatabases)}
                        name="maxDatabasesPerServer"
                        type="number"
                        value={config.maxDatabasesPerServer || 0}
                        onChange={(e) => handleChange('maxDatabasesPerServer', parseInt(e.target.value) || 0)}
                        description={t(lang.provisioning.maxDatabasesDesc)}
                    />

                    <Switch
                        checked={config.autoCreate || false}
                        onChange={(checked) => handleChange('autoCreate', checked)}
                        label={t(lang.provisioning.autoCreate)}
                        description={t(lang.provisioning.autoCreateDesc)}
                    />

                    <Switch
                        checked={config.requiresDatabase || false}
                        onChange={(checked) => handleChange('requiresDatabase', checked)}
                        label={t(lang.provisioning.requireDatabase)}
                        description={t(lang.provisioning.requireDatabaseDesc)}
                    />

                    <div className="bg-info/10 dark:bg-info/20 border border-info/30 dark:border-info rounded-lg p-4">
                        <Typography size="sm" className="text-info dark:text-blue-200">
                            <strong>{t(lang.provisioning.note)}</strong> {t(lang.provisioning.noteMessage)}{' '}
                            <a href="/admin/extensions/database-manager" className="underline hover:no-underline">
                                {t(lang.provisioning.adminPanel)}
                            </a>{' '}
                            {t(lang.provisioning.noteMessageEnd)}
                        </Typography>
                    </div>
                </div>
            )}
        </Card>
    );
}
