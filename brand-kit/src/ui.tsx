import React from 'react';
import { useGameCP } from '@gamecp/types/client';

interface PageBrandingWrapperProps {
    children: React.ReactNode;
    originalProps: {
        serverId: string;
        serverInfo: any;
        serverDetails: any;
    };
}

interface CardBrandingWrapperProps {
    children: React.ReactNode;
    originalProps: any;
}

/**
 * Page-level branding wrapper
 * Adds custom header and footer to the entire dashboard page
 */
export function PageBrandingWrapper({ children, originalProps }: PageBrandingWrapperProps) {
    const { Card } = useGameCP();

    // Access config from window (will be injected by the app)
    const config = (typeof window !== 'undefined' && (window as any).GameCP_ExtensionConfig?.['brand-kit']) || {};

    const headerText = config.headerText || '';
    const headerSubtext = config.headerSubtext || '';
    const footerText = config.footerText || '';

    return (
        <div className="relative">
            {/* Custom Header */}
            {headerText && (
                <div className="mb-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 overflow-hidden">
                    <div className="px-6 py-4">
                        <h2 className="text-xl font-bold text-foreground">
                            {headerText}
                        </h2>
                        {headerSubtext && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {headerSubtext}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Original Dashboard Content */}
            {children}

            {/* Custom Footer */}
            {footerText && (
                <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-sm text-center text-muted-foreground">
                        {footerText}
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Card-level branding wrapper
 * Adds subtle branding badge to individual cards
 */
export function CardBrandingWrapper({ children }: CardBrandingWrapperProps) {
    // Access config from window
    const config = (typeof window !== 'undefined' && (window as any).GameCP_ExtensionConfig?.['brand-kit']) || {};
    const headerText = config.headerText || '';

    // Only show badge if header text is configured
    if (!headerText) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            {/* Subtle branding badge */}
            <div className="absolute top-2 right-2 z-10">
                <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-xs font-medium text-primary">
                    {headerText}
                </div>
            </div>

            {/* Original Card Content */}
            {children}
        </div>
    );
}
