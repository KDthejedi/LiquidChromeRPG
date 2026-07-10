import { html, useState } from '../ui.js';
import { Hud } from './Hud.js';
import { CITIES, cityOf, vehicleOf, RUNS, mapSrc } from '../world.js';
import { legDays } from '../state.js';
import { cityDistance } from '../engine.js';

// Net-links: each city wired to its two nearest neighbours, deduped. Decorative —
// travel is open transit, you can jump to any node — but it draws the sprawl.
const LINKS = (() => {
  const out = [];
  CITIES.forEach((a, i) => {
    CITIES.filter((_, j) => j !== i)
      .map(b => ({ b, d: cityDistance(a, b) }))
      .sort((x, y) => x.d - y.d).slice(0, 2)
      .forEach(({ b }) => {
        const key = [a.id, b.id].sort().join('-');
        if (!out.some(l => l.key === key)) out.push({ key, a, b });
      });
  });
  return out;
})();

// Each bloc gets a signal colour so the sprawl reads as contested territory.
const BLOC_COLOR = {
  'Japanese technology houses':            '#38bdf8',
  'South China Sea consortia':             '#f43f5e',
  'Korean arcology consortium':            '#22d3ee',
  'South Asian port authority':            '#f59e0b',
  'Russian cyber-intelligence':            '#a78bfa',
  'North African finance houses':          '#eab308',
  'Caribbean holding companies':           '#2dd4bf',
  'South American resource corps':         '#84cc16',
  'African intelligence & resource corps': '#fb7185',
  'American defense':                      '#60a5fa',
};

// Story job status for a district, read off the debt run graph + what's done.
// null → fixer money only. 'open' → the next thread waits here. 'locked' →
// there's a thread, but clear this district's fixer work (and the arc) first.
function storyStatus(state, id) {
  const k = RUNS.find(r => r.city === id && r.type === 'kiros');
  if (!k) return null;
  const done = new Set(state.runsDone || []);
  if (done.has(k.id)) return 'done';
  const fixersCleared = RUNS.filter(r => r.city === id && r.type === 'fixer').every(r => done.has(r.id));
  const arcReady = !k.requires || done.has(k.requires);
  return fixersCleared && arcReady ? 'open' : 'locked';
}

