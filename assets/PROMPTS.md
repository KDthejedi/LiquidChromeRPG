# Liquid Chrome — portrait prompts

Image-generation prompts for the five avatar portraits and the three fixer
portraits. The game loads these by **filename** (`assets/portraits/<id>.png`),
so any generator works — overwrite the file with the same name to swap the art.

Each character is one specific person (no face picker), so there's exactly one
portrait per id.

## Style & settings

- **Look:** **gritty semi-realistic cyberpunk digital painting** — cinematic
  concept-art style, painterly rendering with realistic proportions and detailed
  skin, moody film-still lighting, saturated neon-noir two-tone rim light,
  stylized but grounded. **Not anime, not cartoon, not a glossy 3D render** — and
  not a straight photo either.
- **Engine:** end every prompt with **`--ar 1:1 --style raw --v 7`**.
- **Keep the cast consistent:** set one image you like as a **style reference**
  (in the Midjourney app, add it in the imagine bar; or in text, `--sref <url>`
  / `--sref <code>` with `--sw 300`). Generate the rest against it so they read
  as one show. Don't add `--sref` in the text if you've already set a reference
  in the app.

## Status

- ✅ **done** (real art in): zen, socrates, jackal, hemlock (operatives), kiros
  (benefactor), deane, finn, nameless (fixers) — full cast installed.

---

## Avatar portraits — `assets/portraits/<id>.png`

### zen.png — corporate ghost · teal / blue ✅
```
Gritty semi-realistic cyberpunk portrait (digital painting, cinematic concept art) of Zen, an Asian corporate woman in her 30s, a sharp burned-out hacker, composed and a little wary, looking at camera — a sleek chrome ocular implant over one eye, a neural port behind the ear, a fine corporate barcode tattoo down one side of the neck. Head and shoulders, dark near-black background, two-tone neon rim lighting (teal and electric blue), painterly digital rendering, realistic proportions and detailed skin, moody cinematic lighting, neon-noir, high contrast, stylized but grounded, not anime, not cartoon. --ar 1:1 --style raw --v 7
```

### socrates.png — struck-off surgeon · teal / green ✅
```
Gritty semi-realistic cyberpunk portrait (digital painting, cinematic concept art) of Socrates, a man of mixed descent in his 60s with brown skin and grey hair, a struck-off surgeon, calm and clinical, looking at camera — fine luminous circuitry tattoos across the temples and one cheekbone, a thin surgical scanner-lens over one eye, sterile composure. Head and shoulders, dark near-black background, two-tone neon rim lighting (teal and sickly green), painterly digital rendering, realistic proportions and detailed skin, moody cinematic lighting, neon-noir, high contrast, stylized but grounded, not anime, not cartoon. --ar 1:1 --style raw --v 7
```

### jackal.png — ex-corp military · amber / blue ✅
```
Gritty semi-realistic cyberpunk portrait (digital painting, cinematic concept art) of Jackal, a bald white man in his 50s, a hardened ex-corp soldier, disciplined and watchful, looking at camera — a chrome comms-jack at the temple, subdermal armor plating along the jaw, a unit barcode tattoo on the neck, old scars, worn corp fatigues. Head and shoulders, dark near-black background, two-tone neon rim lighting (warm amber and electric blue), painterly digital rendering, realistic proportions and detailed skin, moody cinematic lighting, neon-noir, high contrast, stylized but grounded, not anime, not cartoon. --ar 1:1 --style raw --v 7
```

### hemlock.png — assassin & poisoner · violet / rose ✅
```
Gritty semi-realistic cyberpunk portrait (digital painting, cinematic concept art) of Hemlock, a Black woman in her 30s with dreadlocks, an assassin, still and unreadable, quietly lethal, looking at camera — faint circuit-line tattoos and a small hemlock-sprig tattoo at the throat, glassy fully-augmented eyes, almost no visible chrome. Head and shoulders, dark near-black background, two-tone neon rim lighting (violet and rose), painterly digital rendering, realistic proportions and detailed skin, moody cinematic lighting, neon-noir, high contrast, stylized but grounded, not anime, not cartoon. --ar 1:1 --style raw --v 7
```

---

