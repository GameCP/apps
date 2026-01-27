#!/usr/bin/env node

/**
 * GameCP Extension Local Update Script
 * 
 * Directly updates installed extensions in tenant databases from local dist files.
 * This is for LOCAL DEVELOPMENT only - bypasses the appstore.
 * 
 * Usage: ./update-local.js [extension-name] [tenant-slug]
 * 
 * If no tenant slug is provided, it defaults to 'local'.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DEFAULT_TENANT = process.env.DEFAULT_TENANT || 'local';

function printUsage() {
    console.log(`
📦 GameCP Extension Local Updater

Updates installed extensions directly from local dist files (dev mode).

Usage: 
  ./update-local.js <extension-name>              # Update in default tenant
  ./update-local.js <extension-name> <tenant>     # Update in specific tenant

Options:
  --all          Update all tenants that have this extension installed
  --help, -h     Show this help message

Environment:
  MONGODB_URI     - MongoDB connection string (default: mongodb://127.0.0.1:27017)
  DEFAULT_TENANT  - Default tenant slug (default: local)

Example:
  ./update-local.js game-scheduler
  ./update-local.js game-scheduler demo
  ./update-local.js game-scheduler --all
  `);
}

async function updateExtension(extensionDir, tenantSlug) {
    const distDir = path.join(extensionDir, 'dist');
    const manifestPath = path.join(extensionDir, 'gamecp.json');

    if (!fs.existsSync(manifestPath)) {
        throw new Error(`No gamecp.json found in ${extensionDir}`);
    }

    if (!fs.existsSync(distDir)) {
        console.log('⚠️  No dist folder. Running npm run build first...');
        const { execSync } = require('child_process');
        execSync('npm run build', { cwd: extensionDir, stdio: 'inherit' });
    }

    const uiBundle = fs.readFileSync(path.join(distDir, 'index.js'), 'utf-8');
    const handlersBundle = fs.readFileSync(path.join(distDir, 'handlers.js'), 'utf-8');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    const dbName = `gamecp_tenant_${tenantSlug}`;
    const connection = mongoose.createConnection(`${MONGODB_URI}/${dbName}`);

    // Wait for connection to be ready
    await new Promise((resolve, reject) => {
        connection.once('connected', resolve);
        connection.once('error', reject);
    });

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
            tenant: tenantSlug,
            matched: result.matchedCount,
            modified: result.modifiedCount,
            version: manifest.version
        };
    } finally {
        await connection.close();
    }
}

async function getAllTenants() {
    const connection = await mongoose.createConnection(`${MONGODB_URI}/admin`);
    try {
        const dbs = await connection.db.admin().listDatabases();
        return dbs.databases
            .map(db => db.name)
            .filter(name => name.startsWith('gamecp_tenant_'))
            .map(name => name.replace('gamecp_tenant_', ''));
    } finally {
        await connection.close();
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        printUsage();
        process.exit(args.length === 0 ? 1 : 0);
    }

    const updateAll = args.includes('--all');
    const filteredArgs = args.filter(a => a !== '--all');

    const extensionName = filteredArgs[0];
    const tenantSlug = filteredArgs[1] || DEFAULT_TENANT;

    // Find extension directory
    let extensionDir;
    if (fs.existsSync(path.join(process.cwd(), 'apps', extensionName))) {
        extensionDir = path.join(process.cwd(), 'apps', extensionName);
    } else if (fs.existsSync(path.join(process.cwd(), extensionName))) {
        extensionDir = path.join(process.cwd(), extensionName);
    } else if (fs.existsSync(path.join(process.cwd(), 'gamecp.json'))) {
        extensionDir = process.cwd();
    } else {
        console.error(`❌ Extension not found: ${extensionName}`);
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(extensionDir, 'gamecp.json'), 'utf-8'));
    console.log(`📦 Updating ${manifest.name} v${manifest.version}...`);

    try {
        if (updateAll) {
            const tenants = await getAllTenants();
            console.log(`🔄 Updating across ${tenants.length} tenant(s)...`);

            let updated = 0;
            for (const tenant of tenants) {
                try {
                    const result = await updateExtension(extensionDir, tenant);
                    if (result.matched > 0) {
                        console.log(`   ✅ ${tenant}: v${result.version}`);
                        updated++;
                    }
                } catch (e) {
                    // Ignore tenants that don't have the extension
                }
            }
            console.log(`\n✅ Updated in ${updated} tenant(s)`);
        } else {
            const result = await updateExtension(extensionDir, tenantSlug);

            if (result.matched === 0) {
                console.log(`❌ Extension not installed in tenant: ${tenantSlug}`);
                process.exit(1);
            }

            console.log(`✅ Updated to v${result.version} in tenant: ${tenantSlug}`);
        }

        console.log('\n🔄 Refresh your browser to see changes!');
    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        process.exit(1);
    }

    process.exit(0);
}

main();
