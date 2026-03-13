import React from 'react';
import { useGameCP } from '@gamecp/types/client';
import { RiDatabase2Line } from 'react-icons/ri';
import { lang } from '../lang';
import useSWR from 'swr';

interface ServerDatabaseNavProps {
    serverId: string;
}

import { SidebarNavItem } from '@gamecp/ui';

export function ServerDatabaseNav({ serverId }: ServerDatabaseNavProps) {
    const { api, t } = useGameCP();

    // Use SWR to fetch visibility data
    // Only check game extensionData - no need to verify sources exist here.
    // The DatabaseTab page handles "no sources" with an appropriate empty state.
    const { data: visibilityData } = useSWR<{ visible: boolean }>(
        `/api/x/database-manager/nav-visibility?serverId=${serverId}`,
        async () => {
            try {
                // Fetch server to get game config
                const serverRes = await api.get(`/api/game-servers/${serverId}`);
                const gameRef = serverRes.gameServer?.gameRef;

                if (!gameRef) {
                    return { visible: false };
                }

                // Check if database is enabled in game's extensionData
                const dbConfig = gameRef.extensionData?.['database-manager'];
                return { visible: dbConfig?.enabled === true };
            } catch (error) {
                console.error('Failed to check database visibility:', error);
                return { visible: false };
            }
        }
    );

    const visible = visibilityData?.visible ?? false;

    if (!visible) return null;

    return (
        <SidebarNavItem
            href={`/game-servers/${serverId}/extensions/database-manager`}
            icon={RiDatabase2Line}
            title=""
        >
            {t(lang.page.title)}
        </SidebarNavItem>
    );
}

