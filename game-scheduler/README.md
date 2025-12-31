# Game Scheduler Extension

Auto-Tasker Pro for GameCP - Schedule restarts, wipes, and command sequences.

## Features

- 🔄 **Scheduled Restarts** - Automate server restarts on a schedule
- 🧹 **Automated Wipes** - Clear world data on a schedule (perfect for Rust/ARK)
- ⚡ **Command Sequences** - Run RCON commands before restarts
- 📅 **Flexible Scheduling** - Use cron expressions for precise timing

## Installation

This extension is designed to be installed through the GameCP App Store.

## Development

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# The built bundle will be in dist/index.js
```

## Usage

1. Navigate to your game server in GameCP
2. Click "Scheduler" in the sidebar
3. Create a new task with:
   - Task name
   - Action type (restart, command, or wipe)
   - Cron schedule
4. The task will execute automatically based on the schedule

## Cron Expression Examples

- `0 4 * * *` - Every day at 4 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Every Sunday at midnight
- `*/30 * * * *` - Every 30 minutes

## License

MIT
