import React from 'react';
import { useGameCP } from '@gamecp/types/client';
import { Card } from '@gamecp/ui';

interface BrandedHeaderProps {
    originalProps: any;
    position: 'top' | 'bottom';
}

/**
 * Branded Header Component
 * Displays custom header text at the top of pages
 */
export function BrandedHeader({ originalProps }: BrandedHeaderProps) {
    const { getConfig } = useGameCP();
    const config = getConfig('brand-kit');

    const headerText = config.headerText || '';
    const headerSubtext = config.headerSubtext || '';

    if (!headerText) {
        return null;
    }

    return (
        <div className="px-4 lg:px-8 pt-4 lg:pt-8 mb-0">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
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
            </Card>
        </div>
    );
}
