// CHRONICLES · LIQUID CHROME — runtime store.
//
// One reducer, mirrored to localStorage so a run resumes in place after a
// refresh or an app-switch. State is plain JSON; the lattice is re-seeded per
// run by engine.layIce.

import {
  characterOf, HARDWARE, RUNS, runOf, huntRun, ENDINGS, RETIRE_AT,
  HOME_CITY, CITIES, cityOf, vehicleOf, VEHICLE_TUNE,
  montageOf, abilityOf, ALLOC_POOL, STAT_CAP,
} from './world.js';
import { layIce, finaleChoices, clamp, travelDays, randInt } from './engine.js';

const SAVE_KEY = 'chronicles-chrome-v1';
// Bump when the state shape changes incompatibly — stale saves from older
// builds (pre-onboarding, pre-stats) otherwise rehydrate past the character
// select into a half-broken world.
const SAVE_VERSION = 6;

// Chance the sprawl throws something at you on a leg of travel — an ambush or a
// net-snare, settled with the fight or the ice before you reach the board.
const ENCOUNTER_CHANCE = 0.33;

// Missions between level-ups — clear this many debt runs and you earn a point
// to raise a stat or install a new ability.
const LEVEL_EVERY = 2;

export function initialState() {
  return {
    screen: 'title',
    characterId: null,
    name: '',
    // per-run art seed — deals which pool variant each city/ending shows, so
    // replays look different (rolled fresh on PICK_CHARACTER via initialState)
    artSeed: Math.floor(Math.random() * 1e9),
    // character build (select → montage → contact → doctor)
    baseStats: null,     // the archetype's stats, before the rebuild
    alloc: null,         // points routed into each stat at the doctor
    pool: 0,             // rebuild points left to spend
    ability: null,       // chosen chrome / special ability id
    montageIndex: 0,     // which backstory beat we're on
    // the five-stat sheet (finalised at the doctor) and what it drives
    stats: null,         // { strength, speed, stealth, tech, marksmanship }
    marks: 5,            // marksmanship, read by the run for loose-credit yield
    // progression — a point earned every few missions, spent on stats/abilities
    level: 1,
    points: 0,           // unspent level-up points
    abilities: [],       // ability ids owned (build pick + any gained on level-up)
    // resources
    yen: 0,
    nerve: 100,
    nerveMax: 100,
    breakers: 2,
    breakersMax: 2,
    traceMult: 1.0,      // trace-rate multiplier from speed + stealth (lower = safer)
    burn: 1.0,
    // installs
    hardware: [],
    stabiliser: false,
    ghost: false,
    // where you are, and what you drive
    cityId: HOME_CITY,   // current district
    vehicleId: 'mule',   // owned ride
    speedMods: 0,        // garage tunes installed (each −1 travel day)
    // the debt + the dossier
    runsDone: [],        // debt run ids completed
    dossier: [],         // [{ id, quality }] intel fragments earned, with how clean
    intel: 0,            // score: clean run +3, rushed +1, traced +0
    turned: false,       // the board has flipped — the hunt is unlocked
    // current
    briefId: null,
    run: null,           // full run object in play (debt or hunt)
    runId: null,
    lattice: null,
    // a road encounter mid-travel, or null
    encounter: null,
    // the ledger of who you choose to be — tallied every time a job (or the
    // street) puts a moral choice in front of you. Seeded at the first meeting.
    morality: { lethal: 0, nonlethal: 0, guile: 0 },
    // outcome scratch (read by Debrief / Ending)
    lastOutcome: null,
    ending: null,
    day: 0,
    sfx: null,
  };
}

// Rides retired from the lot — a save that owns one gets the nearest survivor
// (by speed), not the starter mule that vehicleOf's fallback would hand them.
const LEGACY_VEHICLES = { wraith: 'shinden', noctis: 'seraph' };

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s !== 'object') return null;
    if (s.v !== SAVE_VERSION) return null; // stale shape — start clean at the title
    if (LEGACY_VEHICLES[s.vehicleId]) s.vehicleId = LEGACY_VEHICLES[s.vehicleId];
    return s;
  } catch { return null; }
}

export function saveState(s) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...s, v: SAVE_VERSION })); } catch { /* private mode */ }
}

const beep = (name) => ({ key: Math.random(), name });

// The board for the city you're standing in. After the turn: nothing but the
// hunt — one job, and it is yours, wherever you are.
//   fixer jobs — available as soon as their `requires` clears (usually at once).
//   kiros jobs — surface only when this city's fixer jobs are ALL done, and in
//                arc order (each `requires` the previous kiros job).
export function availableRuns(s) {
  if (s.turned) return [huntRun(characterOf(s.characterId))];
  const done = new Set(s.runsDone);
  const here = RUNS.filter(r => r.city === s.cityId);
  const fixersCleared = here.filter(r => r.type === 'fixer').every(r => done.has(r.id));
  return here.filter(r => {
    if (done.has(r.id)) return false;
    if (r.requires && !done.has(r.requires)) return false;
    if (r.type === 'kiros' && !fixersCleared) return false;
    return true;
  });
}

