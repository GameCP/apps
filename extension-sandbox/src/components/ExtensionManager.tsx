'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineCog6Tooth,
    HiOutlineArrowPath,
    HiOutlineCheck,
    HiOutlineXMark,
    HiOutlineCloudArrowUp,
    HiOutlineDocumentText,
    HiOutlineEye,
    HiOutlinePuzzlePiece,
} from 'react-icons/hi2';
import { useSandboxStore, ExtensionManifest, Extension } from '@/store/sandboxStore';
import LocalExtensions from './LocalExtensions';

export default function ExtensionManager() {
    const {
        extensions,
        addExtension,
        removeExtension,
        toggleExtension,
        selectedExtension,
        setSelectedExtension,
        addConsoleLog,
    } = useSandboxStore();

    const [showInstallModal, setShowInstallModal] = useState(false);
    const [installMethod, setInstallMethod] = useState<'upload' | 'paste' | 'url'>('upload');
    const [manifestJson, setManifestJson] = useState('');
    const [manifestUrl, setManifestUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            if (file.name.endsWith('.zip')) {
                // Handle zip file - extract manifest
                addConsoleLog({
                    level: 'info',
                    source: 'installer',
                    message: `Processing zip file: ${file.name}`,
                });

                // For now, we'll just show an error since we'd need JSZip
                setError('ZIP file support coming soon. Please upload the gamecp.json file directly.');
            } else if (file.name.endsWith('.json')) {
                const text = await file.text();
                const manifest = JSON.parse(text) as ExtensionManifest;
                validateAndInstall(manifest);
            } else {
                setError('Please upload a .json manifest file or .zip extension package');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse file');
            addConsoleLog({
                level: 'error',
                source: 'installer',
                message: `Failed to install extension: ${err instanceof Error ? err.message : 'Unknown error'}`,
            });
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [addConsoleLog]);

    const handlePasteInstall = useCallback(() => {
        setIsLoading(true);
        setError(null);

        try {
            const manifest = JSON.parse(manifestJson) as ExtensionManifest;
            validateAndInstall(manifest);
            setManifestJson('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid JSON');
        } finally {
            setIsLoading(false);
        }
    }, [manifestJson]);

    const handleUrlInstall = useCallback(async () => {
        if (!manifestUrl.trim()) {
            setError('Please enter a URL');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(manifestUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }
            const manifest = await response.json() as ExtensionManifest;
            validateAndInstall(manifest);
            setManifestUrl('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch manifest');
        } finally {
            setIsLoading(false);
        }
    }, [manifestUrl]);

    const validateAndInstall = (manifest: ExtensionManifest) => {
        // Validate required fields
        if (!manifest.extension_id) throw new Error('Missing extension_id');
        if (!manifest.name) throw new Error('Missing name');
        if (!manifest.version) throw new Error('Missing version');

        addExtension(manifest);
        setShowInstallModal(false);
        setError(null);
    };

    const selected = extensions.find(e => e.id === selectedExtension);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Extensions</h1>
                    <p className="text-sm text-muted mt-1">
                        Develop and test GameCP extensions with hot reload
                    </p>
                </div>
            </div>

            {/* Local Extensions from parent directory */}
            <LocalExtensions />

            {/* Divider */}
            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-4 text-xs text-muted bg-background">
                        OR INSTALL MANUALLY
                    </span>
                </div>
            </div>

            {/* Manual Install Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Manual Install</h2>
                    <p className="text-sm text-muted">
                        Upload or paste extension manifests
                    </p>
                </div>
                <button
                    onClick={() => setShowInstallModal(true)}
                    className="btn btn-secondary"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    Install Extension
                </button>
            </div>

            {/* Extensions Grid */}
            {extensions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border-2 border-dashed border-border bg-sidebar">
                    <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
                        <HiOutlinePuzzlePiece className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No extensions installed</h3>
                    <p className="text-sm text-muted text-center max-w-md mb-6">
                        Install your first extension to start testing. You can upload a manifest file,
                        paste JSON directly, or fetch from a URL.
                    </p>
                    <button
                        onClick={() => setShowInstallModal(true)}
                        className="btn btn-accent"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        Install Your First Extension
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {extensions.map((ext) => (
                        <ExtensionCard
                            key={ext.id}
                            extension={ext}
                            isSelected={selectedExtension === ext.id}
                            onSelect={() => setSelectedExtension(ext.id === selectedExtension ? null : ext.id)}
                            onToggle={() => toggleExtension(ext.id)}
                            onRemove={() => removeExtension(ext.id)}
                        />
                    ))}
                </div>
            )}

            {/* Selected Extension Details */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <ExtensionDetails extension={selected} onClose={() => setSelectedExtension(null)} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Install Modal */}
            <AnimatePresence>
                {showInstallModal && (
                    <InstallModal
                        installMethod={installMethod}
                        setInstallMethod={setInstallMethod}
                        manifestJson={manifestJson}
                        setManifestJson={setManifestJson}
                        manifestUrl={manifestUrl}
                        setManifestUrl={setManifestUrl}
                        isLoading={isLoading}
                        error={error}
                        fileInputRef={fileInputRef}
                        onFileUpload={handleFileUpload}
                        onPasteInstall={handlePasteInstall}
                        onUrlInstall={handleUrlInstall}
                        onClose={() => {
                            setShowInstallModal(false);
                            setError(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

interface ExtensionCardProps {
    extension: Extension;
    isSelected: boolean;
    onSelect: () => void;
    onToggle: () => void;
    onRemove: () => void;
}

function ExtensionCard({ extension, isSelected, onSelect, onToggle, onRemove }: ExtensionCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
        group p-5 rounded-xl border bg-card hover-lift cursor-pointer transition-colors
        ${isSelected ? 'border-accent ring-2 ring-accent/20' : 'border-border'}
      `}
            onClick={onSelect}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${extension.enabled ? 'bg-accent/10' : 'bg-sidebar'}
          `}>
                        <HiOutlinePuzzlePiece className={`w-5 h-5 ${extension.enabled ? 'text-accent' : 'text-muted'}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{extension.name}</h3>
                        <p className="text-xs text-muted">v{extension.version}</p>
                    </div>
                </div>

                {/* Toggle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    className={`
            relative w-11 h-6 rounded-full transition-colors
            ${extension.enabled ? 'bg-success' : 'bg-border'}
          `}
                >
                    <span
                        className={`
              absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
              ${extension.enabled ? 'left-6' : 'left-1'}
            `}
                    />
                </button>
            </div>

            <p className="text-sm text-muted line-clamp-2 mb-4">
                {extension.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted">by {extension.author}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                        <HiOutlineTrash className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

interface ExtensionDetailsProps {
    extension: Extension;
    onClose: () => void;
}

function ExtensionDetails({ extension, onClose }: ExtensionDetailsProps) {
    const manifest = extension.manifest;

    return (
        <div className="p-6 rounded-xl bg-card border border-border animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Extension Details</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-sidebar rounded-lg transition-colors"
                >
                    <HiOutlineXMark className="w-5 h-5 text-muted" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Manifest Info */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-foreground mb-2">Manifest</h3>
                        <div className="code-block max-h-64 overflow-auto">
                            <pre className="text-xs">{JSON.stringify(manifest, null, 2)}</pre>
                        </div>
                    </div>
                </div>

                {/* UI Injections & API Routes */}
                <div className="space-y-4">
                    {manifest.ui_injection && manifest.ui_injection.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-foreground mb-2">UI Injections</h3>
                            <div className="space-y-2">
                                {manifest.ui_injection.map((injection, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-sidebar border border-border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="badge badge-info">{injection.method}</span>
                                            <span className="text-xs font-mono text-muted">{injection.target}</span>
                                        </div>
                                        <p className="text-sm text-foreground">{injection.component}</p>
                                        {injection.route_path && (
                                            <p className="text-xs text-muted mt-1">Route: {injection.route_path}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {manifest.internal_logic?.api_routes && manifest.internal_logic.api_routes.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-foreground mb-2">API Routes</h3>
                            <div className="space-y-2">
                                {manifest.internal_logic.api_routes.map((route, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-sidebar border border-border">
                                        <div className="flex items-center gap-2">
                                            <span className={`
                        badge
                        ${route.method === 'GET' ? 'badge-success' : ''}
                        ${route.method === 'POST' ? 'badge-info' : ''}
                        ${route.method === 'PUT' || route.method === 'PATCH' ? 'badge-warning' : ''}
                        ${route.method === 'DELETE' ? 'badge-error' : ''}
                      `}>
                                                {route.method}
                                            </span>
                                            <span className="text-sm font-mono text-foreground">{route.path}</span>
                                        </div>
                                        {route.description && (
                                            <p className="text-xs text-muted mt-1">{route.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {manifest.sandbox_config && (
                        <div>
                            <h3 className="text-sm font-medium text-foreground mb-2">Sandbox Config</h3>
                            <div className="p-3 rounded-lg bg-sidebar border border-border">
                                {manifest.sandbox_config.permissions && (
                                    <div className="mb-2">
                                        <span className="text-xs text-muted">Permissions:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {manifest.sandbox_config.permissions.map((perm, idx) => (
                                                <span key={idx} className="badge badge-warning">{perm}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {manifest.sandbox_config.db_collections && (
                                    <div className="mb-2">
                                        <span className="text-xs text-muted">Collections:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {manifest.sandbox_config.db_collections.map((col, idx) => (
                                                <span key={idx} className="badge badge-info">{col}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {manifest.sandbox_config.node_modules && (
                                    <div>
                                        <span className="text-xs text-muted">Node Modules:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {manifest.sandbox_config.node_modules.map((mod, idx) => (
                                                <span key={idx} className="badge badge-success">{mod}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface InstallModalProps {
    installMethod: 'upload' | 'paste' | 'url';
    setInstallMethod: (method: 'upload' | 'paste' | 'url') => void;
    manifestJson: string;
    setManifestJson: (json: string) => void;
    manifestUrl: string;
    setManifestUrl: (url: string) => void;
    isLoading: boolean;
    error: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasteInstall: () => void;
    onUrlInstall: () => void;
    onClose: () => void;
}

function InstallModal({
    installMethod,
    setInstallMethod,
    manifestJson,
    setManifestJson,
    manifestUrl,
    setManifestUrl,
    isLoading,
    error,
    fileInputRef,
    onFileUpload,
    onPasteInstall,
    onUrlInstall,
    onClose,
}: InstallModalProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">Install Extension</h2>
                    <p className="text-sm text-muted">Add an extension to the sandbox</p>
                </div>

                {/* Method tabs */}
                <div className="px-6 pt-4">
                    <div className="flex rounded-lg bg-sidebar p-1">
                        {(['upload', 'paste', 'url'] as const).map((method) => (
                            <button
                                key={method}
                                onClick={() => setInstallMethod(method)}
                                className={`
                  flex-1 py-2 text-sm font-medium rounded-md transition-colors
                  ${installMethod === method
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted hover:text-foreground'
                                    }
                `}
                            >
                                {method === 'upload' && 'Upload File'}
                                {method === 'paste' && 'Paste JSON'}
                                {method === 'url' && 'From URL'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    {installMethod === 'upload' && (
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.zip"
                                onChange={onFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="w-full p-8 border-2 border-dashed border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-colors"
                            >
                                <HiOutlineCloudArrowUp className="w-10 h-10 mx-auto text-muted mb-3" />
                                <p className="text-sm text-foreground font-medium">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-muted mt-1">
                                    gamecp.json or extension.zip
                                </p>
                            </button>
                        </div>
                    )}

                    {installMethod === 'paste' && (
                        <div>
                            <textarea
                                value={manifestJson}
                                onChange={(e) => setManifestJson(e.target.value)}
                                placeholder='Paste your gamecp.json manifest here...'
                                className="input h-48 font-mono text-sm resize-none"
                            />
                            <button
                                onClick={onPasteInstall}
                                disabled={isLoading || !manifestJson.trim()}
                                className="btn btn-primary w-full mt-4"
                            >
                                {isLoading ? (
                                    <HiOutlineArrowPath className="w-4 h-4 animate-spin" />
                                ) : (
                                    <HiOutlineCheck className="w-4 h-4" />
                                )}
                                Install Extension
                            </button>
                        </div>
                    )}

                    {installMethod === 'url' && (
                        <div>
                            <input
                                type="url"
                                value={manifestUrl}
                                onChange={(e) => setManifestUrl(e.target.value)}
                                placeholder="https://example.com/gamecp.json"
                                className="input"
                            />
                            <button
                                onClick={onUrlInstall}
                                disabled={isLoading || !manifestUrl.trim()}
                                className="btn btn-primary w-full mt-4"
                            >
                                {isLoading ? (
                                    <HiOutlineArrowPath className="w-4 h-4 animate-spin" />
                                ) : (
                                    <HiOutlineCheck className="w-4 h-4" />
                                )}
                                Fetch & Install
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-sidebar border-t border-border flex justify-end">
                    <button onClick={onClose} className="btn btn-secondary">
                        Cancel
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
