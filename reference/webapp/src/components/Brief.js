import { html } from '../ui.js';
import { Hud } from './Hud.js';
import { posterOf, portraitSrc, GRADE_LABEL, characterOf, interiorSrc } from '../world.js';
import { runById } from '../state.js';

export function Brief({ state, dispatch }) {
  const run = runById(state, state.briefId);
  if (!run) return html`<div class="wrap"><button class="btn" onClick=${() => dispatch({ type: 'GO', screen: 'contacts' })}>Back</button></div>`;

  // Worst case is a traced run: stake × your burn × 1.6 (matching RUN_RESOLVE),
  // plus any chrome you torch on specials in there. Warn while it still helps.
  const worstCost = Math.round(run.stake * (state.burn || 1) * 1.6);
  const thin = state.nerve <= worstCost + 10;
  const c = characterOf(state.characterId);

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />
      <div class="kicker">${run.hunt ? 'The hunt' : 'Brief'} · ${GRADE_LABEL[run.grade]} security</div>

      ${!run.hunt ? html`<div class="city-banner"><img src=${interiorSrc('bar', state.artSeed)} alt="" draggable="false"
        onError=${(e) => { e.target.parentElement.style.display = 'none'; }} /></div>` : null}

      ${run.hunt
        ? html`<div class="panel-fixer"><div class="fixer-name rose">No fixer. No retainer. Just ${c.burner}.</div></div>`
        : (() => { const p = posterOf(run); return html`<div class="job-fixer panel-fixer">
            <img class="fixer-face" src=${portraitSrc(p.id)} alt="" draggable="false" />
            <div>
              <div class=${'fixer-name' + (run.type === 'kiros' ? ' violet' : '')}>${p.name}</div>
              <div class="dim" style=${{ fontSize: '12px' }}>${p.line}</div>
            </div>
          </div>`; })()}

      <div class="panel">
        <div class="prose">
          <p><b>${run.target}</b></p>
          <p class="dim">${run.brief}</p>
          ${run.grade === 'black' ? html`<p class="rose">This is black-site security. If the trace locks
            onto you in there, it does not fine you — it reaches back down the link and stops your heart.</p>` : null}
        </div>
        <div class="tags">
          ${run.yen ? html`<span class="tag">payout ${run.yen.toLocaleString()} credits</span>` : null}
          <span class="tag">${state.breakersMax} exploits</span>
          <span class="tag">chrome at stake ${run.stake}</span>
        </div>
      </div>

      ${thin ? html`<div class="panel"><div class="prose"><p class="rose">You're running thin. A blown run here
        could take ~${worstCost} chrome, and you're carrying ${state.nerve}. Top up at the clinic first — or jack in
        light and hope the trace never finds you.</p></div></div>` : null}

      <button class="btn btn-primary" onClick=${() => dispatch({ type: 'START_RUN', id: run.id })}>${run.hunt ? 'Run the hunt ▸' : 'Run the breach ▸'}</button>
      <button class="btn btn-ghost" onClick=${() => dispatch({ type: 'GO', screen: 'contacts' })}>Not yet</button>
    </div>`;
}
