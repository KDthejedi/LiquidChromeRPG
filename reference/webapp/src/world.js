// CHRONICLES · CHROME — world data.
//
// Voice note: this file is the game's tongue. The voice is the north-star in
// WRITING.md — vivid, visceral, present. You are in the body on the wire; put
// the player there. Physical and sensory, real menace in the tech, propulsive
// rhythm broken by short blades, clarity underneath the heat. The world's own
// words are fair game — ICE, jack in, the wire, liquid chrome, the trace, an
// exploit (a zero-day), black-site (lethal) countermeasures, credits. Retire the
// dead tics (grey months, the grid past the glass, the wet dark).
//
// Everything here is plain data + small pure effect functions. state.js seeds a
// run from it; engine.js builds the firewall lattice; components render it.

// Security grade → the word the board shows. (Internal ids stay grey/white/black
// for the colour classes; these are the modern labels the player reads.)
export const GRADE_LABEL = { grey: 'commercial', white: 'hardened', black: 'black-site' };

// Portrait image path (relative to chrome/). Actual picture files under
// assets/portraits/ — same idea as Sundown's face*.jpg.
export function portraitSrc(id) { return `assets/portraits/${id}.png`; }


// ── The world ────────────────────────────────────────────────────────────────
export const SETTING = 'The year is 2055. The corporations rule everything now — every acre, every signal, every breath with a price on it. Space travel is a memory, a door that closed a generation ago. Every instrument ever pointed at the sky agrees on one cold verdict: there is no one else out there. We are alone in all that dark. So we fight, corp against corp, for every last inch of earth we have.';

// The blocs that carve up what is left.
export const CORPS = [
  'the South China Sea consortia',
  'the Japanese technology houses',
  'American defense',
  'Russian cyber-intelligence',
  'the African intelligence and resource corps',
  'Indian, South American and Caribbean holding companies buying up tech, resources and transit',
];

// ── Cities — the sprawl you move across ──────────────────────────────────────
// Ten districts of the 2055 world, each answering to a different bloc. You start
// at home in Keihin and travel the net-linked sprawl to work. Coords are map
// percentages (0–100). `home` is base — Kiros's clinic, no story job of its own.
// Five districts carry a Kiros story job; the rest are fixer money and roaming.
// Each city draws its banner from an art `pool` (assets/cities/<pool><n>.jpg).
// Pools group similar districts so art can be shared and varied: which variant
// a city shows is picked per run from the save's artSeed — replays look
// different. Sevastopol and Tidewater share the cold `grid` pool by design.
export const CITY_POOLS = {
  harbor: 2, market: 3, spire: 1, port: 3, medina: 3,
  coast: 4, signal: 4, mining: 3, grid: 4,
};
export const CITIES = [
  { id: 'chiba', name: 'Keihin', bloc: 'Japanese technology houses', home: true, pool: 'harbor',
    x: 14, y: 32, blurb: 'Home. Neon over black water, the clinic that rebuilt you strung underneath it.' },
  { id: 'kowloon', name: 'Hainan Reach', bloc: 'South China Sea consortia', pool: 'market',
    x: 36, y: 16, blurb: 'A stacked arcology market where the consortia launder everything through everything.' },
  { id: 'songdo', name: 'Songdo Spire', bloc: 'Korean arcology consortium', pool: 'spire',
    x: 30, y: 45, blurb: 'A vertical smart-city grown from the sea floor, every wall a screen selling you back to yourself.' },
  { id: 'karachi', name: 'Karachi Deep', bloc: 'South Asian port authority', pool: 'port',
    x: 52, y: 33, blurb: "Where half the world's freight and twice its contraband change hands in the dark under the cranes." },
  { id: 'sevastopol', name: 'Sevastopol', bloc: 'Russian cyber-intelligence', pool: 'grid',
    x: 68, y: 17, blurb: 'Cold relays and colder people. The walls here were built to kill, not to fine.' },
  { id: 'marrakech', name: 'Marrakech Ring', bloc: 'North African finance houses', pool: 'medina',
    x: 48, y: 60, blurb: "Old walls, new money. The desert wind carries dust and other people's account numbers." },
  { id: 'freeside', name: 'Cayo Verde', bloc: 'Caribbean holding companies', pool: 'coast',
    x: 16, y: 63, blurb: "The Finn's water. Sun, cut-outs, and money that never sleeps in the same account twice." },
  { id: 'cordillera', name: 'Cordillera', bloc: 'South American resource corps', pool: 'mining',
    x: 30, y: 79, blurb: 'Lithium and altitude. The mines run straight down and the money runs straight out.' },
  { id: 'lagos', name: 'Lagos', bloc: 'African intelligence & resource corps', pool: 'signal',
    x: 64, y: 77, blurb: 'Griot Intelligence country — resource money and signals traffic, thick as the heat.' },
  { id: 'sprawl', name: 'Tidewater', bloc: 'American defense', pool: 'grid',
    x: 83, y: 50, blurb: 'A thousand miles of arcology under one dead-channel sky. Where the money finally goes home.' },
];
export function cityOf(id) { return CITIES.find(c => c.id === id) || CITIES[0]; }
// Banner for a city, varied per run: the save's artSeed offsets which variant
// of the pool this city shows, so a replay deals the art differently.
export function citySrc(id, seed) {
  const c = cityOf(id);
  const size = CITY_POOLS[c.pool] || 1;
  const idx = CITIES.findIndex(x => x.id === c.id);
  const n = ((Math.abs(seed || 0) + idx) % size) + 1;
  return `assets/cities/${c.pool}${n}.jpg`;
}
export const HOME_CITY = CITIES.find(c => c.home).id;

