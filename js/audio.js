// Audio — music beds from assets/music/, SFX synthesized live with WebAudio
// (the §10 "synth SFX" direction: no binary SFX assets, silent fallbacks per
// BUILD_HANDOFF). Autoplay policy: music requested before the first user
// gesture is held pending and started on the first pointer/key event.

const MUTE_KEY = 'liquidchrome_mute';

class AudioManager {
  constructor() {
    this.muted = localStorage.getItem(MUTE_KEY) === '1';
    this.music = null;
    this.track = null;
    this.ctx = null;
    this.pending = null;

    const unlock = () => {
      // fully inert while muted: no AudioContext, no media elements
      if (this.muted) return;
      this.ensureCtx();
      if (this.pending) this.playMusic(this.pending.src, this.pending.vol);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  ensureCtx() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* silent */ }
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    if (this.music) this.music.muted = muted;
    if (!muted && !this.music && this.pending) {
      this.playMusic(this.pending.src, this.pending.vol);
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  playMusic(src, vol = 0.3) {
    // muted: don't even create the media element — remember what to resume
    if (this.muted) {
      this.pending = { src, vol };
      this.track = src;
      if (this.music) { this.music.pause(); this.music = null; }
      return;
    }
    if (this.track === src && this.music && !this.music.paused) return;
    this.track = src;
    if (this.music) { this.music.pause(); this.music = null; }
    const a = new Audio(src);
    a.loop = true;
    a.volume = vol;
    a.muted = this.muted;
    a.play().then(() => { this.pending = null; }).catch(() => { this.pending = { src, vol }; });
    this.music = a;
  }

  tone({ freq = 880, end = freq, dur = 0.08, type = 'sine', gain = 0.05, when = 0 }) {
    if (this.muted) return;
    this.ensureCtx();
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(end, 1), t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  sfx(name) {
    switch (name) {
      case 'move':
        this.tone({ freq: 660, end: 440, dur: 0.07, gain: 0.03 });
        break;
      case 'interact':
        this.tone({ freq: 980, end: 1240, dur: 0.06, type: 'triangle', gain: 0.045 });
        this.tone({ freq: 1240, end: 1560, dur: 0.05, type: 'triangle', gain: 0.035, when: 0.07 });
        break;
      case 'beep': // the console beep — it never beeps
        this.tone({ freq: 1046, dur: 0.09, type: 'square', gain: 0.045 });
        this.tone({ freq: 1046, dur: 0.13, type: 'square', gain: 0.045, when: 0.18 });
        break;
      case 'key':
        this.tone({ freq: 1700 + Math.random() * 1000, dur: 0.015, type: 'square', gain: 0.012 });
        break;
      case 'open':
        this.tone({ freq: 520, end: 880, dur: 0.1, gain: 0.035 });
        break;
      case 'close':
        this.tone({ freq: 880, end: 440, dur: 0.1, gain: 0.035 });
        break;
      case 'save':
        this.tone({ freq: 880, dur: 0.07, gain: 0.04 });
        this.tone({ freq: 1320, dur: 0.1, gain: 0.04, when: 0.09 });
        break;
      default:
        break;
    }
  }
}

export const audio = new AudioManager();
