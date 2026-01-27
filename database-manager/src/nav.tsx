import React from 'react';
import { useGameCP } from '@gamecp/types/client';
import { RiDatabase2Line } from 'react-icons/ri';
import { lang } from './lang';

interface DatabaseSourcesNavProps {
    user?: {
        role: string;
    };
    closeSidebar?: () => void;
}

export function DatabaseSourcesNav({ user, closeSidebar }: DatabaseSourcesNavProps) {
    // Only show to admins
    if (user?.role !== 'admin') return null;

    const { Link, t, pathname } = useGameCP();
    const href = '/extensions/database-manager';
    const isActive = pathname === href || pathname?.startsWith(href + '/');

    return (
        <Link
            href={href}
            className={`peer/menu-button flex w-full items-center gap-0 overflow-hidden rounded-md p-2 text-left outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 h-8 text-sm ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
        >
            <RiDatabase2Line className={`mr-4 text-xl transition-all duration-150 ease-in-out ${isActive ? 'text-primary-foreground' : ''}`} />
            <span className="transition-all duration-150 ease-in-out">{t(lang.admin.title)}</span>
        </Link>
    );
}

