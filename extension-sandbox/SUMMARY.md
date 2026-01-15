# Extension Sandbox - Summary

## What Was Built

A **fully-featured, open-source Next.js 16 testing environment** for GameCP extensions, styled to match the HQ dashboard aesthetic.

## Key Features

### 1. Local Extension Discovery & Hot Reload
- **Auto-scans** the parent `apps/` directory for extensions with `gamecp.json` manifests
- **Polls every 2 seconds** to detect file changes (Hot Reload toggle)
- Shows build status (Built/Not Built) and dependency status (Deps OK/No Deps)
- Click to view full manifest, source files, and dist files

### 2. Extension Manager
- Install extensions via **file upload**, **paste JSON**, or **URL fetch**
- Enable/disable extensions with toggle switches
- View detailed manifest info: UI injections, API routes, sandbox config

### 3. Mock Game Servers
- Create simulated servers (Minecraft, CS2, Rust, etc.)
- Start/stop/restart with realistic state transitions
- Test extension interactions with server events

### 4. Console Viewer
- Real-time log viewer with info/warn/error/debug levels
- Test log buttons for quick debugging
- All sandbox events logged automatically

### 5. Documentation
- Built-in developer guide
- Covers manifest structure, UI injection, backend handlers, security

### 6. Settings
- Configure mock user role (admin/manager/user/demo)
- Reset all sandbox data
- Storage management

## File Structure

```
apps/extension-sandbox/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── extensions/
│   │   │       ├── route.ts          # GET - List all local extensions
│   │   │       ├── [id]/route.ts     # GET - Extension details + files
│   │   │       └── file/route.ts     # GET - Read extension source files
│   │   ├── page.tsx                  # Extensions page (home)
│   │   ├── servers/page.tsx
│   │   ├── console/page.tsx
│   │   ├── docs/page.tsx
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── SandboxLayout.tsx         # HQ-style layout with header + nav
│   │   ├── ExtensionManager.tsx      # Manual extension install
│   │   ├── LocalExtensions.tsx       # ⭐ Auto-discovery from parent dir
│   │   ├── ServerManager.tsx         # Mock game servers
│   │   ├── ConsoleViewer.tsx         # Log viewer
│   │   └── Documentation.tsx         # Dev docs
│   └── store/
│       └── sandboxStore.ts           # Zustand state (persisted to localStorage)
├── public/
│   ├── icon.png                      # GameCP grayscale logo
│   └── logo.svg
├── package.json
└── README.md
```

## How It Works

1. **User runs `npm run dev`** in `extension-sandbox`
2. **Sandbox scans parent `apps/` folder** for extensions with `gamecp.json`
3. **Extensions appear in "Local Extensions"** with build/deps status
4. **User enables an extension** → logs to console
5. **User edits extension code** → sandbox detects change (2s polling)
6. **User can view files** directly in the sandbox (manifest, src, dist)

## Tech Stack

- **Next.js 16.1.1** with Turbopack
- **Tailwind CSS 4**
- **Zustand** for state management (localStorage persistence)
- **Framer Motion** for animations
- **react-icons** for icons

## Running It

```bash
cd apps/extension-sandbox
npm install
npm run dev
```

Open http://localhost:3000

## What's Left (Future Enhancements)

1. **True file watching** - Use chokidar/fs.watch instead of polling
2. **Live UI preview** - Actually render extension UI components
3. **Handler execution** - Run handlers in a sandboxed VM
4. **Build integration** - Run `npm run build` from the UI
5. **Extension scaffolding** - Generate new extension boilerplate

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/extensions` | GET | List all extensions in parent directory |
| `/api/extensions/[id]` | GET | Get extension details + file listing |
| `/api/extensions/file?id=X&file=Y` | GET | Read a specific file from an extension |

---

*Created: January 2026*
*Location: `apps/extension-sandbox/`*
