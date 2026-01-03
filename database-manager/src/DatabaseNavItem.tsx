import React from 'react';
import { useGameCP } from '@gamecp/types/client';
import { HiDatabase } from 'react-icons/hi';
import { lang } from './lang';

interface DatabaseNavItemProps {
    activeSection: string;
    scrollToSection: (id: string) => void;
}

export function DatabaseNavItem({ activeSection, scrollToSection }: DatabaseNavItemProps) {
    const { t } = useGameCP();
    const isActive = activeSection === 'database-provisioning';

    return (
        <button
            type="button"
            onClick={() => scrollToSection('database-provisioning')}
            className={`w-full flex items-start p-3 text-left rounded-lg transition-colors ${isActive
                ? 'bg-primary text-primary-foreground border border-primary shadow-sm'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
        >
            <HiDatabase
                className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-blue-600'
                    }`}
            />
            <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">
                    {t(lang.nav.provisioningTitle)}
                </div>
                <div className="text-xs mt-1 line-clamp-2">
                    {t(lang.nav.provisioningDescription)}
                </div>
            </div>
        </button>
    );
}

