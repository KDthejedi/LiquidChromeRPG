// The summons — P2's opening act (WORLD.md §8.2, §11): the coat, the walk,
// the gang (the first moral choice, feeding the morality ledger), the old
// market, tea with Kiros, the deal there was never a choice about, the chair,
// and the operative's burn surfacing while the rebuild hums. Authored-first
// (D4): every word here is canon voice, no generation.

import { audio } from './audio.js';

const $ = (id) => document.getElementById(id);

function buildBeats(op) {
  return [
    {
      art: 'assets/intro/leaving.jpg',
      text: 'You sit with it as long as pride allows. Three minutes. Then you reach for the coat — it’s going to be a long night, and the deep end doesn’t respect a man in shirtsleeves. The relic pistol goes in the pocket like an apology. Whatever this is, it doesn’t start with you shooting somebody. Probably.',
    },
    {
      art: null,
      text: 'Three blocks. How bad can three blocks be.\n\nThe rain answers first. It comes off the stacked roofs in ropes, neon dissolving in every puddle like something spilled. Doorways watch you pass. The deep end doesn’t sleep — it just changes shifts, and the night shift has better knives.',
    },
    {
      art: 'assets/intro/gang.jpg',
      text: 'Four of them peel off a doorway like paint coming off a wall. Wired kids, cheap chrome buzzing under their skin, lit from inside by whatever they’re running on tonight. The tall one has a blade out — casual, the way other people hold a phone.\n\n“Toll road,” he says. Nobody laughs.',
      choices: [
        {
          label: 'FISTS — put the tall one down, gently',
          apply: (state) => { state.character.ledger.nonlethal += 1; },
          after: 'He’s fast, but he’s fast like a kid who’s never lost. You’re slow like a man who has. One step inside the blade, an elbow where it changes his mind, and he sits down in the rain to think about arithmetic — four, minus him, minus the look on your face. The other three let the math do the talking. You walk on. Knuckles singing. Nothing broken that was yours.',
        },
        {
          label: 'GUN — let the relic clear your coat',
          apply: (state) => { state.character.ledger.lethal += 1; },
          after: 'The relic comes out slower than it used to. Doesn’t matter. Some shapes rearrange a street all by themselves. You don’t aim it at anyone — you aim it at the rain, at the night, at the general concept of tonight going wrong. The blade disappears. The tall one walks backward the whole way out — respect, of a kind, the only kind this street issues.',
        },
        {
          label: 'BRIBE — name the toll before he does (50 credits)',
          apply: (state) => {
            state.character.ledger.guile += 1;
            state.character.credits = Math.max(0, state.character.credits - 50);
          },
          after: '“Toll’s fifty,” you say, before he can price it himself. Naming the number first — oldest trick the deep end ever taught you. It costs him more to argue than to take it. The credits leave your account the way rain leaves a roof: fast and all at once. Four shapes melt back into the doorway. Everyone’s a businessman until the weather turns.',
        },
      ],
    },
    {
      art: 'assets/intro/market.jpg',
      text: 'The old market never closed — it just stopped pretending to be legal. Lanterns and steam, fish that came out of tanks and parts that came out of somewhere worse. The noise parts around one table like water around a stone.\n\nHe’s waiting. Of course he’s waiting.',
    },
    {
      art: 'assets/intro/kiros.jpg',
      text: `Young, for the weight he’s carrying. Calm the way deep water is calm. One eye catches the lantern light wrong — glass and circuitry where the iris should be, glowing faint and patient.\n\n“Tea?” He pours before you answer. “I’m Kiros. You came. They always come.” He slides the cup across. “${op.kirosRead}”`,
    },
    {
      art: 'assets/intro/kiros.jpg',
      text: '“Here’s the offer. A body that works — the chrome back, better than it was. Money. A gun that isn’t a relic. A road to drive it on. In return: a handful of jobs, across the regions. The ones that matter.” He turns his cup slowly, once. “Clear the debt — and then, then — I help you go back for the people who did this to you. All of it.”',
      choices: [
        {
          label: 'TAKE THE DEAL',
          apply: () => {},
          after: 'You say yes the way a man steps off a ledge he’s been standing on for seven months. Kiros nods once, like the weather did something he predicted.',
        },
        {
          label: '“AND IF I SAY NO?”',
          apply: () => {},
          after: '“Then you finish the tea, and you walk home, and the seven months become the rest of your life.” He doesn’t blink. The glass eye doesn’t either. “But you won’t. Nobody crosses the deep end at night to hear themselves say no.”\n\nHe’s right. You hate that he’s right. You take the deal.',
        },
      ],
    },
    {
      art: 'assets/intro/kiros.jpg',
      text: '“And you won’t be doing it alone. This is a family business.” He stands, drops coins on the table without counting them. “My blood — and now, for a while, yours.”',
    },
    {
      art: 'assets/interiors/clinic1.jpg',
      text: `The clinic hangs under Keihin like something the city swallowed and couldn’t digest. The tech-doctor snaps on gloves and reads your ruin the way other people read a bill.\n\n“${op.doctorRead}” A pause. “Good bones, under all that ruin.” The chair unfolds. The rebuild hums to itself, waiting.\n\n“Try not to enjoy it. The ones who enjoy it don’t come back to the body.”`,
    },
    { art: null, text: op.montage[0], quick: true },
    { art: null, text: op.montage[1], quick: true },
    { art: null, text: op.montage[2], quick: true },
    { art: null, text: op.montage[3], quick: true },
    {
      art: null,
      text: 'You wake in the safehouse with the grid singing in your teeth.\n\nSeven months of static, and now the wire is everywhere again — the walls, the rain, the city, all of it humming on a frequency you’d almost forgotten you were built to hear. The chrome holds. It actually holds.\n\nThe debt starts tomorrow.',
    },
  ];
}

