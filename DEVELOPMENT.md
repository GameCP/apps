# GameCP Extension Development Guide

This guide outlines the standards and best practices for developing GameCP extensions.

## Project Structure

```
your-extension/
├── gamecp.json          # Extension manifest
├── package.json         # NPM dependencies
├── tsconfig.json        # TypeScript config
├── README.md           # User-facing documentation
├── src/
│   ├── index.tsx       # Export all UI components
│   ├── ui.tsx          # UI components
│   ├── handlers.ts     # Backend API handlers
│   ├── content.ts      # i18n translations
│   └── types.ts        # TypeScript interfaces
└── assets/
    └── icon.png        # Extension icon (required)
```

## Security & Sandboxing

Extension handlers run in an **isolated container** with limited resources:

- **Memory**: Limited to 128MB per extension
- **Execution Time**: 5 second timeout per request (configurable up to 5 minutes)
- **No File System Access**: Extensions cannot read/write host files
- **No Process Spawning**: Extensions cannot spawn child processes
- **Controlled Network**: External HTTP requests require `network.outbound` permission
- **Scoped Database**: Extensions can only access their declared collections

**Available APIs in handlers:**
- `ctx.db` - MongoDB-like database (scoped to extension)
- `ctx.http` - HTTP client for external requests
- `ctx.logger` - Logging utilities
- `ctx.instance` - Game server control (when available)
- `ctx.mysql` - MySQL queries (requires `node_modules: ["mysql2"]`)
- `ctx.pg` - PostgreSQL queries (requires `node_modules: ["pg"]`)
- `ctx.redis` - Redis commands (requires `node_modules: ["ioredis"]`)

**Platform-provided Node modules:**

Extensions can request access to specific Node.js modules that the platform provides:

```json
{
  "sandbox_config": {
    "node_modules": ["mysql2", "pg", "ioredis"]
  }
}
```

Currently supported:
- `mysql2` - MySQL/MariaDB client
- `pg` - PostgreSQL client
- `ioredis` - Redis client
- `nodemailer` - Email sending (coming soon)
- `axios` - HTTP client (coming soon)

## Core Principles

### 1. **Extensions Are Self-Contained**

✅ Use the extension route system:
```json
{
  "ui_injection": [{
    "method": "HANDLER",
    "target": "dashboard.page",
    "component": "MyPage",
    "route_path": "/extensions/my-extension"
  }]
}
```

### 2. **Use the GameCP UI Library**

Always use `@gamecp/ui` for UI components and `@gamecp/types/client` for SDK utilities:

```typescript
import { useGameCP } from '@gamecp/types/client';
import { Card, Button, Badge, FormInput, Switch } from '@gamecp/ui';

export function MyComponent() {
  const { api, confirm, t } = useGameCP();
  
  return (
    <Card>
      <FormInput
        label="Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button variant="primary">{t(myContent.title)}</Button>
    </Card>
  );
}
```

❌ **DON'T** use:
- `window.location.href` for navigation
- Direct `next/link` imports
- Hardcoded English text

✅ **DO** use:
- `@gamecp/ui` for UI components (Card, Button, Badge, FormInput, Switch, etc.)
- SDK's `Link` component from `useGameCP()` for navigation
- SDK's `t()` function for translations
- SDK's `api` for API calls

### 3. **Full i18n Support**

All user-facing text MUST be translated. Support these locales:
- `en` (English)
- `es` (Spanish)
- `pt` (Portuguese)
- `ro` (Romanian)
- `da` (Danish)

**Example content.ts:**
```typescript
export const myContent = {
  title: {
    en: 'My Feature',
    es: 'Mi Característica',
    pt: 'Minha Funcionalidade',
    ro: 'Funcția Mea',
    da: 'Min Funktion'
  },
  buttons: {
    save: {
      en: 'Save',
      es: 'Guardar',
      pt: 'Salvar',
      ro: 'Salvați',
      da: 'Gem'
    }
  }
};
```

**Usage:**
```typescript
const { t } = useGameCP();
<h1>{t(myContent.title)}</h1>
<Button>{t(myContent.buttons.save)}</Button>
```

### 4. **Proper Route Patterns**

**For standalone pages:**
```json
{
  "method": "HANDLER",
  "target": "dashboard.page",
  "route_path": "/extensions/my-extension"
}
```

**For game server pages:**
```json
{
  "method": "HANDLER",
  "target": "server.page.extensions",
  "route_path": "/game-servers/:id/extensions/my-extension"
}
```

**For sidebar navigation:**
```json
{
  "method": "MOUNT",
  "target": "global.sidebar.nav",
  "component": "MyNavLink",
  "order": 100
}
```

