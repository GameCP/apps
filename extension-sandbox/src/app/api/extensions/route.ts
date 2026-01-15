import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export interface LocalExtension {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  path: string;
  manifestPath: string;
  manifest: Record<string, unknown>;
  hasDist: boolean;
  hasNodeModules: boolean;
  lastModified: string;
}

const EXTENSIONS_DIR = path.resolve(process.cwd(), '..');

// Directories to ignore when scanning for extensions
const IGNORE_DIRS = ['extension-sandbox', 'node_modules', '.git', '.DS_Store'];

export async function GET() {
  try {
    const extensions: LocalExtension[] = [];
    
    // Read the parent apps directory
    const entries = await fs.readdir(EXTENSIONS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory() || IGNORE_DIRS.includes(entry.name)) {
        continue;
      }
      
      const extPath = path.join(EXTENSIONS_DIR, entry.name);
      const manifestPath = path.join(extPath, 'gamecp.json');
      
      try {
        // Check if gamecp.json exists
        const manifestStat = await fs.stat(manifestPath);
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent);
        
        // Check for dist and node_modules
        const hasDist = await fs.stat(path.join(extPath, 'dist')).then(() => true).catch(() => false);
        const hasNodeModules = await fs.stat(path.join(extPath, 'node_modules')).then(() => true).catch(() => false);
        
        extensions.push({
          id: manifest.extension_id || entry.name,
          name: manifest.name || entry.name,
          version: manifest.version || '0.0.0',
          description: manifest.description || '',
          author: manifest.author || 'Unknown',
          path: extPath,
          manifestPath,
          manifest,
          hasDist,
          hasNodeModules,
          lastModified: manifestStat.mtime.toISOString(),
        });
      } catch {
        // No gamecp.json or invalid JSON - skip this directory
        continue;
      }
    }
    
    // Sort by name
    extensions.sort((a, b) => a.name.localeCompare(b.name));
    
    return NextResponse.json({
      extensions,
      basePath: EXTENSIONS_DIR,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error scanning extensions:', error);
    return NextResponse.json(
      { error: 'Failed to scan extensions directory' },
      { status: 500 }
    );
  }
}
