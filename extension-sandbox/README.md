# GameCP Extension Sandbox

An open-source testing environment for developing and testing GameCP extensions.

![Extension Sandbox](https://gamecp.com/images/sandbox-preview.png)

## Features

- 🧩 **Extension Manager** - Install, enable/disable, and inspect extensions
- 🎮 **Mock Game Servers** - Create simulated servers to test extension interactions
- 📋 **Console Viewer** - Monitor extension logs and sandbox events
- 📚 **Documentation** - Built-in guide for extension development
- 🔒 **Sandboxed Environment** - Safe testing without affecting production
- 🌙 **Dark Mode** - Automatic dark mode support
- 💾 **Persistent Storage** - Extensions and settings saved to localStorage

## Quick Start

```bash
# Clone the repository
git clone https://github.com/GameCP/apps.git
cd apps/extension-sandbox

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the sandbox.

## Usage

### Installing Extensions

1. Navigate to the **Extensions** tab
2. Click **Install Extension**
3. Upload your `gamecp.json` manifest file, paste JSON directly, or fetch from URL

### Testing with Mock Servers

1. Go to the **Game Servers** tab
2. Create mock servers with different games and configurations
3. Start/stop servers to trigger extension hooks

### Viewing Logs

The **Console** tab shows all activity from:
- Extension installation/removal
- Server start/stop events
- Extension-generated logs

## Extension Structure

Extensions need a `gamecp.json` manifest:

```json
{
  "extension_id": "my-extension",
  "version": "1.0.0",
  "name": "My Extension",
  "description": "A brief description",
  "author": "Your Name",
  "ui_bundle": "dist/index.js",
  "handlers_bundle": "dist/handlers.js",
  "ui_injection": [
    {
      "method": "MOUNT",
      "target": "global.sidebar.nav",
      "component": "MyNavLink"
    }
  ],
  "sandbox_config": {
    "db_collections": ["my_data"],
    "permissions": ["network.outbound"]
  }
}
```

## Technologies

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **Monaco Editor** - Code editing

## Development

This sandbox is part of the [GameCP Apps](https://github.com/GameCP/apps) repository.

### Building

```bash
npm run build
npm run start
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Related Projects

- [@gamecp/types](https://www.npmjs.com/package/@gamecp/types) - TypeScript types for extensions
- [@gamecp/ui](https://www.npmjs.com/package/@gamecp/ui) - UI component library
- [@gamecp/build](https://www.npmjs.com/package/@gamecp/build) - Build tools for extensions

## License

MIT License - see [LICENSE](./LICENSE) for details.