// City-map backdrop — aerial sprawl art behind the node layer, one variant
// dealt per run from the save's artSeed so every playthrough gets a different
// map. Bump MAP_POOL as you add assets/maps/map<n>.jpg (target: 10).
export const MAP_POOL = 5;
export function mapSrc(seed) {
  if (!MAP_POOL) return null;
  const n = (Math.abs(seed || 0) % MAP_POOL) + 1;
  return `assets/maps/map${n}.jpg`;
}

// Ending art — four variants per ending, dealt by the same per-run seed.
export const ENDING_ART = { walkaway: 4, flatline: 4, burnout: 4, vanish: 4 };
export function endingSrc(ending, seed) {
  const size = ENDING_ART[ending] || 0;
  if (!size) return null;
  const n = (Math.abs(seed || 0) % size) + 1;
  return `assets/endings/${ending}${n}.jpg`;
}

// Interior art — the rooms you keep returning to (clinic, fixer bar, garage),
// four variants each, dealt per run. `salt` lets two screens that share a pool
// (the rebuild and the between-runs clinic) show different frames.
export const INTERIORS = { clinic: 4, bar: 4, garage: 1 }; // garage: one canonical shot
export function interiorSrc(kind, seed, salt) {
  const size = INTERIORS[kind] || 0;
  if (!size) return null;
  const n = ((Math.abs(seed || 0) + (salt || 0)) % size) + 1;
  return `assets/interiors/${kind}${n}.jpg`;
}

// ── Vehicles — your ride across the sprawl ───────────────────────────────────
// Eight machines — four motorcycles, four coupes. One meaningful stat: `days`,
// the time a leg of travel costs (lower is faster). Buy a better one outright,
// or a garage tune shaves a day off whatever you drive. (Travel also scales with
// map distance — see engine.travelDays.) Art loads via vehicleSrc below.
export const VEHICLES = [
  { id: 'mule', name: 'Keihin mule', type: 'bike', days: 4.0, price: 0,
    blurb: "A rusted delivery bike on a dead man's plates. It starts. Most mornings." },
  { id: 'kabuki', name: 'Kabuki runner', type: 'bike', days: 3.4, price: 750,
    blurb: 'Stripped courier two-wheeler, silent, made for the gaps in gridlock.' },
  { id: 'lowboy', name: 'Lowboy coupe', type: 'coupe', days: 3.0, price: 1200,
    blurb: 'A battered two-door with tinted glass and a heater that works. Anonymous.' },
  { id: 'katana', name: 'Katana sport', type: 'bike', days: 2.5, price: 1900,
    blurb: 'Monocoque sport bike. Leans into a corner like it means it.' },
  { id: 'onyx', name: 'Onyx coupe', type: 'coupe', days: 2.2, price: 2600,
    blurb: 'Ceramic-plated grand tourer. Eats distance, ignores checkpoints.',
    weapon: { name: 'Limpet spinners', cost: 150,
      note: 'Mines spin out of the skirts, climb whatever is chasing you, and end it.',
      winLine: 'You feather the release and a pair of limpets spin out of the skirts, skate the wet asphalt, and climb their wheel arches. The blast lifts them off the road in one hot piece. The rain closes over the wreck behind you.' } },
  { id: 'vulon', name: 'Vulon interceptor', type: 'bike', days: 1.9, price: 3300,
    blurb: 'Ex-police pursuit bike, governor cut, still hungry.',
    weapon: { name: 'Shredder pod', cost: 120,
      note: 'The old service hardware still works. Their tyres come apart at speed.',
      winLine: 'The interceptor still carries its service hardware. You dump the shredder pod and their tyres come apart at speed — the whole pursuit folds into the barrier in a shriek of steel. You never even slow down.' } },
  { id: 'shinden', name: 'Shinden coupe', type: 'coupe', days: 1.6, price: 4200,
    blurb: 'Turbine-drive coupe. The horizon comes at you sideways.',
    weapon: { name: 'Flechette turret', cost: 180,
      note: 'The rear cowling splits and a turret walks fire across their engine block.',
      winLine: 'The rear cowling splits and the turret wakes, walking flechettes across their engine block until it stops being an engine. They drift dead into the dark, and you pour the turbine on.' } },
  { id: 'seraph', name: 'Seraph aerodyne', type: 'coupe', days: 1.0, price: 7500,
    blurb: 'It leaves the ground. The sprawl becomes a map you cross in a single night.',
    weapon: { name: 'Lock-on arc missiles', cost: 250,
      note: 'Lock, loose, and everything behind you goes dark — engines, weapons, lights.',
      winLine: 'The canopy chimes — lock. Four electric darts leave the tail and thread the rain, and everything behind you dies at once: engines, weapons, lights. You watch them coast to a stop in the mirror, sitting in the dark, and you fly on.' } },
];
export function vehicleOf(id) { return VEHICLES.find(v => v.id === id) || VEHICLES[0]; }
// Pooled vehicle art — vehicles with several shots get one dealt per run by
// artSeed (offset by lot position so two pools never mirror each other).
// Anything not in VEHICLE_ART falls back to the single assets/vehicles/<id>.jpg.
export const VEHICLE_ART = { mule: 4, seraph: 4 };
export function vehicleSrc(id, seed) {
  const size = VEHICLE_ART[id];
  if (!size) return `assets/vehicles/${id}.jpg`;
  const idx = VEHICLES.findIndex(v => v.id === id);
  const n = ((Math.abs(seed || 0) + (idx < 0 ? 0 : idx)) % size) + 1;
  return `assets/vehicles/${id}${n}.jpg`;
}
export const VEHICLE_TUNE = { cost: 600, maxMods: 2 }; // each tune −1 day, to a floor of 1

