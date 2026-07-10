# CLAUDE CODE BUILD HANDOFF
## Project: Evolve existing web adventure into a solo cyberpunk fantasy RPG

*(Author's original working spec. Where this conflicts with WORLD.md §12 — the
approved decisions that came out of the audit this document commissioned —
WORLD.md wins. Known deltas: "Resonance" became **Signal** (D2/D3, with the
Hum/Static metaphysics); zone-based combat became **same-view isometric**
combat (D5); "no levels, buy directly with Cred" became **a point every 2
contracts** (WORLD.md §9). Everything else here stands as the working spec.)*

You are the lead engineer on a solo developed narrative RPG. The existing codebase is a procedural, choose your own adventure style web app set in an original cyberpunk universe. Your job is to evolve it, in phases, into a single player tactical narrative RPG in the spirit of classic isometric cyberpunk fantasy RPGs (turn based combat, deep dialogue with skill checks, a lone operative taking contracts in a neon noir city). Do not use any names, terms, or lore from existing licensed franchises. This is original IP. All world names, factions, slang, and metaphysics come from the fiction already in this project or will be invented fresh in its voice.

---

## STEP 0: AUDIT BEFORE YOU BUILD

Before writing any new code:
1. Read the entire existing codebase. Map the architecture: framework, state management, routing, how scenes/passages are stored, how the AI narrative generation is wired (API calls, prompts, response parsing), how portraits and art assets are loaded, and how player state persists.
2. Read all existing fiction, lore, and world documents in the repo. Extract the setting bible: city name, districts, factions, slang, tone, named characters, and any established rules about technology and the supernatural.
3. Produce a short written report: what exists, what is reusable, what must be refactored, and any risks. Wait for my approval on the migration plan before restructuring anything.

The narrative engine and the AI driven dynamic content are assets, not legacy cruft. We are not replacing the adventure system. We are wrapping an RPG skeleton around it.

---

## CREATIVE VISION

**Pitch:** A lone freelance operative runs contracts in a city where illegal tech and awakened forces coexist. Every job is a heist shaped problem: get in, get paid, get out, and live with the choices. The player talks, sneaks, hacks, shoots, or channels their way through, and the city remembers.

**Pillars (in priority order):**
1. **Prose first.** Gritty noir narration is the core experience. Text quality beats visual spectacle every time.
2. **Meaningful choice.** Skill checks, faction standing, and prior decisions visibly change outcomes. No fake branches.
3. **One operative, many builds.** Solo protagonist. Replayability comes from build variety (street muscle, infiltrator, console jockey, adept), not party management.
4. **Hybrid narrative.** Authored story spine with AI generated connective tissue, ambient detail, and reactive flavor. Authored content controls plot beats; generated content controls texture.
5. **Tactical but readable combat.** Turn based encounters that resolve in 5 to 10 minutes, playable comfortably on desktop and mobile web.

**Tone reference:** hard boiled noir narration, short declarative sentences, rain and neon, cynicism with a conscience. Match the voice of the existing fiction files exactly.

---

## CORE SYSTEMS SPEC

