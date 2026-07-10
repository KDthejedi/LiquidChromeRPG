# LIQUID CHROME — isometric RPG

All canon (setting, characters, voice, systems, approved design decisions) lives
in **WORLD.md**. Read it before writing any player-facing text or touching game
data — the voice rules (§2), lexicon (§3), and locked palette (§10) are not
negotiable.

## Stack

Static site, no build step, no dependencies, no server keys (decision D4).
ES modules served from `js/`; open via any static server (`.claude/launch.json`
runs `python3 -m http.server 8642`).

- `js/data.js` — operative data (WORLD.md §6 mapped through D2 attributes/skills), vitals derivation
- `js/save.js` — versioned localStorage save (key `liquidchrome_save_v1`)
- `js/scene.js` — isometric canvas renderer: code-drawn neon wireframe, BFS tap-to-move, glow-ring actor chips (D5: no sprites, ever)
- `js/main.js` — UI wiring: operative select, HUD, character sheet, SYS menu

## Conventions

- Colors only from the locked palette in `css/style.css` `:root` (amber = lamplight only).
- Every player-facing string is written in the WORLD.md §2 voice; "credits" always spelled out.
- Phase plan (WORLD.md §12): **P1 done** (sheet, saves, iso safehouse) → P2 loop
  (creation ceremony, fixer talk, one 2-approach contract) → P3 combat → P4 depth
  → P5 polish. Gate at each phase end — keep the game playable at every merge (D1).
