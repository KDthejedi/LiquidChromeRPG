import { html, Svg } from '../ui.js';
import { ENDINGS, characterOf, VANISH_INTEL, endingSrc } from '../world.js';
import { FLATLINE } from '../art.js';

export function Ending({ state, dispatch }) {
  const e = ENDINGS[state.ending] || ENDINGS.flatline;
  const flat = e.id === 'flatline';
  const c = characterOf(state.characterId);
  const text = (e.text || '').replace(/\{burner\}/g, c.burner || 'them');
  const epilogue = (c.epilogues || {})[e.id] || null;
  const art = endingSrc(e.id, state.artSeed);

  return html`
    <div class="wrap fade center">
      <div class="spacer"></div>
      ${art ? html`<div class="ending-art"><img src=${art} alt="" draggable="false"
        onError=${(ev) => { ev.target.parentElement.style.display = 'none'; }} /></div>`
        : (flat ? html`<${Svg} markup=${FLATLINE} />` : null)}
      <div class="kicker">${flat ? 'Flatline' : 'How it ends'} · ${state.name || c.name}</div>
      <h1 class="title-mark" style=${{ fontSize: 'clamp(30px,10vw,54px)' }}>${e.title}</h1>
      <div class="panel" style=${{ textAlign: 'left' }}>
        <div class="prose"><p>${text}</p>
          ${epilogue ? html`<p class="dim">${epilogue}</p>` : null}</div>
      </div>
      <div class="panel" style=${{ textAlign: 'left' }}>
        <div class="hud">
          <span>Credits banked <b>${state.yen.toLocaleString()}</b></span>
          <span>runs <b>${state.runsDone.length}</b></span>
          <span>dossier <b>${state.dossier.length}/5</b></span>
          <span>intel <b>${state.intel}</b>${state.intel >= VANISH_INTEL ? ' ✦' : ''}</span>
        </div>
      </div>
      <button class="btn btn-primary" onClick=${() => dispatch({ type: 'RESET' })}>Jack in again ▸</button>
    </div>`;
}
