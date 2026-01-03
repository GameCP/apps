import { useGameCP } from '@gamecp/types/client';
import { Typography, Container } from '@gamecp/ui';

/**
 * Branded Footer Component
 * Displays custom footer text at the bottom of pages
 */
export function BrandedFooter() {
    const { getConfig } = useGameCP();
    const config = getConfig('brand-kit');
    const footerText = config.footerText || '';

    if (!footerText) {
        return null;
    }

    return (
        <Container className="pt-8">
            <Typography variant="muted" size="sm" className="text-center">
                {footerText}
            </Typography>
        </Container>
    );
}
