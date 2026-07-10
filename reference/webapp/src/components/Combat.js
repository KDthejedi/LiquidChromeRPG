import { html, useState, useRef } from '../ui.js';

// Combat — a short, stat-driven fight. Guns lean on Marksmanship (accurate,
// steady); blades lean on Strength + Speed (heavier, needs closing). Speed lets
// you slip a hit; Stealth opens the fight with the enemy already bleeding.
//
// Chrome specials: the character's owned combat abilities surface here. Actives
// spend chrome from the run reserve (reported back via onResolve); passives fire
// automatically. Reusable: { level, stats, style, enemy?, abilities?, chrome?,
// onResolve }. onResolve(win:boolean, chromeSpent:number).
//
// Effects — active: mercury/breach (pierce), burn (kill their chrome), shadow
// (dodge next), feedback/suppress (damage + skip their turn), blackout (their
// accuracy craters), sedative (their damage halves), scalpel (pierce + bleed),
// triage (self-heal), overclock (next two strikes auto-crit), execute (finish
// them under a health threshold). Passive: negate_lethal (the killing blow
// misses), trauma (survive it, stitched), first_whiff (their opener misses),
// soft_hits (first two hits land soft).
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const rnd = () => Math.random();
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function loadout(stats, style) {
  const s = stats || {};
  const str = s.strength || 5, spd = s.speed || 5, mk = s.marksmanship || 5;
  if (style === 'blade') {
    return { name: 'Blade', acc: clamp(0.60 + spd * 0.03, 0.4, 0.95), dmg: () => 5 + Math.round(str * 0.7) + ri(0, 3) };
  }
  return { name: 'Sidearm', acc: clamp(0.55 + mk * 0.035, 0.4, 0.96), dmg: () => 4 + Math.round(mk * 0.6) + ri(0, 3) };
}

