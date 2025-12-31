/**
 * GameCP Extension Build
 * Uses @gamecp/build for standardized build process
 */

import { buildExtension } from '@gamecp/build';

buildExtension(process.cwd()).catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
