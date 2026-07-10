import { html } from '../ui.js';
import { characterOf, STAT_KEYS, abilitiesFor, STAT_CAP, interiorSrc } from '../world.js';

// The rebuild — where the player routes the new nervous system across the five
// stats and picks one signature chrome ability. CONFIRM_BUILD finalises it all.
export function Doctor({ state, dispatch }) {
  const c = characterOf(state.characterId);
  const base = state.baseStats || c.stats;
  const alloc = state.alloc || {};
  const val = (k) => base[k] + (alloc[k] || 0);
  const canConfirm = state.ability != null;
  const abilities = abilitiesFor(state.characterId);

  return html`
    <div class="wrap fade">
      <div class="kicker">The clinic · the rebuild</div>
      <div class="city-banner"><img src=${interiorSrc('clinic', state.artSeed, 1)} alt="" draggable="false"
        onError=${(e) => { e.target.parentElement.style.display = 'none'; }} /></div>
      <div class="panel"><div class="prose"><p class="dim">The surgery is done underground, in a room strung with
        more tech than a corp ward. Before the new chrome takes — and it takes all at once — the surgeon looks up.
        "Your body, your build. Tell me where to route it."</p></div></div>

      <div class="panel">
        <div class="row"><div class="kicker">Route the rebuild</div>
          <div class="dim">points left <b class="teal">${state.pool}</b></div></div>
        <div class="statsheet">
          ${STAT_KEYS.map(sk => {
            const v = val(sk.key);
            const added = alloc[sk.key] || 0;
            return html`
              <div class="statrow build" key=${sk.key}>
                <span class="statlabel">${sk.label}</span>
                <button class="stat-btn" disabled=${added <= 0}
                  onClick=${() => dispatch({ type: 'ALLOCATE', key: sk.key, delta: -1 })}>−</button>
                <span class="statbar"><span style=${{ width: (v * 10) + '%' }}></span></span>
                <button class="stat-btn" disabled=${state.pool <= 0 || v >= STAT_CAP}
                  onClick=${() => dispatch({ type: 'ALLOCATE', key: sk.key, delta: 1 })}>+</button>
                <span class="statval">${v}</span>
              </div>`;
          })}
        </div>
      </div>

      <div class="kicker">Chrome — one of four, cut for ${c.name}</div>
      ${abilities.map(a => html`
        <div class=${'card ability' + (state.ability === a.id ? ' sel' : '')} key=${a.id}
          onClick=${() => dispatch({ type: 'PICK_ABILITY', id: a.id })}>
          <div class="row"><div class="name">${a.name}</div>
            <div class=${'price' + (state.ability === a.id ? '' : ' dim')}>${state.ability === a.id ? 'installed' : a.tag}</div></div>
          <div class="line">${a.line}</div>
        </div>`)}

      <div class="spacer"></div>
      <button class="btn btn-primary" disabled=${!canConfirm}
        onClick=${() => canConfirm && dispatch({ type: 'CONFIRM_BUILD' })}>
        ${canConfirm ? 'Take the chair — jack in ▸' : 'Pick your chrome first'}</button>
    </div>`;
}
