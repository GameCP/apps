import React, { useState, useEffect } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { databaseContent } from './content';
import type { Database, DatabaseSource } from './types';
import { HiDatabase, HiPlus, HiTrash, HiExternalLink, HiClipboardCopy } from 'react-icons/hi';

interface DatabaseTabProps {
    serverId: string;
}

export function DatabaseTab({ serverId }: DatabaseTabProps) {
    const { Card, Button, Badge, api, confirm, t } = useGameCP();
    const [databases, setDatabases] = useState<Database[]>([]);
    const [sources, setSources] = useState<DatabaseSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedSource, setSelectedSource] = useState('');

    useEffect(() => {
        loadData();
    }, [serverId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dbRes, sourcesRes] = await Promise.all([
                api.get(`/api/x/database-manager/databases?serverId=${serverId}`),
                api.get('/api/x/database-manager/sources'),
            ]);
            setDatabases(dbRes.databases || []);
            setSources(sourcesRes.sources?.filter((s: DatabaseSource) => s.enabled) || []);
        } catch (error) {
            console.error('Failed to load databases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!selectedSource) return;

        setCreating(true);
        try {
            await api.post('/api/x/database-manager/databases', {
                serverId,
                sourceId: selectedSource,
            });
            await loadData();
            setShowCreateForm(false);
            setSelectedSource('');
        } catch (error: any) {
            alert(error.error || 'Failed to create database');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: t(databaseContent.confirm.deleteTitle),
            message: t(databaseContent.confirm.deleteMessage),
            confirmText: t(databaseContent.buttons.delete),
        });

        if (!confirmed) return;

        try {
            await api.delete(`/api/x/database-manager/databases/${id}`);
            await loadData();
        } catch (error: any) {
            alert(error.error || 'Failed to delete database');
        }
    };

    const copyConnectionString = (connectionString: string) => {
        navigator.clipboard.writeText(connectionString);
        alert(t(databaseContent.messages.connectionCopied));
    };

    const getAdminerUrl = (db: Database) => {
        // Find the source for this database to get the adminerUrl
        const source = sources.find(s => s._id === db.sourceId);
        if (!source?.adminerUrl) return null;

        const params = new URLSearchParams({
            server: db.host,
            username: db.username,
            db: db.name,
        });
        return `${source.adminerUrl}?${params.toString()}`;
    };

    if (loading) {
        return (
            <Card>
                <div className="p-6 text-center text-muted-foreground">
                    Loading databases...
                </div>
            </Card>
        );
    }

    if (sources.length === 0) {
        return (
            <Card>
                <div className="p-6 text-center">
                    <HiDatabase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t(databaseContent.info.noSources)}</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card
                title={t(databaseContent.page.title)}
                description={t(databaseContent.page.description)}
                icon={HiDatabase}
                padding="lg"
            >
                <div className="space-y-4">
                    {/* Create Button */}
                    {!showCreateForm && (
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            variant="primary"
                            className="w-full sm:w-auto"
                        >
                            <HiPlus className="w-5 h-5 mr-2" />
                            {t(databaseContent.buttons.create)}
                        </Button>
                    )}

                    {/* Create Form */}
                    {showCreateForm && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    {t(databaseContent.create.selectSource)}
                                </label>
                                <select
                                    value={selectedSource}
                                    onChange={(e) => setSelectedSource(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Select a database server...</option>
                                    {sources.map((source) => (
                                        <option key={source._id} value={source._id}>
                                            {source.name} ({source.type.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCreate}
                                    isLoading={creating}
                                    disabled={!selectedSource}
                                    variant="primary"
                                >
                                    {t(databaseContent.buttons.create)}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setSelectedSource('');
                                    }}
                                    variant="secondary"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Databases List */}
                    {databases.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>{t(databaseContent.info.noDatabases)}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {databases.map((db) => (
                                <div
                                    key={db._id}
                                    className="bg-background border border-border rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-foreground">{db.name}</h3>
                                                <Badge variant="success" size="sm">
                                                    {db.type.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Created {new Date(db.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => handleDelete(db._id)}
                                            variant="danger"
                                            size="sm"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Connection Details */}
                                    <div className="bg-muted/30 rounded p-3 space-y-2 text-sm font-mono mb-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-muted-foreground">{t(databaseContent.connection.host)}:</span>
                                                <span className="ml-2 text-foreground">{db.host}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">{t(databaseContent.connection.port)}:</span>
                                                <span className="ml-2 text-foreground">{db.port}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">{t(databaseContent.connection.username)}:</span>
                                                <span className="ml-2 text-foreground">{db.username}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">{t(databaseContent.connection.password)}:</span>
                                                <span className="ml-2 text-foreground">••••••••</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => copyConnectionString(db.connectionString)}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            <HiClipboardCopy className="w-4 h-4 mr-2" />
                                            {t(databaseContent.buttons.copyConnection)}
                                        </Button>
                                        {(db.type === 'mysql' || db.type === 'postgresql') && getAdminerUrl(db) && (
                                            <a
                                                href={getAdminerUrl(db)!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                            >
                                                <HiExternalLink className="w-4 h-4 mr-2" />
                                                {t(databaseContent.buttons.openManager)}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
