import { html } from '../ui.js';
import { Hud } from './Hud.js';
import { availableRuns, kirosPending, RETIRE_AT } from '../state.js';
import { posterOf, portraitSrc, GRADE_LABEL, characterOf, cityOf, citySrc, missionOf, MISSION_LABEL } from '../world.js';

const GRADE_TAG = { grey: 'grey', white: 'white', black: 'black' };

export function Contacts({ state, dispatch }) {
  const runs = availableRuns(state);
  const c = characterOf(state.characterId);

  // After the turn: the hunt, and the choice to walk.
  if (state.turned) {
    const hunt = runs[0];
    return html`
      <div class="wrap fade">
        <${Hud} state=${state} />
        <div class="kicker">The board is yours</div>
        <div class="panel"><div class="prose"><p class="dim">The debt is paid and the voice with no name has
          gone quiet. One job left, and no one posted it but you.</p></div></div>

        <div class="card job" onClick=${() => dispatch({ type: 'OPEN_BRIEF', id: 'hunt' })}>
          <div class="fixer-name rose">The hunt · ${c.burner}</div>
          <div class="name">${hunt.target}</div>
          <div class="line">${hunt.brief}</div>
          <div class="tags">
            <span class="tag black">black-site</span>
            <span class="tag">stakes chrome ${hunt.stake}</span>
            <span class="tag violet">personal</span>
          </div>
        </div>

        <div class="spacer"></div>
        ${state.points > 0 ? html`<button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'levelup' })}>
          Level up — ${state.points} ${state.points === 1 ? 'point' : 'points'} to spend ▸</button>` : null}
        <button class="btn" onClick=${() => dispatch({ type: 'GO', screen: 'clinic' })}>The clinic — top up the chrome, buy reach</button>
        <button class="btn btn-ghost" onClick=${() => dispatch({ type: 'WALK_AWAY' })}>
          Walk away with the money (${state.yen.toLocaleString()} credits) — leave them standing</button>
        <div class="sys-row">
          <button class="btn-back" onClick=${() => dispatch({ type: 'GO', screen: 'title' })}>◂ title & menu</button>
          <a class="btn-back exit-link" href="../index.html">exit to Chronicles ▸</a>
        </div>
      </div>`;
  }

  const city = cityOf(state.cityId);
  const pending = kirosPending(state); // false, or { fixersCleared, arcReady }
  const fixerJobs = runs.filter(r => r.type === 'fixer');
  const kirosJob = runs.find(r => r.type === 'kiros');

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />
      <div class="row">
        <div class="kicker">${city.name} · ${city.bloc}</div>
        <div class="dim">day ${state.day}</div>
      </div>
      <div class="city-banner">
        <img src=${citySrc(city.id, state.artSeed)} alt=${city.name} draggable="false"
          onError=${(e) => { e.target.parentElement.style.display = 'none'; }} />
        <div class="city-banner-blurb">${city.blurb}</div>
      </div>

      ${fixerJobs.map(r => jobCard(r, dispatch))}
      ${kirosJob ? jobCard(kirosJob, dispatch) : null}

      ${!kirosJob && pending && !pending.fixersCleared ? html`
        <div class="card locked">
          <div class="job-fixer">
            <img class="fixer-face sm" src=${portraitSrc('kiros')} alt="Kiros" draggable="false" />
            <div><div class="fixer-name">Kiros</div><div class="fixer-tag">The handler · waiting</div></div>
          </div>
          <div class="line dim">Kiros won't call while there's fixer work left on this board. Clear it, and he'll surface.</div>
        </div>` : null}
      ${!kirosJob && pending && pending.fixersCleared && !pending.arcReady ? html`
        <div class="card locked">
          <div class="job-fixer">
            <img class="fixer-face sm" src=${portraitSrc('kiros')} alt="Kiros" draggable="false" />
            <div><div class="fixer-name">Kiros</div><div class="fixer-tag">The handler · elsewhere</div></div>
          </div>
          <div class="line dim">Kiros has nothing for you here yet — there's a thread to pull in another city first.</div>
        </div>` : null}

      ${runs.length === 0 && !(pending && !pending.fixersCleared) ? html`
        <div class="panel"><div class="prose"><p class="dim">Nothing left on this board. Try another district —
          or push the story where Kiros wants it next.</p></div></div>` : null}

      <div class="spacer"></div>
      ${state.points > 0 ? html`<button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'levelup' })}>
        ⬆ Level up — ${state.points} ${state.points === 1 ? 'point' : 'points'} to spend</button>` : null}
      <button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'map' })}>The map — travel the sprawl ▸</button>
      <button class="btn" onClick=${() => dispatch({ type: 'GO', screen: 'garage' })}>The garage — your ride</button>
      <button class="btn" onClick=${() => dispatch({ type: 'GO', screen: 'clinic' })}>The clinic — top up the chrome, buy reach</button>
      ${state.yen >= RETIRE_AT ? html`<button class="btn btn-ghost"
        onClick=${() => window.confirm(`Walk away with ${state.yen.toLocaleString()} credits? The debt stays unpaid, the ones who burned you go on standing — and this run ends here.`) && dispatch({ type: 'WALK_AWAY' })}>
        Retire — you have enough to disappear (${state.yen.toLocaleString()} credits)</button>` : null}
      <div class="sys-row">
        <button class="btn-back" onClick=${() => dispatch({ type: 'GO', screen: 'title' })}>◂ title & menu</button>
        <a class="btn-back exit-link" href="../index.html">exit to Chronicles ▸</a>
      </div>
    </div>`;
}

function jobCard(r, dispatch) {
  const p = posterOf(r);
  const kiros = r.type === 'kiros';
  return html`
    <div class=${'card job' + (kiros ? ' kiros' : '')} key=${r.id} onClick=${() => dispatch({ type: 'OPEN_BRIEF', id: r.id })}>
      <div class="job-fixer">
        <img class="fixer-face sm" src=${portraitSrc(p.id)} alt=${p.name} draggable="false" />
        <div>
          <div class=${'fixer-name' + (kiros ? ' violet' : '')}>${p.name}</div>
          <div class="fixer-tag">${p.tag}</div>
        </div>
      </div>
      <div class="name">${r.target}</div>
      <div class="line">${r.brief}</div>
      <div class="tags">
        ${missionOf(r) !== 'heist' ? html`<span class="tag white">${MISSION_LABEL[missionOf(r)]}</span>` : null}
        <span class=${'tag ' + GRADE_TAG[r.grade]}>${GRADE_LABEL[r.grade]}</span>
        <span class="tag">${r.yen.toLocaleString()} credits</span>
        <span class="tag">stakes chrome ${r.stake}</span>
        ${r.intel ? html`<span class="tag violet">intel</span>` : null}
      </div>
    </div>`;
}
