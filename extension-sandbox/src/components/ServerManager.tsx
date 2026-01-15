'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlinePlay,
    HiOutlineStop,
    HiOutlineArrowPath,
    HiOutlineServer,
    HiOutlineUsers,
    HiOutlineSignal,
    HiOutlineXMark,
} from 'react-icons/hi2';
import { useSandboxStore, MockGameServer } from '@/store/sandboxStore';

const GAMES = [
    'Minecraft',
    'Counter-Strike 2',
    'Rust',
    'ARK: Survival Evolved',
    'Valheim',
    'Terraria',
    'Factorio',
    '7 Days to Die',
    'Project Zomboid',
    'Satisfactory',
];

export default function ServerManager() {
    const { mockServers, addMockServer, removeMockServer, updateMockServer, addConsoleLog } = useSandboxStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newServer, setNewServer] = useState({
        name: '',
        game: GAMES[0],
        ip: '192.168.1.100',
        port: 25565,
        maxPlayers: 20,
    });

    const handleCreate = () => {
        if (!newServer.name.trim()) return;

        addMockServer({
            ...newServer,
            status: 'offline',
            players: 0,
        });

        setNewServer({
            name: '',
            game: GAMES[0],
            ip: '192.168.1.100',
            port: 25565,
            maxPlayers: 20,
        });
        setShowCreateModal(false);
    };

    const handleStartStop = (server: MockGameServer) => {
        if (server.status === 'online') {
            updateMockServer(server.id, { status: 'stopping' });
            addConsoleLog({
                level: 'info',
                source: 'server',
                message: `Stopping server: ${server.name}`,
            });
            setTimeout(() => {
                updateMockServer(server.id, { status: 'offline', players: 0 });
                addConsoleLog({
                    level: 'info',
                    source: 'server',
                    message: `Server stopped: ${server.name}`,
                });
            }, 1500);
        } else if (server.status === 'offline') {
            updateMockServer(server.id, { status: 'starting' });
            addConsoleLog({
                level: 'info',
                source: 'server',
                message: `Starting server: ${server.name}`,
            });
            setTimeout(() => {
                const players = Math.floor(Math.random() * (server.maxPlayers / 2));
                updateMockServer(server.id, { status: 'online', players });
                addConsoleLog({
                    level: 'info',
                    source: 'server',
                    message: `Server online: ${server.name} (${players} players)`,
                });
            }, 2000);
        }
    };

    const handleRestart = (server: MockGameServer) => {
        if (server.status !== 'online') return;

        updateMockServer(server.id, { status: 'stopping' });
        addConsoleLog({
            level: 'info',
            source: 'server',
            message: `Restarting server: ${server.name}`,
        });

        setTimeout(() => {
            updateMockServer(server.id, { status: 'starting' });
            setTimeout(() => {
                const players = Math.floor(Math.random() * (server.maxPlayers / 2));
                updateMockServer(server.id, { status: 'online', players });
                addConsoleLog({
                    level: 'info',
                    source: 'server',
                    message: `Server restarted: ${server.name} (${players} players)`,
                });
            }, 1500);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Game Servers</h1>
                    <p className="text-sm text-muted mt-1">
                        Manage mock game servers for testing extension interactions
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    Add Server
                </button>
            </div>

            {/* Server Grid */}
            {mockServers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border-2 border-dashed border-border bg-sidebar">
                    <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
                        <HiOutlineServer className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No game servers</h3>
                    <p className="text-sm text-muted text-center max-w-md mb-6">
                        Create mock game servers to test how extensions interact with server events and data.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-accent"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        Create Your First Server
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {mockServers.map((server) => (
                        <ServerCard
                            key={server.id}
                            server={server}
                            onStartStop={() => handleStartStop(server)}
                            onRestart={() => handleRestart(server)}
                            onRemove={() => removeMockServer(server.id)}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-border">
                                <h2 className="text-lg font-semibold text-foreground">Create Mock Server</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Server Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newServer.name}
                                        onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                                        placeholder="My Awesome Server"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Game
                                    </label>
                                    <select
                                        value={newServer.game}
                                        onChange={(e) => setNewServer({ ...newServer, game: e.target.value })}
                                        className="input"
                                    >
                                        {GAMES.map((game) => (
                                            <option key={game} value={game}>{game}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            IP Address
                                        </label>
                                        <input
                                            type="text"
                                            value={newServer.ip}
                                            onChange={(e) => setNewServer({ ...newServer, ip: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Port
                                        </label>
                                        <input
                                            type="number"
                                            value={newServer.port}
                                            onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
                                            className="input"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Max Players
                                    </label>
                                    <input
                                        type="number"
                                        value={newServer.maxPlayers}
                                        onChange={(e) => setNewServer({ ...newServer, maxPlayers: parseInt(e.target.value) })}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-sidebar border-t border-border flex justify-end gap-3">
                                <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={handleCreate} disabled={!newServer.name.trim()} className="btn btn-primary">
                                    Create Server
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface ServerCardProps {
    server: MockGameServer;
    onStartStop: () => void;
    onRestart: () => void;
    onRemove: () => void;
}

function ServerCard({ server, onStartStop, onRestart, onRemove }: ServerCardProps) {
    const isTransitioning = server.status === 'starting' || server.status === 'stopping';

    const statusConfig = {
        online: { color: 'var(--success)', label: 'Online', dotClass: 'online' },
        offline: { color: 'var(--muted)', label: 'Offline', dotClass: 'offline' },
        starting: { color: 'var(--warning)', label: 'Starting...', dotClass: 'warning' },
        stopping: { color: 'var(--warning)', label: 'Stopping...', dotClass: 'warning' },
    };

    const status = statusConfig[server.status];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group p-5 rounded-xl border border-border bg-card hover-lift"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sidebar border border-border flex items-center justify-center">
                        <HiOutlineServer className="w-5 h-5 text-muted" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{server.name}</h3>
                        <p className="text-xs text-muted">{server.game}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={`status-dot ${status.dotClass}`}></span>
                    <span className="text-xs font-medium" style={{ color: status.color }}>
                        {status.label}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-sidebar">
                    <div className="flex items-center gap-2 text-muted mb-1">
                        <HiOutlineUsers className="w-4 h-4" />
                        <span className="text-xs">Players</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                        {server.players} / {server.maxPlayers}
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-sidebar">
                    <div className="flex items-center gap-2 text-muted mb-1">
                        <HiOutlineSignal className="w-4 h-4" />
                        <span className="text-xs">Address</span>
                    </div>
                    <p className="text-sm font-mono text-foreground">
                        {server.ip}:{server.port}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-border">
                <button
                    onClick={onStartStop}
                    disabled={isTransitioning}
                    className={`
            flex-1 btn text-sm
            ${server.status === 'online' ? 'btn-danger' : 'btn-accent'}
          `}
                >
                    {isTransitioning ? (
                        <HiOutlineArrowPath className="w-4 h-4 animate-spin" />
                    ) : server.status === 'online' ? (
                        <>
                            <HiOutlineStop className="w-4 h-4" />
                            Stop
                        </>
                    ) : (
                        <>
                            <HiOutlinePlay className="w-4 h-4" />
                            Start
                        </>
                    )}
                </button>

                <button
                    onClick={onRestart}
                    disabled={server.status !== 'online'}
                    className="btn btn-secondary text-sm"
                    title="Restart"
                >
                    <HiOutlineArrowPath className="w-4 h-4" />
                </button>

                <button
                    onClick={onRemove}
                    className="btn btn-secondary text-sm hover:!bg-danger/10 hover:!text-danger hover:!border-danger/20"
                    title="Delete"
                >
                    <HiOutlineTrash className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
