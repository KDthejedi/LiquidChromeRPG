import { html } from '../ui.js';
import { Hud } from './Hud.js';
import { INTEL, characterOf } from '../world.js';
import { finaleChoices } from '../state.js';

export function Debrief({ state, dispatch }) {
  const o = state.lastOutcome || {};
  const won = o.kind === 'won';
  const c = characterOf(state.characterId);
  const burner = c.burner || 'them';
  const fill = (t) => (t || '').replace(/\{burner\}/g, burner);
  const frag = o.intelId ? INTEL[o.intelId] : null;
  const choices = o.finale ? finaleChoices(state) : [];
  const gradeNote = { clean: 'Clean run; the fragment came out sharp and whole.',
                      rushed: 'You got out hot, so the fragment came partial.',
                      traced: '' }[o.grade] || '';

  return html`
    <div class="wrap fade">
      <${Hud} state=${state} />
      <div class="kicker">${o.hunt ? (won ? 'The hunt' : 'Thrown back') : (won ? 'Pulled' : 'Traced')}</div>

      <div class="panel">
        <div class="prose">
          ${won
            ? (o.hunt
                ? html`<p>You're through their core and standing in the wreck of it. Every record, every
                    account, every thing they took from you — spilled open in front of you now, naked and yours.</p>`
                : html`<p>You pull the data and jack clear before the ice can close its hand. Your eyes crack open
                    on the flat hum of the room: the fan, the dead monitor glow, the last of the liquid chrome fading
                    off your tongue. You're out, and you're whole, and the score's already burning on the deck.
                    ${o.gained ? html` Some loose money rode out with it — <span class="teal">${o.gained} credits</span>.` : ''}</p>`)
            : html`
                <p>Before you even open your eyes, you feel it. The trace bites down right as you're clawing your way
                out of the wire, a pressure crawling up the connection, a small touch is death. When your eyes finally
                crack open to a blur of ceiling and dead monitor glow, you don't wait for the world to sharpen. You go
                straight for the electrodes, ripping them off your skull in fistfuls, adhesive peeling away with hair
                and skin, liquid chrome taste flooding the back of your throat. Because that thing is still coming. The
                ICE, black and patient, threading itself through the open jacks like a parasite that's found a warm
                body, its next host. You can sense its glee as it closes in.</p>
                <p>You get the last one off and sit there shaking, electronics around you still humming, sweat gone
                cold down your spine. Doesn't matter. It almost touched you. But somehow in that half second before you
                tore free, it got a taste — your signature, the raw shape of what you are when you're naked in the grid.
                It knows you now. That thought alone kills the run dead. You're done for tonight. Maybe longer.</p>`}
          ${o.saved ? html`<p class="rose">Your heart stopped in there. The trauma stabiliser counted to three,
            argued — and won, burning itself out to do it. The slot's empty now. The clinic sells another.</p>` : null}
          <p class="dim">Jacking out cost you ${o.nerveCost} chrome.${won && gradeNote ? ' ' + gradeNote : ''}</p>
        </div>
      </div>

      ${frag ? html`
        <div class="panel">
          <div class="kicker">${o.turn ? 'The turn' : frag.title}</div>
          <div class="prose"><p>${fill(frag.text)}</p>
            ${o.turn ? html`<p class="rose">The debt's paid. The board's yours now, and there's one job left on it.</p>` : null}</div>
        </div>` : null}

      ${o.leveled ? html`
        <div class="panel"><div class="prose">
          <p class="teal">The work leaves a mark. You've levelled up. Spend the point on a stat or new chrome.</p>
        </div></div>` : null}

      ${o.finale
        ? html`
          <div class="kicker">How do you walk out?</div>
          ${choices.map(ch => html`
            <button class=${'btn ' + (ch.ending === 'vanish' ? 'btn-primary' : 'btn-danger')}
              key=${ch.ending} onClick=${() => dispatch({ type: 'CHOOSE_ENDING', ending: ch.ending })}>
              ${ch.label} — <span class="dim">${ch.note}</span></button>`)}`
        : state.points > 0
          ? html`
            <button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'levelup' })}>
              Level up — ${state.points} ${state.points === 1 ? 'point' : 'points'} ▸</button>
            <button class="btn btn-ghost" onClick=${() => dispatch({ type: 'GO', screen: 'contacts' })}>${o.turn ? 'To the board' : 'Back to the board'}</button>`
          : html`<button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'contacts' })}>${o.turn ? 'To the board ▸' : 'Back to the board ▸'}</button>`}
    </div>`;
}
