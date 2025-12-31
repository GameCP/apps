import React from 'react';

interface BrandedFooterProps {
    originalProps: any;
    position: 'top' | 'bottom';
}

/**
 * Branded Footer Component
 * Displays custom footer text at the bottom of pages
 */
export function BrandedFooter({ originalProps }: BrandedFooterProps) {
    const config = (typeof window !== 'undefined' && (window as any).GameCP_ExtensionConfig?.['brand-kit']) || {};

    const footerText = config.footerText || '';

    if (!footerText) {
        return null;
    }

    return (
        <div className="px-4 lg:px-8 pb-4 lg:pb-8">
            <div className="mt-8 pt-6">
                <p className="text-sm text-center text-muted-foreground">
                    {footerText}
                </p>
            </div>
        </div>
    );
}
