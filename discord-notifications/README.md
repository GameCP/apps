# Discord Notifications Extension

A GameCP extension that sends Discord notifications for game server events.

## Features

- 🔔 **Real-time Notifications** - Get instant alerts in Discord
- 🔴 **Crash Alerts** - Notified immediately when servers crash
- 🟢 **Status Updates** - Know when servers start/stop
- 🧪 **Test Messages** - Verify webhook configuration
- 📊 **Event Logging** - Track all notification events

## Installation

### For Users

Install directly from the [GameCP App Store](https://appstore.gamecp.com):

1. Browse to the Discord Notifications extension
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

- `POST /api/x/discord-notifications/webhooks` - Save webhook URL
- `GET /api/x/discord-notifications/webhooks` - Get configured webhooks
- `POST /api/x/discord-notifications/test` - Send test message to Discord
- `DELETE /api/x/discord-notifications/webhooks` - Remove a webhook

### Event Listeners

The extension automatically listens for these server events:

- `server.status.crash` → `handleCrash()` - Send crash alert to Discord
- `server.status.started` → `handleStart()` - Send server started notification
- `server.status.stopped` → `handleStop()` - Send server stopped notification

## Database Collections

The extension uses sandboxed database collections:

- `webhooks` - Stores Discord webhook URLs per server
- `logs` - Event notification history

## Permissions

Required permissions:
- `network.outbound` - Send HTTP requests to Discord webhooks

## Resource Limits

- **Memory**: 128 MB
- **Timeout**: 10 seconds per request
- **DB Queries**: Max 10 per request

## License

MIT
