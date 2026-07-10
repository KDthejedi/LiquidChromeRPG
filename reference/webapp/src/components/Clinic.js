import { html } from '../ui.js';
import { Hud } from './Hud.js';
import { HARDWARE, interiorSrc } from '../world.js';

export function Clinic({ state, dispatch }) {
  const flushCost = Math.round((state.nerveMax - state.nerve) * 6);
  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />
      <div class="kicker">The clinic</div>
      <div class="city-banner"><img src=${interiorSrc('clinic', state.artSeed)} alt="" draggable="false"
        onError=${(e) => { e.target.parentElement.style.display = 'none'; }} /></div>
      <div class="panel"><div class="prose"><p class="dim">The surgeon takes credits for anything. Some of it
        tops up the chrome. Some of it pushes the limit further out — which is another way of saying it lets
        you go deeper before the body gives out.</p></div></div>

      ${flushCost > 0 ? html`
        <div class="card" onClick=${() => dispatch({ type: 'FLUSH' })}>
          <div class="row"><div class="name">Top up the chrome</div><div class="price">${flushCost.toLocaleString()} credits</div></div>
          <div class="line">Back to ${state.nerveMax}. The shakes go quiet. For a while.</div>
        </div>` : html`
        <div class="card owned"><div class="name">Chrome steady</div><div class="line">Nothing to flush. You're whole — as whole as you get.</div></div>`}

      <div class="spacer"></div>
      <div class="kicker">Hardware & wetwork</div>
      ${HARDWARE.map(h => {
        const owned = state.hardware.includes(h.id);
        const afford = state.yen >= h.cost;
        return html`
          <div class=${'card' + (owned ? ' owned' : '')} key=${h.id}
            onClick=${() => (!owned && afford) && dispatch({ type: 'BUY', id: h.id })}>
            <div class="row"><div class="name">${h.name}</div>
              <div class="price">${owned ? 'installed' : h.cost.toLocaleString() + ' credits'}</div></div>
            <div class="line">${h.line}</div>
          </div>`;
      })}

      <div class="spacer"></div>
      <button class="btn" onClick=${() => dispatch({ type: 'GO', screen: 'trainer' })}>The training deck — drill locks &amp; ice</button>
      <button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'contacts' })}>Back to the board ▸</button>
    </div>`;
}
