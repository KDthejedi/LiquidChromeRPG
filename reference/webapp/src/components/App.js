import { html, useReducer, useEffect, useRef } from '../ui.js';
import { reducer, initialState, loadState, saveState } from '../state.js';
import { Title } from './Title.js';
import { Outfit } from './Outfit.js';
import { Montage } from './Montage.js';
import { Contact } from './Contact.js';
import { Doctor } from './Doctor.js';
import { Contacts } from './Contacts.js';
import { Clinic } from './Clinic.js';
import { Map } from './Map.js';
import { Garage } from './Garage.js';
import { Brief } from './Brief.js';
import { Heist } from './Heist.js';
import { Rescue } from './Rescue.js';
import { Pursuit } from './Pursuit.js';
import { Encounter } from './Encounter.js';
import { missionOf } from '../world.js';
import { Debrief } from './Debrief.js';
import { LevelUp } from './LevelUp.js';
import { Trainer } from './Trainer.js';
import { Ending } from './Ending.js';
import { MuteButton } from './MuteButton.js';
import { ExitButton } from './ExitButton.js';
import { sfx, music } from '../systems/audio.js';

// CHROME runs as a self-contained app — its own reducer + localStorage save,
// so a refresh or app-switch rehydrates and resumes in place.
export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState() || initialState());

  useEffect(() => { saveState(state); }, [state]);

  const lastSfx = useRef(0);
  useEffect(() => {
    if (state.sfx && state.sfx.key !== lastSfx.current) {
      lastSfx.current = state.sfx.key;
      sfx.play(state.sfx.name);
    }
  }, [state.sfx]);

  const S = state.screen;

  // Score follows the screen: the title theme carries the title + character
  // select, a random heist track scores a run, and the overworld bed plays
  // across every other screen.
  useEffect(() => {
    if (S === 'title' || S === 'outfit') music.playTheme();
    else if (S === 'run') music.playHeist();
    else music.playGame();
  }, [S]);

  // Autoplay is gated until the player interacts — unlock on the first tap.
  useEffect(() => {
    const unlock = () => music.resume();
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);
  let screen;
  if (S === 'title') screen = html`<${Title} state=${state} dispatch=${dispatch} />`;
  else if (S === 'outfit') screen = html`<${Outfit} state=${state} dispatch=${dispatch} />`;
  else if (S === 'montage') screen = html`<${Montage} state=${state} dispatch=${dispatch} />`;
  else if (S === 'contact') screen = html`<${Contact} state=${state} dispatch=${dispatch} />`;
  else if (S === 'doctor') screen = html`<${Doctor} state=${state} dispatch=${dispatch} />`;
  else if (S === 'clinic') screen = html`<${Clinic} state=${state} dispatch=${dispatch} />`;
  else if (S === 'map') screen = html`<${Map} state=${state} dispatch=${dispatch} />`;
  else if (S === 'garage') screen = html`<${Garage} state=${state} dispatch=${dispatch} />`;
  else if (S === 'brief') screen = html`<${Brief} state=${state} dispatch=${dispatch} />`;
  else if (S === 'run') {
    const m = missionOf(state.run);
    screen = m === 'rescue'
      ? html`<${Rescue} state=${state} dispatch=${dispatch} />`
      : m === 'pursuit'
        ? html`<${Pursuit} state=${state} dispatch=${dispatch} />`
        : html`<${Heist} state=${state} dispatch=${dispatch} />`;
  }
  else if (S === 'debrief') screen = html`<${Debrief} state=${state} dispatch=${dispatch} />`;
  else if (S === 'levelup') screen = html`<${LevelUp} state=${state} dispatch=${dispatch} />`;
  else if (S === 'trainer') screen = html`<${Trainer} state=${state} dispatch=${dispatch} />`;
  else if (S === 'encounter') screen = html`<${Encounter} state=${state} dispatch=${dispatch} />`;
  else if (S === 'ending') screen = html`<${Ending} state=${state} dispatch=${dispatch} />`;
  else screen = html`<${Contacts} state=${state} dispatch=${dispatch} />`;

  // key forces a remount per screen, replaying the fade — the jack-in cut.
  return html`<div data-theme="chrome"><div key=${S}>${screen}</div><${ExitButton} /><${MuteButton} /></div>`;
}
