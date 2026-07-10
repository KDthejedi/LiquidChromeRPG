# Step 0 — Audit & Migration Plan
*Evolving Liquid Chrome into the solo tactical narrative RPG (working title: Volume I continues).*
*Status: **APPROVED** with amendment — isometric presentation (classic
isometric-cyberpunk-RPG vein). Decisions D1–D5 locked. Execution continues in
a dedicated project; this document plus the build handoff are its seed. Start
at Phase 1 of §7.*

---

## 1. What exists — architecture map

**Framework.** No-build ES modules served static. Vendored React (global) + `htm`
tagged templates (`src/ui.js`, 15 lines — the entire "framework glue"). No
bundler, no TypeScript, no dependencies to install. Runs from `python -m
http.server`. ~4,100 lines of source.

**State.** Exactly the store the spec asks for already: one reducer
(`src/state.js`), every mutation an action, mirrored to localStorage
(`chronicles-chrome-v1`, SAVE_VERSION 6, single slot). Screen routing is a
`state.screen` switch in `App.js`. Recently hardened by a 1,500-game simulated
sweep + 120k-action fuzz (zero crashes).

**Content/data.** `src/world.js` is the data layer: districts, factions,
characters, abilities, vehicles (with weapons), hardware, runs/contracts,
intel, endings — plain JS objects with small `apply` effect functions. Already
"content defines, code renders," just without schema validation.

**Procedural engine.** `src/engine.js`: the netrun lattice generator (columns
of nodes, ICE, trace clock, loot), heist/rescue beat generators, travel math,
seeded art-variant dealing (`artSeed`). RNG is unseeded `Math.random`
otherwise.

**Systems.** Turn-based combat (`Combat.js` — strike/aim/guard + a
data-driven chrome-ability layer with 16 active/passive effects), two
mini-games (LockPick timing, Hack cipher), pursuit chase, road encounters
with vehicle weapons, morality ledger, intel/dossier grading, leveling.
Synthesized SFX (oscillators, zero audio files) + music track manager with
mood switching (title/overworld/heist) and mute. Canvas matrix-rain renderer.

**Art.** Complete and first-class: 8 portraits (4 PCs + Kiros + 3 fixers),
27 city banners, 5 aerial maps, 16 ending shots, 9 interiors, 8 vehicles,
6 intro stills, cover/title. Manifest-by-convention (`portraitSrc(id)` etc.)
with graceful `onError` fallbacks everywhere. Remaining wishlist documented in
`PROMPTS.md` §7.

