# Liquid Chrome — Game Overview & Godot First-Person Shooter Build Spec

This document describes **Liquid Chrome** (Cyberpunk Chronicles, Volume I), its
playable characters and their abilities, and a **task specification for building
a first-person shooter in Godot** where the player picks any of the **five
characters — including Kiros — to play a mission**.

The existing game is a touch-first web roguelite (React/htm, no build step) under
`cyberpunk-chronicles/chrome/`. The Godot project described in Part B is a **new,
separate 3D FPS** that reuses this world, cast, palette, and systems.

---

# PART A — The game

## The world

The year is **2055**. International corporations rule everything, space travel is
a memory, and every instrument ever built agrees on one cold verdict — we are
alone in this vast expanse we call the universe. So we fight for every inch of
soil we have. Our planet is carved up between a handful of corporate blocs, all
buying up tech, resources and transit.

It is a world of **liquid chrome** — AI tech etched into flesh, the body wired to
the network. You jack in; a run is a walk through a hostile building, physical and
digital at once. The register is spare and literary: neon-noir, restraint over
slang, the tech treated as weather.

### The powers that carved it up

No nations left that matter — only **corporate blocs**, each a controlling power
over tech, resources and transit:

- **The South China Sea consortia** — laundering money through arcology markets.
- **The Japanese technology houses** — old money, new chrome; the home ground.
- **American defense** — where the money finally goes home, under a dead-channel sky.
- **Russian cyber-intelligence** — cold relays and walls built to kill, not to fine.
- **The African intelligence & resource corps** (Griot Intelligence country) —
  resource money and signals traffic.
- **Indian, South American & Caribbean holding companies** — buying up everything
  that isn't nailed down.

The corps that **burned the playable characters** are named, specific enemies:
**Kaisei** (Zen), **BiTechs Biomedical** (Socrates), **Griot Intelligence** (Jackal),
the **Nakamura Directorate** (Hemlock). Each is the endgame target of that
character's personal hunt.

### The sprawl (districts)

You move across a **net-linked megacity** of ten districts, each answering to a
different bloc. (Great source material for FPS mission locations.)

| District | Bloc | Character |
|---|---|---|
| **Keihin** (home) | Japanese technology houses | Neon over black water; the clinic that rebuilt you strung underneath it |
| **Hainan Reach** | South China Sea consortia | A stacked arcology market laundering everything through everything |
| **Songdo Spire** | Korean arcology consortium | A vertical smart-city grown from the sea floor, every wall a screen |
| **Karachi Deep** | South Asian port authority | Freight and contraband change hands in the dark under the cranes |
| **Sevastopol** | Russian cyber-intelligence | Cold relays; walls built to kill, not to fine |
| **Marrakech Ring** | North African finance houses | Old walls, new money; dust and other people's account numbers |
| **Cayo Verde** | Caribbean holding companies | Sun, cut-outs, money that never sleeps in the same account twice |
| **Cordillera** | South American resource corps | Lithium and altitude; mines run straight down, money straight out |
| **Lagos** | African intelligence & resource corps | Griot country — resource money and signals traffic, thick as the heat |
| **Tidewater** | American defense | A thousand miles of arcology under one dead-channel sky |

### The grid, the body, the chair

The **network** (the grid) is a place you go, not a screen you look at. To **jack
in** is to run your nervous system into hostile ice; the toll is paid in **nerve**,
and if the trace catches you it can follow the wire down into the **body** and
flatline you. The corps that burned each character **burned the nerve** —
took away the ability to jack — as a mercy crueller than death. Kiros's clinic
rebuilds it, on loan. Modern security language, not dated jargon: the network / the
grid, jack in, a run, the firewall / countermeasures, black-site (lethal)
countermeasures, an exploit, the trace, New Yen (the currency, ₩).

## The premise

You were **the best at what you did — and got burned for it.** A power you crossed
didn't kill you; they burned your *nerve* (your ability to jack in) and turned you
loose as a warning. Seven grey months later, a voice with no name reaches across
the dead grid:

