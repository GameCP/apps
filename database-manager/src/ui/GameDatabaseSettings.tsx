import React from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, FormInput, Switch, Typography } from '@gamecp/ui';
import { lang } from '../lang';

interface GameDatabaseSettingsProps {
    gameId: string;
    extensionData: Record<string, any>;
    onChange: (extensionId: string, config: any) => void;
}

export function GameDatabaseSettings({ gameId, extensionData, onChange }: GameDatabaseSettingsProps) {
    const { t } = useGameCP();

    // Get this extension's data from the extensionData object
    const EXTENSION_ID = 'database-manager';
    const config = extensionData[EXTENSION_ID] || {
        enabled: false,
        defaultType: 'mysql',
        maxDatabasesPerServer: 0,
        autoProvision: false,
        requiresDatabase: false,
    };

    const handleChange = (field: string, value: any) => {
        onChange(EXTENSION_ID, {
            ...config,
            [field]: value,
        });
    };

    return (
        <Card id="database-provisioning" padding="lg">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                    <Typography as="h3" size="lg" className="font-bold">{t(lang.provisioning.title)}</Typography>
                    <Typography variant="muted" size="sm" className="mt-1">
                        {t(lang.provisioning.description)}
                    </Typography>
                </div>
                <Switch
                    checked={config.enabled || false}
                    onChange={(checked) => handleChange('enabled', checked)}
                />
            </div>

            {config.enabled && (
                <div className="space-y-4">
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

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <Typography size="sm" className="text-blue-800 dark:text-blue-200">
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
