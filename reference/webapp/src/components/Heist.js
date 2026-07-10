import { html, useState, useRef } from '../ui.js';
import { Hud } from './Hud.js';
import { layHeist, randInt, clamp } from '../engine.js';
import { combatAbilitiesOf } from '../world.js';
import { Combat } from './Combat.js';
import { Hack } from './Hack.js';
import { LockPick } from './LockPick.js';

// The heist — a short choose-your-own-adventure. Pick an approach that suits
// your talents, then work a string of encounters: slip past, crack, pick, or
// fight your way through. Dice checks are stat-weighted; locks and ice are the
// mini-games; a fight is the combat system. Heat rises when you scrape through
// hot; max it (or lose a fight) and the run is blown. Reach the objective clean
// and you pull the score. Feeds the same RUN_RESOLVE the lattice used to.
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const APPROACHES = [
  { id: 'stealth', label: 'Ghost', note: 'In and out unseen. Favours Speed + Stealth.', favors: ['sneak', 'vault'] },
  { id: 'force', label: 'Hard entry', note: 'Through the front, guns up. Favours Strength + Marksmanship.', favors: ['fight', 'force', 'grab'] },
  { id: 'wire', label: 'Wire job', note: 'Own the building from inside its net. Favours Tech.', favors: ['hack', 'bypass'] },
];

export function optionsFor(kind) {
  switch (kind) {
    case 'guard': return [
      { tag: 'sneak', label: 'Slip past them', mode: 'dice', stats: ['speed', 'stealth'] },
      { tag: 'fight', label: 'Take them down', mode: 'combat' }];
    case 'door': return [
      { tag: 'pick', label: 'Pick the lock', mode: 'lock' },
      { tag: 'force', label: 'Force it open', mode: 'dice', stats: ['strength'] }];
    case 'terminal': return [
      { tag: 'hack', label: 'Crack the ice', mode: 'hack' },
      { tag: 'bypass', label: 'Bypass the node', mode: 'dice', stats: ['tech'] }];
    case 'patrol': return [
      { tag: 'sneak', label: 'Ghost the patrol', mode: 'dice', stats: ['speed', 'stealth'] },
      { tag: 'fight', label: 'Ambush them', mode: 'combat' }];
    case 'gap': return [
      { tag: 'vault', label: 'Make the jump', mode: 'dice', stats: ['speed'] },
      { tag: 'bypass', label: 'Find a wired way round', mode: 'dice', stats: ['tech'] }];
    case 'objective': return [
      { tag: 'hack', label: 'Jack the core', mode: 'hack' },
      { tag: 'grab', label: 'Grab it and run', mode: 'dice', stats: ['speed', 'strength'] }];
    default: return [];
  }
}

export function beatLine(b) {
  switch (b.kind) {
    case 'guard': return `${cap(b.place)} — ${b.foe} posted dead in the way, bored and armed and going nowhere.`;
    case 'door': return `${cap(b.place)} — a sealed bulkhead between you and the next floor, its lock breathing a slow red pulse.`;
    case 'terminal': return `${cap(b.place)} — one node runs the door controls, humming to itself in the dark. Own it or slip past it.`;
    case 'patrol': return `${cap(b.place)} — a patrol sweeps the floor, boots and torchlight. ${cap(b.foe)}, on the move.`;
    case 'gap': return `${cap(b.place)} — the floor is torn open ahead, a long black drop where the structure gave. Only speed or wit gets you over.`;
    case 'objective': return `${cap(b.place)}. This is what you came for. Take it and be gone before the room notices.`;
    default: return cap(b.place);
  }
}

