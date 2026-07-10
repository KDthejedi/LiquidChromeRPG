# Liquid Chrome — generation prompts

Reference prompts for the **main / title screen** of *Liquid Chrome*
(Cyberpunk Chronicles, Volume I). Written to match the established art
direction: spare, literary neon-noir, "the tech is weather," restraint over
slang. Palette anchors — near-black `#04070d`, teal `#2dd4bf`, blue
`#38bdf8`, violet `#a78bfa`, and a rose bruise `#f43f5e` for danger.

---

## 1. Title-screen hero image

Wide cinematic banner that sits behind/above the wordmark on the main
screen (roughly **3:1**, e.g. 1536×512 or 1792×640). Drop into
`chrome/assets/` and swap for the vector skyline in `art.js`.

**Prompt**

> Neon-noir cyberpunk cityscape at night, year 2055, seen as a wide
> cinematic banner. A drowned megacity of black glass towers under a low
> blood-red sun, its light smeared across a flooded street of standing
> water like poured mercury. Rain-slick chrome reflections; ribbons of
> teal and electric-blue signage bleeding into violet haze; a single
> crimson beacon burning deep in the sprawl. In the foreground, faint and
> small, a lone console-jacker in a long coat wades the water, a data
> cable trailing behind them into the dark. Liquid-chrome surfaces —
> molten metal sheen, mirror-bright highlights, mercury drips. Volumetric
> fog, wet asphalt, distant holograms. Muted palette of near-black
> `#04070d`, teal, electric blue, violet, with a bruised rose-red accent.
> Restrained and moody, not busy; the technology reads like weather.
> Cinematic wide-angle, shallow depth of field, film grain, subtle
> scanline texture, anamorphic bloom. In the style of Syd Mead and classic
> neon-noir science-fiction cover art.

**Negative prompt**

> text, letters, logos, watermark, signature, people close-up, faces,
> cartoon, anime, cluttered, oversaturated, daylight, clear sky, lens
> flare overload, HUD, UI elements

**Suggested params** — Midjourney: `--ar 3:1 --style raw --stylize 250 --chaos 8`
· SDXL: 1536×512, CFG ~6.5, 30–40 steps, add "cinematic, moody, film grain."

---

## 2. Wordmark / stylish title (optional image version)

The in-app title is now rendered live as flowing **liquid chrome** (see
`.title-hero` in `styles.css`). If you ever want a baked image version
(social card, splash), this produces a matching lockup:

**Prompt**

> The words "LIQUID CHROME" as a bold cyberpunk logotype, two stacked
> lines, extruded from polished liquid metal — brushed chrome and mercury
> with mirror-bright specular highlights and a soft molten drip at the
> base of each letter. Cool steel-blue reflections, a faint teal-and-violet
> neon rim-glow behind the type, set on a near-black `#04070d` background.
> Condensed heavy sans-serif, slight italic lean, clean and legible,
> centered. Studio product-shot lighting, high contrast, subtle scanlines.
> No background scenery.

**Negative prompt** — `misspelled text, extra letters, gibberish, serif, ornate, cluttered background, low contrast`

---

## 3. Music — title / menu theme

For an AI music generator (Suno, Udio, etc.). A loopable ambient bed for
the title and menu screens — present but never in the way of reading.

**Style tags**

> darksynth, dark ambient, cyberpunk, neo-noir, synthwave, cinematic,
> analog synths, slow, brooding, atmospheric, instrumental, loopable

**Description / prompt**

> A slow, brooding neon-noir title theme for a cyberpunk console-jacker
> game set in a drowned megacity in 2055. Warm analog synth pads drifting
> over a deep sub-bass drone, a sparse pulsing arpeggio far back in the
> mix, distant reverb-drenched piano notes, the hiss of rain and tape.
> Around 70–80 BPM, in a minor key, patient and cinematic — Vangelis
> *Blade Runner* by way of modern darksynth. No vocals, no drops;
> restraint over spectacle. Mysterious, melancholy, a little dangerous.
> Should loop seamlessly as a menu bed.

