'use strict';

const { Tray, Menu, nativeImage, app } = require('electron');

class TrayManager {
  constructor(store, scheduler, onShowPopup) {
    this.store        = store;
    this.scheduler    = scheduler;
    this.onShowPopup  = onShowPopup;
    this.tray         = null;
    this.updateTimer  = null;
  }

  /**
   * @param {Electron.NativeImage} icon  — the idle_1 sprite nativeImage
   */
  create(icon) {
    let trayIcon;
    try {
      trayIcon = icon.resize({ width: 16, height: 16 });
    } catch {
      trayIcon = nativeImage.createEmpty();
    }

    this.tray = new Tray(trayIcon);
    this.tray.setToolTip('HydroCat');

    this._updateMenu();

    this.updateTimer = setInterval(() => {
      this._updateMenu();
    }, 30000);
  }

  /**
   * @param {Electron.NativeImage} icon
   */
  updateIcon(icon) {
    if (!this.tray) return;
    try {
      this.tray.setImage(icon.resize({ width: 16, height: 16 }));
    } catch {}
  }

  refresh() {
    this._updateMenu();
  }

  destroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    if (this.tray && !this.tray.isDestroyed()) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  _updateMenu() {
    const streak   = this.store.get('streak') || 0;
    const lastDrank = this.store.get('lastDrank');
    const nextDue   = this.scheduler.getNextReminderTime();

    let nextLabel = 'No reminder set';
    if (nextDue) {
      const mins = Math.round((nextDue - Date.now()) / 60000);
      nextLabel = mins <= 0 ? 'Reminder due!' : `Next reminder in ${mins} min`;
    }

    const menu = Menu.buildFromTemplate([
      { label: `💧 Streak: ${streak} drink${streak !== 1 ? 's' : ''}`, enabled: false },
      { label: lastDrank ? `Last drink: ${new Date(lastDrank).toLocaleTimeString()}` : 'No drinks recorded', enabled: false },
      { label: nextLabel, enabled: false },
      { type: 'separator' },
      { label: 'I drank water 💧', click: () => this.onShowPopup() },
      { type: 'separator' },
      { label: 'Quit HydroCat', click: () => app.quit() },
    ]);

    if (this.tray && !this.tray.isDestroyed()) {
      this.tray.setContextMenu(menu);
    }
  }
}

module.exports = TrayManager;
