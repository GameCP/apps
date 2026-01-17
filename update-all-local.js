#!/usr/bin/env node

/**
 * GameCP Extension Local Update All Script
 *
 * Updates all installed extensions in tenant databases from local dist files.
 * This is for LOCAL DEVELOPMENT only - bypasses the appstore.
 *
 * Usage: ./update-all-local.js [tenant-slug]
 *
 * If no tenant slug is provided, it defaults to 'local'.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DEFAULT_TENANT = process.env.DEFAULT_TENANT || 'local';

// List of all extension directories
const EXTENSIONS = [
    'brand-kit',
    'database-manager',
    'discord-notifications',
    'game-scheduler',
    'server-notes'
];

function printUsage() {
    console.log(`
📦 GameCP Extension Local Updater (All Extensions)

Updates all extensions directly from local dist files (dev mode).

Usage:
  ./update-all-local.js              # Update in default tenant
  ./update-all-local.js <tenant>     # Update in specific tenant

Environment:
  MONGODB_URI     - MongoDB connection string (default: mongodb://127.0.0.1:27017)
  DEFAULT_TENANT  - Default tenant slug (default: local)

Example:
  ./update-all-local.js
  ./update-all-local.js demo
  `);
}

async function updateExtension(extensionDir, tenantSlug) {
    const distDir = path.join(extensionDir, 'dist');
    const manifestPath = path.join(extensionDir, 'gamecp.json');

    if (!fs.existsSync(manifestPath)) {
        throw new Error(`No gamecp.json found in ${extensionDir}`);
    }

    if (!fs.existsSync(distDir)) {
        console.log(`⚠️  No dist folder for ${extensionDir}. Running npm run build first...`);
        const { execSync } = require('child_process');
        execSync('npm run build', { cwd: extensionDir, stdio: 'inherit' });
    }

    const uiBundle = fs.readFileSync(path.join(distDir, 'index.js'), 'utf-8');
    const handlersBundle = fs.readFileSync(path.join(distDir, 'handlers.js'), 'utf-8');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    const dbName = `gamecp_tenant_${tenantSlug}`;
    const connection = await mongoose.createConnection(`${MONGODB_URI}/${dbName}`);

    try {
        const result = await connection.db.collection('userextensions').updateOne(
            { extensionId: manifest.extension_id },
            {
                $set: {
                    bundleCode: uiBundle,
                    handlerCode: handlersBundle,
                    manifest: manifest,
                    version: manifest.version,
                    name: manifest.name,
                    description: manifest.description,
                    updatedAt: new Date()
                }
            }
        );

        return {
            extensionId: manifest.extension_id,
            name: manifest.name,
            tenant: tenantSlug,
            matched: result.matchedCount,
            modified: result.modifiedCount,
            version: manifest.version
        };
    } finally {
        await connection.close();
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        printUsage();
        process.exit(0);
    }

    const tenantSlug = args[0] || DEFAULT_TENANT;

    console.log(`📦 Updating all extensions in tenant: ${tenantSlug}`);
    console.log('');

    let updated = 0;
    let skipped = 0;

    for (const extensionName of EXTENSIONS) {
        const extensionDir = path.join(process.cwd(), 'apps', extensionName);

        if (!fs.existsSync(extensionDir)) {
            console.log(`⚠️  Extension directory not found: ${extensionName}`);
            skipped++;
            continue;
        }

        try {
            const result = await updateExtension(extensionDir, tenantSlug);

            if (result.matched > 0) {
                console.log(`✅ ${result.name} v${result.version}`);
                updated++;
            } else {
                console.log(`⏭️  ${result.name} (not installed in tenant)`);
                skipped++;
            }
        } catch (error) {
            console.log(`❌ ${extensionName}: ${error.message}`);
            skipped++;
        }
    }

    console.log('');
    console.log(`🎉 Updated ${updated} extension(s), skipped ${skipped} extension(s)`);
    console.log('');
    console.log('🔄 Refresh your browser to see changes!');
}

main().catch(error => {
    console.error(`❌ Failed: ${error.message}`);
    process.exit(1);
});
