# Discord Notifications Extension

A GameCP extension that sends Discord notifications for game server events.

## Features

- 🔔 **Real-time Notifications** - Get instant alerts in Discord
- 🔴 **Crash Alerts** - Notified immediately when servers crash
- 🟢 **Status Updates** - Know when servers start/stop
- 🧪 **Test Messages** - Verify webhook configuration
- 📊 **Event Logging** - Track all notification events

## Installation

### 1. Build the Extension

```bash
npm install
npm run build
```

This creates `dist/index.js` - your bundled extension.

### 2. Generate SRI Hash

```bash
npm run generate-hash
```

Copy the output hash and update `gamecp.json`:

```json
"integrity": "sha384-YOUR_HASH_HERE"
```

### 3. Upload to CDN

Upload `dist/index.js` to your CDN at:
```
https://cdn.gamecp.com/extensions/discord-notifications/v1.0.0/index.js
```

### 4. Create Icon

Create a 256x256 PNG icon and upload to:
```
https://cdn.gamecp.com/extensions/discord-notifications/icon.png
```

### 5. Submit to App Store

1. Visit your GameCP App Store developer portal
2. Click "Submit New Extension"
3. Upload:
   - `gamecp.json` (manifest)
   - `dist/index.js` (bundle)
   - `icon.png` (256x256)
   - Screenshots (optional)

## Usage

### Configure Discord Webhook

1. In Discord: Server Settings → Integrations → Webhooks → New Webhook
2. Copy the webhook URL
3. In GameCP: Navigate to your game server → Discord extension
4. Paste webhook URL and save
5. Click "Send Test Message" to verify

### Events

The extension automatically sends notifications for:

- **Server Crash** 🔴 - Red embed with crash reason
- **Server Start** 🟢 - Green embed when server comes online
- **Server Stop** 🟡 - Yellow embed when server is stopped

## Development

### File Structure

```
discord-notifications-extension/
├── gamecp.json           # Extension manifest
├── src/
│   ├── index.jsx        # React UI components
│   └── handlers.js      # Server-side event handlers
├── dist/
│   └── index.js         # Built bundle
├── build.js             # Build script
└── package.json
```

### Manifest Schema

The `gamecp.json` follows the [GameCP Extension Manifest Specification](https://github.com/GameCP/appstore/blob/main/docs/manifest-spec.md).

Key sections:
- **ui_injection**: Defines where UI components render
- **internal_logic**: API routes and event listeners
- **sandbox_config**: Database collections and permissions
- **metadata**: Marketplace display info

### API Routes

- `POST /api/x/discord-notifications/webhooks` - Save webhook
- `GET /api/x/discord-notifications/webhooks` - Get webhooks
- `POST /api/x/discord-notifications/test` - Send test message

### Event Handlers

- `handleCrash(event, payload, ctx)` - Server crash
- `handleStart(event, payload, ctx)` - Server start
- `handleStop(event, payload, ctx)` - Server stop

## Database Collections

The extension uses two collections (auto-prefixed):

- `plugin_discord-notifications_webhooks` - Webhook URLs
- `plugin_discord-notifications_logs` - Event history

## Permissions

Required permissions:
- `server.console.read` - Read console logs
- `server.metrics.read` - Read server metrics
- `network.outbound` - Send HTTP requests to Discord

## License

MIT
