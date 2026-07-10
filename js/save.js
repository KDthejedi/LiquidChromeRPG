// Save/load — localStorage, three slots, versioned for later migration (D1:
// the game stays playable at every merge, saves included). Export/import as a
// JSON file per BUILD_HANDOFF persistence spec.

const PREFIX = 'liquidchrome_save_v1';
export const SLOTS = [1, 2, 3];

const key = (slot) => `${PREFIX}_s${slot}`;

function wrap(state) {
  return { v: 1, at: Date.now(), state };
}

function unwrap(raw) {
  try {
    const data = JSON.parse(raw);
    if (data?.v !== 1 || !data.state?.character?.opId) return null;
    return data;
  } catch {
    return null;
  }
}

// one-time migration of the original single-slot save into slot 1
function migrateLegacy() {
  const old = localStorage.getItem(PREFIX);
  if (old && !localStorage.getItem(key(1))) localStorage.setItem(key(1), old);
  if (old) localStorage.removeItem(PREFIX);
}

export function save(state, slot = 1) {
  try {
    localStorage.setItem(key(slot), JSON.stringify(wrap(state)));
    return true;
  } catch {
    return false;
  }
}

export function load(slot = 1) {
  migrateLegacy();
  return unwrap(localStorage.getItem(key(slot)))?.state ?? null;
}

export function wipe(slot = 1) {
  localStorage.removeItem(key(slot));
}

export function wipeAll() {
  for (const s of SLOTS) wipe(s);
}

// [{slot, name, at} | {slot, empty: true}] for the SYS menu
export function slotInfo() {
  migrateLegacy();
  return SLOTS.map((slot) => {
    const data = unwrap(localStorage.getItem(key(slot)));
    return data
      ? { slot, name: data.state.character.name, at: data.at }
      : { slot, empty: true };
  });
}

// most recently written non-empty slot, for boot
export function latestSlot() {
  let best = null;
  for (const slot of SLOTS) {
    const data = unwrap(localStorage.getItem(key(slot)));
    if (data && (!best || data.at > best.at)) best = { slot, at: data.at };
  }
  return best?.slot ?? null;
}

export function exportSave(state) {
  return JSON.stringify(wrap(state), null, 2);
}

export function importSave(text) {
  return unwrap(text)?.state ?? null;
}