// ── Characters (who jacks in) ────────────────────────────────────────────────
// Four avatars. Each was the best at something and got burned for it by a
// different power. Every one has the same five-stat sheet — STRENGTH, SPEED,
// STEALTH, TECH, MARKSMANSHIP (each 1–10) — and those stats drive the run:
// strength → how much chrome you hold in the chair; tech → how many exploits you
// carry; speed + stealth → how slowly the trace wakes to you; marksmanship →
// how many loose credits you pull clear. (Derived in state.PICK_CHARACTER.)
export const STAT_KEYS = [
  { key: 'strength', label: 'Strength' },
  { key: 'speed', label: 'Speed' },
  { key: 'stealth', label: 'Stealth' },
  { key: 'tech', label: 'Tech' },
  { key: 'marksmanship', label: 'Marksmanship' },
];
export const CHARACTERS = [
  {
    id: 'zen',
    name: 'Zen',
    role: 'Corporate ghost',
    deck: 'Kaisei Ghost-7, company issue',
    bio: 'The most feared hacker on the net. Corporations searched far and wide for you — but you were always a ghost.',
    stoleFrom: 'Kaisei',
    origin: "You wore a Kaisei badge by day and ran the most feared profile on the grid by night — famous, faceless, and theirs without ever knowing it. When they found what you'd lifted, they didn't fire you. They burned the chrome so you could never jack again.",
    kirosLine: "Kaisei never even learned your face — just your profile, and how to burn it. I know both.",
    doctorLine: "Kaisei toxin work. Neat, corporate, cruel — they metered the dose so you'd feel it finish.",
    epilogues: {
      walkaway: "You keep a cheap deck in a drawer you never open. The most feared profile on the grid, and it retired before they ever learned your face.",
      flatline: "Somewhere in Kaisei's logs there's a half-second intrusion, source unresolved. It's the closest thing to a headstone a ghost gets.",
      burnout: "The net still tells stories about the profile that walked into Kaisei's core and turned the lights off from the inside.",
      vanish: "A year later a new profile surfaces on the grid — quieter, better. Kaisei's countermeasures flinch at it. They should.",
    },
    burner: 'Kaisei',
    hunt: 'Kaisei Tower — the arcology core that still owns your burned profile.',
    stats: { strength: 4, speed: 6, stealth: 8, tech: 9, marksmanship: 3 }, yen: 350,
  },
  {
    id: 'socrates',
    name: 'Socrates',
    role: 'Struck-off surgeon',
    deck: 'Field-medic rig, heavily modified',
    bio: "Philosopher and child prodigy. For decades you've worked magic with your hands — manipulating liquid chrome and flesh like an artist.",
    stoleFrom: 'BiTechs Biomedical',
    origin: "A surgeon once, struck off for lifting med-tech from the big houses and using it on people who couldn't pay. BiTechs Biomedical sent people to end it, and they showed you mercy — of a kind. The chrome, not the throat.",
    kirosLine: "You stole from BiTechs to cut for people who couldn't pay, and they called it mercy when they only took your chrome.",
    doctorLine: "BiTechs work, this. Clean as a signature. You've stood on my side of the table — so you know exactly what the next part costs.",
    epilogues: {
      walkaway: "You open a back-alley clinic under another name and never charge anyone who can't pay. It isn't revenge. Some nights it's better.",
      flatline: "The hands that saved a hundred people the big houses wrote off finally stop moving. BiTechs files it under equipment loss.",
      burnout: "Every stolen BiTechs patent goes public on your way down. Clinics in ten districts run on your ashes.",
      vanish: "A free clinic opens in the deep end six months later. Nobody ever meets the surgeon. The waiting list never closes.",
    },
    burner: 'BiTechs Biomedical',
    hunt: 'the BiTechs Biomedical vault where they signed off on your death.',
    stats: { strength: 6, speed: 4, stealth: 5, tech: 8, marksmanship: 6 }, yen: 300,
  },
  {
    id: 'jackal',
    name: 'Jackal',
    role: 'Ex-corp military',
    deck: 'Griot field deck, service grade',
    bio: 'Ran espionage for whoever could pay — CEOs had you on speed dial. The ultimate problem solver.',
    stoleFrom: 'Griot Intelligence',
    origin: "You led black espionage for Griot Intelligence, good enough to be handed everything. When you caught your own colonels bleeding the corp dry and moved against them, they hung all of it on you — framed, burned, and turned loose as a warning to the next one.",
    kirosLine: "You caught your own colonels bleeding Griot dry, and they hung the whole rot on you. I've read the real file.",
    doctorLine: "Military-grade burn, Griot signature. They wanted the next deserter to read the warning right off your body.",
    epilogues: {
      walkaway: "The colonels who framed you die rich and old, and you let them. You know what the real file says. Most days that has to be enough.",
      flatline: "Griot buries the intrusion with the rest of its rot — one more soldier written off by men who never once blinked.",
      burnout: "The frame they hung on you burns with the building. Griot spends years denying the fire had a name.",
      vanish: "One morning every colonel who signed the frame wakes to empty accounts and open files. None of them ever says your name aloud again.",
    },
    burner: 'Griot Intelligence',
    hunt: "Griot Intelligence's inner ring, where your own colonels buried the frame.",
    stats: { strength: 8, speed: 6, stealth: 5, tech: 5, marksmanship: 9 }, yen: 300,
  },
  {
    id: 'hemlock',
    name: 'Hemlock',
    role: 'Assassin · poisoner',
    deck: 'Silent infiltration rig',
    bio: 'Deadly and patient — the best infiltrator anyone never saw coming. You blend into the shadows and move like mercury.',
    stoleFrom: 'an unknown corp',
    origin: "Poison and patience — the finest infiltrator no one ever saw. The last contract was the trap: a room of your own kind with orders to close the account. One of them let you walk and told you to vanish. You didn't. Here you are, defiant as ever.",
    kirosLine: "A room full of your own kind was sent to close your account, and they still don't know how you walked out. I do.",
    doctorLine: "Contact toxin, skin-delivered. Poisoner's work. Whoever burned you has a sense of humour — your trade, turned on you.",
    epilogues: {
      walkaway: "Nakamura keeps a room on retainer for the day you come back. You never do. You let them keep paying for it.",
      flatline: "Nakamura's countermeasure finishes what a room full of assassins couldn't. They call it a rounding error. They still check the shadows.",
      burnout: "Nakamura burns, and every assassin on their books quietly tears up the contract. Nobody takes work on a name that did that.",
      vanish: "One by one, the assassins from that room stop reporting in. Nakamura never finds a body. Yours, or theirs.",
    },
    burner: 'the Nakamura Directorate',
    hunt: 'the Nakamura Directorate — the corp that filled that room with your own kind.',
    stats: { strength: 5, speed: 8, stealth: 9, tech: 5, marksmanship: 8 }, yen: 200,
  },
];