> "I know what they did. I know what you were. I can give it back — the nerve, the
> reach, all of it — for a while, and for a price. There is a clinic. Come and be
> built again. Then you work for me, and when the debt is paid, you go back for the
> ones who burned you."

That voice is **Kiros**, the handler. The loop: get rebuilt, run jobs across the
sprawl to clear the debt, level up, then hunt the corp that burned you.

## The core loop (web game)

Character select → the rebuild (spend stat points, pick a chrome ability) → the
job board (fixers post work) → travel the city map → run the job → debrief →
level up → repeat → the hunt → an ending.

**Mission types** already in the game: **heist** (get inside, take a piece of
tech), **rescue** (extract a captive to a waiting ride), **pursuit** (run down a
shipment vehicle). Missions are choose-your-own-adventure: pick an approach
(Ghost / Hard entry / Wire job) and work a string of encounters resolved by
stat-weighted **dice**, two **mini-games** (lock-picking, hacking), or **combat**.
Random **road encounters** (ambush / net-snare) can hit you between cities.

## The five stats

Every character has the same five-stat sheet, each **1–10**:

| Stat | In the web game it drives… |
|---|---|
| **Strength** | Nerve pool (how deep you can go) and slower nerve burn |
| **Speed** | Trace resistance; dice for vaulting, fleeing, chases |
| **Stealth** | Trace resistance; sneaking; combat ambush opener |
| **Tech** | Number of exploits; the hacking mini-game; bypass checks |
| **Marksmanship** | Loose New Yen pulled clear; gun combat accuracy & damage |

## The chrome abilities

One signature ability, chosen at the rebuild and expandable on level-up:

| Ability | Effect |
|---|---|
| **Trauma governor** | A second heart that argues with death — survive one otherwise-lethal hit per run. |
| **Signal-ghost lattice** | Your trace smears across a dozen dead addresses; countermeasures are slower to find you. |
| **Overclocked cortex** | One more exploit racked and ready, every run. |
| **Cold-blood regulator** | The chair takes less out of you — nerve burns slower. |
| **Predator optics** | You see the loose money and the openings others miss. |

---

## The characters

Four burned experts jack in — plus **Kiros**, the handler who rebuilt them, added
as a fifth playable option for the FPS (see note). Portraits live in
`cyberpunk-chronicles/chrome/assets/portraits/<id>.png`.

### 1. Zen — Corporate ghost  (`zen`)
- **Stats:** STR 4 · SPD 6 · STE 8 · TECH 9 · MRK 3 · (starting ₩350)
- **Deck:** Kaisei Ghost-7, company issue.
- **Who:** The most feared hacker profile on the grid — and nobody ever knew the
  face behind it was yours. You wore a **Kaisei** badge by day and ran the profile
  by night. When they found what you'd lifted, they didn't fire you — they burned
  the nerve so you could never jack again.
- **Burned by:** Kaisei. **The hunt:** Kaisei Tower.
- **Plays like:** the pure netrunner — hacking and stealth, weak in a stand-up fight.

### 2. Socrates — Struck-off surgeon  (`socrates`)
- **Stats:** STR 6 · SPD 4 · STE 5 · TECH 8 · MRK 6 · (starting ₩300)
- **Deck:** Field-medic rig, heavily modified.
- **Who:** Knows flesh and chrome better than anyone alive — every way to keep a
  body running, and every way to stop one. Struck off for lifting med-tech from the big
  houses and using it on people who couldn't pay. **BiTechs Biomedical** showed you
  mercy of a kind: the nerve, not the throat.
- **Burned by:** BiTechs Biomedical. **The hunt:** the BiTechs vault.
- **Plays like:** durable technician — survivability and tech, middling guns.

### 3. Jackal — Ex-corp military  (`jackal`)
- **Stats:** STR 8 · SPD 6 · STE 5 · TECH 5 · MRK 9 · (starting ₩300)
- **Deck:** Griot field deck, service grade.
- **Who:** Ran black espionage for a corp army, trusted with the whole board — which
  is how you learned what they were hiding. When you moved against your own colonels
  bleeding the corp dry, they hung all of it on you: framed, burned, turned loose.
