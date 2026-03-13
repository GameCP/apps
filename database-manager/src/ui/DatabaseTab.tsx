import React, { useState } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, FormInput, useConfirmDialog, Container, EmptyState, Typography, SkeletonItem, PageHeader } from '@gamecp/ui';
import { lang } from '../lang';
import type { Database, DatabaseSource } from '../types';
import { HiDatabase, HiPlus, HiTrash, HiExternalLink, HiClipboardCopy, HiRefresh, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import useSWR, { mutate } from 'swr';

interface DatabaseTabProps {
    serverId: string;
}

export function DatabaseTab({ serverId }: DatabaseTabProps) {
    const { api, t, toast } = useGameCP();
    const { confirm, dialog } = useConfirmDialog();
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedSource, setSelectedSource] = useState('');
    const [testingDb, setTestingDb] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs: number }>>({});

    // SWR for data fetching
    const databasesKey = `/api/x/database-manager/databases?serverId=${serverId}`;
    const sourcesKey = `/api/x/database-manager/sources?serverId=${serverId}`;

    const { data: dbData, isLoading: loadingDatabases } = useSWR<{ databases: Database[] }>(databasesKey, () => api.get(databasesKey));
    const { data: sourcesData, isLoading: loadingSources } = useSWR<{ sources: DatabaseSource[]; permissions?: { canCreate: boolean; canDelete: boolean } }>(sourcesKey, () => api.get(sourcesKey));

    const databases = dbData?.databases || [];
    const sources = (sourcesData?.sources || []).filter(s => s.enabled);
    // Admins always have full permissions; non-admins use server-returned permissions
    const canCreate = sourcesData?.permissions?.canCreate ?? true;
    const canDelete = sourcesData?.permissions?.canDelete ?? true;
    const loading = loadingDatabases || loadingSources;

    const handleCreate = async () => {
        if (!selectedSource) return;

        setCreating(true);
        try {
            await api.post('/api/x/database-manager/databases', {
                serverId,
                sourceId: selectedSource,
            });
            mutate(databasesKey);
            setShowCreateForm(false);
            setSelectedSource('');
            toast.success(t(lang.messages.created));
        } catch (error: any) {
            toast.error(error.error || t(lang.messages.createError));
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
            mutate(databasesKey);
            toast.success(t(lang.messages.deleted));
        } catch (error: any) {
            toast.error(error.error || t(lang.messages.deleteError));
        }
    };

    const copyConnectionString = (connectionString: string) => {
        navigator.clipboard.writeText(connectionString);
        toast.success(t(lang.messages.connectionCopied));
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
            <Container padding="lg" className="space-y-6">
                {/* PageHeader Skeleton */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <SkeletonItem width="w-48" height="h-7" className="mb-1" />
                        <SkeletonItem width="w-72" height="h-4" />
                    </div>
                    <SkeletonItem width="w-36" height="h-9" />
                </div>

                {/* Database Card Skeletons */}
                {[1, 2].map((i) => (
                    <div key={i} className="card p-4 lg:p-6">
                        <div className="flex items-start justify-between mb-4">
                            <SkeletonItem width="w-20" height="h-6" />
                            <SkeletonItem width="w-9" height="h-9" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            {[1, 2, 3, 4, 5].map((j) => (
                                <div key={j}>
                                    <SkeletonItem width="w-16" height="h-4" className="mb-2" />
                                    <SkeletonItem width="w-full" height="h-10" />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <SkeletonItem width="w-32" height="h-9" />
                            <SkeletonItem width="w-36" height="h-9" />
                        </div>
                    </div>
                ))}
            </Container>
        );
    }

    if (sources.length === 0) {
        return (
            <Container padding="lg">
                <EmptyState
                    icon={HiDatabase}
                    title={t(lang.nav.title)}
                    subtitle={t(lang.info.noSources)}
                />
            </Container>
        );
    }

    return (
        <Container padding="lg" className="space-y-6">
            {/* Header */}
            <PageHeader
                title={t(lang.page.title)}
                subtitle={t(lang.page.description)}
                size="md"
                rightContent={
                    !showCreateForm && canCreate ? (
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            variant="primary"
                            size="sm"
                        >
                            <HiPlus className="w-4 h-4 mr-1.5" />
                            {t(lang.buttons.create)}
                        </Button>
                    ) : undefined
                }
            />

            {/* Create Form */}
            {showCreateForm && (
                <Card padding="lg">
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

                    <div className="flex gap-2 mt-4">
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
                </Card>
            )}

            {/* Database Cards */}
            {databases.length === 0 && !showCreateForm ? (
                <EmptyState
                    icon={HiDatabase}
                    title={t(lang.info.noDatabases)}
                    subtitle=""
                />
            ) : (
                databases.map((db) => (
                    <Card
                        key={db._id}
                        title={db.type.charAt(0).toUpperCase() + db.type.slice(1)}
                        subtitle={`${t(lang.info.created)} ${new Date(db.createdAt).toLocaleDateString()}`}
                        padding="lg"
                        actionButton={
                            canDelete ? (
                                <Button
                                    onClick={() => handleDelete(db._id)}
                                    variant="danger"
                                    size="sm"
                                >
                                    <HiTrash className="w-4 h-4" />
                                </Button>
                            ) : undefined
                        }
                        contentClassName="space-y-4"
                    >
                        {/* Connection Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormInput
                                label="Database Name"
                                name={`name-${db._id}`}
                                value={db.name}
                                onChange={() => { }}
                                readOnly
                                copyable
                            />
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

                        {/* Test Result */}
                        {testResults[db._id] && (
                            <div className={`p-3 rounded-lg border ${testResults[db._id].success ? 'bg-success/10 dark:bg-success/20 border-success/30 dark:border-success' : 'bg-danger/10 dark:bg-danger/20 border-danger/30 dark:border-danger'}`}>
                                <div className="flex items-center gap-2">
                                    {testResults[db._id].success ? (
                                        <HiCheckCircle className="w-4 h-4 text-success dark:text-success" />
                                    ) : (
                                        <HiXCircle className="w-4 h-4 text-danger dark:text-danger" />
                                    )}
                                    <span className={`text-sm font-medium ${testResults[db._id].success ? 'text-success' : 'text-danger'}`}>
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
                    </Card>
                ))
            )}
            {dialog}
        </Container>
    );
}