export function characterOf(id) { return CHARACTERS.find(c => c.id === id) || CHARACTERS[0]; }

// ── The montage — who you were, a screen at a time ───────────────────────────
// Played after select, before Kiros makes contact. Four beats each: the height,
// the transgression, the burning, the grey months in the body.
export const MONTAGE = {
  zen: [
    "By day you wore a Kaisei badge and rode the elevator up past men who couldn't have picked your face out of a lineup.",
    "By night you were the most feared profile on the grid — faceless, untouchable, theirs without ever knowing it. Then you lifted the one file they'd kill to keep buried.",
    "They didn't fire you. They put a toxin in the loop that burned the liquid chrome in your nerves to dead scar, then dumped your body in the slums to rot.",
    "Seven months of that. Your hands still twitch for a deck that isn't there, and the grid burns on without you — close enough to see, dead as stone to touch.",
  ],
  socrates: [
    'You had the best hands in any theatre, and you spent them on the people the big houses had already crossed off the ledger.',
    "The chrome you lifted to do it belonged to BiTechs Biomedical. They don't forgive missing inventory.",
    'They sent people to close the account — and gave you mercy, of a kind. They burned the chrome out of your nerves instead of your heart, and left you breathing in the runoff.',
    'Struck off, burned out, seven months in a body you know far too well to lie to. It shakes now. You know exactly why.',
  ],
  jackal: [
    'You ran black espionage for Griot Intelligence — handed the whole board, because you never once blinked.',
    'Then you caught your own colonels bleeding the corp dry. So you did the unforgivable thing. You moved on them.',
    'They hung every crime on your name, burned the liquid chrome in your nerves to scar, and threw your body in the slums as a warning to the next fool with a conscience.',
    'Seven months a framed man, flinching at every door, the grid a country that exiled you and locked the gate.',
  ],
  hemlock: [
    'Poison and patience — the finest infiltrator no one ever saw come, and no one ever saw leave.',
    'The last contract was the trap: a room full of your own kind, and one order between them. Close your account.',
    "One of them let you walk and told you to vanish. You didn't. They burned the chrome from your nerves for the insolence and left you in the gutter to think about it.",
    'Seven months since, still breathing, still a splinter under the nail of the people who filled that room.',
  ],
};
export function montageOf(id) { return MONTAGE[id] || MONTAGE.zen; }

// ── The contact — Kiros reaches across the dead grid ─────────────────────────
// Shown after the montage. Kiros makes first contact over the net.
export const CONTACT = [
  'Then, on a night like any other, the grid you cannot touch reaches back for you.',
  'A message, routed through a dozen dead addresses, no name on it but one: Kiros.',
  '"I know what they did. I know what you were. I can give it back — the nerve, the reach, all of it — for a while, and for a price."',
  '"There is a clinic. Come and be built again. Then you work for me, and when the debt is paid, you go back for the ones who burned you."',
];

