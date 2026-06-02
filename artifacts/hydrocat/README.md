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

- macOS 10.15 (Catalina) or later
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
npx electron .
```

## Building for Distribution

### 1. Install dependencies (run once)

```bash
pnpm install
```

### 2. Slice sprites from the approved sheet (run once after cloning)

```bash
pnpm --filter @workspace/hydrocat run slice-sprites
```

This reads `assets/spritesheet.png` (the approved pixel-art reference) and
writes 33 individual 128×128 frame PNGs into `assets/sprites/`, the
`spritesheet.json` manifest, and the 512×512 `assets/icon.png`.

The sprite PNGs are committed to the repo, so this step is only strictly
needed if you delete `assets/sprites/` or update `assets/spritesheet.png`.

### 3. Build the .dmg installer

```bash
# Universal binary — creates both arm64 and x64 DMGs
pnpm --filter @workspace/hydrocat run build

# Directory output only (faster, no installer — useful for quick testing)
pnpm --filter @workspace/hydrocat run build:dir
```

Output lands in `artifacts/hydrocat/dist/`:

```
dist/
  HydroCat-1.0.0-arm64.dmg   ← Apple Silicon installer
  HydroCat-1.0.0.dmg         ← Intel installer
  mac-arm64/HydroCat.app
  mac/HydroCat.app
```

Open the `.dmg`, drag HydroCat to `/Applications`, and launch it.

---

## Code Signing & Notarization (optional)

Without signing, macOS Gatekeeper shows a warning the first time you open the
app. Users can bypass it via **right-click → Open**, but for a smoother
experience you can sign and notarize the build.

### Prerequisites

1. Enroll in the [Apple Developer Program](https://developer.apple.com) ($99/yr).
2. In Xcode / Keychain, create a **Developer ID Application** certificate and
   export it as a `.p12` file.
3. Create an [app-specific password](https://appleid.apple.com) for your Apple ID.
4. Find your **Team ID** on [developer.apple.com/account](https://developer.apple.com/account).

### Environment variables

Set these before running `pnpm ... run build`:

| Variable            | Description                                    |
|---------------------|------------------------------------------------|
| `CSC_LINK`          | Path to your `.p12` file (or base-64 string)   |
| `CSC_KEY_PASSWORD`  | Password for the `.p12` certificate            |
| `APPLE_ID`          | Your Apple ID email                            |
| `APPLE_APP_PASSWORD`| App-specific password                          |
| `APPLE_TEAM_ID`     | 10-character Team ID                           |

### Enable notarization

```bash
pnpm --filter @workspace/hydrocat add -D @electron/notarize
```

Then open `scripts/notarize.js` and uncomment the `notarize(…)` call inside
the `exports.default` function. The `afterSign` hook in `package.json` wires
it up automatically.

### Sign + notarize in one command

```bash
CSC_LINK=/path/to/cert.p12 \
CSC_KEY_PASSWORD=yourpassword \
APPLE_ID=you@example.com \
APPLE_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
APPLE_TEAM_ID=XXXXXXXXXX \
pnpm --filter @workspace/hydrocat run build
```

---

## How it works

On launch, HydroCat:
1. Loads pre-sliced sprite PNGs from `assets/sprites/` via `spritesheet.json`
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
├── build/
│   └── entitlements.mac.plist   # Hardened runtime entitlements (code signing)
├── main/
│   ├── index.js         # Electron main process
│   ├── DockAnimator.js  # Dock icon animation engine
│   ├── Scheduler.js     # Hydration reminder timer
│   ├── TrayManager.js   # Menu bar item
│   ├── Store.js         # Settings persistence
│   └── preload.js       # IPC bridge
├── renderer/
│   ├── popup.html       # Popup window UI
│   ├── popup.css        # Popup styles
│   └── popup.js         # Popup logic
├── assets/
│   ├── spritesheet.png        # Approved pixel-art reference (source of truth)
│   ├── spritesheet.json       # Frame manifest (generated by slice-sprites)
│   ├── icon.png               # 512×512 app icon (generated by slice-sprites)
│   └── sprites/               # Individual 128×128 frame PNGs (33 total)
├── scripts/
│   ├── slice-sprites.js       # Slices assets/spritesheet.png into frame PNGs
│   └── notarize.js            # Apple notarization hook
└── package.json
```

## Settings

Settings are stored in:
- macOS: `~/Library/Application Support/HydroCat/hydrocat-settings.json`

Available settings:
- `intervalMinutes`: Reminder interval (30, 60, 90, or 120)
- `isPaused`: Whether reminders are paused
- `streak`: Total hydration count
- `lastDrank`: ISO timestamp of last drink
