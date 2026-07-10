import { html } from '../ui.js';
import { characterOf, portraitSrc, montageOf } from '../world.js';

// The backstory montage — who you were, one screen at a time, over your own face.
// Tap through the beats; the last one hands off to Kiros's contact.
export function Montage({ state, dispatch }) {
  const c = characterOf(state.characterId);
  const beats = montageOf(c.id);
  const i = Math.min(state.montageIndex || 0, beats.length - 1);
  const last = i === beats.length - 1;

  return html`
    <div class="wrap fade center" key=${i}>
      <div class="spacer"></div>
      <img class="montage-face" src=${portraitSrc(c.id)} alt=${c.name} draggable="false" />
      <div class="kicker">${state.name || c.name} · ${c.role}</div>
      <div class="panel" style=${{ textAlign: 'left' }}>
        <div class="prose"><p>${beats[i]}</p></div>
      </div>
      <div class="montage-dots">
        ${beats.map((_, n) => html`<span key=${n} class=${'mdot' + (n === i ? ' on' : '')}></span>`)}
      </div>
      <button class="btn btn-primary" onClick=${() => dispatch({ type: 'MONTAGE_NEXT' })}>
        ${last ? 'Continue ▸' : 'Next ▸'}</button>
    </div>`;
}
