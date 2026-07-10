import { html, useState } from '../ui.js';
import { Hud } from './Hud.js';
import { LockPick } from './LockPick.js';
import { Hack } from './Hack.js';
import { Combat } from './Combat.js';
import { combatAbilitiesOf } from '../world.js';

// The training deck — a sim rig at the clinic to drill the two skills that
// carry a heist: picking locks and cracking ice. No stakes but your pride;
// difficulty is the sim's, and your own stats push back the way they will
// on a real job. (The same LockPick / Hack widgets run inside heists later.)
const DIFFS = [{ label: 'Easy', lvl: 1 }, { label: 'Standard', lvl: 2 }, { label: 'Hard', lvl: 3 }];

function resultLine(r) {
  const spar = r.kind === 'spar-gun' || r.kind === 'spar-blade';
  if (r.win) return spar ? 'You put them down. Still standing.'
    : r.kind === 'lock' ? 'The lock gives. Clean.' : 'The ice folds. You are through.';
  return spar ? 'They got the better of you. The sim resets — no real blood.'
    : r.kind === 'lock' ? 'The pick snapped. Reset and run it again.' : 'Locked out. The cipher held.';
}

export function Trainer({ state, dispatch }) {
  const [view, setView] = useState('menu');   // 'menu' | 'lock' | 'hack' | 'result'
  const [lvl, setLvl] = useState(2);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null);  // { kind, win }

  const start = (kind) => { setView(kind); setRound(r => r + 1); };
  const onResolve = (kind) => (win) => { setResult({ kind, win }); setView('result'); };

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />
      <div class="kicker">The training deck</div>

      ${view === 'menu' ? html`
        <div class="panel"><div class="prose"><p class="dim">A sim rig in the back of the clinic. Run the drills
          cold, so the real thing isn't the first time. Your hands and your head are your own — the sim only sets
          the difficulty.</p></div></div>

        <div class="row"><div class="kicker">Difficulty</div></div>
        <div class="diff-row">
          ${DIFFS.map(d => html`<button key=${d.lvl}
            class=${'chip' + (lvl === d.lvl ? ' sel' : '')} onClick=${() => setLvl(d.lvl)}>${d.label}</button>`)}
        </div>

        <div class="card" onClick=${() => start('lock')}>
          <div class="row"><div class="name">Pick locks</div><div class="price teal">timing</div></div>
          <div class="line">A pick sweeps the barrel — set each pin on the shear line. Steadier with Speed + Stealth.</div>
        </div>
        <div class="card" onClick=${() => start('hack')}>
          <div class="row"><div class="name">Crack ice</div><div class="price teal">deduction</div></div>
          <div class="line">Deduce the cipher from exact/present reads. More tries, shorter code, with Tech.</div>
        </div>
        <div class="card" onClick=${() => start('spar-gun')}>
          <div class="row"><div class="name">Spar — gunfight</div><div class="price teal">Marksmanship</div></div>
          <div class="line">Trade fire with a sim opponent. Steady, accurate — Aim to charge the next shot.</div>
        </div>
        <div class="card" onClick=${() => start('spar-blade')}>
          <div class="row"><div class="name">Spar — blade</div><div class="price teal">Strength + Speed</div></div>
          <div class="line">Close the distance. Heavier hits, Feint to open a guard — Speed slips theirs.</div>
        </div>

        <div class="spacer"></div>
        <button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'clinic' })}>Back to the clinic ▸</button>`
      : null}

      ${view === 'lock' ? html`<div class="panel pz-wrap">
        <${LockPick} key=${'l' + round} level=${lvl} stats=${state.stats} onResolve=${onResolve('lock')} /></div>
        <button class="btn-back" onClick=${() => setView('menu')}>◂ quit drill</button>` : null}
      ${view === 'hack' ? html`<div class="panel pz-wrap">
        <${Hack} key=${'h' + round} level=${lvl} stats=${state.stats} onResolve=${onResolve('hack')} /></div>
        <button class="btn-back" onClick=${() => setView('menu')}>◂ quit drill</button>` : null}
      ${view === 'spar-gun' || view === 'spar-blade' ? html`<div class="panel pz-wrap">
        <${Combat} key=${'c' + round} level=${lvl} stats=${state.stats}
          style=${view === 'spar-blade' ? 'blade' : 'gun'}
          abilities=${combatAbilitiesOf(state.abilities)} chrome=${state.nerve}
          onResolve=${onResolve(view)} /></div>
        <button class="btn-back" onClick=${() => setView('menu')}>◂ quit drill</button>` : null}

      ${view === 'result' ? html`
        <div class="panel"><div class="prose">
          <p class=${result.win ? 'teal' : 'rose'}>${resultLine(result)}</p>
          <p class="dim">It's only a sim. On a real job the stakes are your chrome — and worse.</p>
        </div></div>
        <button class="btn btn-primary" onClick=${() => start(result.kind)}>Run it again ▸</button>
        <button class="btn" onClick=${() => setView('menu')}>Other drills</button>
        <button class="btn btn-ghost" onClick=${() => dispatch({ type: 'GO', screen: 'clinic' })}>Back to the clinic</button>`
      : null}
    </div>`;
}