export function Heist({ state, dispatch }) {
  const stats = state.stats || {};
  const [plan] = useState(() => layHeist(state.run || { grade: 'grey' }));
  const [approach, setApproach] = useState(null);
  const [idx, setIdx] = useState(0);
  const [heat, setHeat] = useState(0);
  const [gained, setGained] = useState(0);
  const [fails, setFails] = useState(0);
  const [view, setView] = useState('approach');   // approach | beat | sub | resolved
  const [sub, setSub] = useState(null);            // { mode, level, opt }
  const [res, setRes] = useState(null);            // resolved outcome
  const doneRef = useRef(false);

  const beat = plan.beats[idx];
  const appr = APPROACHES.find(a => a.id === approach);
  const favored = (tag) => !!(appr && appr.favors.includes(tag));
  const stepN = idx + 1, stepT = plan.beats.length;

  function pick(opt) {
    if (opt.mode === 'dice') {
      const roll = randInt(1, 20);
      const mod = Math.round(opt.stats.reduce((a, k) => a + (stats[k] || 5), 0) / opt.stats.length);
      const bonus = favored(opt.tag) ? 4 : 0;
      const total = roll + mod + bonus, threshold = 10 + beat.level * 3;
      resolve(total >= threshold, opt, `d20 ${roll} + ${mod}${bonus ? ` +${bonus}` : ''} = ${total} vs ${threshold}`);
    } else {
      setSub({ mode: opt.mode, level: clamp(beat.level - (favored(opt.tag) ? 1 : 0), 0, 4), opt });
      setView('sub');
    }
  }

  function resolve(success, opt, detail) {
    let heatUp = 0, lootUp = 0, combatLoss = false;
    if (success) lootUp = beat.loot || 0;
    else if (opt.mode === 'combat') { combatLoss = true; heatUp = 100; }
    else heatUp = 20 + beat.level * 4;
    const heatAfter = Math.min(100, heat + heatUp);
    const gainAfter = gained + lootUp;
    if (!success) setFails(f => f + 1);
    setHeat(heatAfter); setGained(gainAfter);
    setRes({ success, opt, detail, heatUp, lootUp, combatLoss, heatAfter, gainAfter, kind: beat.kind });
    setView('resolved');
  }

  function cont() {
    const caught = res.combatLoss || res.heatAfter >= 100;
    if (caught) return finish(true, res.gainAfter);
    if (idx >= plan.beats.length - 1) return finish(false, res.gainAfter);
    setIdx(i => i + 1); setRes(null); setSub(null); setView('beat');
  }

  function finish(caught, gain) {
    if (doneRef.current) return; doneRef.current = true;
    dispatch({ type: 'RUN_RESOLVE', caught, gained: gain, traceAtPull: Math.min(99, Math.round(heat)), forced: fails });
  }

  const combatStyle = (stats.marksmanship || 5) >= (stats.strength || 5) ? 'gun' : 'blade';
  const meter = html`
    <div class="heist-bar">
      <span class="dim">step ${stepN}/${stepT}</span>
      <span class="heist-heat"><span class=${'heat-fill' + (heat >= 70 ? ' hot' : '')} style=${{ width: heat + '%' }}></span></span>
      <span class="dim">${heat < 70 ? 'heat' : 'HEAT'} ${Math.round(heat)}</span>
      ${gained ? html`<span class="teal">${gained} credits</span>` : null}
    </div>`;

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />

      ${view === 'approach' ? html`
        <div class="kicker">The way in</div>
        <div class="panel"><div class="prose"><p class="dim">You have the layout and the shape of the job.
          How you take it is yours to call — play to what you're good at.</p></div></div>
        ${APPROACHES.map(a => html`
          <div class="card" key=${a.id} onClick=${() => { setApproach(a.id); setView('beat'); }}>
            <div class="row"><div class="name">${a.label}</div></div>
            <div class="line">${a.note}</div>
          </div>`)}`
      : null}

      ${view === 'beat' ? html`
        ${meter}
        <div class="panel"><div class="prose"><p>${beatLine(beat)}</p></div></div>
        ${optionsFor(beat.kind).map(opt => html`
          <button class=${'btn' + (favored(opt.tag) ? ' btn-primary' : '')} key=${opt.tag + opt.label}
            onClick=${() => pick(opt)}>
            ${opt.label}${favored(opt.tag) ? ' ◂ your play' : ''}</button>`)}`
      : null}

      ${view === 'sub' ? html`
        ${meter}
        <div class="panel"><div class="prose"><p class="dim">${beatLine(beat)}</p></div></div>
        <div class="panel pz-wrap">
          ${sub.mode === 'combat' ? html`<${Combat} level=${sub.level} stats=${stats} style=${combatStyle}
            enemyName=${beat.foe} abilities=${combatAbilitiesOf(state.abilities)} chrome=${state.nerve}
            onResolve=${(w, spent) => { if (spent) dispatch({ type: 'SPEND_CHROME', n: spent }); resolve(w, sub.opt, null); }} />` : null}
          ${sub.mode === 'hack' ? html`<${Hack} level=${sub.level} stats=${stats}
            onResolve=${(w) => resolve(w, sub.opt, null)} />` : null}
          ${sub.mode === 'lock' ? html`<${LockPick} level=${sub.level} stats=${stats}
            onResolve=${(w) => resolve(w, sub.opt, null)} />` : null}
        </div>`
      : null}

      ${view === 'resolved' ? html`
        ${meter}
        <div class="panel"><div class="prose">
          <p class=${res.success ? 'teal' : (res.combatLoss ? 'rose' : '')}>${resolveLine(res, beat)}</p>
          ${res.detail ? html`<p class="dim mono-sm">${res.detail}</p>` : null}
          ${res.lootUp ? html`<p class="dim">Loose credits: <span class="teal">${res.lootUp}</span>.</p>` : null}
          ${res.heatUp && !res.combatLoss ? html`<p class="dim rose">Heat +${res.heatUp} — you're hotter now.</p>` : null}
        </div></div>
        ${res.combatLoss || res.heatAfter >= 100
          ? html`<button class="btn btn-danger" onClick=${cont}>They have you — jack out ▸</button>`
          : idx >= plan.beats.length - 1
            ? html`<button class="btn btn-primary" onClick=${cont}>Pull the score ▸</button>`
            : html`<button class="btn btn-primary" onClick=${cont}>Push on ▸</button>`}`
      : null}
    </div>`;
}

export function resolveLine(res, beat) {
  if (res.combatLoss) return `${cap(beat.foe)} puts you on the floor, and the alarm goes wide and screaming.`;
  if (res.success) {
    switch (res.opt.tag) {
      case 'sneak': case 'vault': return 'You flow through the dark, breath held, and the room never once knows you passed through it.';
      case 'fight': return `${cap(beat.foe)} folds without a sound, and you step over the body while it is still settling.`;
      case 'pick': return 'The lock gives with a soft click under your fingers. You are through before it finishes falling open.';
      case 'force': return 'It gives with a crack of steel that rings the length of the corridor — loud, but open.';
      case 'hack': case 'bypass': return 'The ICE buckles under you, layer after layer, and the door sighs open with it.';
      case 'grab': return 'You palm it clean and you are already three steps gone.';
      default: return 'Clean and quiet. On to the next.';
    }
  }
  return 'You get through — but loud, and something back there has your scent now.';
}
