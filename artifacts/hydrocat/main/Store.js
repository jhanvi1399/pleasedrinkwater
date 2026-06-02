const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class Store {
  constructor() {
    this.dataPath = path.join(app.getPath('userData'), 'hydrocat-settings.json');
    this.defaults = {
      intervalMinutes: 60,
      isPaused: false,
      streak: 0,
      lastDrank: null,
    };
    this._data = null;
  }

  _load() {
    if (this._data) return;
    try {
      const raw = fs.readFileSync(this.dataPath, 'utf8');
      this._data = { ...this.defaults, ...JSON.parse(raw) };
    } catch {
      this._data = { ...this.defaults };
    }
  }

  _save() {
    try {
      fs.mkdirSync(path.dirname(this.dataPath), { recursive: true });
      fs.writeFileSync(this.dataPath, JSON.stringify(this._data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }

  get(key) {
    this._load();
    return this._data[key];
  }

  set(key, value) {
    this._load();
    this._data[key] = value;
    this._save();
  }

  getAll() {
    this._load();
    return { ...this._data };
  }
}

module.exports = new Store();