// Is Kiros's job in this city waiting on the local fixer board? (for board copy)
export function kirosPending(s) {
  const here = RUNS.filter(r => r.city === s.cityId);
  const kiros = here.find(r => r.type === 'kiros');
  if (!kiros || s.runsDone.includes(kiros.id)) return false;
  const done = new Set(s.runsDone);
  const fixersCleared = here.filter(r => r.type === 'fixer').every(r => done.has(r.id));
  const arcReady = !kiros.requires || done.has(kiros.requires);
  return { kiros, fixersCleared, arcReady };
}

// Days a leg to another city costs, given the current ride and its tunes.
export function legDays(s, toCityId) {
  return travelDays(cityOf(s.cityId), cityOf(toCityId), vehicleOf(s.vehicleId).days, s.speedMods);
}

// Resolve a run id for the brief/start (the hunt is generated, not in RUNS).
export function runById(s, id) {
  return id === 'hunt' ? huntRun(characterOf(s.characterId)) : runOf(id);
}

// The five-stat sheet → the run's knobs. Strength holds nerve; tech carries
// exploits; speed + stealth slow the trace; burn (nerve spent per run) eases with
// strength. Marksmanship is read straight (loose-credit yield) in the run.
export function deriveStats(st) {
  const s = st || { strength: 5, speed: 5, stealth: 5, tech: 5, marksmanship: 5 };
  return {
    nerveMax: 90 + s.strength * 5,
    breakersMax: 2 + Math.floor(s.tech / 4),
    burn: Math.round((1.3 - s.strength * 0.035) * 100) / 100,
    traceMult: Math.max(0.7, Math.round((1.15 - (s.speed + s.stealth) * 0.028) * 100) / 100),
  };
}

// Rebuild every derived knob from the stat sheet, then re-apply owned hardware
// and abilities on top. Idempotent — safe to call after any stat raise or new
// install, so leveling a stat never wipes a hardware bonus (or vice versa).
function recompute(s) {
  if (!s.stats) return s;
  const d = deriveStats(s.stats);
  s.nerveMax = d.nerveMax;
  s.breakersMax = d.breakersMax;
  s.burn = d.burn;
  s.traceMult = d.traceMult;
  s.marks = s.stats.marksmanship;
  s.stabiliser = false;
  s.ghost = false;
  for (const id of s.hardware || []) { const hw = HARDWARE.find(h => h.id === id); if (hw) hw.apply(s); }
  for (const id of s.abilities || []) { const ab = abilityOf(id); if (ab && ab.apply) ab.apply(s); }
  return s;
}

// How clean was the run — sets the intel earned and the fragment's reliability.
const INTEL_SCORE = { clean: 3, rushed: 1, traced: 0 };
function gradeRun(action) {
  if (action.caught) return 'traced';
  if ((action.traceAtPull || 0) >= 70 || (action.forced || 0) > 0) return 'rushed';
  return 'clean';
}