- **Burned by:** Griot Intelligence. **The hunt:** Griot's inner ring.
- **Plays like:** the soldier — high strength and marksmanship, front-line combat.

### 4. Hemlock — Assassin · poisoner  (`hemlock`)
- **Stats:** STR 5 · SPD 8 · STE 9 · TECH 5 · MRK 8 · (starting ₩200)
- **Deck:** Silent infiltration rig.
- **Who:** Poison and patience — the finest infiltrator no one ever saw. The last
  contract was the trap: a room of your own kind with orders to close your account.
  One let you walk and told you to vanish. You didn't.
- **Burned by:** the Nakamura Directorate. **The hunt:** the Directorate.
- **Plays like:** the assassin — top speed and stealth, silent takedowns, deadly aim.

### 5. Kiros — The handler  (`kiros`) *(FPS-only playable extension)*
- **Suggested stats:** STR 6 · SPD 6 · STE 7 · TECH 9 · MRK 6
- **Who:** The one who bought you back. His jobs come last, and they are never just
  money. In the web game he is the mysterious quest-giver, never seen in the field.
  For the FPS he becomes playable: a veteran fixer-netrunner who owns the building
  from the inside.
- **Signature (new):** **Ghost in the machine** — remotely seizes facility systems
  (cameras blind, turrets flip, doors open) for a short window.
- **Plays like:** the puppetmaster — balanced, tech-dominant, control over the level itself.

> **Note on Kiros:** Kiros is not a playable avatar in the web game (only Zen,
> Socrates, Jackal, Hemlock are). His stats and signature above are an **original
> design for the FPS**, kept consistent with his lore as the handler.

---

## Aesthetic & visual identity

The whole thing should read as **one system** — neon-noir, spare, and moody. The
tech is weather: ambient, unexplained, everywhere.

### Palette

| Role | Colour |
|---|---|
| Background / void | near-black `#04070d` (deep blue-black `#0a0812`) |
| Primary signal | **teal `#2dd4bf`** |
| Secondary signal | blue `#38bdf8` |
| Accent / net | violet `#a78bfa` |
| Danger / alarm / blood | rose `#f43f5e` |
| Ink / text | `#cfe7f2`, dim `#7b93a6` |

Cool palette dominates; **rose is reserved for danger** (alarms, damage, lethal
countermeasures, the blood-red sun of the key art). Districts are lightly tinted to
their controlling bloc so the map reads as contested territory.

### Mood & surfaces

- **Liquid chrome** is the signature motif — poured, wet, mirror-bright metal, with
  molten drips (see the animated title wordmark and its art). Reflective chrome,
  rain-slick asphalt, standing water like poured mercury.
- **Wet, dark, volumetric.** Rain, haze, drifting smoke; bloom on neon; a low
  blood-red sun over black-glass towers. Signage bleeds teal/blue into violet.
- **Dead-channel texture:** faint scanlines and grain over everything, like a
  screen left on a dead channel. A distressed, analog-future feel — CRT flicker,
  tape hiss, anamorphic streaks.

### Typography & UI

- **Monospace** throughout (`ui-monospace`, SF Mono, Menlo) — terminal-spare, wide
  letter-spacing on labels, uppercase kickers.
- **Dark glass panels:** translucent `rgba(14,22,34,0.72)` with a thin teal hairline
  border, soft backdrop blur, teal glow on focus. Rounded corners, generous touch
  targets.
- HUD language is diegetic and restrained: heat/trace meters, a nerve bar that turns
  to a rose bruise when low, meter readouts in New Yen (₩).

### Environments (mission set-dressing)

