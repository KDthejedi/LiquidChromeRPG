// CHRONICLES · CHROME — engine.
//
// Seeds a run and builds the firewall lattice: columns of nodes you trace
// left-to-right from an entry toward the data core, while a trace timer (the
// intrusion detection waking up to you) fills behind you. Some nodes are
// firewalled and must be cracked with an exploit or brute-forced at a cost in
// time. Reach the core and pull the data before the trace locks.
//
// Pure data out. matrix.js draws the nonspace; Run.js drives the taps.

import { VANISH_INTEL } from './world.js';

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Security grades — the whole difficulty curve lives here. (Node type 'ice' is
// kept as the internal key for a firewalled node.)
const GRADES = {
  grey:  { cols: 4, rows: 3, traceRate: 5.5,  iceChance: 0.16, lethal: false },
  white: { cols: 5, rows: 4, traceRate: 8.0,  iceChance: 0.28, lethal: false },
  black: { cols: 6, rows: 4, traceRate: 11.5, iceChance: 0.38, lethal: true  },
};

let _nid = 0;
const nid = () => `n${_nid++}`;

// Build the lattice. Node types: entry | open | ice | data | core.
export function layIce(run) {
  const g = GRADES[run.grade] || GRADES.grey;
  const cols = g.cols, rows = g.rows;
  const grid = []; // grid[col][row] = node

  for (let c = 0; c < cols; c++) {
    grid[c] = [];
    for (let r = 0; r < rows; r++) {
      let type = 'open';
      if (c === 0 && r === (rows >> 1)) type = 'entry';
      else if (c === cols - 1 && r === (rows >> 1)) type = 'core';
      else if (Math.random() < g.iceChance) type = 'ice';
      else if (Math.random() < 0.14) type = 'data'; // bonus credits on the way
      grid[c][r] = { id: nid(), col: c, row: r, type, cut: false, taken: false };
    }
  }

  // Guarantee the entry and core rows are reachable: force the entry column's
  // mid node and the core node to exist as placed above.
  const nodes = grid.flat();
  const entry = nodes.find(n => n.type === 'entry');
  const core = nodes.find(n => n.type === 'core');

  // Edges: connect each node to next-column nodes within one row of it.
  const edges = {}; // id -> [ids in next column]
  for (const n of nodes) edges[n.id] = [];
  for (let c = 0; c < cols - 1; c++) {
    for (const a of grid[c]) {
      for (const b of grid[c + 1]) {
        if (Math.abs(a.row - b.row) <= 1) edges[a.id].push(b.id);
      }
    }
  }

  // Make sure at least one non-ice path exists to the core by carving a spine:
  // pick a walk from entry to core and strip ice off it (leave one, maybe).
  let cur = entry;
  for (let c = 0; c < cols - 1; c++) {
    const outs = edges[cur.id].map(id => nodes.find(n => n.id === id));
    // prefer stepping toward the core's row
    outs.sort((x, y) => Math.abs(x.row - core.row) - Math.abs(y.row - core.row));
    const next = outs[0];
    if (next && next.type === 'ice' && Math.random() < 0.6) next.type = 'open';
    cur = next || cur;
  }

  return {
    cols, rows,
    nodes,
    edges,
    entryId: entry.id,
    coreId: core.id,
    traceRate: g.traceRate,
    lethal: g.lethal,
    grade: run.grade,
  };
}

// Neighbours of a node in the next column (the only legal moves — you go
// forward, into the machine, never back out the way you came).
export function neighbours(lattice, id) {
  return (lattice.edges[id] || []).map(n => lattice.nodes.find(x => x.id === n));
}

export function nodeById(lattice, id) {
  return lattice.nodes.find(n => n.id === id);
}

// ── The heist as a path ──────────────────────────────────────────────────────
// A run is a short string of encounters between the way in and the objective.
// Each beat has a kind; the Heist component offers approach-appropriate ways
// through it, resolved by a dice check, a mini-game (locks / ice), or a fight.
// Beats are dealt fresh each run from the grade, so no two heists read the same.
const HEIST_PLACES = [
  'the loading dock', 'a service corridor', 'the mirror-glass atrium',
  'a checkpoint under dead cameras', 'the server floor', 'the exec mezzanine',
  'the vault antechamber', 'a maintenance shaft', 'the skybridge',
  'the parking sublevel', 'a cold-storage bay', 'the roof relays',
];
const HEIST_OBJECTIVES = [
  'the core vault', 'the black-site server', 'the exec safe', 'the cold data cell',
];
const HEIST_FOES = [
  'Corp security', 'a lone guard', 'a security drone', 'a response team',
  'a black-ice netrunner', 'a cyber-samurai on retainer',
];
const HEIST_KINDS = ['guard', 'door', 'terminal', 'patrol', 'gap'];

export function layHeist(run) {
  const g = run.grade;
  const size = g === 'black' ? 5 : g === 'white' ? 4 : 3;
  const level = g === 'black' ? 3 : g === 'white' ? 2 : 1;
  const beats = [];
  for (let i = 0; i < size - 1; i++) {
    beats.push({
      id: i, kind: pick(HEIST_KINDS), place: pick(HEIST_PLACES), foe: pick(HEIST_FOES),
      loot: Math.random() < 0.5 ? randInt(120, 300) : 0, level,
    });
  }
  beats.push({
    id: size - 1, kind: 'objective', place: pick(HEIST_OBJECTIVES), foe: pick(HEIST_FOES),
    loot: randInt(160, 340), level,
  });
  return { beats, level, lethal: g === 'black', grade: g };
}

// A rescue: infiltrate to the captive, free them, then run a hot extraction
// with them in tow — escort beats bleed heat faster, and the last one is the
// waiting ride. The person you're pulling out is named for flavour.
const RESCUE_WHO = [
  'a burned runner', 'a corp defector', "one of Kiros's contacts", 'a witness who saw too much',
  'a chipped kid', "a fixer's daughter", 'a netrunner the corps want silenced',
];
const RESCUE_HOLD = ['a holding cell', 'a wet-room', 'an interrogation suite', 'a cold locker', 'a black-site ward'];
const ESCORT_KINDS = ['guard', 'patrol', 'gap'];

export function layRescue(run) {
  const g = run.grade;
  const level = g === 'black' ? 3 : g === 'white' ? 2 : 1;
  const infilCount = g === 'black' ? 3 : 2;
  const escortCount = g === 'black' ? 3 : 2;
  const infil = [];
  for (let i = 0; i < infilCount; i++) {
    infil.push({ id: 'i' + i, kind: pick(HEIST_KINDS), place: pick(HEIST_PLACES), foe: pick(HEIST_FOES),
      loot: 0, level });
  }
  const free = { id: 'free', kind: 'free', place: pick(RESCUE_HOLD), foe: pick(HEIST_FOES), level };
  const escort = [];
  for (let i = 0; i < escortCount - 1; i++) {
    escort.push({ id: 'e' + i, kind: pick(ESCORT_KINDS), place: pick(HEIST_PLACES), foe: pick(HEIST_FOES),
      loot: 0, level, escort: true });
  }
  escort.push({ id: 'ride', kind: 'extract', place: 'the waiting ride', foe: pick(HEIST_FOES), level, escort: true });
  return { infil, free, escort, level, lethal: g === 'black', grade: g, who: pick(RESCUE_WHO) };
}

// ── Travel across the sprawl ─────────────────────────────────────────────────
// A vehicle's effective speed is its base days minus any garage tunes, floored
// at one. A leg's time scales that by the map distance between two cities, so a
// hop next door is cheap and crossing the sprawl on a rusted mule is a slog.
export const effectiveDays = (vehicleDays, mods) => Math.max(1, vehicleDays - (mods || 0));
export function cityDistance(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
export function travelDays(from, to, vehicleDays, mods) {
  if (!from || !to || from.id === to.id) return 0;
  const eff = effectiveDays(vehicleDays, mods);
  return Math.max(1, Math.round(eff * (0.5 + cityDistance(from, to) / 130)));
}

// The hunt is won — how do you walk out? Burn out is always on the table; the
// clean exit (vanish) takes a well-earned dossier (VANISH_INTEL, from world.js).
export function finaleChoices(state) {
  const choices = [
    { ending: 'burnout', label: 'Burn it down', note: 'Take them — and go with them.' },
  ];
  if ((state.intel || 0) >= VANISH_INTEL) {
    choices.push({ ending: 'vanish', label: 'Vanish', note: 'Take them clean, and disappear.' });
  }
  return choices;
}
