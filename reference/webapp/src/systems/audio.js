// CHRONICLES · CHROME — synthesised sfx. No files: everything is a few
// oscillators through a gain envelope. Safe to call before any user gesture
// (it just no-ops until the context is allowed to start).

let ac = null;
let muted = false;

function ctx() {
  if (ac) return ac;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ac = AC ? new AC() : null;
  } catch { ac = null; }
  return ac;
}

function blip({ type = 'sine', from, to = from, dur = 0.12, gain = 0.14, delay = 0 }) {
  const c = ctx();
  if (!c || muted) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const VOICES = {
  move:     () => blip({ type: 'triangle', from: 520, to: 640, dur: 0.06, gain: 0.06 }),
  jack:     () => { blip({ type: 'sawtooth', from: 80, to: 420, dur: 0.35, gain: 0.10 }); },
  buy:      () => { blip({ type: 'square', from: 660, to: 990, dur: 0.10, gain: 0.08 }); },
  pull:     () => { blip({ type: 'sine', from: 440, to: 880, dur: 0.18, gain: 0.12 });
                    blip({ type: 'sine', from: 660, to: 1320, dur: 0.22, gain: 0.10, delay: 0.08 }); },
  cut:      () => blip({ type: 'sawtooth', from: 900, to: 200, dur: 0.10, gain: 0.10 }),
  caught:   () => blip({ type: 'square', from: 300, to: 90, dur: 0.30, gain: 0.12 }),
  flatline: () => { blip({ type: 'sine', from: 220, to: 220, dur: 1.2, gain: 0.14 }); },
};

export const sfx = {
  play(name) { const v = VOICES[name]; if (v) v(); },
  setMuted(m) { muted = !!m; music._applyMute(); },
  get muted() { return muted; },
};

// ── music — file-based score. One looping track at a time, keyed by what
// it is ('theme' for the title + character select, 'game' for the overworld
// screens, 'heist' for a run). Each survives moves between screens that share
// its key (same key = no restart); entering a run swaps to a random heist
// track so no two runs sound alike. Honours the same mute toggle as the sfx.
// Browsers gate autoplay until a gesture, so the first tap anywhere unlocks
// whatever should be playing.
const THEME = './assets/music/title.mp3';
const GAME = './assets/music/game.mp3';
const HEIST_TRACKS = [
  './assets/music/heist1.mp3',
  './assets/music/heist2.mp3',
  './assets/music/heist3.mp3',
  './assets/music/heist4.mp3',
];
const VOL = { theme: 0.5, game: 0.45, heist: 0.55 };

let curEl = null;     // the active HTMLAudioElement, or null
let curKey = null;    // 'theme' | 'heist' | null
let lastPick = -1;    // avoid replaying the same heist track back-to-back
let fadeTimer = 0;

function pickHeist() {
  if (HEIST_TRACKS.length < 2) return HEIST_TRACKS[0];
  let i = Math.floor(Math.random() * HEIST_TRACKS.length);
  if (i === lastPick) i = (i + 1) % HEIST_TRACKS.length;  // reshuffle on repeat
  lastPick = i;
  return HEIST_TRACKS[i];
}

function clearFade() { if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = 0; } }

function hardStop() {
  clearFade();
  const el = curEl; curEl = null; curKey = null;
  if (el) { try { el.pause(); el.src = ''; } catch {} }
}

function start(key, src, vol) {
  hardStop();
  try {
    const el = new Audio(src);
    el.loop = true; el._vol = vol;
    el.volume = muted ? 0 : vol;
    el.muted = muted;
    curEl = el; curKey = key;
    if (!muted) el.play().catch(() => {});  // may defer until first gesture
  } catch { curEl = null; curKey = null; }
}

export const music = {
  // Title + character-select bed. No-op if already playing so navigating
  // between those two screens never restarts the track.
  playTheme() { if (curKey === 'theme' && curEl) return; start('theme', THEME, VOL.theme); },

  // The overworld bed — every screen that isn't the title or a heist. No-op
  // if already playing so it carries unbroken across map/clinic/garage/etc.
  playGame() { if (curKey === 'game' && curEl) return; start('game', GAME, VOL.game); },

  // A random heist track for the length of a run.
  playHeist() { start('heist', pickHeist(), VOL.heist); },

  // Fade the current track out and clear it.
  stop() {
    clearFade();
    const el = curEl; curEl = null; curKey = null;
    if (!el) return;
    let v = el.volume;
    fadeTimer = setInterval(() => {
      v -= 0.08;
      if (v <= 0 || el.muted) { clearFade(); try { el.pause(); el.src = ''; } catch {} }
      else el.volume = v;
    }, 40);
  },

  // Retry playback after a user gesture (autoplay unlock).
  resume() { const el = curEl; if (el && !muted) el.play().catch(() => {}); },

  // Called by sfx.setMuted so one button governs both sfx and score.
  _applyMute() {
    const el = curEl;
    if (!el) return;
    el.muted = muted;
    if (muted) el.pause();
    else { el.volume = el._vol || 0.5; el.play().catch(() => {}); }
  },
};