Drawn straight from the world: **rain-flooded neon streets**, **black-glass corporate
arcologies**, the **underground clinic** (surgical, strung with more tech than a corp
ward), a **fixer bar**, a **garage**, **cold-storage vaults**, **server floors**,
**skybridges**, **parking sublevels**, **rooftop relays**. Districts range from
stacked arcology markets to cold Russian relay stations to desert finance rings.

### Sound

Low, ominous **darksynth / dark ambient** — Vangelis *Blade Runner* by way of modern
darksynth. A brooding overworld bed, a taut propulsive heist/combat track, the hum of
neon and far-off sirens, rain and tape hiss. Restraint over spectacle: no drops, no
slang, tension held. (Full music & image generation prompts live in `PROMPTS.md`.)

### Reusable assets

- **Character portraits:** `assets/portraits/{zen,socrates,jackal,hemlock,kiros}.png`
- **Key art / title:** `assets/title.jpg`, `assets/title-bg.jpg`, `assets/cover.jpg`
- **Aerial city maps:** `assets/maps/map1–5.jpg` (top-down neon sprawl)
- **District / interior / ending banners:** `assets/cities/`, `assets/interiors/`,
  `assets/endings/`, `assets/vehicles/`
- **Generation prompts** for new art & music in the same register: `PROMPTS.md`

---

# PART B — THE TASK: build a first-person shooter in Godot

## Goal

Build a **single-mission, first-person shooter in Godot 4.x (GDScript)** set in the
Liquid Chrome world. On launch, the player **selects one of the five characters
(Zen, Socrates, Jackal, Hemlock, Kiros)**, then infiltrates a corporate facility to
complete a mission. Each character's **five stats and signature ability** meaningfully
change how the mission plays.

Target: a vertical slice — one polished character-select screen, one playable
mission level, working shooting + stealth + hacking, five distinct characters. Keep
it self-contained; no online play.

## Player experience / core loop

1. **Title → Character select.** Pick one of five; see stats, ability, and a one-line
   bio. Confirm.
2. **Briefing.** A short text card: the target, the objective, the way in.
3. **The mission.** Drop into a corporate facility. Move, shoot, sneak, hack terminals,
   take down or avoid guards, reach and complete the objective, exfiltrate to an
   extraction point.
4. **Debrief.** Success/fail, time, kills vs ghosted, loot (New Yen), and a stinger
   pointing at the larger story (the debt, the hunt).

## Character select → gameplay

Selecting a character loads a **CharacterData resource** that sets the player's
stats, signature ability, starting weapon, and portrait. Stats map to FPS mechanics:

| Stat | FPS mechanic |
|---|---|
| **Strength** | Max health / armor; melee damage; recoil control; carry capacity |
| **Speed** | Move & sprint speed; reload speed; slide/dodge; ability cooldown |
| **Stealth** | Noise radius; enemy detection range & time-to-spot; silent-takedown range |
| **Tech** | Hack speed & range (terminals, cameras, turrets, drones, locked doors); gadget charges |
| **Marksmanship** | Accuracy (spread), damage, headshot multiplier, aim-down-sights stability |

Suggested formula pattern (tune later): a stat `s` (1–10) →
`value = base + (s - 5) * step`. Example: `max_health = 100 + (STR-5)*12`;
`move_speed = 5.0 + (SPD-5)*0.35`; `spread_deg = 4.0 - (MRK-5)*0.35`;
`detect_range = 18.0 - (STE-5)*1.2`; `hack_seconds = 4.0 - (TECH-5)*0.3`.

## Abilities → FPS powers

Each character has one **signature ability** (active, on a cooldown driven by Speed).
Map the game's chrome to FPS powers; give Kiros the new one:

| Character | Signature ability | FPS effect |
|---|---|---|
| Zen | **Signal-ghost lattice** | Active cloak / decoy: enemies lose your track for a few seconds |
| Socrates | **Trauma governor** | Passive: one lethal hit per mission is survived (revive to 1 HP + brief i-frames); active self-stim heal |
| Jackal | **Predator optics** | Tag/highlight enemies through walls; +damage on tagged targets |
| Hemlock | **Overclocked cortex** | Combat reflexes: brief bullet-time / slow-mo for precise kills |
| Kiros | **Ghost in the machine** *(new)* | Seize facility systems: cameras blind, turrets flip to your side, nearby doors open |