### 5. **Backend Handlers**

Use the `ExtensionContext` API:

```typescript
import type { ExtensionContext, ApiResponse } from '@gamecp/types';

export async function myHandler(ctx: ExtensionContext): Promise<ApiResponse> {
  // Access request data
  const { serverId } = ctx.request.query;
  const data = ctx.request.body;
  
  // Use database
  const items = await ctx.db.collection('my_items').find({ serverId }).toArray();
  
  // Make external requests
  const response = await ctx.http.get('https://api.example.com/data');
  
  // Log
  ctx.logger.info('Processing request', { serverId });
  
  // Return response
  return {
    status: 200,
    body: { items }
  };
}
```

### 6. **Manifest Requirements**

**Required fields:**
```json
{
  "extension_id": "my-extension",
  "version": "1.0.0",
  "name": "My Extension",
  "description": "Short description",
  "author": "Your Name",
  "ui_bundle": "dist/index.js",
  "handlers_bundle": "dist/handlers.js",
  "integrity": "sha384-...",
  "metadata": {
    "icon": "assets/icon.png",
    "category": "utilities"
  },
  "sandbox_config": {
    "db_collections": ["my_collection"],
    "permissions": ["network.outbound"]
  }
}
```

**Valid injection targets:**
- `global.sidebar.nav` - Main sidebar navigation
- `global.sidebar.footer` - Main sidebar footer
- `server.dashboard.page` - Game server dashboard
- `server.sidebar.nav` - Game server sidebar
- `dashboard.page` - Main dashboard
- And more (see schema)

### 7. **Dependencies**

**Always include:**
```json
{
  "dependencies": {
    "@gamecp/types": "^0.2.1",
    "@gamecp/ui": "^0.1.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-icons": "^5.0.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@gamecp/build": "^1.0.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.3.3"
  }
}
```

**Build script:**
```json
{
  "scripts": {
    "build": "gamecp-build",
    "dev": "gamecp-build --watch"
  }
}
```

## Common Patterns

### Admin-Only Features (UI)

```typescript
export function AdminComponent({ user }: { user?: { role: string } }) {
  if (user?.role !== 'admin') return null;
  
  return <div>Admin content</div>;
}
```

### Admin-Only Handlers (Backend)

Use `ctx.user` to check permissions in handlers:

```typescript
export async function createSource(ctx: ExtensionContext): Promise<ApiResponse> {
  // Check if user is admin
  if (!ctx.user || ctx.user.role !== 'admin') {
    return { status: 403, body: { error: 'Admin access required' } };
  }
  
  // Admin-only logic here...
}
```

Available user fields:
- `ctx.user.id` - User ID
- `ctx.user.email` - Email address
- `ctx.user.role` - One of: `admin`, `manager`, `user`, `demo`
- `ctx.user.firstName`, `ctx.user.lastName`, `ctx.user.fullName`

### Confirmation Dialogs

```typescript
const { confirm } = useGameCP();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: t(content.deleteTitle),
    message: t(content.deleteMessage),
    confirmText: t(content.buttons.delete)
  });
  
  if (!confirmed) return;
  // Proceed with deletion
};
```

### API Calls

```typescript
import { gamecp } from '@gamecp/types/client';

// GET request
const data = await gamecp.api.get('/api/x/my-extension/items');

// POST request
await gamecp.api.post('/api/x/my-extension/items', { name: 'New Item' });

// DELETE request
await gamecp.api.delete(`/api/x/my-extension/items/${id}`);
```

## Testing Locally

1. Build your extension:
   ```bash
   cd apps/my-extension
   npm install
   npm run build release
   ```

2. Upload the generated zip to your local app store

3. Install on a test tenant

4. Test all features and translations

## Checklist Before Release

- [ ] All text is translated (5 languages)
- [ ] Uses `@gamecp/ui` components (Card, Button, Badge, FormInput, Switch)
- [ ] Uses SDK utilities from `useGameCP()` (api, confirm, t, Link)
- [ ] Uses SDK navigation (no `window.location.href`)
- [ ] React 19 and required peer dependencies installed
- [ ] Routes use `/extensions/` pattern
- [ ] Icon is included (`assets/icon.png`)
- [ ] README is complete
- [ ] All handlers return `ApiResponse`
- [ ] Database collections are declared in manifest
- [ ] Permissions are minimal and correct
- [ ] Build succeeds without errors
- [ ] Tested on local environment

## Examples

See these extensions for reference:
- `brand-kit` - Simple UI customization
- `discord-notifications` - API integration with webhooks
- `database-manager` - Complex admin + user features

## Questions?

Check the SDK documentation at `/api-reference/sdk` on the app store.
