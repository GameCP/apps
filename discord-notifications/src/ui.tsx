import React from 'react';
import { RiDiscordLine } from 'react-icons/ri';
import { useGameCP } from '@gamecp/types/client';
import { SidebarNavItem } from '@gamecp/ui';
import { AdminSettingsPage } from './ui/AdminSettingsPage';
import { ServerSettingsPage } from './ui/ServerSettingsPage';
import { lang } from './lang';

interface DiscordIconProps {
    serverId: string;
}

interface SettingsPageProps {
    serverId: string;
}

export function DiscordIcon({ serverId }: DiscordIconProps) {
    const { t } = useGameCP();
    const href = `/game-servers/${serverId}/extensions/discord`;

    return (
        <SidebarNavItem
            href={href}
            icon={RiDiscordLine}
            title=""
        >
            {t(lang.nav.title)}
        </SidebarNavItem>
    );
}

// Server-level settings page (per-server webhooks + overrides)
export function SettingsPage({ serverId }: SettingsPageProps) {
    return <ServerSettingsPage serverId={serverId} />;
}

// Admin-level settings page (global config + templates)
export function DiscordAdminPage() {
    return <AdminSettingsPage />;
}
