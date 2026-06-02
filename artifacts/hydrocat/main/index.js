const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');
const Store = require('./Store');
const DockAnimator = require('./DockAnimator');
const Scheduler = require('./Scheduler');
const TrayManager = require('./TrayManager');

// Keep references alive
let spriteWindow = null;
let popupWindow = null;
let dockAnimator = null;
let scheduler = null;
let trayManager = null;
let generatedFrames = {};

app.whenReady().then(() => {
  // macOS: keep app alive even with no windows
  app.dock.hide();

  dockAnimator = new DockAnimator(app);
  scheduler = new Scheduler(Store);

  // Generate sprites via hidden renderer window
  generateSprites();

  // Set up IPC
  setupIPC();

  // Start scheduler
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
});

function generateSprites() {
  spriteWindow = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  spriteWindow.loadFile(path.join(__dirname, '..', 'renderer', 'sprite-generator.html'));

  spriteWindow.webContents.on('did-finish-load', () => {
    // Wait for sprites to be generated via IPC
  });
}

function showPopup(initialState = 'idle') {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.focus();
    popupWindow.webContents.send('animation-state', initialState);
    return;
  }

  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = primaryDisplay.workAreaSize;

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

  popupWindow.on('blur', () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.close();
    }
  });

  popupWindow.on('closed', () => {
    popupWindow = null;
  });

  popupWindow.show();
}

function setupIPC() {
  ipcMain.on('sprites-generated', (_event, frames) => {
    generatedFrames = frames;
    dockAnimator.loadFrames(frames);

    // Start in sleeping state
    dockAnimator.setState('sleeping');

    // Set up idle transitions
    setupIdleTransitions();

    // Create tray with first idle frame
    const trayFrame = frames['idle_1'] || frames['sleep_1'];
    trayManager = new TrayManager(Store, scheduler, () => showPopup());
    trayManager.create(trayFrame);

    // Show dock now that we have an icon
    app.dock.show();

    // Close sprite generator window
    if (spriteWindow && !spriteWindow.isDestroyed()) {
      spriteWindow.close();
      spriteWindow = null;
    }
  });

  ipcMain.handle('drank-water', () => {
    const currentStreak = Store.get('streak') + 1;
    Store.set('streak', currentStreak);
    Store.set('lastDrank', new Date().toISOString());

    dockAnimator.playOnceAndReturn('happy', 'idle');

    setTimeout(() => {
      dockAnimator.playOnceAndReturn('celebrating', 'sleeping');
    }, 2500);

    scheduler.resetAfterDrink();
    trayManager && trayManager.refresh();

    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.webContents.send('animation-state', 'happy');
      setTimeout(() => {
        if (popupWindow && !popupWindow.isDestroyed()) {
          popupWindow.close();
        }
      }, 3000);
    }

    return { streak: currentStreak };
  });

  ipcMain.handle('remind-later', () => {
    scheduler.remindLater(15);
    dockAnimator.setState('sleeping');
    trayManager && trayManager.refresh();

    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.webContents.send('animation-state', 'sad');
      setTimeout(() => {
        if (popupWindow && !popupWindow.isDestroyed()) {
          popupWindow.close();
        }
      }, 1500);
    }

    return { ok: true };
  });

  ipcMain.handle('close-popup', () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.close();
    }
    return { ok: true };
  });

  ipcMain.handle('get-streak', () => {
    return { streak: Store.get('streak') };
  });

  ipcMain.handle('need-sprites', () => {
    return { ok: true };
  });
}

let idleTimer = null;
function setupIdleTransitions() {
  // Occasionally transition from sleeping to idle and back
  function scheduleNextIdleEvent() {
    const delay = 20000 + Math.random() * 40000; // 20-60 seconds
    idleTimer = setTimeout(() => {
      const currentState = dockAnimator.currentState;
      if (currentState === 'sleeping') {
        // Occasionally wake up briefly
        if (Math.random() < 0.3) {
          dockAnimator.transitionTo('waking', () => {
            dockAnimator.transitionTo('idle', () => {
              setTimeout(() => {
                dockAnimator.setState('sleeping');
                scheduleNextIdleEvent();
              }, 5000 + Math.random() * 10000);
            });
          });
        } else {
          scheduleNextIdleEvent();
        }
      } else if (currentState === 'idle') {
        dockAnimator.setState('sleeping');
        scheduleNextIdleEvent();
      } else {
        scheduleNextIdleEvent();
      }
    }, delay);
  }

  scheduleNextIdleEvent();
}

app.on('window-all-closed', () => {
  // Don't quit on macOS when all windows are closed
  // The app lives in the dock/tray
});

app.on('before-quit', () => {
  dockAnimator && dockAnimator.stop();
  scheduler && scheduler.stop();
  trayManager && trayManager.destroy();
});

app.on('activate', () => {
  // Show popup when dock icon is clicked
  showPopup();
});