// Deterministic sprawl backdrop — seeded once at load so it never re-rolls on
// a re-render. Faint district blocks + a couple of glowing arteries.
function mulberry32(a) {
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const BLOCKS = (() => {
  const r = mulberry32(0x1c40);
  return Array.from({ length: 22 }, () => {
    const w = 5 + r() * 10, h = 5 + r() * 10;
    return { x: r() * 96, y: r() * 96, w, h, o: 0.05 + r() * 0.06 };
  });
})();
const ARTERIES = [
  'M -2 62 Q 30 46 52 54 T 104 40',
  'M 10 -2 Q 26 34 50 44 T 74 102',
  'M 102 78 Q 70 70 46 60 T -2 30',
];

export function Map({ state, dispatch }) {
  const here = cityOf(state.cityId);
  const v = vehicleOf(state.vehicleId);
  const [selId, setSel] = useState(null);
  const sel = selId && selId !== state.cityId ? cityOf(selId) : null;
  const selDays = sel ? legDays(state, sel.id) : 0;
  const selStory = sel ? storyStatus(state, sel.id) : null;
  const mapArt = mapSrc(state.artSeed);

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />
      <div class="row">
        <div class="kicker">The sprawl · open transit</div>
        <div class="dim">${v.name}${state.speedMods ? ` +${state.speedMods}` : ''}</div>
      </div>

      <div class=${'citymap' + (mapArt ? ' has-photo' : '')}>
        ${mapArt
          ? html`<div class="citymap-photo" aria-hidden="true" style=${{ backgroundImage: `url(${mapArt})` }}></div>`
          : html`
            <div class="citymap-art" aria-hidden="true"></div>
            <svg class="citymap-blocks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${BLOCKS.map((b, i) => html`<rect key=${i} x=${b.x} y=${b.y} width=${b.w} height=${b.h}
                rx="1.5" fill=${`rgba(120,170,210,${b.o})`} />`)}
            </svg>
            <svg class="citymap-grid" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${gridLines()}
            </svg>
            <svg class="citymap-arteries" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${ARTERIES.map((d, i) => html`<path key=${i} d=${d} fill="none" />`)}
            </svg>`}
        <svg class="citymap-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${LINKS.map(l => html`<line key=${l.key}
            x1=${l.a.x} y1=${l.a.y} x2=${l.b.x} y2=${l.b.y} />`)}
        </svg>
        ${sel ? html`
          <svg class="citymap-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1=${here.x} y1=${here.y} x2=${sel.x} y2=${sel.y} />
          </svg>` : null}
        ${CITIES.map(cy => {
          const isHere = cy.id === state.cityId;
          const isSel = sel && cy.id === sel.id;
          const st = storyStatus(state, cy.id);
          const days = isHere ? 0 : legDays(state, cy.id);
          const cls = ['map-city', isHere ? 'here' : 'go'];
          if (isSel) cls.push('sel');
          if (cy.home) cls.push('home');
          if (st) cls.push('story', 'story-' + st);
          return html`
            <button key=${cy.id} class=${cls.join(' ')}
              style=${{ left: cy.x + '%', top: cy.y + '%', '--hue': BLOC_COLOR[cy.bloc] || '#a78bfa' }}
              onClick=${() => setSel(isHere ? null : cy.id)}>
              <span class="map-pin">
                <span class="map-dot"></span>
                ${st === 'open' ? html`<span class="map-badge">◆</span>` : null}
                ${st === 'done' ? html`<span class="map-badge done">✓</span>` : null}
              </span>
              <span class="map-label">${cy.name}</span>
              <span class="map-sub">${isHere ? 'you are here' : days + (days === 1 ? ' day' : ' days')}</span>
            </button>`;
        })}
        <div class="citymap-scan" aria-hidden="true"></div>
      </div>

      <div class="map-legend">
        <span><i class="lg lg-here"></i>you are here</span>
        <span><i class="lg lg-bloc"></i>colour = bloc</span>
        <span><b class="lg-gly open">◆</b>story job</span>
        <span><b class="lg-gly done">✓</b>cleared</span>
      </div>

      <div class="panel"><div class="prose">
        ${sel ? html`
          <p class="dim"><b class="teal">${sel.name}.</b> ${sel.blurb}</p>
          <p class="dim">Answers to ${sel.bloc}. ${storyLine(selStory)}</p>
          <button class="btn btn-primary"
            onClick=${() => dispatch({ type: 'TRAVEL', cityId: sel.id })}>
            Travel — ${selDays} ${selDays === 1 ? 'day' : 'days'} ▸</button>
          <button class="btn btn-ghost" onClick=${() => setSel(null)}>Cancel</button>`
        : html`
          <p class="dim"><b>${here.name}.</b> ${here.blurb}</p>
          <p class="dim">Tap a district to plot a route. The run of it costs time — ${state.speedMods || v.days < 4 ? 'your ride buys some back' : 'a faster ride would buy some back'}.</p>
          <button class="btn btn-ghost" onClick=${() => dispatch({ type: 'GO', screen: 'contacts' })}>Back to the board</button>`}
      </div></div>
    </div>`;
}

function storyLine(st) {
  if (st === 'open') return 'A thread of the debt waits here.';
  if (st === 'locked') return 'A thread waits — clear the local fixer work first.';
  if (st === 'done') return 'That thread is closed.';
  return 'Fixer money and roaming.';
}

function gridLines() {
  const lines = [];
  for (let i = 1; i < 10; i++) {
    lines.push(html`<line key=${'v' + i} x1=${i * 10} y1="0" x2=${i * 10} y2="100" />`);
    lines.push(html`<line key=${'h' + i} x1="0" y1=${i * 10} x2="100" y2=${i * 10} />`);
  }
  return lines;
}
