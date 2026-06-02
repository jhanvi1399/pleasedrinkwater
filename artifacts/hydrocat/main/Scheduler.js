const { Notification } = require('electron');

class Scheduler {
  constructor(store) {
    this.store = store;
    this.timer = null;
    this.nextReminderAt = null;
    this.onReminder = null;
    this.tickTimer = null;
  }

  start(onReminder) {
    this.onReminder = onReminder;
    if (!this.store.get('isPaused')) {
      this._scheduleNext();
    }
    this._startTick();
  }

  _scheduleNext(delayMinutes = null) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const minutes = delayMinutes !== null
      ? delayMinutes
      : this.store.get('intervalMinutes');

    const ms = minutes * 60 * 1000;
    this.nextReminderAt = Date.now() + ms;

    this.timer = setTimeout(() => {
      this._fireReminder();
    }, ms);
  }

  _fireReminder() {
    this.nextReminderAt = null;

    const notification = new Notification({
      title: 'HydroCat 🐱',
      body: 'Hey human, time to drink water 💧',
      silent: false,
    });

    notification.on('click', () => {
      if (this.onReminder) this.onReminder('notification-click');
    });

    notification.show();

    if (this.onReminder) this.onReminder('reminder');

    // Always re-arm the next interval after firing, even if the user ignores
    // the notification. "I drank water" and "Remind me later" will reset/
    // override this timer via resetAfterDrink() and remindLater().
    if (!this.store.get('isPaused')) {
      this._scheduleNext();
    }
  }

  remindLater(minutes = 15) {
    this._scheduleNext(minutes);
  }

  resetAfterDrink() {
    this._scheduleNext();
  }

  pause() {
    this.store.set('isPaused', true);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.nextReminderAt = null;
  }

  resume() {
    this.store.set('isPaused', false);
    this._scheduleNext();
  }

  setInterval(minutes) {
    this.store.set('intervalMinutes', minutes);
    if (!this.store.get('isPaused')) {
      this._scheduleNext(minutes);
    }
  }

  isPaused() {
    return this.store.get('isPaused');
  }

  getTimeRemaining() {
    if (!this.nextReminderAt || this.store.get('isPaused')) return null;
    const ms = this.nextReminderAt - Date.now();
    if (ms <= 0) return null;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds, totalSeconds };
  }

  _startTick() {
    this.tickTimer = setInterval(() => {
      if (this.onReminder) this.onReminder('tick');
    }, 30000);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.timer = null;
    this.tickTimer = null;
  }
}

module.exports = Scheduler;
