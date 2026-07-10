import { html } from '../ui.js';
import { characterOf, portraitSrc, cityOf } from '../world.js';

// The persistent read-out: your face, money, and the chrome you have left before
// the body gives out. Low chrome turns the meter to a bruise. A thin line under
// it keeps where-and-when in view: district, day, and the dossier so far.
export function Hud({ state }) {
  const c = characterOf(state.characterId);
  const pct = Math.max(0, Math.round((state.nerve / state.nerveMax) * 100));
  const low = pct <= 33;
  const where = state.cityId ? cityOf(state.cityId).name : null;
  const meta = [where, state.day ? `day ${state.day}` : null,
    state.dossier && state.dossier.length ? `dossier ${state.dossier.length}/5` : null,
    state.turned ? 'the debt is paid' : null].filter(Boolean).join(' · ');
  return html`
    <div class="hud">
      <img class="hud-face" src=${portraitSrc(c.id)} alt=${state.name || c.name} draggable="false" />
      <div class="hud-cols">
        <div class="hud-line"><b>${state.name || c.name}</b><span class="dim">${state.yen.toLocaleString()} credits</span></div>
        <div class="hud-line">
          <span class=${'meter' + (low ? ' low' : '')}><span style=${{ width: pct + '%' }}></span></span>
          <span class="dim">chrome ${state.nerve}/${state.nerveMax}</span>
        </div>
        ${meta ? html`<div class="dim" style=${{ fontSize: '11px' }}>${meta}</div>` : null}
      </div>
    </div>`;
}