export function runIntro({ op, state, onDone }) {
  const cin = $('cinema');
  const art = $('cinema-art');
  const textEl = $('cinema-text');
  const actions = $('cinema-actions');
  const beats = buildBeats(op);
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  let i = 0;
  let timer = null;
  let full = '';
  let typing = false;
  let advance = null;

  cin.classList.remove('hidden');
  audio.sfx('open');

  function type(text, done) {
    clearInterval(timer);
    full = text;
    if (still) { textEl.textContent = text; typing = false; done(); return; }
    textEl.textContent = '';
    typing = true;
    let k = 0;
    timer = setInterval(() => {
      textEl.textContent += text[k];
      if (k % 4 === 0 && text[k] !== ' ') audio.sfx('key');
      k += 1;
      if (k >= text.length) { clearInterval(timer); typing = false; done(); }
    }, 16);
  }

  function skipType() {
    if (!typing) return false;
    clearInterval(timer);
    textEl.textContent = full;
    typing = false;
    return true;
  }

  function button(label, fn) {
    const b = document.createElement('button');
    b.className = 'cinema-btn';
    b.textContent = label;
    b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
    actions.appendChild(b);
    return b;
  }

  function showBeat() {
    if (i >= beats.length) { finish(); return; }
    const b = beats[i];
    actions.innerHTML = '';
    advance = null;
    art.style.backgroundImage = b.art ? `url(${b.art})` : 'none';
    art.classList.toggle('no-art', !b.art);
    type(b.text, () => {
      if (b.choices) {
        for (const c of b.choices) {
          button(c.label, () => {
            audio.sfx('interact');
            c.apply(state);
            actions.innerHTML = '';
            type(c.after, () => {
              advance = () => { i += 1; showBeat(); };
              button('CONTINUE', advance);
            });
          });
        }
      } else {
        advance = () => { i += 1; showBeat(); };
        button(b.quick ? '…' : 'CONTINUE', advance);
      }
    });
  }

  function onTap() {
    if (skipType()) return;      // first tap: finish the typing
    if (advance) advance();      // second tap: next beat (when no choice pending)
  }
  cin.addEventListener('click', onTap);

  function finish() {
    cin.removeEventListener('click', onTap);
    clearInterval(timer);
    cin.classList.add('hidden');
    audio.sfx('close');
    onDone();
  }

  showBeat();
  return { finish };
}
