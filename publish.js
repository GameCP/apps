#!/usr/bin/env node

/**
 * GameCP Extension Publisher CLI
 * 
 * Usage: ./publish.js [extension-name]
 * 
 * If no extension name is provided, it will try to publish from the current directory.
 * 
 * Environment variables:
 *   GAMECP_API_KEY - Your developer API key (required)
 *   GAMECP_APPSTORE_URL - App store URL (default: https://appstore.gamecp.com)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const APPSTORE_URL = process.env.GAMECP_APPSTORE_URL || 'http://localhost:3000';
const API_KEY = process.env.GAMECP_API_KEY;

function printUsage() {
    console.log(`
📦 GameCP Extension Publisher

Usage: 
  ./publish.js [options] [extension-name]

Options:
  --force, -f    Overwrite existing version if it already exists
  --help, -h     Show this help message

Environment:
  GAMECP_API_KEY      - Your developer API key (required)
  GAMECP_APPSTORE_URL - App store URL (default: http://localhost:3000)

Example:
  GAMECP_API_KEY=your-key ./publish.js game-scheduler
  GAMECP_API_KEY=your-key ./publish.js --force game-scheduler
  `);
}

async function findZipFile(extensionDir) {
    const files = fs.readdirSync(extensionDir);
    const zipFiles = files.filter(f => f.endsWith('.zip'));

    if (zipFiles.length === 0) {
        // Try to find in release folder
        const releaseDir = path.join(extensionDir, 'release');
        if (fs.existsSync(releaseDir)) {
            const releaseFiles = fs.readdirSync(releaseDir);
            const releaseZips = releaseFiles.filter(f => f.endsWith('.zip'));
            if (releaseZips.length > 0) {
                return path.join(releaseDir, releaseZips.sort().pop());
            }
        }

        console.log('⚠️  No zip file found. Running npm run release first...');
        const { execSync } = require('child_process');
        execSync('npm run release', { cwd: extensionDir, stdio: 'inherit' });

        // Check again for zip files
        const newFiles = fs.readdirSync(extensionDir);
        const newZips = newFiles.filter(f => f.endsWith('.zip'));
        if (newZips.length > 0) {
            return path.join(extensionDir, newZips.sort().pop());
        }

        throw new Error('No zip file found even after running npm run release');
    }

    // Return the most recent zip file (alphabetically last = highest version)
    return path.join(extensionDir, zipFiles.sort().pop());
}

async function uploadZip(zipPath, force = false) {
    const zipBuffer = fs.readFileSync(zipPath);
    const fileName = path.basename(zipPath);

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    // Build multipart form data
    const parts = [];

    // Add the file
    parts.push(`--${boundary}`);
    parts.push(`Content-Disposition: form-data; name="package"; filename="${fileName}"`);
    parts.push('Content-Type: application/zip');
    parts.push('');

    const headerBuffer = Buffer.from(parts.join('\r\n') + '\r\n');

    // Add force field if needed
    let forceBuffer = Buffer.alloc(0);
    if (force) {
        const forceField = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="force"\r\n\r\ntrue`;
        forceBuffer = Buffer.from(forceField);
    }

    const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`);

    const body = Buffer.concat([headerBuffer, zipBuffer, forceBuffer, footerBuffer]);

    const url = new URL(`${APPSTORE_URL}/api/apps/publish`);
    const isHttps = url.protocol === 'https:';

    return new Promise((resolve, reject) => {
        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length,
                'x-api-key': API_KEY,
            },
        };

        const client = isHttps ? https : http;

        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(json);
                    } else {
                        reject(new Error(json.error || json.message || `HTTP ${res.statusCode}`));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        printUsage();
        process.exit(0);
    }

    const forceFlag = args.includes('--force') || args.includes('-f');
    const filteredArgs = args.filter(a => a !== '--force' && a !== '-f');

    if (!API_KEY) {
        console.error('❌ GAMECP_API_KEY environment variable is required');
        printUsage();
        process.exit(1);
    }

    let extensionDir;

    if (filteredArgs.length > 0) {
        // Extension name provided - look in apps/ directory
        const extensionName = filteredArgs[0];

        // Check if we're in the gamecpv3 root or apps directory
        if (fs.existsSync(path.join(process.cwd(), 'apps', extensionName))) {
            extensionDir = path.join(process.cwd(), 'apps', extensionName);
        } else if (fs.existsSync(path.join(process.cwd(), extensionName))) {
            extensionDir = path.join(process.cwd(), extensionName);
        } else {
            console.error(`❌ Extension not found: ${extensionName}`);
            process.exit(1);
        }
    } else {
        // No extension name - use current directory
        extensionDir = process.cwd();
    }

    // Verify it's a valid extension directory
    const manifestPath = path.join(extensionDir, 'gamecp.json');
    if (!fs.existsSync(manifestPath)) {
        console.error(`❌ No gamecp.json found in ${extensionDir}`);
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log(`📦 Publishing ${manifest.name} v${manifest.version}...`);

    try {
        const zipPath = await findZipFile(extensionDir);
        console.log(`📁 Using package: ${path.basename(zipPath)}`);

        console.log(`🚀 Uploading to ${APPSTORE_URL}...${forceFlag ? ' (force mode)' : ''}`);
        const result = await uploadZip(zipPath, forceFlag);

        console.log('');
        console.log('✅ Published successfully!');
        console.log(`   Extension: ${result.app.extensionId}`);
        console.log(`   Version: ${result.app.version}`);
        console.log(`   Status: ${result.app.status}`);

        if (result.app.status === 'pending_review') {
            console.log('');
            console.log('📋 Your submission is pending review. You will be notified when it is approved.');
        } else {
            console.log('');
            console.log('🎉 Your extension is now live!');
        }
    } catch (error) {
        console.error(`❌ Failed to publish: ${error.message}`);
        process.exit(1);
    }
}

main();