**Fiction.** `STORY.md` (canon bible), `WRITING.md` (voice guide + the
author's calibration samples — ready-made system-prompt material), all in-game
copy in one register.

**❗ The handoff's one wrong assumption:** there is **no AI narrative
generation wired anywhere** — zero API calls in the game (verified by grep
across the repo). The "AI-driven dynamic content" is procedural, not LLM. The
adventure engine is real and reusable; the AI layer is a *new build*, with a
real constraint (§5, Risk 1).

## 2. Setting bible (extracted)

- **World:** 2055. Corps rule everything; space is a closed door; we are alone.
  Ten named districts across a world sprawl (Keihin home, Hainan Reach, Songdo
  Spire, Karachi Deep, Sevastopol, Marrakech Ring, Cayo Verde, Cordillera,
  Lagos, Tidewater), each answering to a bloc.
- **Factions in place:** the corp blocs; four burner corps (Kaisei, BiTechs
  Biomedical, Griot Intelligence, the Nakamura Directorate); the fixers
  (Julius Deane, the Finn, a voice with no name); Kiros's family business
  (Prophet · reads the wire, Queen · runs the money, Rhys · moves the muscle);
  street gangs.
- **Slang/terms (canon):** the wire, the grid/net, jack in, ICE, black-site
  countermeasures, the trace, liquid chrome, **chrome** (the body's reserve),
  **credits**, exploits (zero-days), fixers, the burn, flatline.
- **Metaphysics:** strictly technological today. "We are alone" is canon — the
  awakened track must be introduced *carefully* (see §6, decision D3).
- **Voice:** WRITING.md — visceral, present, contracted; comma-momentum then a
  blade; menace in the tech; quotable closes.

## 3. Reuse map — existing system → spec system

| Spec asks for | Exists today | Verdict |
|---|---|---|
| Central store, loggable events | `state.js` reducer + actions | **Keep**, extend |
| Contract loop (fixer→prep→run→pay→spend) | Board → brief → mission → debrief → clinic/garage | **Keep** — this IS the loop |
| Intrusion minigame w/ trace clock, IC, loot | The netrun lattice (`Run.js` + `layIce`) | **Keep nearly as-is** — spec §5 is already built |
| Two-approach missions (stealth vs loud) | Heist approaches: Ghost / Hard entry / Wire job | **Keep**, deepen |
| Turn-based combat | `Combat.js` (1v1, effects-in-data) | **Evolve**: zones, 2-action economy, enemy archetypes, AI tags |
| Shared ability data schema | `combat:{kind,cost,effect,uses}` descriptors | **Generalize** into the dual-track schema |
| Hub locations | Fixer board, clinic, garage, training deck | **Keep**; add safehouse + awakened vendor |
| Skill-gated dialogue | Hardcoded step components (`Contact.js`) | **Refactor** → JSON node trees + one runner |
| Attributes/skills | 5 stats (strength/speed/stealth/tech/marksmanship) driving derived knobs | **Map** (see D2) |
| Chrome-vs-X tradeoff | Chrome exists as resource; no erosion mechanic | **Build** (see D3) |
| Faction standing | Morality ledger + burner enmity (flavor only) | **Build** numeric standing on the ledger pattern |
| Flags/consequences | `morality`, `intel`, `dossier`, `runsDone` | **Generalize** into a flag store |
| Save/load | localStorage, 1 slot, versioned | **Extend**: slots + export/import JSON |
| Seeded RNG | `artSeed` pattern only | **Build** small seeded PRNG, thread through engine |
| Schema validation | none | **Build** tiny hand-rolled validators (no-build constraint) |
| AI narrative service | none | **Build new** — see Risk 1 |
| Portraits/scene art/VFX hooks | Portraits+banners done; VFX = CSS transitions only | VFX library is a **new build** (canvas/CSS) |
| Audio manager w/ silent fallbacks | Synth SFX + music moods, mute, no-file-safe | **Keep** — already matches spec |
| Mobile-first | Yes (built touch-first throughout) | **Keep** |
| Accessibility floor | Partial (aria labels); no reduced-motion | **Build** |

Nothing gets discarded. The roguelite loop *is* the vertical slice's skeleton.

## 4. What must be refactored vs built new

**Refactor (in place, keeping the game playable):**
R1. Dialogue: extract Contact/Brief/Debrief prose into JSON node trees with
    conditions/effects; one `Dialogue` runner renders them. Kiros's intro is
    the pilot conversion.
R2. Stats: introduce the attribute+skill split per D2, with a save migration.
R3. Flags: fold morality/intel/dossier into one namespaced flag store the
    dialogue conditions read.
R4. RNG: seeded rolls everywhere in engine/combat (repro bugs, replays).

**Build new:**
B1. Zone-based encounter system (zones, cover, LoS, 2 actions, initiative,
    4–6 enemy archetypes in JSON, utility-scored behavior tags).
B2. VFX library (canvas/CSS: tracer, sparks, shockwave, shield hex, glitch
    tether, glyphs, shake, chromatic split) + reduced-motion mode.
B3. Awakened track: channeling abilities on the shared schema, strain
    resource, overchannel harm (D3 for the fiction).
B4. Chrome↔awakened erosion mechanic (D3 for the name).
B5. Skill-check presentation layer (descriptors: "Risky / Even odds /
    Favored", cinematic prose results, detail toggle).
6. Faction standing + job gating.
B7. Save slots + export/import.
B8. AI narrative service module (prompt templates, world-bible injection,
    strict output contracts, authored fallbacks, token budget) — *optional
    enhancement layer per Risk 1*.
B9. Character creation (4 archetype templates = the existing four operatives,
    + custom).

## 5. Risks

**Risk 1 — AI calls from a static site.** There is no server. Calling an LLM
API from the client means exposing a key. Mitigations, in order of preference:
(a) **authored-first**: every AI touchpoint ships with authored fallbacks (the
spec demands this anyway), so the game is 100% playable with AI off; (b) AI
activates only when the player pastes their own key (stored locally, never
committed); (c) a proxy worker later if this ever hosts publicly. Recommend
(a)+(b) for the slice.

**Risk 2 — no-build stack vs "zod + TS" guidance.** Adding a bundler would be
a rewrite-shaped decision the spec says to avoid without a blocker. It isn't
one: hand-rolled ~80-line validators cover the JSON content schemas, and JSDoc
types keep editors helpful. Recommend keeping no-build.

**Risk 3 — content volume.** 2–3 hours authored play (three contracts, legwork,
dialogue trees) is the single biggest lift — bigger than any system. The
phases front-load systems; writing must run in parallel from Phase 2.

**Risk 4 — the metaphysics retcon.** Awakened forces contradict "strictly
tech" canon unless introduced as *of the wire, not of the stars* (D3). Needs
your sign-off before any awakened content is written.

**Risk 5 — save compatibility.** D2's stat split breaks v6 saves. Bump to v7
with a migration (attributes derived from old stats) or a clean break at the
character-select. Recommend migration; it's ~20 lines.

## 6. Decisions needing your approval (D1–D4)

**D1 — Evolve in place.** Wrap the RPG around the live game in
`cyberpunk-chronicles/chrome/`, keeping it playable at every merge (the
established slice-PR workflow). No fork, no parallel app. *Recommended.*

**D2 — Attribute mapping.** Spec's Body/Reflex/Mind/Presence/Resonance vs
existing strength/speed/stealth/tech/marksmanship. Proposal:
- **Body** ← strength · **Reflex** ← speed · **Mind** ← tech ·
  **Presence** ← *new* · **Signal** ← *new* (see D3)
- Old stealth & marksmanship become **skills** (Infiltration, Firearms) under
  Reflex, alongside new skills (Negotiation, Streetwise, Channeling, …).
- Derived knobs (chrome pool, trace, exploits) re-derive from the new sheet so
  the existing engine keeps working unmodified.

**D3 — The metaphysics + names (original IP, from our own lore).** The world's
recurring image is the net *humming* past walls you can't touch. Proposal: the
awakened talent is hearing and channeling that — **the Hum**. The governing
attribute: **Signal**. Chrome installed in the body drowns it in noise: the
eroded quality is **Static** ("every piece of chrome adds Static; enough of it
and the Hum goes quiet for good"). Awakened forces are *of the wire* — the
grid woke somewhere along the way — so "we are alone in the universe" stays
true: whatever answers isn't from out there, it's from in here.

**D4 — AI layer scope.** Authored-first with optional user-key enhancement
(Risk 1). AI writes ambient texture and combat-log variants inside guardrails
(WRITING.md + world bible injected); plot beats always authored.

**D5 — Isometric presentation (approved direction).** Walkable isometric
scenes in the vein of classic isometric cyberpunk RPGs: explore, talk,
interact, and (Phase 3) fight turn-based in the same view. Rendering is
**code-drawn canvas** — neon wireframe floors/walls in the house palette,
actors as portrait-chips with glow rings, tap-to-move pathfinding — no tile
sprites, no character sprites. This keeps art 100% code-driven, sidesteps
AI-sprite consistency entirely, and literalizes the fiction: the world reads
as the grid. Scene art (§7 backdrops) letterboxes above the iso view.

## 7. Phase map (amended for isometric, grounded in this codebase)

- **P1 Skeleton:** attribute/skill data model (Body/Reflex/Mind/Presence/
  Signal) + v7 save migration → save slots + export/import → the **isometric
  engine prototype**: the safehouse rendered as a walkable iso scene with
  portrait, prose, and interactable hotspots. *Stop for approval.*
- **P2 Loop:** character creation (4 operatives as archetypes + custom) →
  Kiros/fixer conversation on the dialogue runner with visible skill checks →
  one contract with stealth/loud approaches (evolved heist) → payout/advance.
- **P3 Combat:** zone encounters, 4 archetypes, VFX library, prose log.
- **P4 Depth:** netrun-as-intrusion polish, the Hum abilities + Static
  tradeoff, faction standing, contracts 2–3.
- **P5 Polish:** audio moods, transitions, tuning, full playtest of the slice.

---

*Prepared as Step 0 of the build handoff. Nothing beyond this document has
been changed. Approve, amend, or veto D1–D4 and the phase map to unblock
Phase 1.*
