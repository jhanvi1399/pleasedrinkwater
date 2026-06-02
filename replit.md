# HydroCat

A pixel-art cat desktop companion that lives in your macOS Dock and reminds you to drink water every hour.

## Run & Operate

- `pnpm --filter @workspace/hydrocat run dev` — launch HydroCat in Electron (macOS only)
- `pnpm --filter @workspace/hydrocat run build` — package into a macOS .dmg / .app
- `pnpm --filter @workspace/hydrocat run build:dir` — build unpacked .app (faster, no installer)
- `pnpm run typecheck` — typecheck all packages
- `pnpm install` — install all dependencies (including Electron)

## Stack

- pnpm workspaces, Node.js 24
- **HydroCat**: Electron 33, plain HTML/CSS/JS (no bundler needed for main process)
- **Sprite generation**: HTML5 Canvas API (runs inside a hidden Electron BrowserWindow on first launch)
- **Packaging**: electron-builder 25 (macOS .dmg target)

## Where things live

- `artifacts/hydrocat/main/index.js` — Electron main process entry point
- `artifacts/hydrocat/main/DockAnimator.js` — Dock icon animation state machine
- `artifacts/hydrocat/main/Scheduler.js` — Hydration reminder timer + macOS notifications
- `artifacts/hydrocat/main/TrayManager.js` — Menu bar tray item
- `artifacts/hydrocat/main/Store.js` — Settings persistence (userData JSON)
- `artifacts/hydrocat/main/preload.js` — IPC bridge (contextBridge)
- `artifacts/hydrocat/renderer/sprite-generator.html` — Generates all pixel-art frames on launch
- `artifacts/hydrocat/renderer/popup.html/css/js` — Hydration reminder popup window

## Architecture decisions

- **Sprites generated at runtime via hidden BrowserWindow**: Avoids native canvas dependencies (like `node-canvas`). On first launch, a hidden Electron window runs the sprite generator, draws all frames to an HTML5 Canvas, and sends data URLs back to main via IPC.
- **nativeImage for dock icon animation**: Each animation frame is a base64 PNG data URL passed to `nativeImage.createFromDataURL()`, then set via `app.dock.setIcon()` on a timer.
- **No external runtime dependencies**: The app runs with only Electron as a runtime — no Express, no database, no bundler.
- **Settings stored in userData JSON**: Uses `app.getPath('userData')` + plain `fs` to persist interval, streak, and pause state without any npm packages.

## Product

HydroCat is a macOS Dock companion app. A pixel-art cat sleeps in your Dock, occasionally waking up and stretching. Every 60 minutes (configurable) it bounces excitedly and fires a native notification: "Hey human, time to drink water 💧". Clicking the notification or Dock icon opens a popup with action buttons. Tracking a hydration streak motivates consistent drinking.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **macOS only**: `app.dock`, `app.dock.setIcon()`, and vibrancy effects are macOS-specific. The app will error on Linux/Windows.
- **Notifications on macOS**: The app needs to be running as a proper `.app` bundle for notifications to work reliably. In dev mode (`electron .`), they work if the user has granted permission.
- **Sprite generation timing**: On very slow machines, the sprite generator window might take a moment. The dock icon shows after `sprites-generated` IPC fires.
- **electron and electron-builder are in `onlyBuiltDependencies`** in pnpm-workspace.yaml — required for their postinstall scripts to run.

## Pointers

- See `artifacts/hydrocat/README.md` for end-user instructions and folder structure
- See the `pnpm-workspace` skill for workspace structure details
