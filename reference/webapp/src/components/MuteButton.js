import { html, useState } from '../ui.js';
import { sfx } from '../systems/audio.js';

export function MuteButton() {
  const [m, setM] = useState(sfx.muted);
  return html`<button class="mute" aria-label=${m ? 'Unmute' : 'Mute'} title=${m ? 'Unmute' : 'Mute'}
    onClick=${() => { const n = !m; sfx.setMuted(n); setM(n); }}>${m ? '🔇' : '🔊'}</button>`;
}
