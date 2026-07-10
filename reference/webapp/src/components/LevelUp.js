import { html } from '../ui.js';
import { Hud } from './Hud.js';
import { STAT_KEYS, abilitiesFor, STAT_CAP } from '../world.js';

// Level-up — spend the points earned across missions. Each point raises one
// stat (re-derives chrome / exploits / trace) or installs a new chrome ability.
// What a stat buys, in the player's language.
const STAT_NOTE = {
  strength: 'more chrome, and it burns slower',
  speed: 'the trace is slower to find you',
  stealth: 'the trace is slower to find you',
  tech: 'more exploits racked per run',
  marksmanship: 'more loose credits pulled clear',
};

export function LevelUp({ state, dispatch }) {
  const stats = state.stats || {};
  const owned = new Set(state.abilities || []);
  const pts = state.points || 0;
  const spent = pts <= 0;
  const abilities = abilitiesFor(state.characterId);

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />
      <div class="row">
        <div class="kicker">Jacked in deeper · level ${state.level}</div>
        <div class="dim">points <b class="teal">${pts}</b></div>
      </div>

      <div class="panel"><div class="prose"><p class="dim">The work leaves a mark, and the mark is yours to
        shape. There's slack in the rebuild — route it into a stat, or rack another piece of chrome.</p></div></div>

      <div class="panel">
        <div class="kicker">Raise a stat</div>
        <div class="statsheet">
          ${STAT_KEYS.map(sk => {
            const v = stats[sk.key] || 0;
            const capped = v >= STAT_CAP;
            return html`
              <div class="statrow level" key=${sk.key}>
                <span class="statlabel">${sk.label}</span>
                <span class="statbar"><span style=${{ width: (v * 10) + '%' }}></span></span>
                <span class="statval">${v}</span>
                <button class="stat-btn wide" disabled=${spent || capped}
                  onClick=${() => dispatch({ type: 'LEVEL_STAT', key: sk.key })}>
                  ${capped ? 'max' : '+1'}</button>
              </div>
              <div class="statnote dim" key=${sk.key + '-n'}>${STAT_NOTE[sk.key]}</div>`;
          })}
        </div>
      </div>

      <div class="kicker">Install chrome</div>
      ${abilities.map(a => {
        const have = owned.has(a.id);
        return html`
          <div class=${'card ability' + (have ? ' owned' : '')} key=${a.id}
            onClick=${() => !have && !spent && dispatch({ type: 'LEVEL_ABILITY', id: a.id })}>
            <div class="row"><div class="name">${a.name}</div>
              ${have ? html`<div class="price">installed</div>` : (spent ? null : html`<div class="price teal">1 point</div>`)}</div>
            <div class="line">${a.line}</div>
          </div>`;
      })}

      <div class="spacer"></div>
      <button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'contacts' })}>
        ${spent ? 'Back to the board ▸' : `Save ${pts} for later ▸`}</button>
    </div>`;
}