export function reducer(state, action) {
  const s = { ...state };
  switch (action.type) {
    case 'RESET':
      return initialState();

    // Start over from the title's menu — straight to character select.
    case 'NEW_GAME':
      return { ...initialState(), screen: 'outfit' };

    case 'PICK_CHARACTER': {
      const c = characterOf(action.characterId);
      // Identity only — the montage plays, Kiros calls, and the stats/chrome are
      // chosen at the doctor (CONFIRM_BUILD finalises everything).
      return {
        ...initialState(),
        screen: 'montage',
        characterId: c.id,
        name: (action.name && action.name.trim()) || c.name,
        baseStats: c.stats,
        alloc: { strength: 0, speed: 0, stealth: 0, tech: 0, marksmanship: 0 },
        pool: ALLOC_POOL,
        ability: null,
        montageIndex: 0,
        sfx: beep('jack'),
      };
    }

    case 'MONTAGE_NEXT': {
      const beats = montageOf(s.characterId);
      const next = s.montageIndex + 1;
      if (next >= beats.length) return { ...s, screen: 'contact', sfx: beep('move') };
      return { ...s, montageIndex: next, sfx: beep('move') };
    }

    case 'ALLOCATE': {
      if (!s.alloc || !s.baseStats) return s; // no build in progress (corrupt save)
      const key = action.key, delta = action.delta;
      const cur = s.alloc[key] || 0;
      const base = s.baseStats[key] || 0;
      if (delta > 0 && (s.pool <= 0 || base + cur >= STAT_CAP)) return s;
      if (delta < 0 && cur <= 0) return s;
      return { ...s, alloc: { ...s.alloc, [key]: cur + delta }, pool: s.pool - delta, sfx: beep('move') };
    }

    case 'PICK_ABILITY':
      return { ...s, ability: action.id, sfx: beep('move') };

    case 'CONFIRM_BUILD': {
      if (!s.baseStats || !s.alloc) return s; // no build in progress (corrupt save)
      const c = characterOf(s.characterId);
      const stats = {};
      for (const k of Object.keys(s.baseStats)) stats[k] = s.baseStats[k] + (s.alloc[k] || 0);
      const ns = {
        ...s,
        stats,
        abilities: s.ability ? [s.ability] : [],
        yen: c.yen,
        screen: 'contacts',
        sfx: beep('jack'),
      };
      recompute(ns);                   // derive knobs + apply the chosen ability
      ns.nerve = ns.nerveMax;
      ns.breakers = ns.breakersMax;
      return ns;
    }

    case 'GO':
      return { ...s, screen: action.screen, sfx: action.quiet ? s.sfx : beep('move') };

    // Log a moral choice. `axis` ∈ 'lethal' | 'nonlethal' | 'guile' — the
    // ledger this and every later fork writes to.
    case 'RECORD_CHOICE': {
      const axis = action.axis;
      const m = s.morality || { lethal: 0, nonlethal: 0, guile: 0 };
      if (!(axis in m)) return s;
      return { ...s, morality: { ...m, [axis]: (m[axis] || 0) + 1 } };
    }

    case 'OPEN_BRIEF':
      return { ...s, screen: 'brief', briefId: action.id, sfx: beep('move') };

    case 'BUY': {
      const hw = HARDWARE.find(h => h.id === action.id);
      if (!hw || s.yen < hw.cost || s.hardware.includes(hw.id)) return s;
      s.yen -= hw.cost;
      s.hardware = [...s.hardware, hw.id];
      recompute(s);                    // rebuild knobs from stats + all installs
      s.nerve = clamp(s.nerve, 0, s.nerveMax);
      s.sfx = beep('buy');
      return s;
    }

    case 'FLUSH': {
      const cost = Math.round((s.nerveMax - s.nerve) * 6);
      if (cost <= 0 || s.yen < cost) return s;
      s.yen -= cost;
      s.nerve = s.nerveMax;
      s.sfx = beep('buy');
      return s;
    }

    case 'TRAVEL': {
      // cityOf falls back to the first city, so validate against the real list.
      if (action.cityId === s.cityId || !CITIES.some(c => c.id === action.cityId)) return s;
      s.day += legDays(s, action.cityId);
      s.cityId = action.cityId;
      // the road may throw something at you before you reach the board
      if (s.stats && Math.random() < ENCOUNTER_CHANCE) {
        s.encounter = {
          type: Math.random() < 0.5 ? 'ambush' : 'snare',
          level: clamp(1 + Math.floor((s.runsDone.length) / 4), 1, 3),
        };
        s.screen = 'encounter';
      } else {
        s.encounter = null;
        s.screen = 'contacts';
      }
      s.sfx = beep('jack');
      return s;
    }

    // payload: { n } — burn chrome on a special mid-combat (drawn from the reserve)
    case 'SPEND_CHROME': {
      const n = Math.max(0, Math.round(action.n || 0));
      if (!n) return s;
      return { ...s, nerve: clamp(s.nerve - n, 0, s.nerveMax) };
    }

    // payload: { win, weapon? } — settle a road encounter and land on the board.
    // `weapon: true` means the ride's hardware ended it: charge the ammo cost
    // (read from the vehicle, never the payload) on the way through.
    case 'ENCOUNTER_DONE': {
      const enc = s.encounter || { type: 'ambush' };
      const win = !!action.win;
      if (action.weapon) {
        const w = vehicleOf(s.vehicleId).weapon;
        if (w) s.yen = Math.max(0, s.yen - w.cost);
      }
      if (enc.type === 'ambush') {
        if (win) s.yen += randInt(80, 200);
        else s.nerve = Math.max(1, s.nerve - randInt(12, 26));   // road scraps never flatline
      } else if (!win) {
        s.yen -= Math.min(s.yen, randInt(120, 260));             // a snare skims your accounts
      }
      s.encounter = null;
      s.screen = 'contacts';
      s.sfx = beep(win ? 'pull' : 'caught');
      return s;
    }

    case 'BUY_VEHICLE': {
      const v = vehicleOf(action.id);
      if (!v || v.id === s.vehicleId || s.yen < v.price) return s;
      s.yen -= v.price;
      s.vehicleId = v.id;
      s.speedMods = 0; // tunes were fitted to the old ride
      s.sfx = beep('buy');
      return s;
    }

    case 'BUY_TUNE': {
      const eff = Math.max(1, vehicleOf(s.vehicleId).days - s.speedMods);
      if (s.speedMods >= VEHICLE_TUNE.maxMods || eff <= 1 || s.yen < VEHICLE_TUNE.cost) return s;
      s.yen -= VEHICLE_TUNE.cost;
      s.speedMods += 1;
      s.sfx = beep('buy');
      return s;
    }

    case 'START_RUN': {
      const run = runById(s, action.id);
      if (!run) return s;
      // Refresh everything the installs grant per-run — in particular the trauma
      // stabiliser, whose one save is consumed on use and re-arms for each job.
      recompute(s);
      s.nerve = clamp(s.nerve, 0, s.nerveMax);
      s.run = run;
      s.runId = run.id;
      s.lattice = layIce(run);
      s.breakers = s.breakersMax;
      s.screen = 'run';
      s.sfx = beep('jack');
      return s;
    }

    // payload: { caught, gained, traceAtPull, forced }
    case 'RUN_RESOLVE': {
      const run = s.run;
      if (!run) return s;
      const caught = !!action.caught;
      const grade = gradeRun(action);
      const cost = Math.round(run.stake * s.burn * (caught ? 1.6 : 1.0));
      s.nerve = s.nerve - cost;

      // Flatline: nerve gone, or caught by black-site (lethal) countermeasures.
      const lethal = s.lattice && s.lattice.lethal;
      const dead = s.nerve <= 0 || (caught && lethal);
      let saved = false;
      if (dead) {
        if (s.stabiliser) {
          // The stabiliser argues with death and wins — once. It burns out doing
          // it: the install is spent and has to be bought again at the clinic.
          s.stabiliser = false;
          s.hardware = (s.hardware || []).filter(h => h !== 'trauma');
          s.nerve = Math.max(1, s.nerve);
          saved = true;
        } else {
          s.ending = 'flatline';
          s.screen = 'ending';
          s.sfx = beep('flatline');
          return s;
        }
      }

      let leveled = false;
      if (!caught) {
        s.yen += run.yen + (action.gained || 0);
        s.intel += INTEL_SCORE[grade];
        if (!run.hunt) {
          s.runsDone = [...s.runsDone, run.id];
          // A point earned every LEVEL_EVERY debt runs cleared.
          const lvl = 1 + Math.floor(s.runsDone.length / LEVEL_EVERY);
          if (lvl > s.level) { s.points += lvl - s.level; s.level = lvl; leveled = true; }
        }
        if (run.intel) s.dossier = [...s.dossier, { id: run.intel, quality: grade }];
        if (run.turn) s.turned = true;
      }
      s.day += 1;
      s.lastOutcome = {
        kind: caught ? 'failed' : 'won',
        runId: run.id,
        gained: caught ? 0 : (action.gained || 0),
        grade,
        intelId: caught ? null : (run.intel || null),
        nerveCost: cost,
        turn: !!run.turn && !caught,
        hunt: !!run.hunt,
        finale: !!run.hunt && !caught,   // hunt won → choose an ending
        leveled,                          // earned a level-up point this run
        saved,                            // the trauma stabiliser fired and burned out
      };
      s.lattice = null;
      s.run = null;
      s.runId = null;
      s.screen = 'debrief';
      s.sfx = beep(caught ? 'caught' : 'pull');
      return s;
    }

    // Spend a level-up point: raise one stat by 1 (re-derives nerve/exploits/
    // trace) or install a new ability. recompute keeps every knob consistent.
    case 'LEVEL_STAT': {
      const key = action.key;
      if (s.points <= 0 || !s.stats || s.stats[key] == null || s.stats[key] >= STAT_CAP) return s;
      s.stats = { ...s.stats, [key]: s.stats[key] + 1 };
      s.points -= 1;
      recompute(s);
      s.nerve = clamp(s.nerve, 0, s.nerveMax);
      s.breakers = s.breakersMax;
      s.sfx = beep('buy');
      return s;
    }

    case 'LEVEL_ABILITY': {
      const ab = abilityOf(action.id);
      if (s.points <= 0 || !ab || (s.abilities || []).includes(action.id)) return s;
      s.abilities = [...(s.abilities || []), action.id];
      s.points -= 1;
      recompute(s);
      s.nerve = clamp(s.nerve, 0, s.nerveMax);
      s.breakers = s.breakersMax;
      s.sfx = beep('buy');
      return s;
    }

    case 'CHOOSE_ENDING':
      return { ...s, ending: action.ending, screen: 'ending', sfx: beep('flatline') };

    case 'WALK_AWAY':
      return { ...s, ending: 'walkaway', screen: 'ending' };

    default:
      return s;
  }
}

export { RETIRE_AT, finaleChoices };
