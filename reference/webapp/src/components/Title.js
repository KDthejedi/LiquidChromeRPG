import { html } from '../ui.js';
import { SETTING } from '../world.js';

export function Title({ state, dispatch }) {
  // A run exists once the build is confirmed at the doctor.
  const inRun = !!(state && state.characterId && state.stats && !state.ending);
  return html`
    <div class="wrap fade title-screen">
      <div class="title-splash" aria-hidden="true"></div>
      <div class="kicker">Cyberpunk Chronicles · Volume I</div>
      <h1 class="title-art" aria-label="Liquid Chrome">
        <img src="./assets/title.jpg" alt="Liquid Chrome" width="1280" height="1280" decoding="async" />
      </h1>
      <div class="spacer"></div>
      <div class="panel">
        <div class="prose">
          <p>${SETTING}</p>
          <p class="dim">Our planet is carved up between a handful of corporate blocs, all buying up tech, resources and transit.</p>
        </div>
      </div>
      <div class="panel">
        <div class="prose">
          <p class="dim">You were the best at what you did — and it got you burned. They didn't kill you. They put
          a toxin in the loop that burned the liquid chrome in your nerves to scar tissue, then dumped your body in
          the slums to rot, the net bright and forever out of reach. Then a voice with no name reached back across
          the dead grid, holding your life out like bait — for a while, and for a price.</p>
        </div>
      </div>
      ${inRun
        ? html`
          <button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'contacts' })}>Continue ▸</button>
          <button class="btn btn-ghost" onClick=${() => window.confirm('Start over? The current run is lost.') && dispatch({ type: 'NEW_GAME' })}>New game</button>`
        : html`<button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'outfit' })}>Who jacks in? ▸</button>`}
      <a class="btn-back exit-link" href="../index.html">◂ Exit to Cyberpunk Chronicles</a>
    </div>`;
}
