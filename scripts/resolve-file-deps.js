#!/usr/bin/env node
/**
 * This script converts file: dependencies to npm versions when
 * running outside of the monorepo (e.g., during extension build/deploy).
 * 
 * Run before `npm install` in CI environments.
 * 
 * Usage from package.json:
 *   "preinstall": "node ../scripts/resolve-file-deps.js || true"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the package directory from command line arg or current working directory
const packageDir = process.argv[2] || process.cwd();
const packageJsonPath = path.join(packageDir, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
    console.log('No package.json found at', packageJsonPath);
    process.exit(0);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Check if we're in the monorepo (packages/ui exists)
const packagesUiPath = path.join(packageDir, '..', '..', 'packages', 'ui');
const isInWorkspace = fs.existsSync(packagesUiPath);

if (isInWorkspace) {
    console.log('Running in workspace - keeping file: links');
    process.exit(0);
}

console.log('Not in workspace - converting file: deps to npm versions');

let modified = false;

function convertFileDeps(deps) {
    if (!deps) return;

    for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith('file:')) {
            // Get latest from npm
            try {
                const npmVersion = execSync(`npm view ${name} version`, { encoding: 'utf8' }).trim();
                deps[name] = `^${npmVersion}`;
                console.log(`  ${name}: file:... -> ^${npmVersion}`);
                modified = true;
            } catch (e) {
                console.error(`  Failed to get npm version for ${name}, skipping`);
            }
        }
    }
}

convertFileDeps(packageJson.dependencies);
convertFileDeps(packageJson.devDependencies);

if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('Updated package.json');
} else {
    console.log('No file: dependencies found');
}