// ── Chrome — the signature specials, cut for who you are ─────────────────────
// Each of the four operatives has FOUR specials of their own, specific to them.
// At the rebuild you pick one of your four; more of your set can be earned on
// level-up. All hook the run through the knobs deriveStats / recompute manage
// (exploits, chrome, trace, loose credits, a second life).
export const CHARACTER_ABILITIES = {
  zen: [
    { id: 'z_ghostproto', name: 'Ghost protocol', tag: 'passive · their first shot whiffs',
      line: "Their first shot tracks a profile that isn't there. It always misses. Once per fight.",
      combat: { kind: 'passive', effect: 'first_whiff', uses: 1 } },
    { id: 'z_feedback', name: 'Feedback', tag: 'active · hurt them, fry their turn',
      line: 'You surge back down their targeting link — it hurts, and their next move dies in the wire.',
      combat: { kind: 'active', cost: 14, effect: 'feedback' } },
    { id: 'z_blackout', name: 'Blackout', tag: 'active · crash their optics',
      line: 'You reach into their eyes and turn them off. They shoot at ghosts for the rest of the fight.',
      combat: { kind: 'active', cost: 12, effect: 'blackout' } },
    { id: 'z_overclock', name: 'Overclock', tag: 'active · next two strikes crit',
      line: "You jack your reflexes past the redline. The next two strikes can't miss, and they bite deep. Once per fight.",
      combat: { kind: 'active', cost: 18, effect: 'overclock', uses: 1 } },
  ],
  socrates: [
    { id: 's_trauma', name: 'Trauma reflex', tag: 'passive · survive a killing blow',
      line: 'The second heart argues with death, and wins — once. You come back stitched and standing.',
      combat: { kind: 'passive', effect: 'trauma', uses: 1 } },
    { id: 's_scalpel', name: 'Scalpel', tag: 'active · pierce + bleed',
      line: 'You know exactly where the chrome meets the flesh. The cut ignores armour, and it keeps costing them.',
      combat: { kind: 'active', cost: 15, effect: 'scalpel' } },
    { id: 's_sedative', name: 'Sedative', tag: 'active · halve their damage',
      line: 'The right compound, skin to skin. Their swings go soft and stay soft.',
      combat: { kind: 'active', cost: 12, effect: 'sedative' } },
    { id: 's_triage', name: 'Triage', tag: 'active · stitch yourself mid-fight',
      line: "You've closed worse on worse tables. Pull yourself back together while they watch.",
      combat: { kind: 'active', cost: 16, effect: 'triage' } },
  ],
  jackal: [
    { id: 'j_ironhide', name: 'Iron hide', tag: 'passive · first two hits land soft',
      line: "You've walked away from worse. The first two hits of any fight land like they're tired.",
      combat: { kind: 'passive', effect: 'soft_hits', uses: 2 } },
    { id: 'j_suppress', name: 'Suppressing fire', tag: 'active · damage + pin them',
      line: 'You unload until the air itself is dangerous. They eat lead and keep their head down.',
      combat: { kind: 'active', cost: 14, effect: 'suppress' } },
    { id: 'j_breach', name: 'Breach round', tag: 'active · armour-piercing hit',
      line: 'One round, built for doors. Armour is a suggestion it declines.',
      combat: { kind: 'active', cost: 15, effect: 'breach' } },
    { id: 'j_execute', name: 'Execute', tag: 'active · finish the wounded',
      line: "When they're hurt enough, you end it. No flourish. No second chances. Once per fight.",
      combat: { kind: 'active', cost: 16, effect: 'execute', uses: 1 } },
  ],
  hemlock: [
    { id: 'h_knife', name: "Knife's edge", tag: 'passive · dodge a killing blow',
      line: 'Reflexes past thought. The hit that would end you simply misses. Once per fight.',
      combat: { kind: 'passive', effect: 'negate_lethal', uses: 1 } },
    { id: 'h_mercury', name: 'Mercury', tag: 'active · armour-piercing crit',
      line: 'You move quicker than the eye can hold — a cut that ignores armour and bites to the bone.',
      combat: { kind: 'active', cost: 15, effect: 'mercury' } },
    { id: 'h_burn', name: 'Burn', tag: 'active · kill their chrome',
      line: 'One touch and you cook the liquid chrome inside them. Every trick they own goes dark for the fight.',
      combat: { kind: 'active', cost: 12, effect: 'burn' } },
    { id: 'h_shadow', name: 'Shadow', tag: 'active · vanish, dodge next',
      line: 'You blink out and bleed into the dark. The next thing thrown at you finds empty air. Once per fight.',
      combat: { kind: 'active', cost: 18, effect: 'shadow', uses: 1 } },
  ],
};

// Combat abilities the player actually owns (build pick + level-ups), for the
// Combat screen. Passive/active specials carry a `combat` descriptor; legacy
// passive stat-mod abilities (the other operatives, for now) do not.
export function combatAbilitiesOf(ids) {
  return (ids || []).map(abilityOf).filter((a) => a && a.combat);
}
// Flat list for id lookup (recompute / CONFIRM_BUILD); per-character for the UI.
export const ABILITIES = Object.values(CHARACTER_ABILITIES).flat();
export function abilityOf(id) { return ABILITIES.find(a => a.id === id) || null; }
export function abilitiesFor(id) { return CHARACTER_ABILITIES[id] || CHARACTER_ABILITIES.zen; }

