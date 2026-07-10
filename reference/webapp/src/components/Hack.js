import { html, useState } from '../ui.js';

// Hacking — crack the cipher. Deduce the hidden glyph sequence: each guess
// reads back how many glyphs are exact (right glyph, right slot) and how many
// are present (right glyph, wrong slot). Tech buys you more attempts against a
// shorter cipher; the ice grade lengthens the code and the glyph set, and takes
// attempts away. Pure deduction — no clock.
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const GLYPHS = [
  { ch: '◈', c: '#38bdf8' }, { ch: '▲', c: '#2dd4bf' }, { ch: '●', c: '#a78bfa' },
  { ch: '✦', c: '#f59e0b' }, { ch: '⬡', c: '#f43f5e' }, { ch: '◆', c: '#84cc16' },
  { ch: '✕', c: '#cbd5e1' },
];

function score(guess, secret) {
  let exact = 0;
  const rs = {}, rg = {};
  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) exact++;
    else { rs[secret[i]] = (rs[secret[i]] || 0) + 1; rg[guess[i]] = (rg[guess[i]] || 0) + 1; }
  }
  let present = 0;
  for (const g in rg) present += Math.min(rg[g], rs[g] || 0);
  return { exact, present };
}

export function Hack({ level = 1, stats = {}, onResolve }) {
  const lvl = clamp(level, 0, 4);
  const tech = stats.tech || 5;
  const codeLen = clamp(3 + Math.floor(lvl / 2), 3, 5);
  const paletteN = clamp(4 + lvl, 4, GLYPHS.length);
  const guessesMax = clamp(6 + Math.floor(tech / 3) - lvl, 4, 9);

  const [secret] = useState(() => Array.from({ length: codeLen }, () => Math.floor(Math.random() * paletteN)));
  const [guess, setGuess] = useState([]);
  const [rows, setRows] = useState([]);          // [{ guess, exact, present }]
  const [status, setStatus] = useState('play');  // 'play' | 'won' | 'lost'

  function done(win) {
    setStatus(win ? 'won' : 'lost');
    if (onResolve) setTimeout(() => onResolve(win), win ? 620 : 760);
  }
  function tap(g) { if (status === 'play' && guess.length < codeLen) setGuess([...guess, g]); }
  function back() { if (status === 'play') setGuess(guess.slice(0, -1)); }
  function submit() {
    if (status !== 'play' || guess.length !== codeLen) return;
    const sc = score(guess, secret);
    const nrows = [...rows, { guess, exact: sc.exact, present: sc.present }];
    setRows(nrows); setGuess([]);
    if (sc.exact === codeLen) done(true);
    else if (nrows.length >= guessesMax) done(false);
  }

  const glyph = (g, extra) => html`<span class=${'hx-glyph' + (extra || '')} style=${{ color: GLYPHS[g].c }}>${GLYPHS[g].ch}</span>`;

  return html`
    <div class="pz">
      <div class="pz-head">
        <span class="pz-title">Ice — cipher lock</span>
        <span class="pz-meta">tries <b class="teal">${guessesMax - rows.length}</b></span>
      </div>

      <div class="hx-log">
        ${rows.map((r, i) => html`
          <div class="hx-row" key=${i}>
            <span class="hx-seq">${r.guess.map((g, j) => html`<span key=${j}>${glyph(g)}</span>`)}</span>
            <span class="hx-fb">
              ${Array.from({ length: r.exact }, (_, k) => html`<i key=${'e' + k} class="hx-peg exact"></i>`)}
              ${Array.from({ length: r.present }, (_, k) => html`<i key=${'p' + k} class="hx-peg present"></i>`)}
              ${Array.from({ length: secret.length - r.exact - r.present }, (_, k) => html`<i key=${'n' + k} class="hx-peg"></i>`)}
            </span>
          </div>`)}
        ${status === 'lost' ? html`
          <div class="hx-row reveal">
            <span class="hx-seq">${secret.map((g, j) => html`<span key=${j}>${glyph(g)}</span>`)}</span>
            <span class="hx-fb rose">the cipher</span>
          </div>` : null}
      </div>

      ${status === 'play' ? html`
        <div class="hx-current">
          ${Array.from({ length: codeLen }, (_, i) => html`<span key=${i}
            class=${'hx-slot' + (i === guess.length ? ' active' : '')}>
            ${guess[i] != null ? glyph(guess[i]) : ''}</span>`)}
        </div>
        <div class="hx-pads">
          ${GLYPHS.slice(0, paletteN).map((gl, g) => html`<button key=${g} class="hx-pad"
            style=${{ color: gl.c, borderColor: gl.c }} onClick=${() => tap(g)}>${gl.ch}</button>`)}
        </div>
        <div class="pz-foot">
          <button class="btn btn-ghost pz-act" disabled=${guess.length === 0} onClick=${back}>⌫</button>
          <button class="btn btn-primary pz-act" disabled=${guess.length !== codeLen} onClick=${submit}>Breach ▸</button>
        </div>`
        : html`<div class="pz-foot"><span class="pz-hint dim">◆ exact · ◇ present</span>
          <span class=${'pz-result ' + (status === 'won' ? 'teal' : 'rose')}>
            ${status === 'won' ? 'Ice cracked' : 'Locked out'}</span></div>`}
    </div>`;
}
