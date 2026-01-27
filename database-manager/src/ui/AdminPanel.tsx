import React, { useState } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, Badge, FormInput, useConfirmDialog, Container, Typography, SkeletonItem, SkeletonCard } from '@gamecp/ui';
import { lang } from '../lang';
import type { DatabaseSource, DatabaseType } from '../types';
import { RiDatabase2Line, RiAddLine, RiCheckboxCircleLine, RiCloseCircleLine, RiRefreshLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri';
import useSWR, { mutate } from 'swr';

interface TestResult {
    success: boolean;
    message: string;
    latencyMs: number;
}

export function DatabaseSourcesPage() {
    const { api, t } = useGameCP();
    const { confirm, dialog } = useConfirmDialog();
    const [showForm, setShowForm] = useState(false);
    const [editingSource, setEditingSource] = useState<DatabaseSource | null>(null);
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [formData, setFormData] = useState({
        type: 'mysql' as DatabaseType,
        name: '',
        host: '',
        port: 3306,
        adminUsername: '',
        adminPassword: '',
        adminerUrl: '',
    });

    // SWR for data fetching
    const sourcesKey = '/api/x/database-manager/sources';
    const { data: sourcesData, isLoading: loading } = useSWR<{ sources: DatabaseSource[] }>(sourcesKey, () => api.get(sourcesKey));
    const sources = sourcesData?.sources || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingSource) {
                await api.put(`/api/x/database-manager/sources/${editingSource._id}`, formData);
            } else {
                await api.post('/api/x/database-manager/sources', formData);
            }

            mutate(sourcesKey);
            resetForm();
        } catch (error: any) {
            alert(error.error || t(lang.messages.saveError));
        }
    };

    const handleEdit = (source: DatabaseSource) => {
        setEditingSource(source);
        setFormData({
            type: source.type,
            name: source.name,
            host: source.host,
            port: source.port,
            adminUsername: source.adminUsername,
            adminPassword: source.adminPassword,
            adminerUrl: source.adminerUrl || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: t(lang.admin.deleteConfirmTitle),
            message: t(lang.admin.deleteConfirmMessage),
            confirmText: t(lang.buttons.delete),
        });

        if (!confirmed) return;

        try {
            await api.delete(`/api/x/database-manager/sources/${id}`);
            mutate(sourcesKey);
        } catch (error: any) {
            alert(error.error || t(lang.messages.deleteError));
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingSource(null);
        setTestResult(null);
        setFormData({
            type: 'mysql',
            name: '',
            host: '',
            port: 3306,
            adminUsername: '',
            adminPassword: '',
            adminerUrl: '',
        });
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        setTestResult(null);

        try {
            const result = await api.post('/api/x/database-manager/sources/test-connection', {
                type: formData.type,
                host: formData.host,
                port: formData.port,
                adminUsername: formData.adminUsername,
                adminPassword: formData.adminPassword,
            });
            setTestResult(result);
        } catch (error: any) {
            setTestResult({
                success: false,
                message: error.error || error.message || t(lang.messages.testError),
                latencyMs: 0,
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const getDefaultPort = (type: DatabaseType): number => {
        switch (type) {
            case 'mysql': return 3306;
            case 'postgresql': return 5432;
            case 'redis': return 6379;
            case 'mongodb': return 27017;
            default: return 3306;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header - Static content, render directly */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Typography as="h1" size="2xl" className="font-bold">{t(lang.admin.title)}</Typography>
                        <Typography variant="muted" className="mt-1">
                            {t(lang.admin.description)}
                        </Typography>
                    </div>
                    <SkeletonItem width="w-36" height="h-10" className="sm:flex-shrink-0" />
                </div>

                {/* Sources List Skeleton */}
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <SkeletonItem width="w-40" height="h-6" />
                                        <SkeletonItem width="w-16" height="h-5" rounded />
                                        <SkeletonItem width="w-16" height="h-5" rounded />
                                    </div>
                                    <div className="space-y-1">
                                        <SkeletonItem width="w-36" height="h-4" />
                                        <SkeletonItem width="w-48" height="h-4" />
                                        <SkeletonItem width="w-32" height="h-3" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <SkeletonItem width="w-9" height="h-9" />
                                    <SkeletonItem width="w-9" height="h-9" />
                                </div>
                            </div>
                        </SkeletonCard>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Typography as="h1" size="2xl" className="font-bold">{t(lang.admin.title)}</Typography>
                    <Typography variant="muted" className="mt-1">
                        {t(lang.admin.description)}
                    </Typography>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} variant="primary" className="sm:flex-shrink-0">
                        <RiAddLine className="w-5 h-5 mr-2" />
                        {t(lang.admin.addSource)}
                    </Button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <Card padding="lg">
                    <Typography as="h2" size="lg" className="font-bold mb-4">
                        {editingSource ? t(lang.admin.editSource) : t(lang.admin.addSourceTitle)}
                    </Typography>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label={t(lang.admin.databaseType)}
                                name="type"
                                type="select"
                                value={formData.type}
                                onChange={(e) => {
                                    const type = e.target.value as DatabaseType;
                                    setFormData({
                                        ...formData,
                                        type,
                                        port: getDefaultPort(type)
                                    });
                                }}
                                options={[
                                    { value: 'mysql', label: 'MySQL / MariaDB' },
                                    { value: 'postgresql', label: 'PostgreSQL' },
                                    { value: 'redis', label: 'Redis' },
                                    { value: 'mongodb', label: 'MongoDB' },
                                ]}
                                required
                            />

                            <FormInput
                                label={t(lang.admin.name)}
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t(lang.admin.namePlaceholder)}
                                required
                            />

                            <FormInput
                                label={t(lang.admin.host)}
                                name="host"
                                type="text"
                                value={formData.host}
                                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                placeholder={t(lang.admin.hostPlaceholder)}
                                required
                            />

                            <FormInput
                                label={t(lang.admin.port)}
                                name="port"
                                type="number"
                                value={formData.port}
                                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                                required
                            />

                            {/* Username and password only required for MySQL and PostgreSQL */}
                            {(formData.type === 'mysql' || formData.type === 'postgresql') && (
                                <>
                                    <FormInput
                                        label={t(lang.admin.adminUsername)}
                                        name="adminUsername"
                                        type="text"
                                        value={formData.adminUsername}
                                        onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                                        placeholder={t(lang.admin.adminUsernamePlaceholder)}
                                        required
                                    />

                                    <FormInput
                                        label={t(lang.admin.adminPassword)}
                                        name="adminPassword"
                                        type="password"
                                        value={formData.adminPassword}
                                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                        showHidePassword
                                        required
                                    />
                                </>
                            )}

                            {/* Optional credentials for Redis and MongoDB */}
                            {(formData.type === 'redis' || formData.type === 'mongodb') && (
                                <>
                                    <FormInput
                                        label={t(lang.admin.adminUsername)}
                                        name="adminUsername"
                                        type="text"
                                        value={formData.adminUsername}
                                        onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                                        placeholder={t(lang.admin.adminUsernamePlaceholder)}
                                        description={t(lang.admin.optionalAuth)}
                                    />

                                    <FormInput
                                        label={t(lang.admin.adminPassword)}
                                        name="adminPassword"
                                        type="password"
                                        value={formData.adminPassword}
                                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                        showHidePassword
                                        description={t(lang.admin.optionalAuth)}
                                    />
                                </>
                            )}

                            <div className="md:col-span-2">
                                <FormInput
                                    label={t(lang.admin.adminerUrl)}
                                    name="adminerUrl"
                                    type="url"
                                    value={formData.adminerUrl}
                                    onChange={(e) => setFormData({ ...formData, adminerUrl: e.target.value })}
                                    placeholder="https://adminer.example.com"
                                    description={t(lang.admin.adminerUrlDesc)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Test Connection Result */}
                        {testResult && (
                            <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-success/10 dark:bg-success/20 border-success/30 dark:border-success' : 'bg-danger/10 dark:bg-danger/20 border-danger/30 dark:border-danger'}`}>
                                <div className="flex items-center gap-2">
                                    {testResult.success ? (
                                        <RiCheckboxCircleLine className="w-5 h-5 text-success dark:text-success" />
                                    ) : (
                                        <RiCloseCircleLine className="w-5 h-5 text-danger dark:text-danger" />
                                    )}
                                    <span className={`font-medium ${testResult.success ? 'text-success dark:text-green-200' : 'text-danger dark:text-red-200'}`}>
                                        {testResult.message}
                                    </span>
                                    {testResult.success && testResult.latencyMs > 0 && (
                                        <span className="text-sm text-muted-foreground">({testResult.latencyMs}ms)</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                onClick={handleTestConnection}
                                variant="secondary"
                                disabled={!formData.host || !formData.port || testingConnection}
                            >
                                <RiRefreshLine className={`w-4 h-4 mr-2 ${testingConnection ? 'animate-spin' : ''}`} />
                                {testingConnection ? t(lang.messages.testing) : t(lang.messages.testConnection)}
                            </Button>
                            <Button type="submit" variant="primary">
                                {editingSource ? t(lang.admin.updateSource) : t(lang.admin.addSource)}
                            </Button>
                            <Button type="button" onClick={resetForm} variant="secondary">
                                {t(lang.admin.cancel)}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Sources List */}
            <div className="grid grid-cols-1 gap-4">
                {sources.length === 0 ? (
                    <Card padding="lg">
                        <div className="text-center py-6">
                            <RiDatabase2Line className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <Typography variant="muted">
                                {t(lang.admin.noSources)}
                            </Typography>
                        </div>
                    </Card>
                ) : (
                    sources.map((source) => (
                        <Card key={source._id} padding="lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Typography as="h3" size="lg" className="font-bold">{source.name}</Typography>
                                        <Badge variant="info">
                                            {source.type.toUpperCase()}
                                        </Badge>
                                        {source.enabled ? (
                                            <Badge variant="success" size="sm">
                                                <RiCheckboxCircleLine className="w-3 h-3 mr-1" />
                                                {t(lang.admin.enabled)}
                                            </Badge>
                                        ) : (
                                            <Badge variant="default" size="sm">
                                                <RiCloseCircleLine className="w-3 h-3 mr-1" />
                                                {t(lang.admin.disabled)}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <div className="font-mono">
                                            {source.host}:{source.port}
                                        </div>
                                        <div>
                                            {t(lang.connection.username)}: <span className="font-mono">{source.adminUsername}</span>
                                        </div>
                                        <div className="text-xs">
                                            {t(lang.admin.added)} {new Date(source.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleEdit(source)}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        <RiEditLine className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(source._id)}
                                        variant="danger"
                                        size="sm"
                                    >
                                        <RiDeleteBinLine className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
            {dialog}
        </div>
    );
}