## Kiros — the benefactor (NPC) — `assets/portraits/kiros.png`

The figure in the shadows who gives the four operatives their second life.
A light-skinned Black man in his 20s; young, but he rebuilds burned veterans and
runs them. Kept half-lit, face partly in the dark. ✅

```
Gritty semi-realistic cyberpunk portrait (digital painting, cinematic concept art) of Kiros, a light-skinned Black man in his 20s, the enigmatic benefactor who quietly rebuilds burned operatives — young but commanding, calm and unreadable, half his face lit and half lost in deep shadow, sitting back in the dark. Expensive, understated cyberware — a fine data-lace at the temple, a subtle chrome iris. Well-dressed, composed, powerful without trying. Head and shoulders, very dark near-black background, low-key single-source lighting with a two-tone neon rim (deep violet and warm gold), painterly digital rendering, realistic proportions and detailed skin, moody cinematic lighting, heavy shadow, neon-noir, high contrast, stylized but grounded, not anime, not cartoon. --ar 1:1 --style raw --v 7
```

---

## Fixers — `assets/portraits/<id>.png`

### deane.png — amber / teal ✅
```
Gritty semi-realistic cyberpunk portrait (digital painting, cinematic concept art) of Julius Deane, a ninety-year-old importer wearing an uncanny too-youthful synthetic face over something ancient, immaculately slicked hair, a jeweler's loupe lens over one eye, hairline seams of synthetic skin, courtly and cold. Head and shoulders, dark background, two-tone neon rim lighting (warm amber and teal), painterly digital rendering, realistic proportions and detailed skin, moody cinematic lighting, neon-noir, high contrast, stylized but grounded, not anime, not cartoon. --ar 1:1 --style raw --v 7
```

### finn.png — sickly green / violet ✅
```
Gritty semi-realistic cyberpunk portrait (digital painting, cinematic concept art) of the Finn, a gaunt cadaverous fence, hollow cheeks, unkempt hair, a wry sardonic look, a cheap ocular implant and a curl of cigarette smoke across the face. Head and shoulders, dark background, two-tone neon rim lighting (sickly green and violet), painterly digital rendering, realistic proportions and detailed skin, moody cinematic lighting, neon-noir, high contrast, stylized but grounded, not anime, not cartoon. --ar 1:1 --style raw --v 7
```

### nameless.png — teal / rose, faceless (the AI backer — not a person) ✅
```
Semi-realistic cyberpunk digital painting, but where the face should be there is no face — a human head-and-shoulders silhouette dissolving into streams of data, scan-lines and glitch, signal bleed in teal and rose, no eyes, no features, the shape of a person made of pure signal. Dark near-black background, painterly, moody, high contrast, unsettling and disembodied — a split artificial intelligence, not a human being. --ar 1:1 --style raw --v 7
```

---

## Vehicle art — `assets/vehicles/<id>.jpg`

Ten machines for the garage — five motorcycles, five coupes. The game loads them
by **filename** (`assets/vehicles/<id>.jpg`), shown as a **16:9** card thumbnail,
so end every prompt with **`--ar 16:9 --style raw --v 7`**. Neon-lit placeholders
ship in the repo; overwrite each with the same filename to swap in real art.

**Shared style:** gritty semi-realistic cyberpunk vehicle concept art, digital
painting, cinematic — side three-quarter view, wet neon-lit street at night,
dark near-black background, reflections on wet asphalt, moody, high contrast,
painterly, no text, no rider. Keep the cast consistent with a `--sref`.

