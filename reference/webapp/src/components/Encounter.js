import { html, useState } from '../ui.js';
import { Hud } from './Hud.js';
import { randInt, clamp, pick } from '../engine.js';
import { combatAbilitiesOf, vehicleOf } from '../world.js';
import { Combat } from './Combat.js';
import { Hack } from './Hack.js';
import { cap } from './Heist.js';

// A road encounter — the sprawl throws a fight or a net-snare at you between
// cities. Settle it with the gun/blade or the ice, or gamble a quick way out
// (break away / bull through) on a stat check. Then on to the board.
const AMBUSHERS = ['road pirates', 'a corp interceptor', 'a gang toll-crew', 'a lone bounty hunter'];
const SNARES = ['a net-snare strung across the on-ramp', 'a toll-ice checkpoint', 'a black-ICE tripwire on the wire'];

export function Encounter({ state, dispatch }) {
  const stats = state.stats || {};
  const enc = state.encounter || { type: 'ambush', level: 1 };
  const [subject] = useState(() => pick(enc.type === 'ambush' ? AMBUSHERS : SNARES));
  const [view, setView] = useState('intro');   // intro | sub | resolved
  const [sub, setSub] = useState(null);
  const [res, setRes] = useState(null);
  const combatStyle = (stats.marksmanship || 5) >= (stats.strength || 5) ? 'gun' : 'blade';
  // The ride's hardware — the top-end machines carry a weapon that can end a
  // tail outright, for the cost of the ammo.
  const weapon = vehicleOf(state.vehicleId).weapon || null;
  const canFire = weapon && state.yen >= weapon.cost;

  function dice(keys) {
    const roll = randInt(1, 20);
    const mod = Math.round(keys.reduce((a, k) => a + (stats[k] || 5), 0) / keys.length);
    const total = roll + mod, threshold = 10 + enc.level * 3;
    return { win: total >= threshold, detail: `d20 ${roll} + ${mod} = ${total} vs ${threshold}` };
  }
  function resolve(win, how, detail) { setRes({ win, how, detail }); setView('resolved'); }

  function choose(opt) {
    if (opt === 'fight') { setSub('combat'); setView('sub'); }
    else if (opt === 'hack') { setSub('hack'); setView('sub'); }
    else if (opt === 'flee') { const d = dice(['speed', 'stealth']); resolve(d.win, 'flee', d.detail); }
    else if (opt === 'bull') { const d = dice(['strength']); resolve(d.win, 'bull', d.detail); }
  }

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />
      <div class="kicker">On the road</div>

      ${view === 'intro' ? html`
        <div class="panel"><div class="prose"><p>${enc.type === 'ambush'
          ? `The leg goes bad partway across. Headlights swing out of a side road and box you in — ${subject}, and they mean it.`
          : `Partway across, the wire snags hard: ${subject}. Something has its hand on you, and it wants a good look before it lets you through.`}</p></div></div>
        ${enc.type === 'ambush' ? html`
          ${weapon ? html`
            <button class=${'btn ' + (canFire ? 'btn-danger' : '')} disabled=${!canFire}
              onClick=${() => canFire && resolve(true, 'weapon', null)}>
              Deploy the ${weapon.name} <span class="dim">· ${weapon.cost} credits${canFire ? '' : ' — you can\'t cover the ammo'}</span></button>` : null}
          <button class="btn btn-primary" onClick=${() => choose('fight')}>Fight your way out <span class="dim">· a fight</span></button>
          <button class="btn" onClick=${() => choose('flee')}>Break away <span class="dim">· Speed + Stealth</span></button>`
        : html`
          <button class="btn btn-primary" onClick=${() => choose('hack')}>Crack the ice <span class="dim">· the cipher</span></button>
          <button class="btn" onClick=${() => choose('bull')}>Bull through <span class="dim">· Strength</span></button>`}`
      : null}

      ${view === 'sub' ? html`
        <div class="panel pz-wrap">
          ${sub === 'combat' ? html`<${Combat} level=${enc.level} stats=${stats} style=${combatStyle}
            enemyName=${cap(subject)} abilities=${combatAbilitiesOf(state.abilities)} chrome=${state.nerve}
            onResolve=${(w, spent) => { if (spent) dispatch({ type: 'SPEND_CHROME', n: spent }); resolve(w, 'combat', null); }} />` : null}
          ${sub === 'hack' ? html`<${Hack} level=${enc.level} stats=${stats}
            onResolve=${(w) => resolve(w, 'hack', null)} />` : null}
        </div>`
      : null}

      ${view === 'resolved' ? html`
        <div class="panel"><div class="prose">
          <p class=${res.win ? 'teal' : 'rose'}>${res.how === 'weapon' && weapon ? weapon.winLine : encLine(res, enc, subject)}</p>
          ${res.detail ? html`<p class="dim mono-sm">${res.detail}</p>` : null}
        </div></div>
        <button class=${'btn ' + (res.win ? 'btn-primary' : 'btn-danger')}
          onClick=${() => dispatch({ type: 'ENCOUNTER_DONE', win: res.win, weapon: res.how === 'weapon' })}>
          ${res.win ? 'Back on the road ▸' : 'Get clear ▸'}</button>`
      : null}
    </div>`;
}

function encLine(res, enc, subject) {
  if (enc.type === 'ambush') {
    if (res.how === 'flee') return res.win ? 'You spot a gap in the box and stand on the throttle — gone before they can close it.'
      : `${cap(subject)} run you down and put a round through you before you can break loose.`;
    return res.win ? `You leave ${subject} bleeding in the road and strip what they were carrying.`
      : `${cap(subject)} get the better of it, and you break off hurt, tasting copper.`;
  }
  if (res.how === 'bull') return res.win ? 'You gun it straight through the snare, sparks off the barrier, and out the far side.'
    : 'The snare holds you fast — and skims your accounts clean while you thrash against it.';
  return res.win ? 'The ICE buckles and the checkpoint waves you through like it never saw you.'
    : 'The ICE wins the exchange, lifting credits off you in the half-second before you tear free.';
}
