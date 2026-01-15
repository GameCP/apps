'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlinePuzzlePiece,
    HiOutlineServer,
    HiOutlineCommandLine,
    HiOutlineBookOpen,
    HiOutlineCog6Tooth,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineBell,
    HiOutlineQuestionMarkCircle,
} from 'react-icons/hi2';
import { useSandboxStore } from '@/store/sandboxStore';

interface SandboxLayoutProps {
    children: ReactNode;
}

const navItems = [
    { id: 'extensions', label: 'Extensions', icon: HiOutlinePuzzlePiece, href: '/' },
    { id: 'servers', label: 'Game Servers', icon: HiOutlineServer, href: '/servers' },
    { id: 'console', label: 'Console', icon: HiOutlineCommandLine, href: '/console' },
    { id: 'docs', label: 'Documentation', icon: HiOutlineBookOpen, href: '/docs' },
];

export default function SandboxLayout({ children }: SandboxLayoutProps) {
    const pathname = usePathname();
    const { currentUser, sidebarCollapsed, toggleSidebar, extensions } = useSandboxStore();

    const getUserInitials = () => {
        if (currentUser.fullName) {
            const names = currentUser.fullName.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return currentUser.fullName[0].toUpperCase();
        }
        return currentUser.email[0].toUpperCase();
    };

    const enabledExtensions = extensions.filter(e => e.enabled).length;

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card border-b border-border">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left side - Logo and context */}
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <Link href="/" className="flex items-center shrink-0">
                                <Image
                                    src="/icon.png"
                                    alt="GameCP Logo"
                                    width={32}
                                    height={32}
                                    unoptimized
                                    className="grayscale opacity-90"
                                />
                            </Link>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-foreground">GameCP</span>
                                <span className="text-muted">|</span>
                                <span className="text-sm text-muted">Extension Sandbox</span>
                                <span className="badge badge-info ml-2">Open Source</span>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center space-x-3 flex-shrink-0">
                            {/* Extension count */}
                            <div className="hidden md:flex items-center px-3 py-1.5 rounded-lg bg-sidebar border border-border">
                                <HiOutlinePuzzlePiece className="w-4 h-4 text-muted mr-2" />
                                <span className="text-sm text-foreground">{enabledExtensions} active</span>
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 text-muted hover:text-foreground hover:bg-sidebar rounded-lg transition-colors">
                                <HiOutlineBell className="w-5 h-5" />
                            </button>

                            {/* Help */}
                            <Link
                                href="/docs"
                                className="hidden lg:flex items-center p-2 text-muted hover:text-foreground hover:bg-sidebar rounded-lg transition-colors"
                            >
                                <HiOutlineQuestionMarkCircle className="w-5 h-5" />
                            </Link>

                            {/* Settings */}
                            <Link
                                href="/settings"
                                className="p-2 text-muted hover:text-foreground hover:bg-sidebar rounded-lg transition-colors"
                            >
                                <HiOutlineCog6Tooth className="w-5 h-5" />
                            </Link>

                            {/* User avatar */}
                            <button className="flex items-center p-1 rounded-full hover:bg-sidebar transition-colors">
                                <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center text-xs font-medium">
                                    {getUserInitials()}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation tabs */}
            <nav className="sticky top-16 z-40 bg-card border-b border-border">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-1 overflow-x-auto py-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/' && pathname?.startsWith(item.href));
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`
                    shrink-0 flex items-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all
                    ${isActive
                                            ? 'bg-primary text-background'
                                            : 'text-muted hover:text-foreground hover:bg-sidebar'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <AnimatePresence mode="wait">
                    <motion.aside
                        initial={false}
                        animate={{ width: sidebarCollapsed ? 64 : 280 }}
                        transition={{ duration: 0.2 }}
                        className="hidden lg:flex flex-col bg-sidebar border-r border-border relative"
                    >
                        {/* Sidebar content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {!sidebarCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Quick Stats */}
                                    <div className="p-4 rounded-xl bg-card border border-border">
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                            Quick Stats
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted">Extensions</span>
                                                <span className="text-sm font-medium text-foreground">{extensions.length}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted">Active</span>
                                                <span className="text-sm font-medium text-success">{enabledExtensions}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Environment */}
                                    <div className="p-4 rounded-xl bg-card border border-border">
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                            Environment
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="status-dot online"></span>
                                                <span className="text-sm text-foreground">Sandbox Active</span>
                                            </div>
                                            <div className="text-xs text-muted">
                                                User: {currentUser.role}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Collapse toggle */}
                        <button
                            onClick={toggleSidebar}
                            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted hover:text-foreground hover:bg-sidebar transition-colors shadow-sm"
                        >
                            {sidebarCollapsed ? (
                                <HiOutlineChevronRight className="w-3 h-3" />
                            ) : (
                                <HiOutlineChevronLeft className="w-3 h-3" />
                            )}
                        </button>
                    </motion.aside>
                </AnimatePresence>

                {/* Main area */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
