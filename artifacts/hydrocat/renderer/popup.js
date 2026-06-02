'use strict';

// ─── Sprite animation ─────────────────────────────────────────────────────────
// Frames live in assets/sprites/; relative path from renderer/

const SPRITE_BASE = '../assets/sprites/';

const ANIMATIONS = {
  sleeping:    { frames: ['sleep_1','sleep_2','sleep_3','sleep_4'],               fps: 1.2, loop: true  },
  waking:      { frames: ['wake_1','wake_2','wake_3','wake_4'],                   fps: 2,   loop: false },
  idle:        { frames: ['idle_1','idle_2','idle_3','idle_4'],                   fps: 3,   loop: true  },
  bouncing:    { frames: ['bounce_1','bounce_2','bounce_3','bounce_4'],           fps: 6,   loop: true  },
  happy:       { frames: ['happy_1','happy_2','happy_3','happy_4'],               fps: 8,   loop: false },
  celebrating: { frames: ['celebrate_1','celebrate_2','celebrate_3','celebrate_4'], fps: 6, loop: false },
  sad:         { frames: ['sad_1','sad_2','sad_3'],                               fps: 2,   loop: false },
};

const sprite = document.getElementById('catSprite');
let currentAnim = 'idle';
let frameIdx    = 0;
let animTimer   = null;

function setAnimation(name) {
  if (!ANIMATIONS[name]) return;
  currentAnim = name;
  frameIdx    = 0;
  if (animTimer) { clearInterval(animTimer); animTimer = null; }

  const config = ANIMATIONS[name];
  renderFrame();

  animTimer = setInterval(() => {
    frameIdx++;
    if (frameIdx >= config.frames.length) {
      if (config.loop) {
        frameIdx = 0;
      } else {
        frameIdx = config.frames.length - 1;
        clearInterval(animTimer);
        animTimer = null;
        return;
      }
    }
    renderFrame();
  }, 1000 / config.fps);
}

function renderFrame() {
  const config   = ANIMATIONS[currentAnim];
  const frameName = config.frames[frameIdx];
  sprite.src     = SPRITE_BASE + frameName + '.png';
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#E9A883','#F7A8C2','#D48A6A','#FFD700','#F7C9A5','#FF6B8A'];

function spawnConfetti() {
  const container = document.getElementById('confettiContainer');
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-pixel';
    el.style.left             = (20 + Math.random() * 90) + 'px';
    el.style.top              = (10 + Math.random() * 40) + 'px';
    el.style.background       = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    el.style.animationDuration = (0.6 + Math.random() * 0.8) + 's';
    el.style.animationDelay   = (Math.random() * 0.3) + 's';
    container.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

// ─── IPC events ───────────────────────────────────────────────────────────────

const MESSAGES = {
  sleeping:    'Zzz… sweet dreams…',
  waking:      'Yaaawn… good morning!',
  idle:        "it's itme to sip some water",
  bouncing:    "it's itme to sip some water",
  happy:       'Yay! You drank water! 🎉',
  celebrating: 'Amazing streak! Keep it up! ✨',
  sad:         "Okay… don't forget later! 😿",
  surprised:   'Time to hydrate! 💧',
};

window.hydrocat.onAnimationState((state) => {
  setAnimation(state);
  document.getElementById('message').textContent = MESSAGES[state] || 'Hey there! 👋';
  if (state === 'happy' || state === 'celebrating') {
    setTimeout(spawnConfetti, 100);
  }
});

// ─── Buttons ──────────────────────────────────────────────────────────────────

document.getElementById('drankBtn').addEventListener('click', async () => {
  document.getElementById('drankBtn').disabled  = true;
  document.getElementById('remindBtn').disabled = true;
  const { streak } = await window.hydrocat.drankWater();
  document.getElementById('streakCount').textContent = streak;
  document.getElementById('message').textContent = `Yay! Streak: ${streak} 🎉`;
  setAnimation('happy');
  setTimeout(spawnConfetti, 100);
  setTimeout(spawnConfetti, 500);
});

document.getElementById('remindBtn').addEventListener('click', async () => {
  document.getElementById('drankBtn').disabled  = true;
  document.getElementById('remindBtn').disabled = true;
  await window.hydrocat.remindLater();
  document.getElementById('message').textContent = "Okay, I'll remind you in 15 min 😿";
  setAnimation('sad');
});

document.getElementById('closeBtn').addEventListener('click', async () => {
  await window.hydrocat.closePopup();
});

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  const { streak } = await window.hydrocat.getStreak();
  document.getElementById('streakCount').textContent = streak;
  setAnimation('bouncing');
}

init();