Optionally let the fifth ability, **Cold-blood regulator** (flat damage reduction /
steadier under fire), be a selectable perk for any character.

## The mission

Design **one facility level** with multiple valid routes so different builds shine:

- **Objective (pick one, or make it configurable):** steal a piece of prototype
  chrome from a secure vault; **or** rescue a captive and escort them to the
  extraction; **or** plant/pull data at a core terminal. Ship with the **heist/steal**
  objective first.
- **Layout:** an approach (loading dock / rooftop / sublevel), an interior with guard
  posts, cameras, locked doors, and hackable terminals, and the objective room, then
  an exfil point. Include at least one **stealth route**, one **loud route**, and one
  **hacking route** (open doors / disable defenses via terminals).
- **Enemies:** patrolling **corp security** (hitscan or projectile), a **security
  camera** system (raises alarm), **auto-turrets** (hackable), and a heavier
  **response team** that spawns on high alarm. Simple state-machine AI: Patrol →
  Suspicious → Alerted → Combat → Search.
- **Stealth:** noise and line-of-sight detection scaled by the player's Stealth;
  **silent takedowns** from behind; cameras and bodies raise an **alarm meter**.
- **Hacking:** interact with a terminal → a short **hacking mini-game** (a cipher /
  timed sequence) whose difficulty is reduced by **Tech**. Success opens doors,
  loops cameras, or turns turrets. Echoes the web game's cipher puzzle.
- **Combat:** gunplay driven by **Marksmanship** (spread, damage, headshots) and
  weapon type; melee/takedowns by **Strength/Stealth**. A starting weapon per
  character (Jackal → rifle, Hemlock → suppressed pistol/blade, Zen → SMG, Socrates
  → shotgun/med-tool, Kiros → smart-pistol).
- **Fail/lose states:** health to zero (Trauma governor gives one save); alarm maxed
  triggers a lockdown/heavy response. Non-lethal alternative: getting fully spotted
  doesn't instantly fail — it escalates.

## Technical spec (Godot 4.x)

- **Engine:** Godot **4.2+**, **GDScript**. Forward+ renderer. Keyboard/mouse first;
  controller optional.
- **Player controller:** `CharacterBody3D` FPS controller — walk/sprint/crouch/jump,
  mouse-look, head-bob, footstep noise. Weapon held on a viewmodel `Camera3D` rig.
- **Weapons:** a `Weapon` resource + a shooting component (raycast hitscan first;
  projectiles as a stretch). Recoil, spread, reload, ammo, hit markers.
- **Data-driven characters:** a `CharacterData` **custom `Resource`** per character:
  `id, name, role, stats{str,spd,ste,tech,mrk}, ability_id, start_weapon, portrait,
  bio`. Five `.tres` files, loaded by the select screen and applied to the player on
  spawn via a stat→mechanic mapper.
- **Ability system:** an `Ability` base (activate, cooldown, duration) with one
  subclass per signature; cooldown scaled by Speed.
- **Enemy AI:** `CharacterBody3D` + a `NavigationAgent3D` + a finite state machine;
  vision cones via ray/area checks; a shared `AlarmManager` (autoload) tracking the
  facility alert level.
- **Hacking mini-game:** a self-contained `Control` scene returning success/fail,
  parameterized by a difficulty int (reduced by Tech).
- **Level:** built from modular greybox meshes / CSG first; nav mesh baked; trigger
  areas for objectives and exfil.
- **UI:** title, character-select (portrait, stat bars, ability blurb), in-game HUD
  (health, ammo, ability cooldown, alarm meter, objective marker), debrief.
- **Audio:** reuse the web game's music prompts/tracks in spirit — a low ominous
  overworld bed and a tense combat track; SFX for guns, hacks, takedowns, alarms.
- **Save/settings:** minimal — options (sensitivity, volume) and last-picked character.

