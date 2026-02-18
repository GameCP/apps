import React from 'react';
import { useGameCP } from '@gamecp/types/client';
import { SidebarNavItem } from '@gamecp/ui';
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

    const { t } = useGameCP();
    const href = '/extensions/database-manager';

    return (
        <SidebarNavItem
            href={href}
            icon={RiDatabase2Line}
            className="h-8"
        >
            {t(lang.admin.title)}
        </SidebarNavItem>
    );
}
