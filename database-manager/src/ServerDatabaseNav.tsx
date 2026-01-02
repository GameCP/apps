import React, { useState, useEffect } from 'react';
import { useGameCP } from '@gamecp/types/client';
import { HiDatabase } from 'react-icons/hi';

interface ServerDatabaseNavProps {
    serverId: string;
}

export function ServerDatabaseNav({ serverId }: ServerDatabaseNavProps) {
    const { Link, api } = useGameCP();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const checkVisibility = async () => {
            try {
                // Check if there are any enabled sources
                const sourcesRes = await api.get('/api/x/database-manager/sources');
                const sources = sourcesRes.sources?.filter((s: any) => s.enabled) || [];

                if (sources.length === 0) {
                    setVisible(false);
                    return;
                }

                // Fetch server to get game config
                const serverRes = await api.get(`/api/game-servers/${serverId}`);
                const gameRef = serverRes.gameServer?.gameRef;

                if (!gameRef) {
                    setVisible(false);
                    return;
                }

                // Check if database is enabled in game's extensionData
                const dbConfig = gameRef.extensionData?.['database-manager'];
                setVisible(dbConfig?.enabled === true);
            } catch (error) {
                console.error('Failed to check database visibility:', error);
                setVisible(false);
            }
        };

        checkVisibility();
    }, [serverId, api]);

    if (!visible) return null;

    return (
        <Link
            href={`/game-servers/${serverId}/extensions/database-manager`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors w-full text-left"
        >
            <HiDatabase className="w-5 h-5" />
            <span className="text-sm font-medium">Databases</span>
        </Link>
    );
}

