import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const EXTENSIONS_DIR = path.resolve(process.cwd(), '..');

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  const file = request.nextUrl.searchParams.get('file');
  
  if (!id || !file) {
    return NextResponse.json(
      { error: 'Missing id or file parameter' },
      { status: 400 }
    );
  }
  
  try {
    // Find the extension
    const entries = await fs.readdir(EXTENSIONS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const extPath = path.join(EXTENSIONS_DIR, entry.name);
      const manifestPath = path.join(extPath, 'gamecp.json');
      
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent);
        
        if (manifest.extension_id === id || entry.name === id) {
          // Normalize and validate file path
          const requestedPath = path.normalize(file);
          const fullPath = path.join(extPath, requestedPath);
          
          // Security: ensure the path is within the extension directory
          if (!fullPath.startsWith(extPath)) {
            return NextResponse.json(
              { error: 'Invalid file path' },
              { status: 403 }
            );
          }
          
          const content = await fs.readFile(fullPath, 'utf-8');
          const stat = await fs.stat(fullPath);
          
          return NextResponse.json({
            path: requestedPath,
            content,
            size: stat.size,
            modified: stat.mtime.toISOString(),
          });
        }
      } catch {
        continue;
      }
    }
    
    return NextResponse.json(
      { error: 'Extension or file not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}
