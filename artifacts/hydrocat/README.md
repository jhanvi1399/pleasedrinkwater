# HydroCat 🐱💧

A pixel-art cat that lives in your macOS Dock and reminds you to drink water.

## Features

- 🐱 Animated pixel-art cat in your macOS Dock
- 💧 Hydration reminders every 60 minutes (configurable)
- 🏆 Hydration streak tracking
- 📱 Native macOS notifications
- ⚙️ Menu bar controls (pause, change interval)
- 🌙 Dark mode support

## Requirements

- macOS 10.15 or later
- Node.js 18+
- pnpm

## Development

```bash
# From the workspace root, install dependencies
pnpm install

# Run in development mode
pnpm --filter @workspace/hydrocat run dev

# Or from this directory:
cd artifacts/hydrocat
npm run dev
```

## Building for Production

```bash
# Build a macOS .app / .dmg
pnpm --filter @workspace/hydrocat run build

# Or build directory only (faster, no installer)
pnpm --filter @workspace/hydrocat run build:dir
```

The built app will be in `artifacts/hydrocat/dist/`.

## How it works

On launch, HydroCat:
1. Generates pixel-art sprites using the browser canvas API
2. Animates the macOS Dock icon using Electron's `nativeImage` API
3. Sets a reminder timer (default: 60 minutes)
4. Sends a native macOS notification when it's time to drink water
5. Opens a popup when you click the notification or Dock icon

## Animation States

| State       | Trigger                          |
|-------------|----------------------------------|
| Sleeping    | Default idle state               |
| Waking      | Transition from sleep            |
| Idle        | Alert, sitting upright           |
| Bouncing    | Hydration reminder active        |
| Happy       | After "I drank water"            |
| Celebrating | After streak milestone           |
| Sad         | After "Remind me later"          |

## Folder Structure

```
artifacts/hydrocat/
├── main/
│   ├── index.js         # Electron main process
│   ├── DockAnimator.js  # Dock icon animation engine
│   ├── Scheduler.js     # Hydration reminder timer
│   ├── TrayManager.js   # Menu bar item
│   ├── Store.js         # Settings persistence
│   └── preload.js       # IPC bridge
├── renderer/
│   ├── sprite-generator.html  # Auto-generates pixel art sprites
│   ├── popup.html             # Popup window UI
│   ├── popup.css              # Popup styles
│   └── popup.js               # Popup logic
├── package.json
└── README.md
```

## Settings

Settings are stored in:
- macOS: `~/Library/Application Support/HydroCat/hydrocat-settings.json`

Available settings:
- `intervalMinutes`: Reminder interval (30, 60, 90, or 120)
- `isPaused`: Whether reminders are paused
- `streak`: Total hydration count
- `lastDrank`: ISO timestamp of last drink
