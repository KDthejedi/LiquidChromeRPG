import { html } from '../ui.js';

// Always-present quit — leave the game for the Cyberpunk Chronicles hub from any
// screen (from there, Arcadia is one hop back). The run is saved to localStorage,
// so coming back resumes in place.
export function ExitButton() {
  const quit = () => {
    if (window.confirm('Quit to Cyberpunk Chronicles? Your progress is saved.')) {
      window.location.href = '../index.html';
    }
  };
  return html`<button class="exit-home" aria-label="Quit to Cyberpunk Chronicles" title="Quit to Cyberpunk Chronicles"
    onClick=${quit}>⌂</button>`;
}
