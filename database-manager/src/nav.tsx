import React from 'react';
import { useGameCP } from '@gamecp/types/client';
import { HiDatabase } from 'react-icons/hi';

interface DatabaseSourcesNavProps {
    user?: {
        role: string;
    };
    closeSidebar?: () => void;
}

export function DatabaseSourcesNav({ user, closeSidebar }: DatabaseSourcesNavProps) {
    // Only show to admins
    if (user?.role !== 'admin') return null;

    const { Link } = useGameCP();

    return (
        <Link
            href="/extensions/database-manager"
            className="peer/menu-button flex w-full items-center gap-0 overflow-hidden rounded-md p-2 text-left outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm"
        >
            <HiDatabase className="mr-4 text-xl transition-all duration-150 ease-in-out" />
            <span className="transition-all duration-150 ease-in-out">Database Sources</span>
        </Link>
    );
}
