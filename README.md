# GameCP Extensions

Official repository for GameCP extensions. Each extension is a self-contained package that adds functionality to GameCP game server management panels.

## 📦 Available Extensions

- **[discord-notifications](./discord-notifications)** - Send real-time server alerts to Discord
- **[game-scheduler](./game-scheduler)** - Automate server restarts, wipes, and tasks with visual cron builder
- **[server-notes](./server-notes)** - Private admin notes for server documentation

## 🛠️ Development

### Extension Structure

Each extension follows this standardized structure:

```
extension-name/
├── assets/
│   ├── icon.png              # Extension icon (512x512)
│   └── screenshots/          # App Store screenshots
├── src/
│   ├── handlers.ts           # Backend handlers (isolated-vm)
│   ├── ui.tsx                # Frontend components (React)
│   └── ui/                   # UI components folder
├── dist/                     # Compiled bundles (generated)
├── release/                  # Release package (generated)
├── gamecp.json               # Extension manifest
├── package.json
├── tsconfig.json
└── README.md                 # App Store listing description
```

### Build Commands

All extensions use the centralized `@gamecp/build` package:

#### 1. **Build** - Compile code to `dist/`
```bash
npm run build
```
- Compiles UI and handlers bundles
- Generates integrity hash
- For development/testing

#### 2. **Version Bump** - Update version in `gamecp.json`
```bash
npm run version:patch   # 1.0.0 → 1.0.1
npm run version:minor   # 1.0.0 → 1.1.0
npm run version:major   # 1.0.0 → 2.0.0
```

#### 3. **Release** - Create distribution package
```bash
npm run release
```
- Builds with minification
- Updates integrity hash automatically
- Copies all files to `release/`
- Creates versioned zip file (e.g., `extension-name-v1.0.0.zip`)

**What's in the zip:**
- ✅ `gamecp.json` (with updated integrity)
- ✅ `README.md` (App Store listing)
- ✅ `package.json`
- ✅ `dist/` (compiled bundles)
- ✅ `assets/` (icon + screenshots)

### Creating a New Extension

1. **Copy an existing extension** as a template
2. **Update `gamecp.json`** with your extension details
3. **Install dependencies**: `npm install`
4. **Develop** your handlers and UI components
5. **Build**: `npm run build`
6. **Test** in your local GameCP instance
7. **Release**: `npm run release`
8. **Upload** the generated zip to the App Store

## 📚 Documentation

- **[Extension API Reference](../packages/types/README.md)** - Full API documentation
- **[Manifest Specification](../packages/build/gamecp-manifest.schema.json)** - gamecp.json schema
- **[i18n Support](./EXTENSION_I18N.md)** - Internationalization guide

## 🔧 Shared Packages

- **[@gamecp/build](../packages/build)** - Build tools and CLI
- **[@gamecp/types](../packages/types)** - TypeScript types for extension development

## 📝 License

MIT
