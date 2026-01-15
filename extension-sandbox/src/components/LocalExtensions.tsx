'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineFolder,
    HiOutlineArrowPath,
    HiOutlineCheck,
    HiOutlineXMark,
    HiOutlineEye,
    HiOutlineCodeBracket,
    HiOutlineCog6Tooth,
    HiOutlinePlay,
    HiOutlineExclamationTriangle,
    HiOutlineDocumentText,
    HiOutlineCommandLine,
} from 'react-icons/hi2';
import { useSandboxStore } from '@/store/sandboxStore';

interface LocalExtension {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    path: string;
    manifestPath: string;
    manifest: Record<string, unknown>;
    hasDist: boolean;
    hasNodeModules: boolean;
    lastModified: string;
}

interface ExtensionDetail {
    id: string;
    name: string;
    path: string;
    manifest: Record<string, unknown>;
    files: { path: string; size: number; modified: string }[];
    uiBundle: string | null;
    handlersBundle: string | null;
    hasDist: boolean;
    hasSrc: boolean;
}

export default function LocalExtensions() {
    const { addConsoleLog } = useSandboxStore();
    const [extensions, setExtensions] = useState<LocalExtension[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedExt, setSelectedExt] = useState<string | null>(null);
    const [extDetail, setExtDetail] = useState<ExtensionDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [enabledExtensions, setEnabledExtensions] = useState<Set<string>>(new Set());
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchExtensions = useCallback(async () => {
        try {
            const res = await fetch('/api/extensions');
            if (!res.ok) throw new Error('Failed to fetch extensions');
            const data = await res.json();
            setExtensions(data.extensions);
            setError(null);
            setLastRefresh(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load extensions');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchExtensionDetail = useCallback(async (id: string) => {
        setLoadingDetail(true);
        try {
            const res = await fetch(`/api/extensions/${id}`);
            if (!res.ok) throw new Error('Failed to fetch extension details');
            const data = await res.json();
            setExtDetail(data);
        } catch (err) {
            addConsoleLog({
                level: 'error',
                source: 'local-ext',
                message: `Failed to load extension details: ${err instanceof Error ? err.message : 'Unknown error'}`,
            });
        } finally {
            setLoadingDetail(false);
        }
    }, [addConsoleLog]);

    // Initial load
    useEffect(() => {
        fetchExtensions();
    }, [fetchExtensions]);

    // Auto-refresh every 2 seconds for hot reload detection
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchExtensions();
        }, 2000);

        return () => clearInterval(interval);
    }, [autoRefresh, fetchExtensions]);

    // Fetch detail when selected
    useEffect(() => {
        if (selectedExt) {
            fetchExtensionDetail(selectedExt);
        } else {
            setExtDetail(null);
        }
    }, [selectedExt, fetchExtensionDetail]);

    const handleToggleExtension = (id: string) => {
        const ext = extensions.find(e => e.id === id);
        if (!ext) return;

        if (enabledExtensions.has(id)) {
            setEnabledExtensions(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            addConsoleLog({
                level: 'info',
                source: 'local-ext',
                message: `Disabled extension: ${ext.name}`,
            });
        } else {
            if (!ext.hasDist) {
                addConsoleLog({
                    level: 'warn',
                    source: 'local-ext',
                    message: `Extension "${ext.name}" has no dist folder. Run 'npm run build' first.`,
                });
            }
            setEnabledExtensions(prev => new Set([...prev, id]));
            addConsoleLog({
                level: 'info',
                source: 'local-ext',
                message: `Enabled extension: ${ext.name}`,
                data: { version: ext.version, hasDist: ext.hasDist },
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <HiOutlineArrowPath className="w-6 h-6 text-muted animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 rounded-xl bg-danger/5 border border-danger/20 text-center">
                <HiOutlineExclamationTriangle className="w-8 h-8 text-danger mx-auto mb-2" />
                <p className="text-danger">{error}</p>
                <button onClick={fetchExtensions} className="btn btn-secondary mt-4">
                    <HiOutlineArrowPath className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <HiOutlineFolder className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">Local Extensions</h2>
                        <p className="text-xs text-muted">
                            Found {extensions.length} extensions in parent directory
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Auto refresh toggle */}
                    <label className="flex items-center gap-2 text-sm text-muted">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`
                relative w-10 h-5 rounded-full transition-colors
                ${autoRefresh ? 'bg-success' : 'bg-border'}
              `}
                        >
                            <span className={`
                absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                ${autoRefresh ? 'left-5' : 'left-0.5'}
              `} />
                        </button>
                        Hot Reload
                    </label>

                    <button onClick={fetchExtensions} className="btn btn-secondary text-sm">
                        <HiOutlineArrowPath className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Last refresh indicator */}
            <div className="flex items-center gap-2 text-xs text-muted">
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                Last updated: {lastRefresh.toLocaleTimeString()}
                {autoRefresh && <span className="text-success">(watching for changes)</span>}
            </div>

            {/* Extensions list */}
            {extensions.length === 0 ? (
                <div className="p-8 rounded-xl border-2 border-dashed border-border bg-sidebar text-center">
                    <HiOutlineFolder className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-muted">No extensions found in parent directory</p>
                    <p className="text-xs text-muted mt-2">
                        Create a folder with a <code className="text-foreground">gamecp.json</code> manifest
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extensions.map((ext) => (
                        <LocalExtensionCard
                            key={ext.id}
                            extension={ext}
                            isEnabled={enabledExtensions.has(ext.id)}
                            isSelected={selectedExt === ext.id}
                            onToggle={() => handleToggleExtension(ext.id)}
                            onSelect={() => setSelectedExt(selectedExt === ext.id ? null : ext.id)}
                        />
                    ))}
                </div>
            )}

            {/* Selected extension detail */}
            <AnimatePresence>
                {selectedExt && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <ExtensionDetailPanel
                            extension={extDetail}
                            loading={loadingDetail}
                            onClose={() => setSelectedExt(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface LocalExtensionCardProps {
    extension: LocalExtension;
    isEnabled: boolean;
    isSelected: boolean;
    onToggle: () => void;
    onSelect: () => void;
}

function LocalExtensionCard({ extension, isEnabled, isSelected, onToggle, onSelect }: LocalExtensionCardProps) {
    return (
        <motion.div
            layout
            className={`
        group p-4 rounded-xl border bg-card cursor-pointer transition-all
        ${isSelected ? 'border-accent ring-2 ring-accent/20' : 'border-border hover:border-muted'}
      `}
            onClick={onSelect}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`
            w-9 h-9 rounded-lg flex items-center justify-center
            ${isEnabled ? 'bg-success/10' : 'bg-sidebar'}
          `}>
                        <HiOutlineCodeBracket className={`w-4 h-4 ${isEnabled ? 'text-success' : 'text-muted'}`} />
                    </div>
                    <div>
                        <h3 className="font-medium text-foreground">{extension.name}</h3>
                        <p className="text-xs text-muted">v{extension.version}</p>
                    </div>
                </div>

                {/* Enable toggle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    className={`
            relative w-10 h-5 rounded-full transition-colors
            ${isEnabled ? 'bg-success' : 'bg-border'}
          `}
                >
                    <span className={`
            absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
            ${isEnabled ? 'left-5' : 'left-0.5'}
          `} />
                </button>
            </div>

            <p className="text-sm text-muted line-clamp-2 mb-3">
                {extension.description || 'No description'}
            </p>

            {/* Status indicators */}
            <div className="flex items-center gap-2 pt-3 border-t border-border">
                <span className={`badge ${extension.hasDist ? 'badge-success' : 'badge-warning'}`}>
                    {extension.hasDist ? 'Built' : 'Not Built'}
                </span>
                <span className={`badge ${extension.hasNodeModules ? 'badge-info' : 'badge-error'}`}>
                    {extension.hasNodeModules ? 'Deps OK' : 'No Deps'}
                </span>
                <span className="text-xs text-muted ml-auto">
                    {extension.author}
                </span>
            </div>
        </motion.div>
    );
}

interface ExtensionDetailPanelProps {
    extension: ExtensionDetail | null;
    loading: boolean;
    onClose: () => void;
}

function ExtensionDetailPanel({ extension, loading, onClose }: ExtensionDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<'manifest' | 'files' | 'preview'>('manifest');
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [loadingFile, setLoadingFile] = useState(false);

    const loadFile = async (filePath: string) => {
        if (!extension) return;
        setLoadingFile(true);
        setSelectedFile(filePath);

        try {
            const res = await fetch(`/api/extensions/file?id=${extension.id}&file=${encodeURIComponent(filePath)}`);
            if (!res.ok) throw new Error('Failed to load file');
            const data = await res.json();
            setFileContent(data.content);
        } catch (err) {
            setFileContent(`Error loading file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoadingFile(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-center py-8">
                    <HiOutlineArrowPath className="w-6 h-6 text-muted animate-spin" />
                </div>
            </div>
        );
    }

    if (!extension) return null;

    const srcFiles = extension.files.filter(f => f.path.startsWith('src/'));
    const distFiles = extension.files.filter(f => f.path.startsWith('dist/'));

    return (
        <div className="p-6 rounded-xl bg-card border border-border animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-foreground">{extension.name}</h3>
                    <p className="text-xs text-muted font-mono">{extension.path}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-sidebar rounded-lg">
                    <HiOutlineXMark className="w-5 h-5 text-muted" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-sidebar mb-4">
                {(['manifest', 'files', 'preview'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
              flex-1 py-2 text-sm font-medium rounded-md capitalize transition-colors
              ${activeTab === tab
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted hover:text-foreground'
                            }
            `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'manifest' && (
                <div className="code-block max-h-80 overflow-auto">
                    <pre className="text-xs">{JSON.stringify(extension.manifest, null, 2)}</pre>
                </div>
            )}

            {activeTab === 'files' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* File tree */}
                    <div className="space-y-2 max-h-80 overflow-auto">
                        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Source Files ({srcFiles.length})
                        </h4>
                        {srcFiles.map((file) => (
                            <button
                                key={file.path}
                                onClick={() => loadFile(file.path)}
                                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors
                  ${selectedFile === file.path
                                        ? 'bg-accent/10 text-accent'
                                        : 'hover:bg-sidebar text-muted'
                                    }
                `}
                            >
                                <HiOutlineDocumentText className="w-4 h-4 shrink-0" />
                                <span className="truncate font-mono text-xs">{file.path}</span>
                                <span className="text-xs text-muted ml-auto">
                                    {(file.size / 1024).toFixed(1)}KB
                                </span>
                            </button>
                        ))}

                        {distFiles.length > 0 && (
                            <>
                                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 mt-4">
                                    Dist Files ({distFiles.length})
                                </h4>
                                {distFiles.slice(0, 5).map((file) => (
                                    <button
                                        key={file.path}
                                        onClick={() => loadFile(file.path)}
                                        className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors
                      ${selectedFile === file.path
                                                ? 'bg-accent/10 text-accent'
                                                : 'hover:bg-sidebar text-muted'
                                            }
                    `}
                                    >
                                        <HiOutlineCodeBracket className="w-4 h-4 shrink-0" />
                                        <span className="truncate font-mono text-xs">{file.path}</span>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>

                    {/* File content preview */}
                    <div className="code-block max-h-80 overflow-auto">
                        {loadingFile ? (
                            <div className="flex items-center justify-center py-8">
                                <HiOutlineArrowPath className="w-5 h-5 text-muted animate-spin" />
                            </div>
                        ) : fileContent ? (
                            <pre className="text-xs">{fileContent}</pre>
                        ) : (
                            <div className="text-center py-8 text-muted text-sm">
                                Select a file to view
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'preview' && (
                <div className="text-center py-12">
                    {extension.hasDist ? (
                        <div>
                            <HiOutlinePlay className="w-12 h-12 text-accent mx-auto mb-4" />
                            <p className="text-foreground mb-2">Extension is built and ready</p>
                            <p className="text-sm text-muted">
                                Enable the extension to see it in action
                            </p>
                        </div>
                    ) : (
                        <div>
                            <HiOutlineCommandLine className="w-12 h-12 text-amber mx-auto mb-4" />
                            <p className="text-foreground mb-2">Extension needs to be built</p>
                            <p className="text-sm text-muted mb-4">
                                Run the following command in the extension directory:
                            </p>
                            <code className="px-4 py-2 rounded-lg bg-sidebar text-sm font-mono">
                                npm run build
                            </code>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
