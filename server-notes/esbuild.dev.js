const esbuild = require('esbuild');
const fs = require('fs');

async function build() {
    try {
        await esbuild.build({
            entryPoints: ['src/bridge.js'],
            bundle: true,
            outfile: 'dist/index.js',
            format: 'esm',
            platform: 'node',
            external: ['react', 'react-dom'],
            watch: {
                onRebuild(error, result) {
                    if (error) {
                        console.error('❌ Build failed:', error);
                    } else {
                        console.log('✅ Rebuilt successfully');
                    }
                },
            },
        });

        console.log('👀 Watching for changes...');
    } catch (error) {
        console.error('Build error:', error);
        process.exit(1);
    }
}

build();