// Kiros's people — the family business that backs the play. Named here so the
// meeting can introduce them; fuller roles come as the board grows.
export const SIBLINGS = [
  { id: 'prophet', name: 'Prophet', tag: 'reads the wire', line: 'The eldest — sees the shape of a job before it happens.' },
  { id: 'queen', name: 'Queen', tag: 'runs the money', line: 'Moves credits through a hundred shells; nothing touches her twice.' },
  { id: 'rhys', name: 'Rhys', tag: 'moves the muscle', line: 'The youngest, and the one you send when talking is done.' },
];

// The rebuild: points the surgeon lets you route across the five stats, and the
// ceiling any one stat can reach.
export const ALLOC_POOL = 5;
export const STAT_CAP = 10;

// ── Fixers (who posts the work) ──────────────────────────────────────────────
// A fixed roster of job-givers. Their jobs all land on one board; you take work
// from whichever of them you trust that day. One of them has no name.
export const FIXERS = [
  {
    id: 'deane',
    name: 'Julius Deane',
    tag: 'Importer · information',
    line: 'Ninety years old behind a face rented by the decade. Trades in cans of ginger and the things people will pay not to have known.',
  },
  {
    id: 'finn',
    name: 'the Finn',
    tag: 'Fence · hardware',
    line: 'You never meet him — only his cut-outs and drop-boxes of dead tech. Word is he runs the whole operation from a beach somewhere in the Caribbean. Never lies about the price. Lies about everything else.',
  },
  {
    id: 'nameless',
    name: 'a voice with no name',
    tag: 'Backer · unknown',
    line: 'No handle, no face, no meeting. Credits clear before the job is spoken, and the job is only ever the next address.',
  },
];

export function fixerOf(id) { return FIXERS.find(f => f.id === id) || FIXERS[0]; }

// ── The clinic — hardware & wetwork you buy between runs ─────────────────────
// Each install trades money for reach. Some steady the chrome; some push the
// limit further out; the sharp ones do both and cost you on the way in.
export const HARDWARE = [
  {
    id: 'coolant',
    name: 'Liquid nitrogen coolant loop',
    line: 'Keeps the deck cold. Keeps you in the chair a few seconds longer than is wise.',
    cost: 300,
    apply: (s) => { s.nerveMax += 25; },
  },
  {
    id: 'breaker',
    name: 'A fresh exploit, boxed',
    line: 'A packaged zero-day, military-grade, three owners back. Still hungry.',
    cost: 250,
    apply: (s) => { s.breakersMax += 1; },
  },
  {
    id: 'reflex',
    name: 'Chrome-splice, reflex grade',
    line: 'They lay it in along the spine. For a week the whole world runs slow enough to read — the trace with it.',
    cost: 450,
    apply: (s) => { s.traceMult = Math.max(0.6, Math.round((s.traceMult - 0.12) * 100) / 100); },
  },
  {
    id: 'trauma',
    name: 'Trauma stabiliser',
    line: 'When the grid stops your heart it counts to three, then argues. It wins exactly once — and burns out winning.',
    cost: 500,
    apply: (s) => { s.stabiliser = true; },
  },
  {
    id: 'ghost',
    name: 'Signal-ghost baffle',
    line: 'It smears your trace across a dozen dead addresses. The countermeasures take longer to be sure of you.',
    cost: 400,
    apply: (s) => { s.ghost = true; },
  },
];