### mule — `mule.jpg` (bike · teal) ◻️
```
Gritty semi-realistic cyberpunk vehicle concept art, digital painting, cinematic — a battered rusted delivery motorcycle, dented panniers, mismatched panels, dead corp livery half sanded off, parked on a wet neon-lit back street at night, side three-quarter view, dark near-black background, two-tone teal and blue rim light, reflections on wet asphalt, moody, high contrast, painterly, no text, no rider. --ar 16:9 --style raw --v 7
```
### kabuki — `kabuki.jpg` (bike · violet) ◻️
```
Gritty semi-realistic cyberpunk vehicle concept art, digital painting, cinematic — a stripped-down courier motorcycle, minimal bodywork, exposed frame, silent hub motor, taped seat, built for speed through gridlock, side three-quarter view on a wet neon street at night, dark background, two-tone violet and teal rim light, wet reflections, moody, high contrast, painterly, no text, no rider. --ar 16:9 --style raw --v 7
```
### lowboy — `lowboy.jpg` (coupe · rose) ◻️
```
Gritty semi-realistic cyberpunk vehicle concept art, digital painting, cinematic — a battered anonymous two-door coupe, tinted glass, faded paint, low and unremarkable, the kind of car nobody looks at twice, parked under neon at night, side three-quarter view, dark background, two-tone rose and teal rim light, reflections on wet asphalt, moody, high contrast, painterly, no text. --ar 16:9 --style raw --v 7
```
### katana — `katana.jpg` (bike · blue) ◻️
```
Gritty semi-realistic cyberpunk vehicle concept art, digital painting, cinematic — a sleek monocoque sport motorcycle, aggressive fairing, single-sided swingarm, race-bred and low, angled hard into a corner stance, wet neon street at night, side three-quarter view, dark background, two-tone electric blue and teal rim light, wet reflections, moody, high contrast, painterly, no text, no rider. --ar 16:9 --style raw --v 7
```
### onyx — `onyx.jpg` (coupe · amber) ◻️
```
Gritty semi-realistic cyberpunk vehicle concept art, digital painting, cinematic — a ceramic-plated armoured grand-tourer coupe, long hood, blacked-out glass, subtle armour seams, expensive and understated, on a wet neon street at night, side three-quarter view, dark background, two-tone warm amber and blue rim light, reflections on wet asphalt, moody, high contrast, painterly, no text. --ar 16:9 --style raw --v 7
```
### vulon — `vulon.jpg` (bike · teal) ◻️
```
Gritty semi-realistic cyberpunk vehicle concept art, digital painting, cinematic — an ex-police pursuit motorcycle, stripped of markings, aggressive stance, oversized brakes, pursuit lights removed but the mounts still there, menacing, wet neon street at night, side three-quarter view, dark background, two-tone teal and rose rim light, wet reflections, moody, high contrast, painterly, no text, no rider. --ar 16:9 --style raw --v 7
```
### shinden — `shinden.jpg` (coupe · violet) ◻️
```
Gritty semi-realistic cyberpunk vehicle concept art, digital painting, cinematic — a turbine-drive sports coupe, low wedge silhouette, glowing intake, heat-haze off the rear, fast and exotic, on a wet neon street at night, side three-quarter view, dark background, two-tone violet and teal rim light, reflections on wet asphalt, moody, high contrast, painterly, no text. --ar 16:9 --style raw --v 7
```
### wraith — `wraith.jpg` (bike · rose) ◻️
```
Gritty semi-realistic cyberpunk vehicle concept art, digital painting, cinematic — a single-wheel gyro monowheel motorcycle, rider seat cradled inside one huge gyroscopic wheel, impossible balance, radical and strange, on a wet neon street at night, side three-quarter view, dark background, two-tone rose and blue rim light, wet reflections, moody, high contrast, painterly, no text, no rider. --ar 16:9 --style raw --v 7
```
### noctis — `noctis.jpg` (coupe · blue) ◻️
```
Gritty semi-realistic cyberpunk vehicle concept art, digital painting, cinematic — a matte-black anti-grav coupe hovering just off the ground, glowing repulsor skirts, radar-dark faceted panels, no wheels, it seems to haunt rather than drive, wet neon street at night, side three-quarter view, dark background, two-tone electric blue and violet rim light, reflections below it, moody, high contrast, painterly, no text. --ar 16:9 --style raw --v 7
```
### seraph — `seraph.jpg` (coupe · white/teal) ◻️
```
Gritty semi-realistic cyberpunk vehicle concept art, digital painting, cinematic — a sleek aerodyne flying coupe lifting off a rooftop pad, ducted lift fans, wings half-folded, city lights far below, chrome-and-white bodywork, the top of the line, night sky and neon haze, three-quarter view, dark background, two-tone white and teal rim light, moody, high contrast, painterly, no text. --ar 16:9 --style raw --v 7
```
