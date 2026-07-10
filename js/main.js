import { OPERATIVES, SKILL_NAMES, newCharacter, deriveVitals } from './data.js';
import {
  save, load, wipeAll, slotInfo, latestSlot, exportSave, importSave,
} from './save.js';
import { SafehouseScene } from './scene.js';
import { audio } from './audio.js';

const $ = (id) => document.getElementById(id);

let state = null;      // { character }
let scene = null;
let activeSlot = 1;

// ---------- operative select ----------

function showSelect() {
  $('game-screen').classList.add('hidden');
  $('select-screen').classList.remove('hidden');
  audio.playMusic('assets/music/title.mp3', 0.4);
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
      activeSlot = slotInfo().find((s) => s.empty)?.slot ?? 1;
      save(state, activeSlot);
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

  audio.playMusic('assets/music/game.mp3', 0.3);

  if (scene) scene.destroy();
  scene = new SafehouseScene($('scene'), {
    accent: op.accent,
    initial: char.name[0],
    portrait: op.portrait,
    figure: op.id,
    onCaption: setCaption,
    onSfx: (name) => audio.sfx(name),
    onInteract: (obj) => {
      audio.sfx('interact');
      if (obj.id === 'deck') {
        setCaption(null);
        openTerminal();
      } else {
        setCaption(obj.text);
      }
    },
  });
  window.__scene = scene;
  setCaption(
    'Home. Well — the corner of the slums you currently call home. Rain and neon blur the silhouettes drifting past your window, the deep end going about its business without you. Then your console beeps. It never beeps.',
    'Tap the floor to move. Tap what’s yours to look it over.',
  );
}

function setCaption(text, hint) {
  const el = $('scene-caption');
  if (!text) { el.classList.add('hidden'); return; }
  el.textContent = text;
  if (hint) {
    const h = document.createElement('span');
    h.className = 'caption-hint';
    h.textContent = hint;
    el.appendChild(h);
  }
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

// ---------- the terminal ----------

let termTimer = null;

function typeInto(el, text) {
  clearInterval(termTimer);
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (still) { el.textContent = text; return; }
  el.textContent = '';
  let i = 0;
  termTimer = setInterval(() => {
    el.textContent += text[i];
    if (i % 3 === 0 && text[i] !== ' ') audio.sfx('key');
    i += 1;
    if (i >= text.length) clearInterval(termTimer);
  }, 14);
}

function openTerminal() {
  const op = OPERATIVES[state.character.opId];
  togglePanel('terminal-panel');
  audio.sfx('beep');
  $('term-title').textContent = op.deck.toUpperCase();
  typeInto($('term-body'), [
    '> clean boot — liquid chrome at 100%. it holds. it actually holds.',
    '> 1 message held · routed through twelve encrypted addresses',
    '> sender: KIROS',
    '',
    `"Hello ${state.character.name}. I'm Kiros. You don't know me, but I know you — everything they did, but most importantly, everything you did. ${op.kirosRead} I have an offer for you. Come and meet me at the old market, in the deep end of the slums. Don't keep me waiting."`,
    '',
    '> connection closed. the cursor blinks.',
  ].join('\n'));
}

// ---------- panels & menu ----------

function togglePanel(id) {
  const el = $(id);
  const opening = el.classList.contains('hidden');
  $('sheet-panel').classList.add('hidden');
  $('menu-panel').classList.add('hidden');
  $('terminal-panel').classList.add('hidden');
  clearInterval(termTimer);
  if (opening) el.classList.remove('hidden');
  audio.sfx(opening ? 'open' : 'close');
}

$('btn-sheet').addEventListener('click', () => togglePanel('sheet-panel'));
$('btn-menu').addEventListener('click', () => { renderSlots(); togglePanel('menu-panel'); });
document.querySelectorAll('.close-btn').forEach((btn) =>
  btn.addEventListener('click', () => {
    $(btn.dataset.close).classList.add('hidden');
    clearInterval(termTimer);
    audio.sfx('close');
  }));
$('term-close').addEventListener('click', () => {
  $('terminal-panel').classList.add('hidden');
  clearInterval(termTimer);
  audio.sfx('close');
});

function renderSndButton() {
  $('btn-snd').textContent = audio.muted ? 'SND ✕' : 'SND';
}
$('btn-snd').addEventListener('click', () => { audio.toggleMuted(); renderSndButton(); });
renderSndButton();

function renderSlots() {
  const list = $('slot-list');
  list.innerHTML = '';
  for (const info of slotInfo()) {
    const row = document.createElement('div');
    row.className = `slot-row${info.slot === activeSlot ? ' active' : ''}`;
    const when = info.at
      ? new Date(info.at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';
    row.innerHTML = info.empty
      ? `<span class="slot-label empty">SLOT ${info.slot} — empty</span>`
      : `<span class="slot-label">SLOT ${info.slot} — ${info.name}<span class="slot-when">${when}</span></span>`;
    const btnSave = document.createElement('button');
    btnSave.textContent = 'SAVE';
    btnSave.addEventListener('click', () => {
      activeSlot = info.slot;
      const ok = save(state, info.slot);
      if (ok) audio.sfx('save');
      $('menu-status').textContent = ok
        ? 'Saved. The wire remembers, even when you’d rather it didn’t.'
        : 'Save failed — storage refused the write.';
      renderSlots();
    });
    const btnLoad = document.createElement('button');
    btnLoad.textContent = 'LOAD';
    btnLoad.disabled = !!info.empty;
    btnLoad.addEventListener('click', () => {
      const loaded = load(info.slot);
      if (!loaded) { $('menu-status').textContent = 'Nothing on file. A clean record, for once.'; return; }
      state = loaded;
      activeSlot = info.slot;
      $('menu-status').textContent = 'Loaded.';
      startGame();
      renderSlots();
    });
    row.append(btnSave, btnLoad);
    list.appendChild(row);
  }
}

$('btn-export').addEventListener('click', () => {
  const blob = new Blob([exportSave(state)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `liquidchrome-${state.character.opId}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  $('menu-status').textContent = 'Exported. Keep it somewhere the corps don’t look.';
});

$('btn-import').addEventListener('click', () => $('import-file').click());
$('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const imported = importSave(await file.text());
  if (!imported) {
    $('menu-status').textContent = 'That file’s no record of yours. Import refused.';
    return;
  }
  state = imported;
  save(state, activeSlot);
  $('menu-status').textContent = 'Imported. Welcome back.';
  startGame();
  renderSlots();
});

$('btn-wipe').addEventListener('click', () => {
  if (!confirm('Wipe every slot and start over?')) return;
  wipeAll();
  state = null;
  $('menu-panel').classList.add('hidden');
  showSelect();
});

// ---------- boot ----------

const bootSlot = latestSlot();
if (bootSlot) {
  activeSlot = bootSlot;
  state = load(bootSlot);
  startGame();
} else {
  showSelect();
}

// dev hook: ?tap=x,y resolves the interactable on that grid cell right at
// boot, so headless tests can assert on UI flows (harmless in normal play)
const tapQ = new URLSearchParams(location.search).get('tap');
if (tapQ && scene) {
  const [tx, ty] = tapQ.split(',').map(Number);
  const obj = scene.room.objects.find((o) => o.cells.some(([cx, cy]) => cx === tx && cy === ty));
  if (obj) scene.resolveInteract(obj);
}