**Optional variants**

- **Run / heist tension** — same palette, add a taut 16th-note bassline,
  ticking hi-hats, rising tension, ~100 BPM, "propulsive but cold."
- **Ending / debrief** — strip to a single sustained pad and a lone piano
  motif; slow, resolved, bittersweet.

---

## 4. Overworld / main theme — "Licking Wounds"

The persistent background bed that plays throughout the game — menus, map,
clinic, garage, dialogue. Low and ominous: a wanted fugitive who should be
hiding in the slums but is armed, driven, and out for revenge. Should sit
under everything without distracting, and loop seamlessly.

**Style tags**

> dark synthwave, dark ambient, cyberpunk, neo-noir, brooding, ominous,
> cinematic, minor key, slow, instrumental, loopable, sub-bass, analog synths

**Description / prompt**

> A low, ominous cyberpunk theme for a wanted fugitive moving through the
> slums of a rain-soaked megacity — hunted, wounded, but armed and driven
> by revenge. A deep sub-bass drone underneath a slow, menacing analog
> synth ostinato that pulses with quiet, relentless forward momentum — the
> pulse of someone on a mission who can't stop moving. Sparse, restrained:
> a single cold detuned synth motif, distant metallic clangs and industrial
> reverb, the hum of neon and far-off sirens, faint tape hiss and rain.
> Around 60–72 BPM, minor key, patient and dangerous. Tension held, never
> released — no drops, no drums beyond a soft heartbeat kick low in the
> mix. Mostly dark and melancholy with a thin thread of steel running
> through it: cornered but not broken. Fully instrumental, no vocals. Must
> loop seamlessly as a background bed under menus and dialogue — present
> but never distracting.

**Tuning levers**

- Too sleepy → add "a steady muted 8th-note bassline pulse, subtle
  propulsion, a sense of stalking toward a target."
- Too busy → "strip back to a single sustained pad and the sub-bass drone,
  more space, more dread, almost silent."
- Want a hook → "a short 4-note minor synth-lead motif that surfaces once,
  then dissolves back into the atmosphere."

---

## 5. City image — "The City Burns Behind"

A wide cinematic scene: our hero in silhouette beside their motorcycle,
watching a neon megacity burn. For a splash / scene backdrop. Drop the
rendered image into `chrome/assets/`.

**Prompt**

