import { html, useState, useRef, useEffect } from '../ui.js';

// Lock-picking — a timing game. A pick sweeps the barrel; tap SET when it's
// inside the shear line to set a pin. Miss and the tension bar slips (a strike).
// Set every pin before the strikes run out. Your hand is steadier — wider shear
// line, slower sweep — with Speed + Stealth; the lock's grade fights all of it.
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const randZone = (w) => { const lo = 6 + Math.random() * (88 - w); return { lo, hi: lo + w }; };

export function LockPick({ level = 1, stats = {}, onResolve }) {
  const lvl = clamp(level, 0, 4);
  const finesse = (stats.speed || 5) + (stats.stealth || 5);       // helping force
  const pinsCount = 3 + lvl;
  const zoneW = clamp(30 - lvl * 5 + (finesse - 10) * 1.4, 9, 42); // shear-line width %
  const sweep = clamp(44 + lvl * 20 - (finesse - 10) * 3.2, 26, 150); // % per second
  const strikesMax = 3 + ((stats.stealth || 5) >= 8 ? 1 : 0);

  const [pin, setPin] = useState(0);
  const [zone, setZone] = useState(() => randZone(zoneW));
  const [strikes, setStrikes] = useState(0);
  const [status, setStatus] = useState('play');   // 'play' | 'won' | 'lost'
  const [flash, setFlash] = useState('');
  const [pos, setPos] = useState(6);
  const posRef = useRef(6), dirRef = useRef(1), doneRef = useRef(false);

  useEffect(() => {
    if (status !== 'play') return undefined;
    let raf = 0, last = 0;
    const tick = (ts) => {
      if (!last) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      let p = posRef.current + dirRef.current * sweep * dt;
      if (p >= 96) { p = 96; dirRef.current = -1; }
      if (p <= 4) { p = 4; dirRef.current = 1; }
      posRef.current = p; setPos(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, sweep]);

  function resolve(win) {
    if (doneRef.current) return;
    doneRef.current = true;
    setStatus(win ? 'won' : 'lost');
    if (onResolve) setTimeout(() => onResolve(win), win ? 520 : 640);
  }

  function attempt() {
    if (status !== 'play') return;
    const p = posRef.current;
    if (p >= zone.lo && p <= zone.hi) {
      setFlash('hit'); setTimeout(() => setFlash(''), 160);
      const next = pin + 1;
      if (next >= pinsCount) { resolve(true); return; }
      setPin(next); setZone(randZone(zoneW));
    } else {
      setFlash('miss'); setTimeout(() => setFlash(''), 160);
      const st = strikes + 1; setStrikes(st);
      if (st >= strikesMax) resolve(false);
    }
  }

  return html`
    <div class="pz">
      <div class="pz-head">
        <span class="pz-title">Lock — tension &amp; pins</span>
        <span class="pz-meta">pins <b class="teal">${pin}/${pinsCount}</b></span>
      </div>
      <div class="pz-pins">
        ${Array.from({ length: pinsCount }, (_, i) => html`<span key=${i}
          class=${'pz-pin' + (i < pin ? ' set' : i === pin ? ' now' : '')}></span>`)}
      </div>

      <div class=${'lock-track' + (flash ? ' ' + flash : '')} onClick=${attempt} role="button" aria-label="Set pin">
        <span class="lock-zone" style=${{ left: zone.lo + '%', width: (zone.hi - zone.lo) + '%' }}></span>
        <span class="lock-pick" style=${{ left: pos + '%' }}></span>
      </div>

      <div class="pz-foot">
        <span class="pz-strikes">tension
          ${Array.from({ length: strikesMax }, (_, i) => html`<i key=${i}
            class=${'pz-strike' + (i < strikes ? ' spent' : '')}></i>`)}
        </span>
        ${status === 'play'
          ? html`<button class="btn btn-primary pz-act" onClick=${attempt}>Set ▸</button>`
          : html`<span class=${'pz-result ' + (status === 'won' ? 'teal' : 'rose')}>
              ${status === 'won' ? 'Lock open' : 'The pick snaps'}</span>`}
      </div>
    </div>`;
}
