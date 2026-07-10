import { html, useState } from '../ui.js';
import { CHARACTERS, portraitSrc, STAT_KEYS } from '../world.js';

// Character select — Sundown's Outfit, in neon. Pick an avatar (each is a
// specific person with a portrait, playstyle + bio), name yourself, and jack
// in. The avatar's portrait is your face for the whole run.
export function Outfit({ dispatch }) {
  const [pickId, setPickId] = useState(CHARACTERS[0].id);
  const [name, setName] = useState('');
  const c = CHARACTERS.find(x => x.id === pickId) || CHARACTERS[0];

  return html`
    <div class="wrap fade">
      <div class="row"><div class="kicker">Who jacks in?</div>
        <button class="btn-back" onClick=${() => dispatch({ type: 'GO', screen: 'title' })}>◂ back</button></div>

      <div class="pick-grid">
        ${CHARACTERS.map(x => html`
          <button key=${x.id} class=${'pick' + (x.id === pickId ? ' sel' : '')} onClick=${() => setPickId(x.id)}>
            <img class="pick-face" src=${portraitSrc(x.id)} alt=${x.name} draggable="false" />
            <span class="pick-name">${x.name}</span>
          </button>`)}
      </div>

      <div class="panel char-detail">
        <div class="char-head">
          <img class="char-face" src=${portraitSrc(c.id)} alt=${c.name} draggable="false" />
          <div>
            <div class="name">${c.name}</div>
            <div class="teal" style=${{ fontSize: '12px', marginTop: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>${c.role}</div>
            <div class="dim" style=${{ fontSize: '12px', marginTop: '2px' }}>${c.deck}</div>
          </div>
        </div>
        <div class="prose">
          <p class="dim">${c.bio}</p>
          <p class="dim" style=${{ fontSize: '12.5px', opacity: 0.85 }}>${c.origin}</p>
        </div>
        <div class="row"><div class="kicker">Base aptitudes</div><div class="dim">shaped at the clinic</div></div>
        <div class="statsheet">
          ${STAT_KEYS.map(s => html`
            <div class="statrow" key=${s.key}>
              <span class="statlabel">${s.label}</span>
              <span class="statbar"><span style=${{ width: (c.stats[s.key] * 10) + '%' }}></span></span>
              <span class="statval">${c.stats[s.key]}</span>
            </div>`)}
        </div>
        <div class="tags"><span class="tag">${c.yen} credits to start</span></div>
      </div>

      <label class="field">
        <span class="dim">Handle</span>
        <input class="text-input" type="text" maxlength="18" placeholder=${c.name}
          value=${name} onInput=${(e) => setName(e.target.value)} />
      </label>

      <button class="btn btn-primary" onClick=${() => dispatch({ type: 'PICK_CHARACTER', characterId: pickId, name })}>Their story ▸</button>
    </div>`;
}