// ── The runs — the debt, spread across the sprawl ────────────────────────────
// Every job belongs to a `city` and has a `type`:
//   'fixer'  — money work the roster posts. Random-feeling, no story weight.
//   'kiros'  — the handler's own job. It only surfaces once that city's fixer
//              jobs are cleared, and Kiros's jobs run in arc order across the
//              map (`requires` the previous one). They carry the `intel`; the
//              last one traces the money home and flips the board (`turn`).
// state.availableRuns enforces the city + fixers-first + arc-order gates.
export const RUNS = [
  // ── Keihin (home) — fixer warm-ups, no story job ──
  { id: 'warmup', city: 'chiba', type: 'fixer', fixer: 'deane', requires: null,
    target: 'A cold-storage node over a noodle stand in the Keihin ward',
    brief: "Trivial. A test, and you know it. Kiros's retainer already cleared. Pull the ledger, leave the walls standing.",
    grade: 'grey', yen: 600, stake: 18, intel: null },
  { id: 'lien', city: 'chiba', type: 'fixer', fixer: 'finn', requires: null,
    target: 'A capsule-hotel node holding a rig the Finn has a lien on',
    brief: "Prove the deck's there, pull the registration. Commercial-grade, low stakes, honest money.",
    grade: 'grey', yen: 700, stake: 20, intel: null },

  // ── Songdo Spire (fixer money) ──
  { id: 'song_fix', city: 'songdo', type: 'fixer', fixer: 'deane', requires: null,
    target: "A Songdo Spire billboard-net controller",
    brief: "Deane wants an hour of the city's ad-net dark on cue. Easy money, if you're quick.",
    grade: 'grey', yen: 850, stake: 20, intel: null },

  // ── Karachi Deep (fixer money) ──
  { id: 'kar_fix', city: 'karachi', type: 'fixer', fixer: 'finn', requires: null,
    target: 'A Karachi Deep bill-of-lading vault',
    brief: 'The Finn needs a container to lose its paperwork before dawn. Straight lift, hardened walls.',
    grade: 'white', yen: 1300, stake: 28, intel: null },

  // ── Marrakech Ring (fixer money) ──
  { id: 'mar_fix', city: 'marrakech', type: 'fixer', fixer: 'deane', requires: null,
    target: 'A Marrakech Ring private-bank ledger',
    brief: "Deane pays for one account's history, whole. Hardened walls, patient money.",
    grade: 'white', yen: 1500, stake: 32, intel: null },

  // ── Cordillera (fixer money) ──
  { id: 'cor_fix', city: 'cordillera', type: 'fixer', fixer: 'finn', requires: null,
    target: 'A Cordillera mine-authority payroll',
    brief: 'Skim the hazard bonuses off a shift that never clocked in. Nobody misses ghosts.',
    grade: 'white', yen: 1400, stake: 30, intel: null },

  // ── Hainan Reach ──
  { id: 'kow_fix', city: 'kowloon', type: 'fixer', fixer: 'finn', requires: null,
    target: 'A stacked-arcology market node in the Hainan reach',
    brief: 'The Finn wants a courier manifest lifted before the consortium reconciles it. Quick money.',
    grade: 'grey', yen: 950, stake: 22, intel: null },
  { id: 'k1', city: 'kowloon', type: 'kiros', requires: null,
    target: 'A leasing registry, three shells deep',
    brief: "Kiros only calls once the local board is clear. Pull a paper trail on an account — and read the names while you're in there.",
    grade: 'white', yen: 1300, stake: 28, intel: 'I1' },

  // ── Cayo Verde ──
  { id: 'free_fix', city: 'freeside', type: 'fixer', fixer: 'finn', requires: null,
    target: "A black clinic's debt ledger on the Cayo Verde strip",
    brief: 'Wipe a line from the books. Hardened security — somebody paid for real walls.',
    grade: 'white', yen: 1200, stake: 30, intel: null },
  { id: 'k2', city: 'freeside', type: 'kiros', requires: 'k1',
    target: 'The Meridian Holdings back office',
    brief: "Kiros again, once the board's clear. Peel the shell the money runs through — the deeper you read, the more it isn't nothing.",
    grade: 'white', yen: 1600, stake: 32, intel: 'I2' },

  // ── Lagos ──
  { id: 'lag_fix', city: 'lagos', type: 'fixer', fixer: 'deane', requires: null,
    target: 'A resource-corp payroll node in the Lagos arcology',
    brief: 'Deane wants the payroll skimmed clean of a single name. Routine, if you are quick.',
    grade: 'white', yen: 1400, stake: 32, intel: null },
  { id: 'k3', city: 'lagos', type: 'kiros', requires: 'k2',
    target: "One of Kiros's own cut-out drops",
    brief: 'Kiros sends you after leverage on his own handler — pull the order history without anyone knowing you looked.',
    grade: 'white', yen: 1700, stake: 34, intel: 'I3' },

  // ── Sevastopol ──
  { id: 'sev_fix', city: 'sevastopol', type: 'fixer', fixer: 'deane', requires: null,
    target: 'A Sevastopol cyber-intelligence relay',
    brief: 'Deane pays for a clean copy of a signals cache. Hardened walls, cold money.',
    grade: 'white', yen: 1600, stake: 36, intel: null },
  { id: 'k4', city: 'sevastopol', type: 'kiros', requires: 'k3',
    target: 'A holding-company registry the voice pointed you at',
    brief: 'Kiros passes down an order from above: pull the ownership tree, who really owns whom. Black-site security; it does not send a bill.',
    grade: 'black', yen: 2800, stake: 48, intel: 'I4' },

  // ── Tidewater — where it ends ──
  { id: 'spr_fix', city: 'sprawl', type: 'fixer', fixer: 'finn', requires: null,
    target: 'A zaibatsu courier vault in Tidewater',
    brief: 'Straight theft, black-site walls. Big money, worse if the trace locks.',
    grade: 'black', yen: 2400, stake: 44, intel: null },
  { id: 'k5', city: 'sprawl', type: 'kiros', requires: 'k4', turn: true,
    target: 'The account behind the voice with no name',
    brief: 'The last job Kiros hands you. Trace the money all the way home — to whoever has been signing your cheques. Then the debt is paid, and the board is yours.',
    grade: 'black', yen: 3600, stake: 56, intel: 'I5' },
];

export function runOf(id) { return RUNS.find(r => r.id === id) || null; }
export const DEBT_RUNS = RUNS.length; // clearing all of these turns the board

// Mission shape of a job — how it actually plays. Most work is a heist; a few
// fixer jobs are extractions (rescues) or interceptions (pursuits). Assigned by
// id here so the run data stays untouched; a run may also carry its own
// `mission`. Kiros's story jobs and the hunt stay heists.
export const MISSION_LABEL = { heist: 'heist', rescue: 'rescue', pursuit: 'pursuit' };
const MISSION_BY_ID = {
  kar_fix: 'rescue', free_fix: 'rescue',
  lag_fix: 'pursuit', cor_fix: 'pursuit',
};
export function missionOf(run) { return (run && (run.mission || MISSION_BY_ID[run.id])) || 'heist'; }

