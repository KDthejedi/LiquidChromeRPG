// Save/load — localStorage, single slot, versioned for later migration (D1:
// the game stays playable at every merge, saves included).

const KEY = 'liquidchrome_save_v1';

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, at: Date.now(), state }));
    return true;
  } catch {
    return false;
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.v !== 1 || !data.state?.character?.opId) return null;
    return data.state;
  } catch {
    return null;
  }
}

export function wipe() {
  localStorage.removeItem(KEY);
}
