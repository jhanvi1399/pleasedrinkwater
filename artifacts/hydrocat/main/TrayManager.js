const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

class TrayManager {
  constructor(store, scheduler, onShowPopup) {
    this.store = store;
    this.scheduler = scheduler;
    this.onShowPopup = onShowPopup;
    this.tray = null;
    this.updateTimer = null;
  }

  create(trayIconDataUrl) {
    let icon;
    try {
      icon = nativeImage.createFromDataURL(trayIconDataUrl);
      icon = icon.resize({ width: 16, height: 16 });
    } catch {
      icon = nativeImage.createEmpty();
    }

    this.tray = new Tray(icon);
    this.tray.setToolTip('HydroCat');

    this._updateMenu();

    this.updateTimer = setInterval(() => {
      this._updateMenu();
    }, 30000);
  }

  updateIcon(trayIconDataUrl) {
    if (!this.tray) return;
    try {
      let icon = nativeImage.createFromDataURL(trayIconDataUrl);
      icon = icon.resize({ width: 16, height: 16 });
      this.tray.setImage(icon);
    } catch {}
  }

  _getTimeLabel() {
    const isPaused = this.scheduler.isPaused();
    if (isPaused) return '⏸ Reminders paused';

    const remaining = this.scheduler.getTimeRemaining();
    if (!remaining) return '🐱 HydroCat';

    const { minutes, seconds } = remaining;
    if (minutes > 0) {
      return `💧 Next reminder in ${minutes}m ${seconds}s`;
    }
    return `💧 Next reminder in ${seconds}s`;
  }

  _updateMenu() {
    if (!this.tray) return;

    const isPaused = this.scheduler.isPaused();
    const currentInterval = this.store.get('intervalMinutes');
    const streak = this.store.get('streak');

    const intervalOptions = [30, 60, 90, 120];

    const menu = Menu.buildFromTemplate([
      {
        label: this._getTimeLabel(),
        enabled: false,
      },
      {
        label: `🏆 Streak: ${streak} drink${streak !== 1 ? 's' : ''}`,
        enabled: false,
      },
      { type: 'separator' },
      {
        label: '🐱 Show HydroCat',
        click: () => {
          if (this.onShowPopup) this.onShowPopup();
        },
      },
      { type: 'separator' },
      {
        label: isPaused ? '▶️ Resume reminders' : '⏸ Pause reminders',
        click: () => {
          if (isPaused) {
            this.scheduler.resume();
          } else {
            this.scheduler.pause();
          }
          this._updateMenu();
        },
      },
      {
        label: '⏰ Reminder interval',
        submenu: intervalOptions.map((mins) => ({
          label: mins < 60
            ? `${mins} minutes`
            : `${mins / 60} hour${mins / 60 !== 1 ? 's' : ''}`,
          type: 'radio',
          checked: currentInterval === mins,
          click: () => {
            this.scheduler.setInterval(mins);
            this._updateMenu();
          },
        })),
      },
      { type: 'separator' },
      {
        label: '🚪 Quit HydroCat',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(menu);
    this.tray.setToolTip(this._getTimeLabel());
  }

  refresh() {
    this._updateMenu();
  }

  destroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    if (this.tray) {
      this.tray.destroy();
    }
  }
}

module.exports = TrayManager;
