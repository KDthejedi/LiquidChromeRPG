import { html, useState, useRef } from '../ui.js';
import { Hud } from './Hud.js';
import { layRescue, randInt, clamp } from '../engine.js';
import { combatAbilitiesOf } from '../world.js';
import { Combat } from './Combat.js';
import { Hack } from './Hack.js';
import { LockPick } from './LockPick.js';
import { APPROACHES, optionsFor as heistOptions, beatLine as heistLine, resolveLine as heistResolve, cap } from './Heist.js';

// A rescue — reach the captive, free them, run a hot extraction to the waiting
// ride with them in tow. Same approach/encounter engine as a heist, but the
// escort out bleeds heat faster: a slip with someone on your arm costs more.
function optionsFor(kind) {
  if (kind === 'free') return [
    { tag: 'pick', label: 'Pick their restraints', mode: 'lock' },
    { tag: 'hack', label: 'Kill the collar', mode: 'hack' },
    { tag: 'fight', label: 'Drop the guard', mode: 'combat' }];
  if (kind === 'extract') return [
    { tag: 'grab', label: 'Get them to the ride', mode: 'dice', stats: ['speed', 'strength'] },
    { tag: 'fight', label: 'Cover their run', mode: 'combat' }];
  return heistOptions(kind);
}

function lineFor(b, who) {
  if (b.kind === 'free') return `${cap(b.place)} — and there they are: ${who}, hollow-eyed and shackled, and not much time on the clock.`;
  if (b.kind === 'extract') return 'Headlights sweep the alley mouth and a door hangs open, engine running. Get them in and go.';
  return (b.escort ? `${cap(b.place)} — moving with ${who} on your arm slows you to a crawl, and these halls have ears. ` : '') + heistLine(b);
}

export function Rescue({ state, dispatch }) {
  const stats = state.stats || {};
  const [plan] = useState(() => layRescue(state.run || { grade: 'grey' }));
  const beats = [...plan.infil, plan.free, ...plan.escort];
  const [approach, setApproach] = useState(null);
  const [idx, setIdx] = useState(0);
  const [heat, setHeat] = useState(0);
  const [fails, setFails] = useState(0);
  const [view, setView] = useState('approach');
  const [sub, setSub] = useState(null);
  const [res, setRes] = useState(null);
  const doneRef = useRef(false);

  const beat = beats[idx];
  const appr = APPROACHES.find(a => a.id === approach);
  const favored = (tag) => !!(appr && appr.favors.includes(tag));
  const combatStyle = (stats.marksmanship || 5) >= (stats.strength || 5) ? 'gun' : 'blade';

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
    let heatUp = 0, combatLoss = false;
    if (!success) {
      if (opt.mode === 'combat') { combatLoss = true; heatUp = 100; }
      else { heatUp = 20 + beat.level * 4; if (beat.escort) heatUp = Math.round(heatUp * 1.5); }
      setFails(f => f + 1);
    }
    const heatAfter = Math.min(100, heat + heatUp);
    setHeat(heatAfter);
    setRes({ success, opt, detail, heatUp, combatLoss, heatAfter });
    setView('resolved');
  }

  function cont() {
    const caught = res.combatLoss || res.heatAfter >= 100;
    if (caught) return finish(true);
    if (idx >= beats.length - 1) return finish(false);
    setIdx(i => i + 1); setRes(null); setSub(null); setView('beat');
  }

  function finish(caught) {
    if (doneRef.current) return; doneRef.current = true;
    // reward is the run's fee; loose loot isn't the point of a rescue
    dispatch({ type: 'RUN_RESOLVE', caught, gained: 0, traceAtPull: Math.min(99, Math.round(heat)), forced: fails });
  }

  const meter = html`
    <div class="heist-bar">
      <span class="dim">step ${idx + 1}/${beats.length}</span>
      <span class="heist-heat"><span class=${'heat-fill' + (heat >= 70 ? ' hot' : '')} style=${{ width: heat + '%' }}></span></span>
      <span class="dim">${heat < 70 ? 'heat' : 'HEAT'} ${Math.round(heat)}</span>
      ${idx >= plan.infil.length ? html`<span class="violet">${plan.who} · in tow</span>` : null}
    </div>`;

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />

      ${view === 'approach' ? html`
        <div class="kicker">The extraction</div>
        <div class="panel"><div class="prose"><p>They're holding ${plan.who} somewhere inside. Get in, get them
          loose, and get them to the ride — alive. <span class="dim">How you go in is yours to call.</span></p></div></div>
        ${APPROACHES.map(a => html`
          <div class="card" key=${a.id} onClick=${() => { setApproach(a.id); setView('beat'); }}>
            <div class="row"><div class="name">${a.label}</div></div>
            <div class="line">${a.note}</div>
          </div>`)}`
      : null}

      ${view === 'beat' ? html`
        ${meter}
        <div class="panel"><div class="prose"><p>${lineFor(beat, plan.who)}</p></div></div>
        ${optionsFor(beat.kind).map(opt => html`
          <button class=${'btn' + (favored(opt.tag) ? ' btn-primary' : '')} key=${opt.tag + opt.label}
            onClick=${() => pick(opt)}>${opt.label}${favored(opt.tag) ? ' ◂ your play' : ''}</button>`)}`
      : null}

      ${view === 'sub' ? html`
        ${meter}
        <div class="panel"><div class="prose"><p class="dim">${lineFor(beat, plan.who)}</p></div></div>
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
          <p class=${res.success ? 'teal' : (res.combatLoss ? 'rose' : '')}>${rescueLine(res, beat, plan.who)}</p>
          ${res.detail ? html`<p class="dim mono-sm">${res.detail}</p>` : null}
          ${res.heatUp && !res.combatLoss ? html`<p class="dim rose">Heat +${res.heatUp}${beat.escort ? ' — dragging them is loud' : ''}.</p>` : null}
        </div></div>
        ${res.combatLoss || res.heatAfter >= 100
          ? html`<button class="btn btn-danger" onClick=${cont}>They take you both — it's over ▸</button>`
          : idx >= beats.length - 1
            ? html`<button class="btn btn-primary" onClick=${cont}>Into the car ▸</button>`
            : html`<button class="btn btn-primary" onClick=${cont}>Keep moving ▸</button>`}`
      : null}
    </div>`;
}

function rescueLine(res, beat, who) {
  if (res.combatLoss) return `${cap(beat.foe)} drops you where you stand, and ${who} is dragged back into the dark, screaming your name.`;
  if (res.success) {
    if (beat.kind === 'free') return `The last restraint springs open. ${cap(who)} is loose, on their feet, and with you — barely.`;
    if (beat.kind === 'extract') return `You fold them into the car and the door slams and the tyres bite. Gone into the sprawl.`;
    return heistResolve(res, beat);
  }
  return beat.escort ? 'You scrape through — but loud, and they are shaking now, clutching your sleeve.' : heistResolve(res, beat);
}
