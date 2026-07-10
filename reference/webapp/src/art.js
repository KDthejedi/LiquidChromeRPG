// CHRONICLES · CHROME — inline SVG art. No image files; everything is markup
// that inherits the theme's neon. Rendered through <Svg/> in ui.js.

// The sprawl at night, seen through rain — for the title and cold open. A low
// skyline, a bruised sky, a single sign burning in a dead language.
export const SKYLINE = `
<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" class="art-skyline" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="ch-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0a0416"/>
      <stop offset="0.55" stop-color="#160a22"/>
      <stop offset="1" stop-color="#04070d"/>
    </linearGradient>
    <linearGradient id="ch-glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f43f5e" stop-opacity="0.0"/>
      <stop offset="1" stop-color="#f43f5e" stop-opacity="0.28"/>
    </linearGradient>
    <filter id="ch-bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs>
  <rect width="400" height="240" fill="url(#ch-sky)"/>
  <rect width="400" height="240" fill="url(#ch-glow)"/>
  <!-- distant towers -->
  <g fill="#0c1420">
    <rect x="10" y="120" width="34" height="120"/>
    <rect x="52" y="86" width="26" height="154"/>
    <rect x="86" y="140" width="40" height="100"/>
    <rect x="150" y="70" width="30" height="170"/>
    <rect x="188" y="110" width="46" height="130"/>
    <rect x="250" y="92" width="28" height="148"/>
    <rect x="286" y="132" width="40" height="108"/>
    <rect x="336" y="80" width="30" height="160"/>
    <rect x="372" y="128" width="22" height="112"/>
  </g>
  <!-- lit windows -->
  <g fill="#2dd4bf" opacity="0.7">
    <rect x="58" y="96" width="4" height="5"/><rect x="66" y="110" width="4" height="5"/>
    <rect x="156" y="84" width="4" height="5"/><rect x="164" y="120" width="4" height="5"/>
    <rect x="256" y="104" width="4" height="5"/><rect x="342" y="96" width="4" height="5"/>
    <rect x="196" y="132" width="4" height="5"/><rect x="300" y="150" width="4" height="5"/>
  </g>
  <g fill="#38bdf8" opacity="0.6">
    <rect x="72" y="132" width="4" height="5"/><rect x="170" y="150" width="4" height="5"/>
    <rect x="264" y="130" width="4" height="5"/><rect x="352" y="140" width="4" height="5"/>
  </g>
  <!-- the burning sign -->
  <g filter="url(#ch-bloom)">
    <rect x="206" y="150" width="4" height="40" fill="#f43f5e" opacity="0.9"/>
    <circle cx="208" cy="146" r="7" fill="#f43f5e"/>
    <circle cx="208" cy="146" r="3" fill="#ffd1d9"/>
  </g>
  <!-- rain -->
  <g stroke="#7dd3fc" stroke-width="1" opacity="0.14">
    <line x1="30" y1="0" x2="22" y2="240"/><line x1="90" y1="0" x2="82" y2="240"/>
    <line x1="150" y1="0" x2="142" y2="240"/><line x1="210" y1="0" x2="202" y2="240"/>
    <line x1="270" y1="0" x2="262" y2="240"/><line x1="330" y1="0" x2="322" y2="240"/>
    <line x1="380" y1="0" x2="372" y2="240"/>
  </g>
</svg>`;

// A deck: the console you jack into. Small glyph for headers / the title mark.
export const DECK_GLYPH = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="8" y="26" width="48" height="26" rx="3" fill="#0c1420" stroke="#2dd4bf" stroke-width="2"/>
  <rect x="14" y="32" width="36" height="9" rx="1" fill="#04070d" stroke="#38bdf8" stroke-width="1"/>
  <circle cx="18" cy="47" r="2" fill="#f43f5e"/>
  <circle cx="26" cy="47" r="2" fill="#2dd4bf"/>
  <!-- the jack cable arcing up -->
  <path d="M44 26 C46 14 30 12 32 2" fill="none" stroke="#a78bfa" stroke-width="2"/>
  <circle cx="32" cy="3" r="3" fill="#a78bfa"/>
</svg>`;

// A flat line — the thing every cowboy is running from. Used on the flatline
// ending; the pulse before it goes flat.
export const FLATLINE = `
<svg viewBox="0 0 320 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="art-ekg">
  <path d="M0 30 L120 30 L130 30 L138 8 L148 52 L156 30 L170 30 L320 30"
        fill="none" stroke="#f43f5e" stroke-width="2"/>
</svg>`;