### 1. Character system
- **Attributes (5):** Body, Reflex, Mind, Presence, Resonance (the stat governing both deep tech affinity and awakened talent, per this world's metaphysics; rename to match existing lore if a term already exists).
- **Skills (10 to 14):** grouped under attributes. Examples: Firearms, Close Combat, Infiltration, Electronics, Intrusion (hacking), Negotiation, Intimidation, Streetwise, Perception, Channeling (magic analog), Medicine, Engineering.
- **Skill checks:** attribute + skill vs difficulty, dice pool or 2d10 style under the hood, always shown to the player as a clean probability or descriptor ("Risky", "Even odds", "Favored"). Show the roll result cinematically in prose, not as raw math, with an optional detail toggle.
- **Advancement:** earn Cred (XP) from contracts and discoveries. Spend between missions. No levels; buy skills and perks directly.
- **The tradeoff mechanic:** augmenting the body with illegal chrome raises combat and tech power but erodes Resonance, weakening awakened abilities and certain social/perception options. This tension is the build defining decision. Invent an original name for this eroded quality from the world's lore.

### 2. Dual track abilities
- **Tech track:** cyberware, drones, intrusion programs, grenades and gadgets.
- **Awakened track:** channeled abilities (offense, veil/illusion, sensing, barrier, healing) fueled by a strain/fatigue resource, not a mana bar. Overchanneling causes lasting harm.
- Both tracks share one underlying "ability" data schema so effects, targeting, costs, and VFX are defined in data, not hardcoded.

### 3. Combat
- **Format:** turn based, zone/node based positioning (abstract positions like Cover Left, Open Ground, Catwalk, Flank) rather than a full grid. This keeps it web friendly and mobile playable while preserving tactical decisions (position, cover, line of sight, movement cost).
- **Turn economy:** 2 actions per turn (move, attack, ability, item, interact). Initiative from Reflex.
- **Enemies:** 4 to 6 archetypes for the vertical slice (ganger, enforcer, drone, adept, spirit entity, security host avatar). Each defined in JSON with stats, AI behavior tag, and loot table.
- **AI:** simple behavior tags (aggressive, cautious, support, ambusher) driving a utility scoring function. No pathfinding needed with zone based movement.
- **Presentation:** combat happens in a styled encounter view: character portraits, zone diagram, code driven VFX (particles, screen shake, chromatic pulses, glitch tethers, all canvas/CSS/SVG, no image based effects). Prose combat log narrates every action in the noir voice, AI generated variants allowed with authored fallbacks.

### 4. Dialogue and skill checks
- Node based dialogue trees stored as JSON, with:
  - Skill gated options tagged and visible ("[Intimidation] Lean in close.")
  - Attribute/faction/flag conditions
  - Consequences written to a global flag store
- AI generation may write incidental NPC banter and reactive flavor lines within authored guardrails (system prompt includes voice guide, world bible, and current scene facts). Plot critical dialogue is always authored.

### 5. Intrusion (the hack space)
- A minigame layer reusing the choose your own adventure engine: entering a secure host is a short procedural text adventure with its own clock (trace counter), nodes, IC threats, and loot. This converts the existing CYOA system into a subsystem instead of discarding it.

### 6. World layer
- **Structure:** one district for the vertical slice. A hub (safehouse + 3 to 4 visitable locations: fixer bar, clinic, gear dealer, talismonger equivalent) and mission sites.
- **Contract loop:** meet fixer, accept job, prep (buy gear, gather intel via legwork scenes), run the mission, get paid, spend, repeat. Legwork discoveries unlock easier paths in missions.
- **Faction standing:** 3 factions minimum, tracked numerically, referenced in dialogue conditions and job availability.
- **Persistence:** full save/load (localStorage or IndexedDB plus export/import as JSON file). Multiple save slots.

---

## ART AND AUDIO INTEGRATION
- **Portraits:** first class asset. Every named NPC and the player character get a portrait slot (existing generated portraits are the style reference; a manifest JSON maps character IDs to image files). Build graceful fallback silhouettes.
- **Scene art:** one wide establishing image per location, displayed as a letterboxed header with a subtle parallax or scanline treatment.
- **VFX:** 100 percent code driven (canvas/CSS). Build a small reusable effect library: muzzle tracer, impact sparks, shockwave ring, shield hex, glitch tether, channeling glyphs, screen shake, chromatic split. Abilities reference effects by name in their JSON.
- **Audio:** hook points for music tracks per scene mood (combat, hub, tension, aftermath) and a small SFX map. Assets will be supplied separately (Suno pipeline); build the manager now with silent fallbacks.

---

## TECHNICAL GUIDANCE
- Keep the existing framework unless the audit reveals a blocker; report before proposing a rewrite.
- **Everything is data driven:** abilities, items, enemies, dialogue, missions, and zones live in JSON/TS content files, validated with a schema (zod or equivalent). Code renders and resolves; content defines.
- Central game state store with a single reducer/event pattern so every state change is loggable, replayable, and save serializable.
- AI narrative calls: isolate in one service module with prompt templates, world bible injection, strict output contracts (JSON where structured), authored fallbacks on failure, and a token budget guard.
- Deterministic RNG with seeded rolls so bugs are reproducible.
- Mobile first responsive layout. The whole game must be playable one handed on a phone.
- Accessibility floor: keyboard navigation, visible focus, reduced motion mode that disables shake and heavy particles.

---

## PHASED ROADMAP

**Phase 1, Skeleton (approve before proceeding):** audit report, migration plan, character data model, save/load, one hub location rendered with portrait and prose.

**Phase 2, The Loop:** character creation (4 archetype templates plus custom), fixer conversation with skill checks, one complete mission with two approaches (stealth vs loud), payout and advancement screen.

**Phase 3, Combat:** zone based encounter system, 4 enemy archetypes, VFX library, combat prose log.

**Phase 4, Depth:** intrusion minigame, awakened abilities, the chrome vs Resonance tradeoff, faction standing, second and third contracts.

**Phase 5, Polish:** audio hookup, transitions, difficulty tuning, full playtest pass of the vertical slice: one district, three contracts, roughly 2 to 3 hours of play.

At the end of each phase, stop and deliver: what was built, how to test it, and open questions. Do not run ahead.

---

## DEFINITION OF DONE (VERTICAL SLICE)
A new player can create an operative, take a contract from a fixer, do legwork, complete the mission via at least two distinct approaches, fight one tactical encounter, hack one host, get paid, spend Cred, and see a faction react to their choices, entirely in the established noir voice, on a phone, with saves that survive a browser restart.
