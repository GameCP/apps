'use client';

import { useState } from 'react';
import {
    HiOutlineUser,
    HiOutlineTrash,
    HiOutlineArrowPath,
    HiOutlineCheck,
} from 'react-icons/hi2';
import { SandboxLayout } from '@/components';
import { useSandboxStore, MockUser } from '@/store/sandboxStore';

const ROLES = ['admin', 'manager', 'user', 'demo'] as const;

export default function SettingsPage() {
    const {
        currentUser,
        setCurrentUser,
        extensions,
        mockServers,
        clearConsoleLogs,
    } = useSandboxStore();

    const [userForm, setUserForm] = useState<MockUser>(currentUser);
    const [saved, setSaved] = useState(false);

    const handleSaveUser = () => {
        setCurrentUser({
            ...userForm,
            fullName: `${userForm.firstName} ${userForm.lastName}`.trim(),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleResetAll = () => {
        if (confirm('Are you sure you want to reset all sandbox data? This will remove all extensions, servers, and logs.')) {
            localStorage.removeItem('gamecp-sandbox-storage');
            window.location.reload();
        }
    };

    return (
        <SandboxLayout>
            <div className="space-y-8 max-w-3xl">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                    <p className="text-sm text-muted mt-1">
                        Configure the sandbox environment
                    </p>
                </div>

                {/* Mock User Settings */}
                <section className="p-6 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <HiOutlineUser className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Mock User</h2>
                            <p className="text-sm text-muted">Configure the simulated user for testing</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={userForm.firstName}
                                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={userForm.lastName}
                                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={userForm.email}
                                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Role
                            </label>
                            <div className="flex gap-2">
                                {ROLES.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setUserForm({ ...userForm, role })}
                                        className={`
                      px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                      ${userForm.role === role
                                                ? 'bg-primary text-background'
                                                : 'bg-sidebar text-muted hover:text-foreground border border-border'
                                            }
                    `}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted mt-2">
                                Role affects how extensions handle permissions (e.g., admin-only features)
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button onClick={handleSaveUser} className="btn btn-primary">
                                {saved ? (
                                    <>
                                        <HiOutlineCheck className="w-4 h-4" />
                                        Saved!
                                    </>
                                ) : (
                                    'Save User Settings'
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Storage Info */}
                <section className="p-6 rounded-xl bg-card border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Sandbox Data</h2>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-sidebar">
                            <p className="text-2xl font-bold text-foreground">{extensions.length}</p>
                            <p className="text-sm text-muted">Extensions</p>
                        </div>
                        <div className="p-4 rounded-lg bg-sidebar">
                            <p className="text-2xl font-bold text-foreground">{mockServers.length}</p>
                            <p className="text-sm text-muted">Mock Servers</p>
                        </div>
                        <div className="p-4 rounded-lg bg-sidebar">
                            <p className="text-2xl font-bold text-foreground">Local</p>
                            <p className="text-sm text-muted">Storage</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={clearConsoleLogs} className="btn btn-secondary">
                            <HiOutlineTrash className="w-4 h-4" />
                            Clear Console
                        </button>
                        <button onClick={handleResetAll} className="btn btn-danger">
                            <HiOutlineArrowPath className="w-4 h-4" />
                            Reset All Data
                        </button>
                    </div>
                </section>

                {/* About */}
                <section className="p-6 rounded-xl bg-sidebar border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-2">About</h2>
                    <p className="text-sm text-muted mb-4">
                        GameCP Extension Sandbox is an open-source testing environment for developing
                        GameCP extensions. It simulates the GameCP runtime environment, allowing you
                        to test UI components, API handlers, and server interactions without deploying
                        to a live environment.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                        <a
                            href="https://github.com/GameCP/apps"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            GitHub Repository
                        </a>
                        <a
                            href="https://appstore.gamecp.com/developers"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            Developer Docs
                        </a>
                    </div>
                </section>
            </div>
        </SandboxLayout>
    );
}