> Cinematic neon-noir cyberpunk scene, year 2055. In the foreground, a lone
> figure — our hero — stands in near-total silhouette, a black rim-lit
> shadow, one hand resting on the seat of a sleek futuristic motorcycle
> beside them, the bike also in silhouette with faint chrome edge-highlights
> catching the neon. They face away, watching a vast megacity that burns on
> the horizon — towers of black glass wreathed in orange fire and drifting
> embers, smoke rising into a bruised sky. Rain-slick empty street
> reflecting the blaze and the neon; ribbons of teal, electric blue and
> violet signage cutting through the dark, contrasted against the hot
> red-orange glow of the flames. Wet asphalt, volumetric haze, distant
> sirens implied. Moody, restrained, ominous — a wanted fugitive and their
> machine, framed against a city coming apart. Backlit composition, strong
> silhouette, deep shadows, low camera angle, wide cinematic framing,
> shallow depth of field, film grain, subtle scanline texture, anamorphic
> bloom. Muted near-black palette (#04070d) with teal/blue/violet neon and a
> rose-red fire accent. In the style of Syd Mead and classic neon-noir
> science-fiction poster art.

**Negative prompt**

> text, letters, logo, watermark, signature, bright daylight, clear blue
> sky, cheerful, cartoon, anime, cluttered, oversaturated, visible detailed
> face, deformed hands, extra limbs, low contrast, washed out

**Params** — Midjourney: `--ar 16:9 --style raw --stylize 250 --chaos 6`
(`--ar 9:16` for a portrait title backdrop) · SDXL: 1536×864, CFG ~6.5,
30–40 steps.

**Tuning levers**

- Hero more readable → "three-quarter back view, subtle magenta rim light
  tracing the figure and the motorcycle's silhouette."
- More drama → "the whole skyline ablaze, walls of flame, thick rolling
  smoke, embers filling the air."
- Calmer / colder → "only a few distant fires, mostly cold neon and rain,
  smoke thin on the horizon."

---

## 6. The intro sequence — six cinematic stills

Six backdrops for the opening cinematic, in narrative order: the console
message, pulling on the coat, the walk through the slums, the gang standoff,
arriving at the old market, and the meet with Kiros. Written as **one
sequence** — the same lone coated figure kept in silhouette or seen from
behind (no clear face, so the still fits any of the four operatives), the same
rain-drowned slums, the same palette, escalating tension. Render and drop into
`chrome/assets/intro/`, wired behind the matching `Contact.js` steps.

**Shared negative prompt** (use on all six)

> text, letters, legible words, gibberish text, logos, watermark, signature,
> close-up detailed face on the hero, daylight, clear sky, cheerful, cartoon,
> anime, cluttered, oversaturated, deformed hands, extra limbs, low contrast,
> washed out, modern-day clothing

**Shared params** — Midjourney: `--ar 2:3 --style raw --stylize 250 --chaos 6`
(portrait, for the mobile intro panels; use `--ar 3:2` for a landscape variant)
· SDXL: 1024×1536 portrait (or 1536×1024 landscape), CFG ~6.5, 30–40 steps,
add "cinematic, moody neon-noir, film grain."

**Keeping them a set** — lock one seed / style reference across all six and vary
only the scene. In Midjourney, generate 6.1, then append the same `--sref <id>`
(or a `--cref` of your hero silhouette) to 6.2–6.6. Keep the hero faceless and
coated in every frame so the sequence fits whichever operative the player chose.

---

### 6.1 The console message

> Neon-noir cyberpunk interior, year 2055, the dead of night. A cramped,
> run-down room deep in the slums, lit only by the cold glow of a single
> battered console screen. The screen shows an incoming encrypted message — a
> blinking cursor beside faint abstract monospaced glyphs, no readable words —
> its teal-and-blue light spilling across a cluttered desk of dead tech:
> tangled cables, an old handgun, a chipped mug, scattered chrome components.
> Beyond the desk the room falls into deep near-black shadow; rain streaks a
> grimy window where violet and rose neon bleeds up from the street below. Dust
> hanging in the air, faint volumetric haze, a wet liquid-chrome sheen on the
> cables. Intimate, claustrophobic, ominous — the moment a stranger reaches
> into your life. Near-black palette `#04070d` with teal, electric blue, violet
> and a rose-red danger accent. Cinematic, shallow depth of field, film grain,
> subtle scanlines, anamorphic bloom, in the style of Syd Mead and classic
> neon-noir science-fiction art.

### 6.2 Pulling on the coat

> Neon-noir cyberpunk interior, year 2055. A lone figure rising from a battered
> console and reaching for a long, weathered coat — pulling it on in the dark,
> seen from behind or in near-total silhouette, no visible face, faint chrome
> rim-light tracing the shoulders. The cold glow of the console screen behind
> them; ahead, a doorway opening onto a rain-lit slum street, neon and darkness
> waiting. One hand reaching for the coat, the other near an old handgun on the
> desk. The quiet, heavy moment before a long night — resolve, dread, no
> turning back. Wet reflections, dust in the light, volumetric haze. Near-black
> palette `#04070d` with teal, electric blue, violet and a rose-red accent.
> Cinematic, shallow depth of field, film grain, subtle scanlines, anamorphic
> bloom, in the style of Syd Mead and classic neon-noir science-fiction art.

### 6.3 The walk through the slums

> Neon-noir cyberpunk street scene, year 2055, the dead of night. A lone figure
> in a long coat, seen from behind, walking away down a narrow, rain-drowned
> slum street, one hand held near the hip. Corrugated-steel shanties and
> stacked market stalls crowd both sides; sodium lamps and abstract neon
> signage (no readable text) bleed teal, blue and violet into the rain; cabling
> and wires strung wall to wall overhead like the street was stitched shut.
> Steam and ozone drifting, wet asphalt mirroring the neon, hunched figures
> watching from dark doorways. Lonely, wary, hemmed in. Near-black palette
> `#04070d` with teal, electric blue, violet and a rose-red accent. Cinematic
> wide shot, deep perspective down the street, shallow depth of field, film
> grain, subtle scanlines, anamorphic bloom, in the style of Syd Mead and
> classic neon-noir science-fiction art.

### 6.4 The gang standoff

> Neon-noir cyberpunk confrontation, year 2055, night, in a narrow slum alley.
> Four young, wired figures in menacing silhouette close off the street at both
> ends, hemming in a single lone figure in a long coat; one gang member holds a
> blade catching the cold sodium light, another's cyberware glints. The coated
> hero stands ready, seen from behind or the side, one hand moving to a grip
> under the coat — the instant before violence. Rain hammering, wet asphalt
> streaked with reflected neon, a hard rose-red danger accent cutting through
> the teal and violet gloom. Tense, coiled, dangerous. Near-black palette
> `#04070d` with teal, electric blue, violet and a rose-red accent. Cinematic,
> low angle, strong silhouettes, deep shadows, shallow depth of field, film
> grain, subtle scanlines, anamorphic bloom, in the style of Syd Mead and
> classic neon-noir science-fiction art.

### 6.5 Arriving at the old market

> Neon-noir cyberpunk establishing shot, year 2055, night. The old market in
> the deep end of the slums — a vast covered bazaar of stacked stalls and
> shipping-crate storefronts under a leaking corrugated roof, strung with
> tangled wires, paper lanterns and abstract neon signage (no readable text).
> Steam rising from food stalls, rain dripping through gaps in the roof,
> puddles mirroring teal, blue and violet light; a few hooded figures moving
> through the haze. In the foreground, small, the lone coated hero seen from
> behind, walking in toward the heart of it. Sprawling, atmospheric, half-lit,
> a little dangerous. Near-black palette `#04070d` with teal, electric blue,
> violet and a rose-red accent. Cinematic wide shot, deep depth, volumetric
> haze, film grain, subtle scanlines, anamorphic bloom, in the style of Syd
> Mead and classic neon-noir science-fiction art.

### 6.6 The meet with Kiros

> Neon-noir cyberpunk scene, year 2055, night, inside the old slum market. A
> calm, unreadable young man — Kiros, a light-skinned Black man in his twenties,
> close-cropped hair — sits behind a low crate, half-lit, unhurriedly pouring
> tea into two small cups; a single warm lamp catches one side of his face
> while the rest falls into shadow. Across from him, in the foreground and seen
> from behind in silhouette, the lone coated hero stands facing him. Around them
> the market's stacked stalls, hanging wires and soft neon fade into haze.
> Intimate, quiet, charged — a handler sizing you up, controlled menace under
> the stillness. Near-black palette `#04070d` with teal, electric blue, violet
> and a warm amber lamp accent. Cinematic, shallow depth of field, strong
> chiaroscuro half-light, film grain, subtle scanlines, anamorphic bloom, in
> the style of Syd Mead and classic neon-noir science-fiction art.

---

## 7. The remaining shot list — what's left to generate

Everything the code *requires* already exists (city banners, maps, endings,
interiors, portraits, vehicles, the title set). This section is the upgrade
list, in priority order — screens with no art yet, pools below their target
size, and one intro beat reusing a neighbour's image.

**The hero rule, on every prompt here:** the player picked one of four faces,
so the hero is always **hooded/coated and seen from behind, in silhouette, or
absent entirely** (POV shots solve this best). Never a readable face on the
protagonist. All shared negatives and params from §6 apply.

---

### 7.1 The slums walk — finish the intro *(highest priority)*

The prompt is already written — **use §6.3 exactly as it stands**. It's the
only intro beat still ungenerated; the walk step currently borrows the
"pulling on the coat" image. Drop the render into `assets/intro/walk.jpg` and
the summons-to-chair cinematic is complete.

### 7.2 Mission backdrops — five screens with no art

The heist, rescue, pursuit and road-encounter screens are text-only today.
One banner each (rendered at 3:2 or 2:3; will be wired like the intro
banners):

**7.2a Heist — the way in** (`assets/missions/heist.jpg`)

> Neon-noir cyberpunk establishing shot, year 2055, night. A fortified corp
> facility seen from across a rain-flooded street — black glass, service
> lights, a loading dock glowing at its base, security drones drifting like
> slow insects. No people in frame. The building reads as a locked safe:
> patient, lit from within, waiting to be opened. Near-black palette `#04070d`
> with teal, electric blue, violet and a rose-red accent. Cinematic wide shot,
> volumetric rain, film grain, subtle scanlines, anamorphic bloom, in the
> style of Syd Mead and classic neon-noir science-fiction art.

**7.2b Rescue — the holding block** (`assets/missions/rescue.jpg`)

> Neon-noir cyberpunk interior, year 2055. A corporate holding block after
> hours — a corridor of cell doors with small reinforced windows, one door
> ajar spilling cold white light, restraint hardware on a wall rack, a single
> chair under a hanging lamp. Empty of people; the menace is the room itself.
> Clinical teal-and-blue gloom with one rose-red status light burning. Cinematic,
> deep one-point perspective, film grain, subtle scanlines, in the style of Syd
> Mead and classic neon-noir science-fiction art.

**7.2c Pursuit — the intercept** (`assets/missions/pursuit.jpg`)

> Neon-noir cyberpunk chase, year 2055, night — first-person view over dark
> handlebars / a dashboard silhouette, closing fast on a heavy cargo rig
> fleeing down a rain-soaked elevated expressway, its tail-lights smearing red
> across the wet lanes, sparks off the barrier, the sprawl a canyon of neon on
> both sides. The viewer IS the pursuer — no rider visible. Speed-blurred
> edges, rain streaking horizontally. Near-black palette `#04070d` with teal,
> electric blue, violet and hot red tail-light accents. Cinematic, motion blur,
> film grain, anamorphic bloom, in the style of Syd Mead and classic neon-noir
> science-fiction art.

**7.2d Road ambush — boxed in** (`assets/missions/ambush.jpg`)

> Neon-noir cyberpunk scene, year 2055, night. A rain-drowned underpass on the
> edge of the sprawl: two battered vehicles slewed across the road ahead,
> headlights blazing toward the camera through the rain, armed silhouettes
> stepping out between them. Shot from the driver's eye — the viewer is the
> one being boxed in; no hero in frame. Hard white headlight glare against
> teal-and-violet gloom, a rose-red flare on wet asphalt. Tense, cornered,
> seconds before it goes wrong. Cinematic, film grain, subtle scanlines,
> anamorphic bloom, in the style of Syd Mead and classic neon-noir
> science-fiction art.

**7.2e Net-snare — the checkpoint** (`assets/missions/snare.jpg`)

> Neon-noir cyberpunk scene, year 2055, night. An automated toll-checkpoint
> strung across a highway on-ramp — a lattice of humming teal energy strands
> like a spider's web between pylons, scanner arrays sweeping, abstract
> glyphs scrolling on a gantry display (no readable text). Empty road, no
> people; the machine itself is the threat, patient and hungry. Near-black
> palette `#04070d` with teal, electric blue, violet and a rose-red scanner
> accent. Cinematic, volumetric haze, film grain, subtle scanlines, in the
> style of Syd Mead and classic neon-noir science-fiction art.

### 7.3 The family — Prophet, Queen, Rhys *(three portraits)*

Kiros's siblings are named at the deal but faceless. New faces are safe to
generate (they're NPCs, not the player). Match the existing portrait style —
square, chest-up, half-lit against near-black, one accent colour each. Render
to `assets/portraits/prophet.png`, `queen.png`, `rhys.png`.

**Prophet — reads the wire (eldest)**

> Neon-noir cyberpunk character portrait, year 2055: a gaunt Black man in his
> thirties, the eldest sibling, calm heavy-lidded eyes that seem to be reading
> something just past the camera, a thin data-cable resting over one shoulder,
> faint teal glyph-light reflected on his face from an unseen screen. Chest-up,
> square crop, near-black background, chiaroscuro half-light with a teal
> accent. Quiet, unsettling, sees the shape of a job before it happens. Film
> grain, subtle scanlines, in the style of classic neon-noir science-fiction
> character art.

**Queen — runs the money**

> Neon-noir cyberpunk character portrait, year 2055: a poised Black woman in
> her late twenties, immaculate high-collared coat, one jewelled data-shard
> earring, expression of pleasant absolute unreadability — the face of someone
> moving credits through a hundred shells. Chest-up, square crop, near-black
> background, chiaroscuro half-light with a violet accent. Elegant, untouchable.
> Film grain, subtle scanlines, in the style of classic neon-noir
> science-fiction character art.

**Rhys — moves the muscle (youngest)**

> Neon-noir cyberpunk character portrait, year 2055: a broad young Black man
> in his early twenties, close-cropped hair, a faint scar through one eyebrow,
> matte armour plating just visible under a street jacket, jaw set — the one
> you send when talking is done. Chest-up, square crop, near-black background,
> chiaroscuro half-light with a rose-red accent. Loyal, heavy, patient. Film
> grain, subtle scanlines, in the style of classic neon-noir science-fiction
> character art.

### 7.4 Aerial map backdrops 6–10 *(pool below target)*

`MAP_POOL` targets 10; five exist. Five more variants of the same subject so
replays deal different boards. Render to `assets/maps/map6.jpg` … `map10.jpg`.

> Top-down aerial view of a vast cyberpunk megacity sprawl at night, seen
> straight down from high altitude — districts of dense neon grids split by
> dark waterways and elevated arteries, teal and violet light bleeding through
> rain haze, one district glowing hotter than the rest. Abstract enough to sit
> behind UI markers; no readable text, no people. Near-black palette `#04070d`
> with teal, electric blue, violet and a rose-red accent. Muted, moody,
> map-like. Film grain, subtle scanlines.

*Variation levers per render:* a coastal shelf of piers and drowned blocks ·
a mountain-edge mining district cut by terraced pits · a river delta of
stilt-city channels · an orbital-launch scar, a dead crater ringed by light ·
a dense island arcology linked by bridges.

### 7.5 Songdo Spire variants *(evens out replay variety)*

Every other city has 2–4 banner variants; Songdo Spire has one. Two more to
`assets/cities/spire2.jpg`, `spire3.jpg` (then bump `CITY_POOLS.spire` to 3):

> A vertical cyberpunk smart-city grown from the sea floor, year 2055, at
> night — one impossible spire of stacked terraces and screen-walls rising
> out of black water, every surface a shifting advertisement (abstract glyphs,
> no readable text), maglev lines spiralling its flanks, rain and sea-mist at
> its base. Seen from water level looking up / from a neighbouring rooftop
> (vary per render). Near-black palette `#04070d` with teal, electric blue,
> violet and a rose-red accent. Cinematic, volumetric haze, film grain, subtle
> scanlines, in the style of Syd Mead and classic neon-noir science-fiction art.

### 7.6 The training deck *(nice to have)*

The Trainer screen is text-only. One interior to `assets/interiors/sim1.jpg`:

> Neon-noir cyberpunk interior, year 2055 — a cramped simulation rig in the
> back room of an underground clinic: a dentist-style chair wrapped in cabling
> under a cold ring-light, twin projection visors on an articulated arm, walls
> of scuffed equipment racks, a wireframe cityscape glowing faintly on a bank
> of test monitors (abstract, no readable text). Empty of people, humming,
> slightly too clean for the building it's in. Near-black palette `#04070d`
> with teal, electric blue, violet accents. Cinematic, shallow depth of field,
> film grain, subtle scanlines.

### Not needed

Player-character scenes beyond the intro (avatar-consistency risk — covered
by keeping the hero hooded/absent), fixer portraits (all exist), vehicle art
(all eight rides covered), ending art (16 exist), interiors (clinic/bar/garage
covered), city banners (all 27 exist).

---

## 8. Isometric room backdrops — the hybrid RPG scenes

A new asset class for the isometric RPG: one painted room per walkable scene,
rendered as a true isometric diorama that the engine lays its grid, actors,
lighting and animation over. Geometry discipline matters more here than in any
cinematic still — the code has to line its walkable floor up with the paint.

**File path:** `assets/interiors/safehouse.jpg` (the engine auto-detects it;
calibration is tuned in `js/scene.js` afterwards). Landscape, 2048px+ wide.

### 8.1 The safehouse *(first hybrid room)*

> True isometric video-game room diorama, classic 2:1 isometric projection,
> orthographic — no perspective convergence, no lens distortion. A single
> rectangular room floating in near-black darkness, edges dissolving to black.
> Camera from the room's south corner, elevated about 30 degrees: the floor is
> a clean diamond, footprint proportions 12 wide by 9 deep, with two back walls
> meeting at the top corner and the two near sides open to the void.
>
> The room: a burned operative's safehouse in the slums of a 2055 megacity.
> Poured-concrete floor in large square panels, grimy, wet-sheened, with a worn
> violet-grey rug in the middle, one corner kicked up. The RIGHT back wall
> holds a broad rain-streaked window — cold blue-violet city towers and tiny
> lit windows beyond the wet glass — and to the right of the window a wall-
> mounted screen crawling with teal data, its light spilling onto the floor,
> above a metal desk bearing two lit monitors, a keyboard, a cold mug. The LEFT
> back wall holds cheap metal shelving cluttered with parts and bottles, a
> paper district map taped up with a marked route and a red X, a broken
> rose-red neon sign fragment still half-glowing, and a long coat hanging from
> a peg. Against the right wall near the corner: a low metal cot with a thin
> pillow and a violet blanket folded back, two empty bottles on the floor
> beside it. Mid-left: a scarred metal workbench with a stowed crate beneath,
> tools, a small hotplate with a steaming kettle, an oil stain bleeding out
> from under it. Room center, on the rug's edge: a single standing floor lamp
> with a cone shade, the one warm amber light in the room, dust hanging in its
> beam. Far right edge: a heavy sliding door in its frame, rose-red keypad
> armed beside it. Near the bottom-right: a stack of sealed shipping crates,
> stencils sanded off, a black duffel slumped against them. Cables sag along
> the tops of both walls; a floor cable runs from the desk up to the wall
> screen; a drain grate and old scuff marks in the concrete.
>
> Leave the center of the floor open and walkable. NO people, NO characters,
> NO readable text anywhere — signage and screens show abstract glyphs only.
> Moody, restrained, never busy. Lit only by: the window's cold wash, the
> monitors and wall screen's teal, the neon fragment's rose, the lamp's amber
> pool. Wet reflections streaking toward the camera on the concrete.
> Near-black palette `#04070d` with teal `#2dd4bf`, electric blue `#38bdf8`,
> violet `#a78bfa`, rose-red `#f43f5e` accents, warm amber reserved for the
> lamp only. Film grain, subtle scanlines, anamorphic bloom, in the style of
> Syd Mead and classic neon-noir science-fiction art.

*Engine notes (not part of the prompt): the walkable grid is 12×9 tiles; the
cot occupies roughly tiles (1–3, 1–2) along the right wall, the desk (9–11,
1–2), the bench (1–3, 6–7) on the left, the lamp at (6, 4) center, the door at
the (11, 4) east edge, the crates at (10–12, 7–8). The closer the paint sits
to those stations, the less calibration fudging later — but exact alignment is
tuned in code, so favor a beautiful image over a precise one.*
