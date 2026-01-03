import React, { useState, useEffect } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, Badge, FormInput, useConfirmDialog } from '@gamecp/ui';
import { databaseContent } from './content';
import type { DatabaseSource, DatabaseType } from './types';
import { HiDatabase, HiPlus, HiTrash, HiPencil, HiCheckCircle, HiXCircle, HiRefresh } from 'react-icons/hi';

interface TestResult {
    success: boolean;
    message: string;
    latencyMs: number;
}

export function DatabaseSourcesPage() {
    const { api, t } = useGameCP();
    const { confirm, dialog } = useConfirmDialog();
    const [sources, setSources] = useState<DatabaseSource[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        loadSources();
    }, []);

    const loadSources = async () => {
        setLoading(true);
        try {
            const data = await api.get('/api/x/database-manager/sources');
            setSources(data.sources || []);
        } catch (error) {
            console.error('Failed to load sources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingSource) {
                await api.put(`/api/x/database-manager/sources/${editingSource._id}`, formData);
            } else {
                await api.post('/api/x/database-manager/sources', formData);
            }

            await loadSources();
            resetForm();
        } catch (error: any) {
            alert(error.error || 'Failed to save source');
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
            title: t(databaseContent.admin.deleteConfirmTitle),
            message: t(databaseContent.admin.deleteConfirmMessage),
            confirmText: t(databaseContent.buttons.delete),
        });

        if (!confirmed) return;

        try {
            await api.delete(`/api/x/database-manager/sources/${id}`);
            await loadSources();
        } catch (error: any) {
            alert(error.error || 'Failed to delete source');
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
                message: error.error || error.message || 'Connection test failed',
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
            <div className="p-6">
                <Card>
                    <div className="p-6 text-center text-muted-foreground">
                        {t(databaseContent.admin.loading)}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t(databaseContent.admin.title)}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t(databaseContent.admin.description)}
                    </p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} variant="primary">
                        <HiPlus className="w-5 h-5 mr-2" />
                        {t(databaseContent.admin.addSource)}
                    </Button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4">
                            {editingSource ? t(databaseContent.admin.editSource) : t(databaseContent.admin.addSourceTitle)}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label={t(databaseContent.admin.databaseType)}
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
                                    label={t(databaseContent.admin.name)}
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={t(databaseContent.admin.namePlaceholder)}
                                    required
                                />

                                <FormInput
                                    label={t(databaseContent.admin.host)}
                                    name="host"
                                    type="text"
                                    value={formData.host}
                                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                    placeholder={t(databaseContent.admin.hostPlaceholder)}
                                    required
                                />

                                <FormInput
                                    label={t(databaseContent.admin.port)}
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
                                            label={t(databaseContent.admin.adminUsername)}
                                            name="adminUsername"
                                            type="text"
                                            value={formData.adminUsername}
                                            onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                                            placeholder={t(databaseContent.admin.adminUsernamePlaceholder)}
                                            required
                                        />

                                        <FormInput
                                            label={t(databaseContent.admin.adminPassword)}
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
                                            label={t(databaseContent.admin.adminUsername)}
                                            name="adminUsername"
                                            type="text"
                                            value={formData.adminUsername}
                                            onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                                            placeholder={t(databaseContent.admin.adminUsernamePlaceholder)}
                                            description="Optional - leave blank if authentication is not enabled"
                                        />

                                        <FormInput
                                            label={t(databaseContent.admin.adminPassword)}
                                            name="adminPassword"
                                            type="password"
                                            value={formData.adminPassword}
                                            onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                            showHidePassword
                                            description="Optional - leave blank if authentication is not enabled"
                                        />
                                    </>
                                )}

                                <div className="md:col-span-2">
                                    <FormInput
                                        label="Adminer URL"
                                        name="adminerUrl"
                                        type="url"
                                        value={formData.adminerUrl}
                                        onChange={(e) => setFormData({ ...formData, adminerUrl: e.target.value })}
                                        placeholder="https://adminer.example.com"
                                        description="URL to your Adminer instance for web-based database management."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Test Connection Result */}
                            {testResult && (
                                <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                                    <div className="flex items-center gap-2">
                                        {testResult.success ? (
                                            <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <HiXCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        )}
                                        <span className={`font-medium ${testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
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
                                    <HiRefresh className={`w-4 h-4 mr-2 ${testingConnection ? 'animate-spin' : ''}`} />
                                    {testingConnection ? 'Testing...' : 'Test Connection'}
                                </Button>
                                <Button type="submit" variant="primary">
                                    {editingSource ? t(databaseContent.admin.updateSource) : t(databaseContent.admin.addSource)}
                                </Button>
                                <Button type="button" onClick={resetForm} variant="secondary">
                                    {t(databaseContent.admin.cancel)}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            )}

            {/* Sources List */}
            <div className="grid grid-cols-1 gap-4">
                {sources.length === 0 ? (
                    <Card>
                        <div className="p-12 text-center">
                            <HiDatabase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {t(databaseContent.admin.noSources)}
                            </p>
                        </div>
                    </Card>
                ) : (
                    sources.map((source) => (
                        <Card key={source._id}>
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-foreground">{source.name}</h3>
                                            <Badge variant={source.enabled ? 'success' : 'default'}>
                                                {source.type.toUpperCase()}
                                            </Badge>
                                            {source.enabled ? (
                                                <Badge variant="success" size="sm">
                                                    <HiCheckCircle className="w-3 h-3 mr-1" />
                                                    {t(databaseContent.admin.enabled)}
                                                </Badge>
                                            ) : (
                                                <Badge variant="default" size="sm">
                                                    <HiXCircle className="w-3 h-3 mr-1" />
                                                    {t(databaseContent.admin.disabled)}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="font-mono">
                                                {source.host}:{source.port}
                                            </div>
                                            <div>
                                                {t(databaseContent.connection.username)}: <span className="font-mono">{source.adminUsername}</span>
                                            </div>
                                            <div className="text-xs">
                                                {t(databaseContent.admin.added)} {new Date(source.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleEdit(source)}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            <HiPencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(source._id)}
                                            variant="danger"
                                            size="sm"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
