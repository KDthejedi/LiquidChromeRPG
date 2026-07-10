import { OPERATIVES, SKILL_NAMES, newCharacter, deriveVitals } from './data.js';
import { save, load, wipe } from './save.js';
import { SafehouseScene } from './scene.js';

const $ = (id) => document.getElementById(id);

let state = null;   // { character }
let scene = null;

// ---------- operative select ----------

function showSelect() {
  $('game-screen').classList.add('hidden');
  $('select-screen').classList.remove('hidden');
  const row = $('operative-cards');
  row.innerHTML = '';
  for (const op of Object.values(OPERATIVES)) {
    const card = document.createElement('button');
    card.className = 'op-card';
    card.style.setProperty('--accent', op.accent);
    card.innerHTML = `
      <div class="op-ring"><img src="${op.portrait}" alt="${op.name}"></div>
      <h2>${op.name}</h2>
      <div class="op-role">${op.role}</div>
      <p class="op-bio">${op.bio}</p>`;
    card.addEventListener('click', () => {
      state = { character: newCharacter(op.id) };
      save(state);
      startGame();
    });
    row.appendChild(card);
  }
}

// ---------- game ----------

function startGame() {
  $('select-screen').classList.add('hidden');
  $('game-screen').classList.remove('hidden');

  const char = state.character;
  const op = OPERATIVES[char.opId];
  $('hud-name').textContent = char.name;
  $('hud-role').textContent = op.role;
  renderHud();
  renderSheet();

  if (scene) scene.destroy();
  scene = new SafehouseScene($('scene'), {
    accent: op.accent,
    initial: char.name[0],
    portrait: op.portrait,
    onCaption: setCaption,
  });
  window.__scene = scene;
  setCaption('Home. Neon over black water, the clinic that rebuilt you strung underneath it. Tap the floor to move; tap what’s yours to look it over.');
}

function setCaption(text) {
  const el = $('scene-caption');
  if (!text) { el.classList.add('hidden'); return; }
  el.textContent = text;
  el.classList.remove('hidden');
}

function renderHud() {
  const char = state.character;
  const v = deriveVitals(char.attrs);
  $('meter-health').style.width = `${(char.health / v.healthMax) * 100}%`;
  $('meter-chrome').style.width = `${(char.chrome / v.chromeMax) * 100}%`;
  $('meter-static').style.width = `${(char.static / v.staticMax) * 100}%`;
  $('hud-credits').textContent = `${char.credits} credits`;
}

function renderSheet() {
  const char = state.character;
  const op = OPERATIVES[char.opId];
  const v = deriveVitals(char.attrs);

  $('sheet-name').textContent = `${char.name} — ${op.role}`;
  $('sheet-bio').textContent = `${op.bio} Deck: ${op.deck}.`;

  $('sheet-attrs').innerHTML = Object.entries(char.attrs)
    .map(([k, val]) => `<li><span>${k}</span><span class="val">${val}</span></li>`)
    .join('');

  $('sheet-vitals').innerHTML = [
    ['Health', `${char.health} / ${v.healthMax}`, ''],
    ['Chrome', `${char.chrome} / ${v.chromeMax}`, ''],
    ['Static', `${char.static} / ${v.staticMax}`, 'warn'],
    ['Credits', char.credits, ''],
  ].map(([k, val, cls]) => `<li><span>${k}</span><span class="val ${cls}">${val}</span></li>`).join('');

  $('sheet-skills').innerHTML = SKILL_NAMES
    .map((k) => `<li><span>${k}</span><span class="val">${char.skills[k] ?? 0}</span></li>`)
    .join('');

  $('sheet-kit').innerHTML = op.kit
    .map((s) => `<li><span class="kit-name">${s.name}</span>
      <span class="kit-cost">${s.cost ? ` · ${s.cost} chrome` : ' · passive'}</span><br>${s.desc}</li>`)
    .join('');
}

// ---------- panels & menu ----------

function togglePanel(id) {
  const el = $(id);
  const opening = el.classList.contains('hidden');
  $('sheet-panel').classList.add('hidden');
  $('menu-panel').classList.add('hidden');
  if (opening) el.classList.remove('hidden');
}

$('btn-sheet').addEventListener('click', () => togglePanel('sheet-panel'));
$('btn-menu').addEventListener('click', () => togglePanel('menu-panel'));
document.querySelectorAll('.close-btn').forEach((btn) =>
  btn.addEventListener('click', () => $(btn.dataset.close).classList.add('hidden')));

$('btn-save').addEventListener('click', () => {
  $('menu-status').textContent = save(state)
    ? 'Saved. The wire remembers, even when you’d rather it didn’t.'
    : 'Save failed — storage refused the write.';
});

$('btn-load').addEventListener('click', () => {
  const loaded = load();
  if (!loaded) {
    $('menu-status').textContent = 'Nothing on file. A clean record, for once.';
    return;
  }
  state = loaded;
  $('menu-status').textContent = 'Loaded.';
  startGame();
});

$('btn-wipe').addEventListener('click', () => {
  if (!confirm('Wipe the record and start over?')) return;
  wipe();
  state = null;
  $('menu-panel').classList.add('hidden');
  showSelect();
});

// ---------- boot ----------

const existing = load();
if (existing) {
  state = existing;
  startGame();
} else {
  showSelect();
}
