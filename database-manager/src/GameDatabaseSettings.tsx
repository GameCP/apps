import React from 'react';
import { useGameCP } from '@gamecp/types/client';

interface GameDatabaseSettingsProps {
    gameId: string;
    extensionData: Record<string, any>;
    onChange: (extensionId: string, config: any) => void;
}

export function GameDatabaseSettings({ gameId, extensionData, onChange }: GameDatabaseSettingsProps) {
    const { Card, FormInput, Switch } = useGameCP();

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
        <Card>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Database Provisioning</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Configure automatic database provisioning for game servers
                        </p>
                    </div>
                    <Switch
                        checked={config.enabled}
                        onChange={(checked) => handleChange('enabled', checked)}
                        label="Enable"
                    />
                </div>

                {config.enabled && (
                    <div className="space-y-4">
                        <FormInput
                            label="Default Database Type"
                            name="defaultType"
                            type="select"
                            value={config.defaultType || 'mysql'}
                            onChange={(e) => handleChange('defaultType', e.target.value)}
                            options={[
                                { value: 'mysql', label: 'MySQL / MariaDB' },
                                { value: 'postgresql', label: 'PostgreSQL' },
                                { value: 'redis', label: 'Redis' },
                                { value: 'mongodb', label: 'MongoDB' },
                            ]}
                            description="Default database type for new servers"
                        />

                        <FormInput
                            label="Max Databases Per Server"
                            name="maxDatabasesPerServer"
                            type="number"
                            value={config.maxDatabasesPerServer || 0}
                            onChange={(e) => handleChange('maxDatabasesPerServer', parseInt(e.target.value))}
                            min={0}
                            description="Maximum databases allowed per server (0 = unlimited)"
                        />

                        <div className="space-y-3">
                            <Switch
                                checked={config.autoProvision || false}
                                onChange={(checked) => handleChange('autoProvision', checked)}
                                label="Auto-Provision Database"
                                description="Automatically create a database when a new server is created"
                            />

                            <Switch
                                checked={config.requiresDatabase || false}
                                onChange={(checked) => handleChange('requiresDatabase', checked)}
                                label="Require Database"
                                description="Server creation requires at least one database"
                            />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Note:</strong> Database sources must be configured in the{' '}
                                <a href="/admin/extensions/database-manager" className="underline hover:no-underline">
                                    Database Manager admin panel
                                </a>{' '}
                                before auto-provisioning will work.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
