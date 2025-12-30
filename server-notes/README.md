# Admin Notes Extension

A GameCP extension that adds private admin notes to game servers for internal documentation and team communication.

## Features

- 📝 **Private Notes** - Add internal notes visible only to admins
- 💾 **Auto-save** - Notes are automatically saved per server
- 📊 **Character Counter** - Track note length (10,000 character limit)
- 🕒 **Last Updated** - See when notes were last modified
- 🔒 **Server-specific** - Each server has its own notes

## Installation

### For Users

Install directly from the [GameCP App Store](https://appstore.gamecp.com):

1. Browse to the Admin Notes extension
2. Click "Install"
3. The extension will be automatically added to your GameCP instance

### For Developers

#### 1. Build the Extension

```bash
npm install
npm run build
```

This creates `dist/index.js` - your bundled extension.

#### 2. Generate SRI Hash

```bash
openssl dgst -sha384 -binary dist/index.js | openssl base64 -A
```

Copy the output hash and update `gamecp.json`:

```json
"integrity": "sha384-YOUR_HASH_HERE"
```

#### 3. Create Icon

Create a 256x256 PNG icon for your extension.

#### 4. Submit to App Store

1. Visit the [GameCP App Store Developer Portal](https://appstore.gamecp.com/developer)
2. Click "Submit New Extension"
3. Fill in the submission form with:
   - Extension manifest (`gamecp.json`)
   - Extension bundle (`dist/index.js`)
   - Icon (256x256 PNG)
   - Screenshots (optional but recommended)
   - Description and documentation

The App Store will:
- ✅ Validate your manifest and bundle
- ✅ Host your extension files on the CDN
- ✅ Make it available for users to install
- ✅ Handle version updates automatically

## Usage

### Adding Notes

1. Navigate to any game server in your GameCP dashboard
2. The Admin Notes panel will appear at the top of the server dashboard
3. Type your notes in the text area
4. Click "Save Note" to store your notes
5. Notes are private and only visible to admins

### Use Cases

- **Server Configuration Notes** - Document custom settings and configurations
- **Troubleshooting History** - Track issues and resolutions
- **Team Communication** - Leave notes for other admins
- **Maintenance Logs** - Record maintenance activities
- **Customer Notes** - Internal notes about client requests or issues

## Development

### File Structure

```
server-notes/
├── gamecp.json           # Extension manifest
├── src/
│   ├── bridge.js        # Main export file
│   ├── components.js    # React UI component
│   └── handlers.js      # Server-side API handlers
├── dist/
│   └── index.js         # Built bundle
├── esbuild.dev.js       # Dev build script
└── package.json
```

### Manifest Schema

The `gamecp.json` follows the [GameCP Extension Manifest Specification](https://github.com/GameCP/appstore/blob/main/docs/manifest-spec.md).

Key sections:
- **ui_injection**: Defines where UI components render
- **internal_logic**: API routes for saving/loading notes
- **sandbox_config**: Database collections and permissions

### API Routes

- `POST /api/x/server-notes/notes` - Save a note for a server
- `GET /api/x/server-notes/notes?serverId=xxx` - Get note for a server

### UI Injection

The extension injects the `NotesArea` component into:
- **Area**: `server_dashboard` - Appears at the top of the server dashboard page

## Database Collections

The extension uses sandboxed database collections:

- `notes` - Stores admin notes per server with timestamps

## Permissions

Required permissions:
- `server.read` - Read server information
- `server.write` - Save notes to servers

## Technical Details

### Note Storage

Each note is stored with:
- `serverId` - The game server ID
- `note` - The note content (max 10,000 characters)
- `updatedAt` - ISO timestamp of last update

### Validation

- Notes are limited to 10,000 characters
- Server ID is required for all operations
- Empty notes are allowed (to clear notes)

## License

MIT
