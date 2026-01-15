'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineTrash,
    HiOutlineArrowPath,
    HiOutlineInformationCircle,
    HiOutlineExclamationTriangle,
    HiOutlineXCircle,
    HiOutlineBugAnt,
} from 'react-icons/hi2';
import { useSandboxStore, ConsoleLog } from '@/store/sandboxStore';

export default function ConsoleViewer() {
    const { consoleLogs, clearConsoleLogs, addConsoleLog } = useSandboxStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to top when new logs arrive (logs are newest first)
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [consoleLogs.length]);

    const handleTestLog = (level: 'info' | 'warn' | 'error' | 'debug') => {
        const messages = {
            info: 'This is an informational message',
            warn: 'This is a warning message',
            error: 'This is an error message',
            debug: 'This is a debug message',
        };

        addConsoleLog({
            level,
            source: 'test',
            message: messages[level],
            data: { timestamp: Date.now(), random: Math.random() },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Console</h1>
                    <p className="text-sm text-muted mt-1">
                        View logs from extensions and sandbox events
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Test buttons */}
                    <div className="hidden md:flex items-center gap-1 mr-2">
                        <span className="text-xs text-muted mr-2">Test:</span>
                        <button
                            onClick={() => handleTestLog('info')}
                            className="p-1.5 text-accent hover:bg-accent/10 rounded transition-colors"
                            title="Log Info"
                        >
                            <HiOutlineInformationCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleTestLog('warn')}
                            className="p-1.5 text-amber hover:bg-amber/10 rounded transition-colors"
                            title="Log Warning"
                        >
                            <HiOutlineExclamationTriangle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleTestLog('error')}
                            className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                            title="Log Error"
                        >
                            <HiOutlineXCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleTestLog('debug')}
                            className="p-1.5 text-muted hover:bg-sidebar rounded transition-colors"
                            title="Log Debug"
                        >
                            <HiOutlineBugAnt className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={clearConsoleLogs}
                        disabled={consoleLogs.length === 0}
                        className="btn btn-secondary"
                    >
                        <HiOutlineTrash className="w-4 h-4" />
                        Clear
                    </button>
                </div>
            </div>

            {/* Console Output */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Toolbar */}
                <div className="px-4 py-2 bg-sidebar border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-muted">
                            {consoleLogs.length} {consoleLogs.length === 1 ? 'entry' : 'entries'}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-accent"></span>
                                {consoleLogs.filter(l => l.level === 'info').length}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber"></span>
                                {consoleLogs.filter(l => l.level === 'warn').length}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-danger"></span>
                                {consoleLogs.filter(l => l.level === 'error').length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Log entries */}
                <div
                    ref={scrollRef}
                    className="h-[calc(100vh-380px)] min-h-[400px] overflow-y-auto font-mono text-sm"
                >
                    {consoleLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <HiOutlineInformationCircle className="w-12 h-12 text-muted mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Console is empty
                            </h3>
                            <p className="text-sm text-muted max-w-md">
                                Logs from sandbox events and extension activities will appear here.
                                Try adding or enabling an extension to see some activity.
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {consoleLogs.map((log) => (
                                <LogEntry key={log.id} log={log} />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}

interface LogEntryProps {
    log: ConsoleLog;
}

function LogEntry({ log }: LogEntryProps) {
    const levelConfig = {
        info: {
            icon: HiOutlineInformationCircle,
            color: 'var(--accent)',
            bg: 'var(--accent)',
        },
        warn: {
            icon: HiOutlineExclamationTriangle,
            color: 'var(--warning)',
            bg: 'var(--warning)',
        },
        error: {
            icon: HiOutlineXCircle,
            color: 'var(--error)',
            bg: 'var(--error)',
        },
        debug: {
            icon: HiOutlineBugAnt,
            color: 'var(--muted)',
            bg: 'var(--muted)',
        },
    };

    const config = levelConfig[log.level];
    const Icon = config.icon;
    const time = new Date(log.timestamp).toLocaleTimeString();

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 border-b border-border hover:bg-sidebar/50 transition-colors"
        >
            <div className="flex items-start gap-3">
                {/* Level indicator */}
                <div
                    className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `color-mix(in srgb, ${config.bg} 15%, transparent)` }}
                >
                    <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-muted">{time}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-sidebar text-muted">
                            {log.source}
                        </span>
                    </div>
                    <p className="text-foreground break-words">{log.message}</p>
                    {log.data !== undefined && log.data !== null && (
                        <pre className="mt-1 text-xs text-muted overflow-x-auto">
                            {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : String(log.data)}
                        </pre>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
