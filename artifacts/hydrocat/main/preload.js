const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hydrocat', {
  drankWater: () => ipcRenderer.invoke('drank-water'),
  remindLater: () => ipcRenderer.invoke('remind-later'),
  closePopup: () => ipcRenderer.invoke('close-popup'),
  getStreak: () => ipcRenderer.invoke('get-streak'),
  onAnimationState: (cb) => {
    ipcRenderer.on('animation-state', (_e, state) => cb(state));
  },
  onSpritesReady: (cb) => {
    ipcRenderer.on('sprites-ready', (_e) => cb());
  },
  sendSprites: (frames) => ipcRenderer.send('sprites-generated', frames),
  requestSpriteGeneration: () => ipcRenderer.invoke('need-sprites'),
});
