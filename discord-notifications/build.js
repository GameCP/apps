import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create dist directory
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'));
}

console.log('📦 Bundling extension with esbuild...');

try {
    // Run esbuild to bundle everything into an IIFE
    // We mark react as external and use format=iife
    execSync('npx esbuild src/bridge.js --bundle --format=iife --global-name=__BUNDLE_EXPORTS__ --external:react --outfile=dist/bundle.raw.js', {
        cwd: __dirname,
        stdio: 'inherit'
    });

    // Read the generated bundle
    let bundle = fs.readFileSync(path.join(__dirname, 'dist/bundle.raw.js'), 'utf8');

    // Remove the 'var __BUNDLE_EXPORTS__ = ' part and the trailing ';' 
    // This turns it into a pure expression: (function() { ... })()
    bundle = bundle.replace(/^var\s+__BUNDLE_EXPORTS__\s+=\s+/, '').replace(/;[\s\n]*$/, '');

    // Write the clean bundle
    fs.writeFileSync(path.join(__dirname, 'dist/index.js'), bundle);
    fs.writeFileSync(path.join(__dirname, 'index.js'), bundle);

    console.log('✅ Bundle created: index.js');
    console.log('📦 This bundle is now a pure IIFE expression ready for eval()');
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}
