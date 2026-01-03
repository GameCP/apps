import React, { useState, useEffect } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, Badge, FormInput, useConfirmDialog, Container, EmptyState, Typography, SkeletonItem, SkeletonCard } from '@gamecp/ui';
import { lang } from '../lang';
import type { Database, DatabaseSource } from '../types';
import { HiDatabase, HiPlus, HiTrash, HiExternalLink, HiClipboardCopy, HiRefresh, HiCheckCircle, HiXCircle } from 'react-icons/hi';

interface DatabaseTabProps {
    serverId: string;
}

export function DatabaseTab({ serverId }: DatabaseTabProps) {
    const { api, t } = useGameCP();
    const { confirm, dialog } = useConfirmDialog();
    const [databases, setDatabases] = useState<Database[]>([]);
    const [sources, setSources] = useState<DatabaseSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedSource, setSelectedSource] = useState('');
    const [testingDb, setTestingDb] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs: number }>>({});

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
            alert(error.error || t(lang.messages.createError));
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: t(lang.confirm.deleteTitle),
            message: t(lang.confirm.deleteMessage),
            confirmText: t(lang.buttons.delete),
        });

        if (!confirmed) return;

        try {
            await api.delete(`/api/x/database-manager/databases/${id}`);
            await loadData();
        } catch (error: any) {
            alert(error.error || t(lang.messages.deleteError));
        }
    };

    const copyConnectionString = (connectionString: string) => {
        navigator.clipboard.writeText(connectionString);
        alert(t(lang.messages.connectionCopied));
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
        return `${source.adminerUrl}?${params.toString()} `;
    };

    const testConnection = async (dbId: string) => {
        setTestingDb(dbId);
        try {
            const result = await api.post(`/api/x/database-manager/databases/${dbId}/test`, {});
            setTestResults(prev => ({ ...prev, [dbId]: result }));
        } catch (error: any) {
            setTestResults(prev => ({ ...prev, [dbId]: { success: false, message: error.error || t(lang.messages.testError), latencyMs: 0 } }));
        } finally {
            setTestingDb(null);
        }
    };

    if (loading) {
        return (
            <Container className="space-y-6">
                <Card
                    title={t(lang.page.title)}
                    description={t(lang.page.description)}
                    icon={HiDatabase}
                    padding="lg"
                    contentClassName="space-y-4"
                >
                    {/* Create Button Skeleton */}
                    <SkeletonItem width="w-36" height="h-10" />

                    {/* Databases List Skeleton */}
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-background border border-border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <SkeletonItem width="w-32" height="h-5" className="mb-2" />
                                        <div className="flex items-center gap-2">
                                            <SkeletonItem width="w-16" height="h-5" rounded />
                                            <SkeletonItem width="w-28" height="h-4" />
                                        </div>
                                    </div>
                                    <SkeletonItem width="w-9" height="h-9" />
                                </div>

                                {/* Connection Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <SkeletonItem width="w-12" height="h-4" className="mb-2" />
                                        <SkeletonItem width="w-full" height="h-10" />
                                    </div>
                                    <div>
                                        <SkeletonItem width="w-12" height="h-4" className="mb-2" />
                                        <SkeletonItem width="w-full" height="h-10" />
                                    </div>
                                    <div>
                                        <SkeletonItem width="w-20" height="h-4" className="mb-2" />
                                        <SkeletonItem width="w-full" height="h-10" />
                                    </div>
                                    <div>
                                        <SkeletonItem width="w-20" height="h-4" className="mb-2" />
                                        <SkeletonItem width="w-full" height="h-10" />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 flex-wrap">
                                    <SkeletonItem width="w-32" height="h-9" />
                                    <SkeletonItem width="w-36" height="h-9" />
                                    <SkeletonItem width="w-28" height="h-9" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </Container>
        );
    }

    if (sources.length === 0) {
        return (
            <Container>
                <EmptyState
                    icon={HiDatabase}
                    title={t(lang.nav.title)}
                    subtitle={t(lang.info.noSources)}
                />
            </Container>
        );
    }

    return (
        <Container className="space-y-6">
            <Card
                title={t(lang.page.title)}
                description={t(lang.page.description)}
                icon={HiDatabase}
                padding="lg"
                contentClassName="space-y-4"
            >
                {/* Create Button */}
                {!showCreateForm && (
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        variant="primary"
                        className="w-full sm:w-auto"
                    >
                        <HiPlus className="w-5 h-5 mr-2" />
                        {t(lang.buttons.create)}
                    </Button>
                )}

                {/* Create Form */}
                {showCreateForm && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                        <FormInput
                            label={t(lang.create.selectSource)}
                            name="source"
                            type="select"
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value)}
                            options={[
                                { value: '', label: t(lang.messages.selectServer) },
                                ...sources.map((source) => ({
                                    value: source._id,
                                    label: `${source.name} (${source.type.toUpperCase()})`
                                }))
                            ]}
                        />

                        <div className="flex gap-2">
                            <Button
                                onClick={handleCreate}
                                isLoading={creating}
                                disabled={!selectedSource}
                                variant="primary"
                            >
                                {t(lang.buttons.create)}
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setSelectedSource('');
                                }}
                                variant="secondary"
                            >
                                {t(lang.admin.cancel)}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Databases List */}
                {databases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>{t(lang.info.noDatabases)}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {databases.map((db) => (
                            <div
                                key={db._id}
                                className="bg-background border border-border rounded-lg p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <Typography as="h3" className="font-semibold">{db.name}</Typography>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="success" size="sm">
                                                {db.type.toUpperCase()}
                                            </Badge>
                                            <Typography size="xs" variant="muted">
                                                {t(lang.info.created)} {new Date(db.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </div>
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
                                <div className="space-y-3 mb-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <FormInput
                                            label={t(lang.connection.host)}
                                            name={`host-${db._id}`}
                                            value={db.host}
                                            onChange={() => { }}
                                            readOnly
                                            copyable
                                        />
                                        <FormInput
                                            label={t(lang.connection.port)}
                                            name={`port-${db._id}`}
                                            value={db.port}
                                            onChange={() => { }}
                                            readOnly
                                            copyable
                                        />
                                        <FormInput
                                            label={t(lang.connection.username)}
                                            name={`username-${db._id}`}
                                            value={db.username}
                                            onChange={() => { }}
                                            readOnly
                                            copyable
                                        />
                                        <FormInput
                                            label={t(lang.connection.password)}
                                            name={`password-${db._id}`}
                                            type="password"
                                            value={db.password}
                                            onChange={() => { }}
                                            readOnly
                                            copyable
                                            showHidePassword
                                        />
                                    </div>
                                </div>

                                {/* Test Result */}
                                {testResults[db._id] && (
                                    <div className={`mb-3 p-3 rounded-lg border ${testResults[db._id].success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                                        <div className="flex items-center gap-2">
                                            {testResults[db._id].success ? (
                                                <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <HiXCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            )}
                                            <span className={`text-sm font-medium ${testResults[db._id].success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                                {testResults[db._id].message}
                                            </span>
                                            {testResults[db._id].success && testResults[db._id].latencyMs > 0 && (
                                                <span className="text-xs text-muted-foreground">({testResults[db._id].latencyMs}ms)</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        onClick={() => testConnection(db._id)}
                                        variant="secondary"
                                        size="sm"
                                        disabled={testingDb === db._id}
                                    >
                                        <HiRefresh className={`w-4 h-4 mr-2 ${testingDb === db._id ? 'animate-spin' : ''}`} />
                                        {testingDb === db._id ? t(lang.messages.testing) : t(lang.messages.testConnection)}
                                    </Button>
                                    <Button
                                        onClick={() => copyConnectionString(db.connectionString)}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        <HiClipboardCopy className="w-4 h-4 mr-2" />
                                        {t(lang.buttons.copyConnection)}
                                    </Button>
                                    {(db.type === 'mysql' || db.type === 'postgresql') && getAdminerUrl(db) && (
                                        <a
                                            href={getAdminerUrl(db)!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                        >
                                            <HiExternalLink className="w-4 h-4 mr-2" />
                                            {t(lang.buttons.openManager)}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
            {dialog}
        </Container >
    );
}
