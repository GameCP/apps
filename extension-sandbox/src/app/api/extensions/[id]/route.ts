import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const EXTENSIONS_DIR = path.resolve(process.cwd(), '..');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // Find the extension directory
    const entries = await fs.readdir(EXTENSIONS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const extPath = path.join(EXTENSIONS_DIR, entry.name);
      const manifestPath = path.join(extPath, 'gamecp.json');
      
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent);
        
        if (manifest.extension_id === id || entry.name === id) {
          // Found the extension, now get more details
          const distPath = path.join(extPath, 'dist');
          const srcPath = path.join(extPath, 'src');
          
          // Get file listing
          const files: { path: string; size: number; modified: string }[] = [];
          
          async function scanDir(dir: string, prefix = '') {
            try {
              const items = await fs.readdir(dir, { withFileTypes: true });
              for (const item of items) {
                if (item.name === 'node_modules' || item.name === '.git') continue;
                
                const itemPath = path.join(dir, item.name);
                const relativePath = prefix ? `${prefix}/${item.name}` : item.name;
                
                if (item.isDirectory()) {
                  await scanDir(itemPath, relativePath);
                } else {
                  const stat = await fs.stat(itemPath);
                  files.push({
                    path: relativePath,
                    size: stat.size,
                    modified: stat.mtime.toISOString(),
                  });
                }
              }
            } catch {
              // Directory doesn't exist or can't be read
            }
          }
          
          await scanDir(extPath);
          
          // Try to read the UI bundle if it exists
          let uiBundle: string | null = null;
          if (manifest.ui_bundle) {
            try {
              uiBundle = await fs.readFile(path.join(extPath, manifest.ui_bundle), 'utf-8');
            } catch {
              // Bundle not built yet
            }
          }
          
          // Try to read handlers bundle
          let handlersBundle: string | null = null;
          if (manifest.handlers_bundle) {
            try {
              handlersBundle = await fs.readFile(path.join(extPath, manifest.handlers_bundle), 'utf-8');
            } catch {
              // Bundle not built yet
            }
          }
          
          return NextResponse.json({
            id: manifest.extension_id,
            name: manifest.name,
            path: extPath,
            manifest,
            files,
            uiBundle,
            handlersBundle,
            hasDist: await fs.stat(distPath).then(() => true).catch(() => false),
            hasSrc: await fs.stat(srcPath).then(() => true).catch(() => false),
          });
        }
      } catch {
        continue;
      }
    }
    
    return NextResponse.json(
      { error: 'Extension not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error loading extension:', error);
    return NextResponse.json(
      { error: 'Failed to load extension' },
      { status: 500 }
    );
  }
}
