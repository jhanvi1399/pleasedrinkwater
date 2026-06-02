'use strict';

const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs   = require('fs');

const Store        = require('./Store');
const DockAnimator = require('./DockAnimator');
const Scheduler    = require('./Scheduler');
const TrayManager  = require('./TrayManager');

let popupWindow   = null;
let dockAnimator  = null;
let scheduler     = null;
let trayManager   = null;

app.whenReady().then(() => {
  app.dock.hide(); // hide until sprites are ready

  dockAnimator = new DockAnimator(app);
  scheduler    = new Scheduler(Store);

  setupIPC();

  scheduler.start((event) => {
    if (event === 'reminder') {
      dockAnimator.setState('bouncing');
      trayManager && trayManager.refresh();
    } else if (event === 'notification-click') {
      showPopup('bouncing');
    } else if (event === 'tick') {
      trayManager && trayManager.refresh();
    }
  });

  const frames = loadSprites();
  if (frames) onSpritesReady(frames);
});

// ─── Sprite loading ───────────────────────────────────────────────────────────

/**
 * Loads all 33 animation frames from the pre-sliced sprite PNGs.
 * Run `npm run slice-sprites` first to produce assets/sprites/*.png.
 *
 * Returns a name → nativeImage map, or null on failure.
 */
function loadSprites() {
  const assetsDir    = path.join(__dirname, '..', 'assets');
  const manifestPath = path.join(assetsDir, 'spritesheet.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(
      '❌  assets/spritesheet.json not found.\n' +
      '    Run: npm run slice-sprites'
    );
    app.quit();
    return null;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.error('❌  Failed to parse spritesheet.json:', e.message);
    app.quit();
    return null;
  }

  const frames = {};
  for (const [name, info] of Object.entries(manifest)) {
    const filePath = path.join(assetsDir, info.file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌  Missing sprite: ${info.file}\n    Run: npm run slice-sprites`);
      app.quit();
      return null;
    }
    frames[name] = nativeImage.createFromPath(filePath);
  }

  console.log(`✅  Loaded ${Object.keys(frames).length} sprite frames from assets/sprites/`);
  return frames;
}

/** Called once we have a complete frames map (name → nativeImage). */
function onSpritesReady(frames) {
  dockAnimator.loadFrames(frames);
  dockAnimator.setState('sleeping');

  setupIdleTransitions();

  const trayIcon = frames['idle_1'] || frames['sleep_1'];
  trayManager = new TrayManager(Store, scheduler, () => showPopup());
  trayManager.create(trayIcon);

  app.dock.show();
}

// ─── Popup window ─────────────────────────────────────────────────────────────

function showPopup(initialState = 'idle') {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.focus();
    popupWindow.webContents.send('animation-state', initialState);
    return;
  }

  const { screen } = require('electron');
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  popupWindow = new BrowserWindow({
    width: 340,
    height: 420,
    x: sw - 360,
    y: sh - 450,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  popupWindow.loadFile(path.join(__dirname, '..', 'renderer', 'popup.html'));

  popupWindow.webContents.once('did-finish-load', () => {
    popupWindow.webContents.send('animation-state', initialState);
  });

  popupWindow.on('blur',   () => { if (popupWindow && !popupWindow.isDestroyed()) popupWindow.close(); });
  popupWindow.on('closed', () => { popupWindow = null; });

  popupWindow.show();
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

function setupIPC() {
  ipcMain.handle('drank-water', () => {
    const streak = Store.get('streak') + 1;
    Store.set('streak', streak);
    Store.set('lastDrank', new Date().toISOString());

    dockAnimator.playOnceAndReturn('happy', 'idle');
    setTimeout(() => dockAnimator.playOnceAndReturn('celebrating', 'sleeping'), 2500);

    scheduler.resetAfterDrink();
    trayManager && trayManager.refresh();

    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.webContents.send('animation-state', 'happy');
      setTimeout(() => {
        if (popupWindow && !popupWindow.isDestroyed()) popupWindow.close();
      }, 3000);
    }

    return { streak };
  });

  ipcMain.handle('remind-later', () => {
    scheduler.remindLater(15);
    dockAnimator.setState('sleeping');
    trayManager && trayManager.refresh();

    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.webContents.send('animation-state', 'sad');
      setTimeout(() => {
        if (popupWindow && !popupWindow.isDestroyed()) popupWindow.close();
      }, 1500);
    }

    return { ok: true };
  });

  ipcMain.handle('close-popup', () => {
    if (popupWindow && !popupWindow.isDestroyed()) popupWindow.close();
    return { ok: true };
  });

  ipcMain.handle('get-streak', () => ({ streak: Store.get('streak') }));
}

// ─── Idle state machine ───────────────────────────────────────────────────────

let idleTimer = null;

function setupIdleTransitions() {
  function scheduleNext() {
    const delay = 20000 + Math.random() * 40000; // 20–60 s
    idleTimer = setTimeout(() => {
      const state = dockAnimator.currentState;

      if (state === 'sleeping' && Math.random() < 0.3) {
        dockAnimator.transitionTo('waking', () => {
          dockAnimator.transitionTo('idle', () => {
            setTimeout(() => {
              dockAnimator.setState('sleeping');
              scheduleNext();
            }, 5000 + Math.random() * 10000);
          });
        });
      } else if (state === 'idle') {
        dockAnimator.setState('sleeping');
        scheduleNext();
      } else {
        scheduleNext();
      }
    }, delay);
  }

  scheduleNext();
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.on('window-all-closed', () => {
  // macOS: stay alive in the Dock/tray even with no open windows
});

app.on('before-quit', () => {
  dockAnimator && dockAnimator.stop();
  scheduler    && scheduler.stop();
  trayManager  && trayManager.destroy();
  if (idleTimer) clearTimeout(idleTimer);
});

app.on('activate', () => {
  showPopup();
});