export function Combat({ level = 1, stats = {}, style = 'gun', enemy, enemyName, abilities = [], chrome = 0, onResolve }) {
  const s = stats || {};
  const gun = loadout(s, style);
  const foe = enemy || { name: enemyName || 'Corp security', hp: 14 + level * 7, dmg: 3 + Math.round(level * 1.6), acc: clamp(0.62 - (s.speed || 5) * 0.02, 0.28, 0.75) };

  const pMax = 20 + (s.strength || 5) * 2;
  const ambush = Math.max(0, Math.min(foe.hp - 4, s.stealth || 5)); // stealth opener

  const actives = abilities.filter(a => a.combat && a.combat.kind === 'active');
  const passives = abilities.filter(a => a.combat && a.combat.kind === 'passive');
  const hasP = (eff) => passives.some(a => a.combat.effect === eff);

  const [p, setP] = useState(pMax);
  const [e, setE] = useState(foe.hp - ambush);
  const [charge, setCharge] = useState(0);
  const [status, setStatus] = useState('play');   // 'play' | 'won' | 'lost'
  const [busy, setBusy] = useState(false);
  const [chromeLeft, setChromeLeft] = useState(chrome);
  const [used, setUsed] = useState({});            // abilityId -> times used this fight
  const pendingGuard = useRef(false);
  const dodgeNext = useRef(false);                 // Shadow — vanish, next attack misses
  const burned = useRef(false);                    // Burn — their chrome killed
  const blackout = useRef(false);                  // Blackout — their accuracy crashed
  const sedated = useRef(false);                   // Sedative — their damage halved
  const enemySkip = useRef(false);                 // Feedback / Suppressing fire — they lose a turn
  const critNext = useRef(0);                      // Overclock — strikes that auto-hit and crit
  const bleedTurns = useRef(0);                    // Scalpel — they bleed at the top of your turns
  const knifeUsed = useRef(false);                 // Knife's edge spent
  const traumaUsed = useRef(false);                // Trauma reflex spent
  const whiffUsed = useRef(false);                 // Ghost protocol spent
  const softLeft = useRef(hasP('soft_hits') ? 2 : 0); // Iron hide hits remaining
  const [log, setLog] = useState(() => ambush > 0
    ? [`You open from cover — ${foe.name} takes ${ambush} before the fight starts.`]
    : [`${foe.name} squares up.`]);

  const say = (m) => setLog(l => [m, ...l].slice(0, 5));

  function finish(win) { setStatus(win ? 'won' : 'lost'); if (onResolve) setTimeout(() => onResolve(win, chrome - chromeLeft), 700); }

  function enemyTurn(pAfter) {
    // Pinned / fried — Feedback or Suppressing fire ate their turn.
    if (enemySkip.current) {
      enemySkip.current = false;
      say(`${foe.name} is locked up — the turn is yours.`);
      pendingGuard.current = false; setBusy(false); return;
    }
    // Shadow — vanish; the next attack finds nothing.
    if (dodgeNext.current) {
      dodgeNext.current = false;
      say(`${foe.name} strikes where you were — and finds nothing.`);
      pendingGuard.current = false; setBusy(false); return;
    }
    // Ghost protocol — their opener tracks a profile that isn't there.
    if (hasP('first_whiff') && !whiffUsed.current) {
      whiffUsed.current = true;
      say(`Ghost protocol — their first shot tracks a profile that isn't there.`);
      pendingGuard.current = false; setBusy(false); return;
    }
    let acc = foe.acc;
    if (burned.current) acc *= 0.55;
    if (blackout.current) acc *= 0.5;
    if (rnd() < acc) {
      const guard = pendingGuard.current ? 0.5 : 1;
      let base = foe.dmg;
      if (burned.current) base *= 0.6;
      if (sedated.current) base *= 0.5;
      let dmg = Math.max(1, Math.round(base * guard) + ri(0, 2));
      if (softLeft.current > 0) {
        softLeft.current -= 1;
        dmg = Math.max(1, Math.round(dmg * 0.5));
        say(`Iron hide — the hit lands soft.`);
      }
      const np = Math.max(0, pAfter - dmg);
      // Knife's edge — the blow that would end you simply misses. Once.
      if (np <= 0 && hasP('negate_lethal') && !knifeUsed.current) {
        knifeUsed.current = true;
        say(`Knife's edge — the killing blow finds only air. You're still up.`);
        pendingGuard.current = false; setBusy(false); return;
      }
      // Trauma reflex — the second heart argues with death, and wins. Once.
      if (np <= 0 && hasP('trauma') && !traumaUsed.current) {
        traumaUsed.current = true;
        const back = Math.max(1, Math.round(pMax * 0.25));
        setP(back);
        say(`Trauma reflex — the second heart drags you back, stitched and standing.`);
        pendingGuard.current = false; setBusy(false); return;
      }
      setP(np);
      say(`${foe.name} hits you for ${dmg}.`);
      pendingGuard.current = false;
      if (np <= 0) { finish(false); return; }
    } else {
      say(`${foe.name} swings wide — you slip it.`);
      pendingGuard.current = false;
    }
    setBusy(false);
  }

  // Scalpel's bleed ticks at the top of your action. Returns the enemy's hp
  // after the tick, or -1 if it finished them.
  function tickBleed() {
    if (bleedTurns.current <= 0) return e;
    bleedTurns.current -= 1;
    const bd = 4;
    const ne = Math.max(0, e - bd);
    setE(ne);
    say(`${foe.name} bleeds for ${bd}.`);
    if (ne <= 0) { finish(true); return -1; }
    return ne;
  }

  function act(kind) {
    if (status !== 'play' || busy) return;
    setBusy(true);
    const eNow = tickBleed();
    if (eNow < 0) return;
    if (kind === 'strike') {
      const auto = critNext.current > 0;
      const acc = auto ? 1 : clamp(gun.acc + charge * 0.15, 0, 0.98);
      if (rnd() < acc) {
        let dmg = gun.dmg();
        if (auto) { critNext.current -= 1; dmg = Math.round(dmg * 1.8); }
        dmg = Math.round(dmg * (1 + charge * 0.5));
        const ne = Math.max(0, eNow - dmg); setE(ne);
        say(auto ? `Overclocked — the strike lands itself, ${dmg} deep.` : `You strike for ${dmg}${charge ? ' (aimed)' : ''}.`);
        setCharge(0);
        if (ne <= 0) { finish(true); return; }
      } else { say('You miss.'); setCharge(0); }
      setTimeout(() => enemyTurn(p), 260);
    } else if (kind === 'aim') {
      setCharge(c => Math.min(2, c + 1));
      say('You steady the shot.');
      setTimeout(() => enemyTurn(p), 260);
    } else if (kind === 'guard') {
      pendingGuard.current = true;
      say('You brace for it.');
      setTimeout(() => enemyTurn(p), 260);
    }
  }

  function canUse(ab) {
    const c = ab.combat;
    if ((used[ab.id] || 0) >= (c.uses || Infinity)) return false;
    return chromeLeft >= (c.cost || 0);
  }

  function useAbility(ab) {
    if (status !== 'play' || busy || !canUse(ab)) return;
    const c = ab.combat;
    setBusy(true);
    setChromeLeft(x => x - (c.cost || 0));
    setUsed(u => ({ ...u, [ab.id]: (u[ab.id] || 0) + 1 }));
    const hitFor = (dmg, line) => {
      const ne = Math.max(0, e - dmg); setE(ne);
      say(line);
      if (ne <= 0) { finish(true); return true; }
      return false;
    };
    if (c.effect === 'mercury') {
      const dmg = Math.round(gun.dmg() * 2.2) + level * 2;
      if (hitFor(dmg, `Mercury — you open ${foe.name} up for ${dmg}, straight through the armour.`)) return;
    } else if (c.effect === 'breach') {
      const dmg = Math.round(gun.dmg() * 2.0) + level * 2;
      if (hitFor(dmg, `Breach round — ${dmg}, and the armour never got a vote.`)) return;
    } else if (c.effect === 'burn') {
      burned.current = true;
      say(`Burn — you cook the chrome inside ${foe.name}. Their edge goes dark.`);
    } else if (c.effect === 'shadow') {
      dodgeNext.current = true;
      say(`Shadow — you blink out. Whatever comes next hits empty air.`);
    } else if (c.effect === 'feedback') {
      const dmg = Math.round(8 + (s.tech || 5) * 1.5);
      enemySkip.current = true;
      if (hitFor(dmg, `Feedback — you surge back down their link for ${dmg}. Their next move dies in the wire.`)) return;
    } else if (c.effect === 'suppress') {
      const dmg = Math.round(gun.dmg() * 1.2) + level;
      enemySkip.current = true;
      if (hitFor(dmg, `Suppressing fire — ${dmg}, and ${foe.name} eats dirt behind cover.`)) return;
    } else if (c.effect === 'blackout') {
      blackout.current = true;
      say(`Blackout — their optics crash. They're shooting at ghosts now.`);
    } else if (c.effect === 'sedative') {
      sedated.current = true;
      say(`Sedative — skin to skin. Their swings go soft.`);
    } else if (c.effect === 'scalpel') {
      const dmg = Math.round(gun.dmg() * 1.4) + level;
      bleedTurns.current = 3;
      if (hitFor(dmg, `Scalpel — ${dmg} where the chrome meets the flesh, and it keeps costing them.`)) return;
    } else if (c.effect === 'triage') {
      const np = Math.min(pMax, p + Math.round(pMax * 0.35));
      setP(np);
      say(`Triage — you stitch yourself back into the fight (${np}/${pMax}).`);
      setTimeout(() => enemyTurn(np), 260);
      return;
    } else if (c.effect === 'overclock') {
      critNext.current = 2;
      say(`Overclock — the world slows to a crawl. The next two strikes are already landed.`);
    } else if (c.effect === 'execute') {
      if (e <= Math.round(foe.hp * 0.35)) {
        setE(0);
        say(`Execute — you end it. No flourish.`);
        finish(true); return;
      }
      const dmg = Math.round(gun.dmg() * 1.6) + level * 2;
      if (hitFor(dmg, `They're not hurt enough to finish — but ${dmg} gets them closer.`)) return;
    } else {
      setBusy(false); return;
    }
    setTimeout(() => enemyTurn(p), 260);
  }

  const bar = (v, m, cls) => html`<span class=${'cbar ' + cls}><span style=${{ width: clamp((v / m) * 100, 0, 100) + '%' }}></span></span>`;

  const foeMarks = [
    burned.current ? 'chrome dark' : null,
    blackout.current ? 'blind' : null,
    sedated.current ? 'sedated' : null,
    bleedTurns.current > 0 ? 'bleeding' : null,
  ].filter(Boolean).join(' · ');

  const passiveSpent = { negate_lethal: () => knifeUsed.current, trauma: () => traumaUsed.current,
    first_whiff: () => whiffUsed.current, soft_hits: () => softLeft.current <= 0 };

  return html`
    <div class="pz cbt">
      <div class="cbt-side">
        <div class="cbt-row"><span class="cbt-name">You</span><span class="cbt-hp">${p}/${pMax}</span></div>
        ${bar(p, pMax, 'you')}
      </div>
      <div class="cbt-side">
        <div class="cbt-row"><span class="cbt-name rose">${foe.name}${foeMarks ? ' · ' + foeMarks : ''}</span><span class="cbt-hp">${Math.max(0, e)}</span></div>
        ${bar(e, foe.hp, 'foe')}
      </div>

      <div class="cbt-log">${log.map((m, i) => html`<div key=${i} class=${'cbt-line' + (i === 0 ? '' : ' old')}>${m}</div>`)}</div>

      ${status === 'play' ? html`
        <div class="cbt-acts">
          <button class="btn btn-primary pz-act" disabled=${busy} onClick=${() => act('strike')}>
            Strike${charge ? ` +${charge}` : ''}</button>
          <button class="btn pz-act" disabled=${busy} onClick=${() => act('aim')}>${style === 'blade' ? 'Feint' : 'Aim'}</button>
          <button class="btn pz-act" disabled=${busy} onClick=${() => act('guard')}>Guard</button>
        </div>
        ${actives.length ? html`
          <div class="cbt-abils">
            ${actives.map(ab => html`
              <button class="btn btn-chrome pz-act" key=${ab.id} disabled=${busy || !canUse(ab)}
                onClick=${() => useAbility(ab)} title=${ab.line}>
                ${ab.name} <span class="dim">· ${ab.combat.cost}c${ab.combat.uses ? ` · ${(ab.combat.uses - (used[ab.id] || 0))} left` : ''}</span></button>`)}
          </div>` : null}
        <div class="pz-hint dim">
          ${gun.name} · ${style === 'blade' ? 'Strength + Speed' : 'Marksmanship'}
          ${actives.length ? html` · <span class="teal">chrome ${chromeLeft}</span>` : ''}
          ${passives.map(ab => html`<span key=${ab.id}> · <span class=${(passiveSpent[ab.combat.effect] || (() => false))() ? 'dim' : 'teal'}>${ab.name}</span></span>`)}
        </div>`
        : html`<div class="pz-foot"><span class=${'pz-result ' + (status === 'won' ? 'teal' : 'rose')}>
            ${status === 'won' ? `${foe.name} is down` : 'You are down'}</span></div>`}
    </div>`;
}