## Suggested project structure

```
res://
  autoload/            GameState.gd, AlarmManager.gd, AudioDirector.gd
  data/
    characters/        zen.tres socrates.tres jackal.tres hemlock.tres kiros.tres
    weapons/           rifle.tres pistol.tres smg.tres ...
    character_data.gd  (Resource class), weapon_data.gd, ability defs
  player/              player.tscn player.gd, camera_rig.tscn, weapon_component.gd
  abilities/           ability.gd + signal_ghost.gd trauma_governor.gd predator.gd
                       overclock.gd ghost_in_the_machine.gd
  enemies/             guard.tscn guard.gd, camera.tscn, turret.tscn, response_team.tscn
  systems/             stealth.gd, hacking_minigame.tscn/.gd, damage.gd
  levels/              facility_01.tscn (greybox), nav, spawn points, objective/exfil
  ui/                  title.tscn, character_select.tscn, hud.tscn, debrief.tscn
  main.tscn            boot → title
```

## Milestones (build order)

1. **Boot & FPS core** — player controller, mouse-look, one greybox room, one hitscan
   weapon that damages a dummy.
2. **CharacterData + select screen** — five `.tres`, a select UI, stats applied to the
   player (health/speed/spread visibly differ per pick).
3. **Enemies + stealth** — one patrolling guard with a vision cone and FSM; alarm
   manager; silent takedown; camera that raises alarm.
4. **Hacking** — a terminal that opens a door via the mini-game, difficulty from Tech.
5. **Abilities** — implement all five signatures with cooldowns; hook to input.
6. **The mission** — full facility level with routes, objective, exfil, response team;
   fail/win states; debrief screen.
7. **Polish** — HUD, audio, weapon per character, camera feel, balance pass on the
   stat formulas.

## Art & audio direction (FPS)

Follow **Part A → Aesthetic & visual identity** for palette, mood, typography and
sound; this section adds the 3D specifics.

- **Lighting:** dark base with **emissive neon** doing most of the work — teal/blue
  signage, violet net-glow, rose alarm strips. Volumetric fog, wet reflective floors
  (SSR or reflection probes), bloom/glow on emissives, anamorphic-ish streaks. A cold
  key light and a single warm/rose accent per space.
- **Materials:** high-metalness "liquid chrome" surfaces (mirror trims, wet asphalt,
  black glass); grungy concrete and steel for interiors; emissive signage meshes.
- **Post-processing:** subtle film grain + faint scanline overlay for the
  dead-channel feel; chromatic aberration and vignette in moderation; a rose full-
  screen tint pulse when the alarm is high or you're hurt.
- **UI in 3D:** carry the dark-glass, monospace, teal-hairline HUD language into the
  world — holographic terminals, door panels, and objective markers as emissive glass.
- **Reuse:** character **portraits** for the select screen; the **aerial city maps**
  as a briefing/mission-select backdrop; `PROMPTS.md` to generate key art, skyboxes,
  and the soundtrack in the same register.

## Stretch goals

- Multiple objective types (rescue + pursuit) reusing the same level kit.
- Procedural guard patrols / objective placement for replayability.
- Light progression between missions (spend points, à la the web game's leveling).
- Co-op or a horde survival variant.

---

## Reference — where the source data lives

- Characters, stats, bios, abilities, setting: `cyberpunk-chronicles/chrome/src/world.js`
  (`CHARACTERS`, `STAT_KEYS`, `ABILITIES`, `KIROS`, `SETTING`, `MONTAGE`, `CONTACT`).
- Mission/gameplay systems (approach, dice, puzzles, combat, mission types):
  `src/components/Heist.js`, `Rescue.js`, `Pursuit.js`, `LockPick.js`, `Hack.js`,
  `Combat.js`, `Encounter.js`; run/stat logic in `src/state.js`, `src/engine.js`.
- Story: `cyberpunk-chronicles/chrome/STORY.md`. Art/music prompts: `PROMPTS.md`.
