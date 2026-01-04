import { useGameCP } from '@gamecp/types/client';
import { Card, Typography } from '@gamecp/ui';

/**
 * Branded Header Component
 * Displays custom header text at the top of pages
 */
export function BrandedHeader() {
    const { getConfig } = useGameCP();
    const config = getConfig('brand-kit');

    const headerText = config.headerText || '';
    const headerSubtext = config.headerSubtext || '';

    if (!headerText) {
        return null;
    }

    return (
        <Card padding="lg">
            <Typography as="h2" size="xl" className="font-bold">{headerText}</Typography>

            {headerSubtext && (
                <Typography variant="muted" size="sm" className="mt-1">
                    {headerSubtext}
                </Typography>
            )}
        </Card>
    );
}
