const { nativeImage } = require('electron');

const ANIMATION_CONFIGS = {
  sleeping: {
    frames: ['sleep_1', 'sleep_2', 'sleep_3', 'sleep_4'],
    fps: 1.2,
    loop: true,
  },
  waking: {
    frames: ['wake_1', 'wake_2', 'wake_3', 'wake_4'],
    fps: 2,
    loop: false,
  },
  idle: {
    frames: ['idle_1', 'idle_2', 'idle_3', 'idle_4'],
    fps: 3,
    loop: true,
  },
  bouncing: {
    frames: ['bounce_1', 'bounce_2', 'bounce_3', 'bounce_4'],
    fps: 6,
    loop: true,
  },
  happy: {
    frames: ['happy_1', 'happy_2', 'happy_3', 'happy_4'],
    fps: 8,
    loop: false,
  },
  celebrating: {
    frames: ['celebrate_1', 'celebrate_2', 'celebrate_3', 'celebrate_4'],
    fps: 6,
    loop: false,
  },
  sad: {
    frames: ['sad_1', 'sad_2', 'sad_3'],
    fps: 2,
    loop: false,
  },
};

class DockAnimator {
  constructor(app) {
    this.app = app;
    this.frames = {};
    this.currentState = 'sleeping';
    this.currentFrameIdx = 0;
    this.timer = null;
    this.onStateEndCallback = null;
    this.ready = false;
  }

  loadFrames(framesMap) {
    this.frames = framesMap;
    this.ready = true;
    this._startAnimation();
  }

  setState(state, onEnd = null) {
    if (!ANIMATION_CONFIGS[state]) return;
    this.currentState = state;
    this.currentFrameIdx = 0;
    this.onStateEndCallback = onEnd;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this._startAnimation();
  }

  _startAnimation() {
    if (!this.ready) return;
    const config = ANIMATION_CONFIGS[this.currentState];
    const interval = 1000 / config.fps;

    this._renderFrame();

    this.timer = setInterval(() => {
      this.currentFrameIdx++;

      if (this.currentFrameIdx >= config.frames.length) {
        if (config.loop) {
          this.currentFrameIdx = 0;
        } else {
          this.currentFrameIdx = config.frames.length - 1;
          clearInterval(this.timer);
          this.timer = null;
          if (this.onStateEndCallback) {
            const cb = this.onStateEndCallback;
            this.onStateEndCallback = null;
            cb();
          }
          return;
        }
      }

      this._renderFrame();
    }, interval);
  }

  _renderFrame() {
    const config = ANIMATION_CONFIGS[this.currentState];
    const frameName = config.frames[this.currentFrameIdx];
    const dataUrl = this.frames[frameName];

    if (!dataUrl) return;

    try {
      const img = nativeImage.createFromDataURL(dataUrl);
      if (!img.isEmpty()) {
        this.app.dock.setIcon(img);
      }
    } catch (e) {
      console.error('DockAnimator: failed to set icon', e);
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  transitionTo(state, then = null) {
    this.setState(state, then);
  }

  playOnceAndReturn(state, returnState = 'idle') {
    this.setState(state, () => {
      this.setState(returnState);
    });
  }
}

module.exports = DockAnimator;