// Who is shown as posting a job — a fixer, or Kiros himself for his own work.
export const KIROS = { id: 'kiros', name: 'Kiros', tag: 'The handler',
  line: 'The one who bought you back. His jobs come last, and they are never just money.' };
export function posterOf(run) { return run.type === 'kiros' ? KIROS : fixerOf(run.fixer); }

// ── Intel — the truth, a fragment at a time, as clean as you earn it ─────────
// Each arc run hands back a fragment. What it reveals is fixed; how reliable it
// is depends on how you ran (the `quality` stored in the dossier). I5 is the
// turn, and it names YOUR burner, so its text is completed at render time.
export const INTEL = {
  I1: { title: 'A number on the money',
    text: 'The voice pays through a shell — Meridian Holdings, a name built to mean nothing. But it snags on something as it scrolls past. You have seen it before, printed small on paper you were never meant to hold.' },
  I2: { title: "The shell's shell",
    text: 'Meridian is a cut-out, and cut-outs have parents. Peel it back one layer and another company stands behind it, and behind that a holding firm with its fingers in half the corps on the strip. It climbs higher than you can see from down here.' },
  I3: { title: 'Kiros, thinner than he looks',
    text: "You crack one of Kiros's own drops and read his mail. He is not the top of anything — a hire, well paid and well buried, taking his orders down the same wire that feeds you. The man who bought you back is on a leash of his own." },
  I4: { title: 'A name you already know',
    text: "The holding company answers to one controlling stake, and the name on it lands in your gut like a swallowed stone: {burner}. You've known since the first night in the burned body — you just didn't want it to be true." },
  I5: { title: 'The turn',
    text: 'You trace the money the whole way home, address by address, until it stops. The voice with no name is a hand of {burner}. The people who burned you bought you back — to run their errands, and to be thrown away clean when the errands were done. Kiros was the glove they wore to reach you. Every job you ran, you ran for them.' },
};

// The hunt — after the turn, one job left, and it is yours. Built per-operative.
export function huntRun(character) {
  return {
    id: 'hunt', fixer: 'self', requires: null, hunt: true, finale: true,
    target: character.hunt,
    brief: `No retainer. No fixer. Just you and ${character.burner}. Punch through their black-site core, take back what they took — or flatline on their doorstep.`,
    grade: 'black', yen: 0, stake: 66, intel: null,
  };
}

// ── Endings — how the hunt closes. {burner} filled at render. ────────────────
export const ENDINGS = {
  walkaway: { id: 'walkaway', title: 'The Payout',
    text: 'You look at the address a long time, and then you close it. The debt is clear and the money is real; you buy a body that does not shake and a room with no deck in it. Somewhere {burner} goes on exactly as it was, and you tell yourself that is a kind of winning. Every night the wire hums on the other side of the wall, still saying your name, and every night you pretend you cannot hear it.' },
  flatline: { id: 'flatline', title: 'Flatline',
    text: 'Their black-site core reaches back down the link and closes its hand around your heart, and this time nothing argues. For one long white second you are inside {burner}, faster and clearer than you have ever been — and then you are a flatline on somebody\'s monitor, a name the strip says for a week and forgets. One more operative Kiros will not have to bury.' },
  burnout: { id: 'burnout', title: 'Burn Out',
    text: 'You gut them — take back what they took and salt the ground on your way out — and it costs you everything: your cover, your chrome, the last of whatever you were keeping in reserve. {burner} burns, and you burn inside it, a fire the corps will study for years. They will not forget your name. You will not live to hear them say it.' },
  vanish: { id: 'vanish', title: 'Ghost',
    text: 'You go in with the whole dossier and take them apart without a sound — the money, the records, the ones who signed the order — and you are three cities gone before {burner} feels the floor drop out from under it. No body in the chair. No name on any list. Somewhere Kiros hears the voice with no name go quiet, and wonders, for the first time, who was ever behind whom.' },
};

// Dossier score needed for the clean exit. Intel accrues on every successful
// run (clean +3, rushed +1), so this bites: sloppy runners get the blaze, not
// the ghost. Single source — engine.finaleChoices imports it from here.
export const VANISH_INTEL = 24;

export function pickEnding({ flatlined }) {
  return flatlined ? ENDINGS.flatline : null; // chosen at the hunt; see engine.finaleChoices
}

export const RETIRE_AT = 5000; // credits to walk away clean without the finale

// ── Flavour pools for procedural grid labels ────────────────────────────────
export const NODE_WORDS = [
  'ledger', 'cache', 'relay', 'vault', 'index', 'archive', 'gate', 'switch',
  'daemon', 'kernel', 'null', 'ghost', 'echo', 'sink', 'core',
];

export const CITY_LINES = [
  'The sky above the port was the colour of a screen tuned to a dead channel.',
  'Rain, and neon smeared on the wet street like something spilled and not cleaned up.',
  'Somewhere below, the arcade\'s speakers were still selling a war that ended years ago.',
];
