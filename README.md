# GameCP Extensions

Official and community extensions for GameCP.

## Creating a New Extension

### 1. Create Extension Directory

```bash
mkdir -p apps/my-extension
cd apps/my-extension
npm init -y
```

### 2. Create Manifest

Create `gamecp.json` following the [manifest specification](https://github.com/GameCP/appstore/blob/main/docs/manifest-spec.md).

### 3. Build Extension

```bash
npm run build
npm run generate-hash
```

### 4. Submit to App Store

Visit the [GameCP App Store Developer Portal](https://apps.gamecp.com/developer) to submit your extension.

---

## Extension Structure

```
apps/
├── discord-notifications/     # Discord webhook notifications
│   ├── gamecp.json           # Manifest
│   ├── src/
│   │   ├── index.jsx        # UI components
│   │   └── handlers.js      # Server handlers
│   ├── dist/
│   │   └── index.js         # Built bundle
│   └── README.md
├── your-extension/           # Your extension here
└── README.md                 # This file
```

---

## Resources

- [Extension Manifest Spec](https://github.com/GameCP/appstore/blob/main/docs/manifest-spec.md)
- [App Store](https://apps.gamecp.com)
- [Developer Portal](https://apps.gamecp.com/developer)
- [Documentation](https://docs.gamecp.com/extensions)

---

## License

Each extension may have its own license. See individual extension directories for details.
