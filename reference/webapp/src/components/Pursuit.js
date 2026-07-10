import { html, useState, useRef } from '../ui.js';
import { Hud } from './Hud.js';
import { vehicleOf, combatAbilitiesOf } from '../world.js';
import { randInt, clamp } from '../engine.js';
import { Combat } from './Combat.js';
import { cap } from './Heist.js';

// A pursuit — run down a shipment vehicle and take it by any means. Close the
// gap before the runner reaches open road and vanishes. Your ride's speed and
// your stats drive it: floor it (Speed + the car), shoot the tyres
// (Marksmanship), jack their rig (Tech), or ram when you're close. Alongside,
// board it — a fight — or force them off the road.
const CARGO = ['a crate of milspec chrome', 'a cold-case of black-market ware', 'a data mule',
  'a pallet of grey-market implants', 'someone the corp wants back'];

export function Pursuit({ state, dispatch }) {
  const stats = state.stats || {};
  const veh = vehicleOf(state.vehicleId);
  const vSpeed = clamp((5 - veh.days) + (state.speedMods || 0) * 0.5, 0.4, 4); // faster car = bigger number
  const level = (state.run && state.run.grade) === 'black' ? 3 : (state.run && state.run.grade) === 'white' ? 2 : 1;

  const [cargo] = useState(() => CARGO[Math.floor(Math.random() * CARGO.length)]);
  const [gap, setGap] = useState(64);        // 0 = alongside
  const [lead, setLead] = useState(0);       // 100 = they hit open road and vanish
  const [tyre, setTyre] = useState(false);   // tyre shot — they pull away slower
  const [slow, setSlow] = useState(false);   // rig jacked — they gain lead slower
  const [heat, setHeat] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [view, setView] = useState('intro'); // intro | chase | takedown | sub | resolved
  const [res, setRes] = useState(null);
  const [log, setLog] = useState(['The rig bolts. You bury the throttle and go after it.']);
  const doneRef = useRef(false);
  const say = (m) => setLog(l => [m, ...l].slice(0, 4));

  const combatStyle = (stats.marksmanship || 5) >= (stats.strength || 5) ? 'gun' : 'blade';

  function evade(gapNow) {
    // runner pulls away and gains ground toward open road
    const pull = Math.max(2, randInt(6, 14) - Math.round(vSpeed * 2)) * (tyre ? 0.5 : 1);
    const step = Math.max(2, randInt(4, 9)) * (slow ? 0.5 : 1);
    setGap(clamp(gapNow + pull, 0, 100));
    const l = clamp(lead + step, 0, 100);
    setLead(l);
    if (l >= 100) { say('They hit the on-ramp and they are gone.'); return finish(true, 0); }
  }

  function move(kind) {
    if (view !== 'chase') return;
    setRounds(r => r + 1);
    let down = 0;
    if (kind === 'floor') {
      down = randInt(8, 16) + Math.round(vSpeed * 3) + Math.round((stats.speed || 5) * 0.5);
      say(`You floor it — ${down} off the gap.`);
    } else if (kind === 'shoot') {
      if (Math.random() < clamp(0.4 + (stats.marksmanship || 5) * 0.05, 0.3, 0.95)) {
        down = randInt(10, 20) + Math.round((stats.marksmanship || 5) * 0.6); setTyre(true);
        say(`Tyre goes — the rig fishtails. ${down} off the gap.`);
      } else say('You miss the tyres in the chaos.');
    } else if (kind === 'hack') {
      if (Math.random() < clamp(0.4 + (stats.tech || 5) * 0.05, 0.3, 0.95)) {
        down = randInt(4, 10); setSlow(true);
        say('You spike their nav — the rig hesitates, drifting slower.');
      } else say('Their firewall holds. No handle on the rig.');
    } else if (kind === 'ram') {
      down = randInt(20, 34); setHeat(h => Math.min(100, h + 15));
      say(`You slam their quarter panel — ${down} off the gap, and paint on both cars.`);
    }
    const g = clamp(gap - down, 0, 100);
    setGap(g);
    if (g <= 0) { say('You pull level with the rig.'); setTimeout(() => setView('takedown'), 300); return; }
    setTimeout(() => evade(g), 260);
  }

  function takedown(mode) {
    if (mode === 'board') { setView('sub'); return; }
    // force them off — a Speed + Strength check
    const roll = randInt(1, 20);
    const mod = Math.round(((stats.speed || 5) + (stats.strength || 5)) / 2);
    const total = roll + mod, threshold = 12 + level * 2;
    resolveTakedown(total >= threshold, `d20 ${roll} + ${mod} = ${total} vs ${threshold}`);
  }

  function resolveTakedown(win, detail) {
    const loot = win ? randInt(240, 520) + level * 60 : 0;
    setRes({ win, detail, loot });
    setView('resolved');
  }

  function finish(escaped, loot) {
    if (doneRef.current) return; doneRef.current = true;
    // escaped or takedown lost → run failed (caught); won → pull the shipment
    dispatch({ type: 'RUN_RESOLVE', caught: escaped, gained: loot, traceAtPull: Math.min(99, Math.round(heat + rounds * 4)), forced: rounds > 6 ? 1 : 0 });
  }

  const meters = html`
    <div class="heist-bar"><span class="dim">gap</span>
      <span class="heist-heat"><span class="heat-fill" style=${{ width: (100 - gap) + '%' }}></span></span>
      <span class="dim">${gap <= 25 ? 'CLOSE' : 'chase'}</span></div>
    <div class="heist-bar"><span class="dim">their run</span>
      <span class="heist-heat"><span class=${'heat-fill' + (lead >= 60 ? ' hot' : '')} style=${{ width: lead + '%' }}></span></span>
      <span class="dim">${Math.round(lead)}%</span>
      ${tyre ? html`<span class="rose">tyre</span>` : null}${slow ? html`<span class="teal">jacked</span>` : null}</div>`;

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />

      ${view === 'intro' ? html`
        <div class="kicker">The intercept</div>
        <div class="panel"><div class="prose"><p>Somewhere up the strip, ${cargo} is riding in a runner's rig with
          the pedal buried and no intention of stopping. Close the gap before they hit open road and vanish — then
          take it off them.</p>
          <p class="dim">Your ride: <b class="teal">${veh.name}</b>. Fast enough. Probably.</p></div></div>
        <button class="btn btn-primary" onClick=${() => setView('chase')}>Give chase ▸</button>`
      : null}

      ${view === 'chase' ? html`
        ${meters}
        <div class="cbt-log">${log.map((m, i) => html`<div key=${i} class=${'cbt-line' + (i ? ' old' : '')}>${m}</div>`)}</div>
        <button class="btn btn-primary" onClick=${() => move('floor')}>Floor it <span class="dim">· Speed + ride</span></button>
        <button class="btn" onClick=${() => move('shoot')}>Shoot the tyres <span class="dim">· Marksmanship</span></button>
        <button class="btn" onClick=${() => move('hack')}>Jack their rig <span class="dim">· Tech</span></button>
        <button class="btn btn-danger" disabled=${gap > 25} onClick=${() => move('ram')}>
          Ram them ${gap > 25 ? html`<span class="dim">· get closer first</span>` : html`<span class="dim">· risky</span>`}</button>`
      : null}

      ${view === 'takedown' ? html`
        ${meters}
        <div class="panel"><div class="prose"><p>You pull level with the rig, door to door at a hundred and climbing,
          paint almost kissing. The shipment is right there behind the glass — and so are the people paid to keep it.</p></div></div>
        <button class="btn btn-primary" onClick=${() => takedown('board')}>Board the rig <span class="dim">· a fight</span></button>
        <button class="btn" onClick=${() => takedown('force')}>Force them off the road <span class="dim">· Speed + Strength</span></button>`
      : null}

      ${view === 'sub' ? html`
        ${meters}
        <div class="panel pz-wrap">
          <${Combat} level=${level} stats=${stats} style=${combatStyle} enemyName="the runner's guard"
            abilities=${combatAbilitiesOf(state.abilities)} chrome=${state.nerve}
            onResolve=${(w, spent) => { if (spent) dispatch({ type: 'SPEND_CHROME', n: spent }); resolveTakedown(w, null); }} /></div>`
      : null}

      ${view === 'resolved' ? html`
        <div class="panel"><div class="prose">
          <p class=${res.win ? 'teal' : 'rose'}>${res.win
            ? `The rig shudders to a dead stop and you haul ${cargo} out clean. Some loose credits rode along: ${res.loot}.`
            : 'They tear clear and the rig is swallowed by the sprawl, tail-lights and all. The shipment with it.'}</p>
          ${res.detail ? html`<p class="dim mono-sm">${res.detail}</p>` : null}
        </div></div>
        <button class=${'btn ' + (res.win ? 'btn-primary' : 'btn-danger')}
          onClick=${() => finish(!res.win, res.loot)}>${res.win ? 'Haul it in ▸' : 'Let it go ▸'}</button>`
      : null}
    </div>`;
}
