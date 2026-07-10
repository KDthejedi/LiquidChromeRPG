import { html } from '../ui.js';
import { Hud } from './Hud.js';
import { VEHICLES, vehicleOf, vehicleSrc, VEHICLE_TUNE, interiorSrc } from '../world.js';

export function Garage({ state, dispatch }) {
  const cur = vehicleOf(state.vehicleId);
  const eff = Math.max(1, cur.days - state.speedMods);
  const tuneMaxed = state.speedMods >= VEHICLE_TUNE.maxMods || eff <= 1;
  const canTune = !tuneMaxed && state.yen >= VEHICLE_TUNE.cost;

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />
      <div class="kicker">The garage</div>
      <div class="city-banner"><img src=${interiorSrc('garage', state.artSeed)} alt="" draggable="false"
        onError=${(e) => { e.target.parentElement.style.display = 'none'; }} /></div>
      <div class="panel"><div class="prose"><p class="dim">A ride is time. The sprawl is wide, and every day
        you spend crossing it is a day the trace has to think about you. Buy a faster machine — or tune the one
        you've got.</p></div></div>

      <div class="panel">
        <div class="hud">
          <span>Driving <b>${cur.name}</b></span>
          <span>speed <b>${eff} day${eff === 1 ? '' : 's'}/leg</b>${state.speedMods ? html` <span class="teal">(tuned +${state.speedMods})</span>` : ''}</span>
        </div>
      </div>

      <div class=${'card' + (canTune ? '' : ' owned')}
        onClick=${() => canTune && dispatch({ type: 'BUY_TUNE' })}>
        <div class="row"><div class="name">Tune the engine</div>
          <div class="price">${tuneMaxed ? 'maxed' : VEHICLE_TUNE.cost.toLocaleString() + ' credits'}</div></div>
        <div class="line">${tuneMaxed
          ? "There's nothing more to give — this chassis is as fast as it gets."
          : 'Shave a day off every leg. Fitted to this ride; a new one starts clean.'}</div>
      </div>

      <div class="spacer"></div>
      <div class="kicker">The lot</div>
      ${VEHICLES.map(v => {
        const owned = v.id === state.vehicleId;
        const afford = state.yen >= v.price;
        return html`
          <div class=${'card veh' + (owned ? ' owned' : '')} key=${v.id}
            onClick=${() => (!owned && afford) && dispatch({ type: 'BUY_VEHICLE', id: v.id })}>
            <div class=${'veh-thumb ' + v.type}>
              <img class="veh-shot" src=${vehicleSrc(v.id, state.artSeed)} alt=${v.name} draggable="false"
                onError=${(e) => { e.target.style.display = 'none'; }} />
              <span class="veh-badge">${v.type}</span>
            </div>
            <div class="row"><div class="name">${v.name}</div>
              <div class="price">${owned ? 'yours' : (v.price ? v.price.toLocaleString() + ' credits' : '—')}</div></div>
            <div class="line">${v.blurb}${v.weapon ? html` <span class="dim">${v.weapon.note}</span>` : ''}</div>
            <div class="tags">
              <span class="tag">${v.days} days/leg</span>
              <span class=${'tag ' + (v.type === 'bike' ? 'violet' : '')}>${v.type}</span>
              ${v.weapon ? html`<span class="tag rose">${v.weapon.name} · ${v.weapon.cost}/use</span>` : null}
            </div>
          </div>`;
      })}

      <div class="spacer"></div>
      <button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'map' })}>To the map ▸</button>
      <button class="btn btn-ghost" onClick=${() => dispatch({ type: 'GO', screen: 'contacts' })}>Back to the board</button>
    </div>`;
}
