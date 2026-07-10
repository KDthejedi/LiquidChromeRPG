// LIQUID CHROME — operative data (WORLD.md §6, mapped through D2)
// Legacy → D2: strength→Body, speed→Reflex, tech→Mind; Presence/Signal new.
// Legacy stealth/marksmanship live on as the Infiltration/Firearms skills.

export const SKILL_NAMES = [
  'Firearms', 'Close Combat', 'Infiltration', 'Electronics', 'Intrusion',
  'Negotiation', 'Intimidation', 'Streetwise', 'Perception', 'Channeling',
  'Medicine',
];

export const OPERATIVES = {
  zen: {
    id: 'zen',
    portrait: 'assets/portraits/zen.png',
    kirosRead: 'Kaisei never even learned your face — just your profile, and how to burn it. I know both.',
    name: 'ZEN',
    role: 'Corporate ghost',
    accent: '#38bdf8',
    bio: 'The most feared hacker on the net. Corporations searched far and wide for you — but you were always a ghost.',
    credits: 350,
    deck: 'Kaisei Ghost-7, company issue',
    attrs: { Body: 4, Reflex: 6, Mind: 9, Presence: 4, Signal: 7 },
    skills: {
      Firearms: 3, 'Close Combat': 2, Infiltration: 8, Electronics: 8,
      Intrusion: 9, Negotiation: 4, Intimidation: 3, Streetwise: 6,
      Perception: 7, Channeling: 6, Medicine: 2,
    },
    kit: [
      { name: 'Ghost protocol', cost: 0, desc: 'Passive — their first shot tracks a profile that isn’t there; always misses, once per fight.' },
      { name: 'Feedback', cost: 14, desc: 'Tech-scaled damage down their targeting link; their next move dies in the wire.' },
      { name: 'Blackout', cost: 12, desc: 'Crash their optics; accuracy craters all fight.' },
      { name: 'Overclock', cost: 18, desc: 'Once per fight — next two strikes can’t miss and bite deep.' },
    ],
  },
  socrates: {
    id: 'socrates',
    portrait: 'assets/portraits/socrates.png',
    kirosRead: 'You stole from BiTechs to cut for people who couldn’t pay, and they called it mercy when they only took your chrome.',
    name: 'SOCRATES',
    role: 'Struck-off surgeon',
    accent: '#2dd4bf',
    bio: 'Philosopher and child prodigy. For decades you’ve worked magic with your hands — manipulating liquid chrome and flesh like an artist.',
    credits: 300,
    deck: 'Field-medic rig, heavily modified',
    attrs: { Body: 6, Reflex: 4, Mind: 8, Presence: 6, Signal: 5 },
    skills: {
      Firearms: 6, 'Close Combat': 5, Infiltration: 5, Electronics: 7,
      Intrusion: 6, Negotiation: 6, Intimidation: 4, Streetwise: 5,
      Perception: 7, Channeling: 4, Medicine: 9,
    },
    kit: [
      { name: 'Trauma reflex', cost: 0, desc: 'Passive — survive a killing blow, back at quarter health, once per fight.' },
      { name: 'Scalpel', cost: 15, desc: 'Armour-ignoring cut that bleeds them for three of your turns.' },
      { name: 'Sedative', cost: 12, desc: 'Their damage halves all fight.' },
      { name: 'Triage', cost: 16, desc: 'Stitch yourself back +35% mid-fight.' },
    ],
  },
  jackal: {
    id: 'jackal',
    portrait: 'assets/portraits/jackal.png',
    kirosRead: 'You caught your own colonels bleeding Griot dry, and they hung the whole rot on you. I’ve read the real file.',
    name: 'JACKAL',
    role: 'Ex-corp military',
    accent: '#f43f5e',
    bio: 'Ran espionage for whoever could pay — CEOs had you on speed dial. The ultimate problem solver.',
    credits: 300,
    deck: 'Griot field deck, service grade',
    attrs: { Body: 8, Reflex: 6, Mind: 5, Presence: 7, Signal: 3 },
    skills: {
      Firearms: 9, 'Close Combat': 7, Infiltration: 5, Electronics: 4,
      Intrusion: 4, Negotiation: 5, Intimidation: 8, Streetwise: 6,
      Perception: 8, Channeling: 2, Medicine: 4,
    },
    kit: [
      { name: 'Iron hide', cost: 0, desc: 'Passive — first two hits of any fight land soft.' },
      { name: 'Suppressing fire', cost: 14, desc: 'Damage, and they lose their next turn.' },
      { name: 'Breach round', cost: 15, desc: 'Armour-piercing heavy hit.' },
      { name: 'Execute', cost: 16, desc: 'Once per fight — below 35% health they’re finished outright; above it, heavy damage.' },
    ],
  },
  hemlock: {
    id: 'hemlock',
    portrait: 'assets/portraits/hemlock.png',
    kirosRead: 'A room full of your own kind was sent to close your account, and they still don’t know how you walked out. I do.',
    name: 'HEMLOCK',
    role: 'Assassin · poisoner',
    accent: '#a78bfa',
    bio: 'Deadly and patient — the best infiltrator anyone never saw coming. You blend into the shadows and move like mercury.',
    credits: 200,
    deck: 'Silent infiltration rig',
    attrs: { Body: 5, Reflex: 8, Mind: 5, Presence: 5, Signal: 6 },
    skills: {
      Firearms: 8, 'Close Combat': 8, Infiltration: 9, Electronics: 4,
      Intrusion: 4, Negotiation: 4, Intimidation: 6, Streetwise: 7,
      Perception: 8, Channeling: 5, Medicine: 5,
    },
    kit: [
      { name: 'Knife’s edge', cost: 0, desc: 'Passive — the blow that would end you simply misses, once per fight.' },
      { name: 'Mercury', cost: 15, desc: 'A cut quicker than the eye; ignores armour, bites to the bone.' },
      { name: 'Burn', cost: 12, desc: 'One touch cooks the liquid chrome inside them; every trick they own goes dark for the fight.' },
      { name: 'Shadow', cost: 18, desc: 'Once per fight — blink out and bleed into the dark; the next thing thrown at you finds empty air.' },
    ],
  },
};

export function deriveVitals(attrs) {
  return {
    healthMax: 20 + attrs.Body * 4,
    chromeMax: 30 + attrs.Mind * 2,
    staticMax: 100,
  };
}

export function newCharacter(opId) {
  const op = OPERATIVES[opId];
  const vitals = deriveVitals(op.attrs);
  return {
    opId,
    name: op.name,
    role: op.role,
    attrs: { ...op.attrs },
    skills: { ...op.skills },
    credits: op.credits,
    health: vitals.healthMax,
    chrome: vitals.chromeMax,
    static: 0,
  };
}
