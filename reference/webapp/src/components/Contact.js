import { html, useState } from '../ui.js';
import { characterOf, portraitSrc, SIBLINGS } from '../world.js';

// The first meeting. Kiros summons you to the slums; you walk; the street tests
// you (fists / gun / bribe — the first entry in the morality ledger); you arrive
// and he reads what you did; he lays out the deal and his family; you accept
// because there was never a choice; the tech-doctor walks you to the chair.
export function Contact({ state, dispatch }) {
  const c = characterOf(state.characterId);
  const [step, setStep] = useState('summons');
  const [choice, setChoice] = useState(null);   // 'fists' | 'gun' | 'bribe'
  const [bribeWin, setBribeWin] = useState(false);
  const [reply, setReply] = useState(null);

  const kicker = (t) => html`<div class="kicker">${t}</div>`;
  const banner = (src, pos) => html`
    <div class="intro-banner"><img src=${'assets/intro/' + src} alt="" draggable="false"
      style=${pos ? { objectPosition: pos } : null}
      onError=${(e) => { e.target.parentElement.style.display = 'none'; }} /></div>`;
  const kiros = (sub) => html`
    <div class="contact-hero">
      <img class="contact-face" src=${portraitSrc('kiros')} alt="Kiros" draggable="false" />
      <div><div class="contact-name"><b>Kiros</b></div>
        <div class="dim" style=${{ fontSize: '12px' }}>${sub}</div></div>
    </div>`;

  function takeStreet(kind) {
    setChoice(kind);
    if (kind === 'gun') dispatch({ type: 'RECORD_CHOICE', axis: 'lethal' });
    else if (kind === 'fists') dispatch({ type: 'RECORD_CHOICE', axis: 'nonlethal' });
    else { setBribeWin(Math.random() < 0.55); dispatch({ type: 'RECORD_CHOICE', axis: 'guile' }); }
    setStep('aftermath');
  }

  return html`
    <div class="wrap fade">

      ${step === 'summons' ? html`
        <div class="spacer"></div>
        ${kicker('Incoming · origin unknown')}
        ${banner('console.jpg')}
        <div class="panel"><div class="prose">
          <p class="dim">It's the dead of night, and you hear your console beep. A message routes in through a dozen
          encrypted addresses, no name on it but one: Kiros.</p>
          <p class="teal">"Hello ${state.name || c.name}. I'm Kiros. You don't know me, but I know you — everything
          they did, but most importantly, everything you did. ${c.kirosLine} I have an offer for you. Come and meet
          me at the old market, in the deep end of the slums. Don't keep me waiting."</p>
          <p class="dim">Then nothing. An empty console, blinking.</p>
        </div></div>
        <div class="panel"><div class="prose"><p class="dim">You turn it over for a long minute in the dark of the
          room. A promise too big to be real. But the net is still out there, humming, and you're still in here,
          hands shaking, with nothing. You reach for your coat and start what will probably be a long night.</p></div></div>
        <button class="btn btn-primary" onClick=${() => setStep('walk')}>Walk over ▸</button>`
      : null}

      ${step === 'walk' ? html`
        ${kicker('The Deep End · three blocks')}
        ${banner('leaving.jpg')}
        <div class="panel"><div class="prose">
          <p>Rain on corrugated steel, and under it the whole register of the slums — fried protein and ozone,
          coolant and rot. Sodium light where there's any light at all, cabling strung wall to wall like the place
          was stitched shut. People watch you from the doorways and decide, quick, that you're not worth the trouble.</p>
          <p class="dim">You keep the old handgun where your hand can find it, and you keep walking. Three blocks.
          How bad can three blocks be.</p>
        </div></div>
        <button class="btn btn-primary" onClick=${() => setStep('gang')}>Keep walking ▸</button>`
      : null}

      ${step === 'gang' ? html`
        ${kicker('Second block · the street decides')}
        ${banner('gang.jpg', 'center 45%')}
        <div class="panel"><div class="prose">
          <p>Four of them peel off a doorway and close the street at both ends. Young, wired, nothing to lose — the
          worst kind. A blade catches the sodium light. "Wrong block, chum. Everything you've got, and you get to
          keep the teeth."</p>
          <p class="dim">Your hand's already on the grip under your coat. Four of them, and not one of them knows what
          you are, or that you stopped scaring a long time ago.</p>
        </div></div>
        <button class="btn btn-primary" onClick=${() => takeStreet('fists')}>Put them down with your hands <span class="dim">· they wake up sore</span></button>
        <button class="btn btn-danger" onClick=${() => takeStreet('gun')}>Draw the gun <span class="dim">· they don't wake up</span></button>
        <button class="btn" onClick=${() => takeStreet('bribe')}>Buy your way past <span class="dim">· talk, and a roll of the dice</span></button>`
      : null}

      ${step === 'aftermath' ? html`
        ${kicker('And then the street is quiet')}
        <div class="panel"><div class="prose">
          <p class=${choice === 'gun' ? 'rose' : ''}>${streetLine(choice, bribeWin)}</p>
        </div></div>
        <button class="btn btn-primary" onClick=${() => setStep('arrive')}>On to the meet ▸</button>`
      : null}

      ${step === 'arrive' ? html`
        ${kicker("The old market · he's waiting")}
        ${banner('market.jpg', 'center bottom')}
        ${kiros('the handler, in the flesh')}
        ${choice === 'gun'
          ? html`
            <div class="panel"><div class="prose">
              <p>"I heard gunshots on the way in." He doesn't look up from the tea he's pouring. "Four of them. You
              didn't have to — but I know what the world took from you, so I won't sit here and ask you to be gentle
              with it."</p></div></div>
            <button class="btn btn-primary" onClick=${() => setStep('deal')}>Go on ▸</button>`
          : html`
            <div class="panel"><div class="prose">
              <p>He pours two cups and slides one across the crate. "How was the walk?"</p></div></div>
            <button class="btn" onClick=${() => { setReply('quiet'); setStep('reply'); }}>"Quiet enough."</button>
            <button class="btn" onClick=${() => { setReply('luck'); setStep('reply'); }}>"Someone tried their luck."</button>
            <button class="btn" onClick=${() => { setReply('nosay'); setStep('reply'); }}>"Rather not say."</button>`}`
      : null}

      ${step === 'reply' ? html`
        ${kicker('The old market')}
        ${kiros('the handler, in the flesh')}
        <div class="panel"><div class="prose"><p>${kirosReply(reply, choice, bribeWin)}</p></div></div>
        <button class="btn btn-primary" onClick=${() => setStep('deal')}>Go on ▸</button>`
      : null}

      ${step === 'deal' ? html`
        ${kicker('The offer')}
        ${banner('kiros.jpg', 'center 22%')}
        <div class="panel"><div class="prose">
          <p>"Here's the shape of it. I give you a body that works — the chrome back, better than it was. Money to
          start, a gun that isn't a relic, and a road to drive it on. In return, you run a handful of jobs for me,
          across the regions, the ones that matter. You clear the debt, and then—" he lets it hang there "—then I
          help you go back for the people who did this to you. All of it."</p>
          <p class="dim">"And you won't be doing it alone. This is a family business." He tips his head at the dark behind him.
          ${SIBLINGS.map((sib, i) => html`<span key=${sib.id}> <b class="teal">${sib.name}</b>, who ${sib.tag}${i < SIBLINGS.length - 1 ? ';' : '.'}</span>`)}
          " My blood — and now, for a while, yours."</p>
        </div></div>
        <button class="btn btn-primary" onClick=${() => setStep('accept')}>Think it over ▸</button>`
      : null}

      ${step === 'accept' ? html`
        ${kicker('There was never a choice')}
        <div class="panel"><div class="prose">
          <p>You turn it over the way you turned over the summons. A body that works, a gun, money, a road, and a way
          back to the ones who burned you — set against a debt to a man you met ten minutes ago and a family you've
          never seen.</p>
          <p class="dim">Weighed like that, it's not a choice at all. It never was. You hold out your hand, and it's
          barely shaking now.</p>
        </div></div>
        <button class="btn btn-primary" onClick=${() => setStep('clinic')}>Take the deal ▸</button>`
      : null}

      ${step === 'clinic' ? html`
        ${kicker('The doctor')}
        <div class="panel"><div class="prose">
          <p>A curtain of plastic sheeting parts and the tech-doctor steps through, already snapping on gloves,
          reading ${state.name || c.name} like a chart. "This the one?" He turns your wrist over without asking,
          reads the scarring like a printout. "${c.doctorLine} Good bones, under all that ruin. Both of you — with me, now."</p>
          <p class="dim">He turns and walks, and you follow, back through the sheeting into a room strung with more
          chrome than a corp ward. There's a chair in the middle of it, humming to itself, and it's waiting for you.</p>
        </div></div>
        <button class="btn btn-primary" onClick=${() => dispatch({ type: 'GO', screen: 'doctor' })}>To the chair ▸</button>`
      : null}

    </div>`;
}

function streetLine(choice, bribeWin) {
  if (choice === 'gun') return 'The handgun barks four times and the street empties of everything but the rain, hammering the runoff, washing the rest away. You step over them and keep walking. It was fast, and it was final, and some cold part of you notes how little it cost you.';
  if (choice === 'fists') return "It's ugly and close and over in a handful of seconds — four of them down in the runoff, breathing, and going to wake up sore and empty-handed. You flex your hand and keep walking.";
  if (bribeWin) return "You peel a few notes off the roll and let them see there's more where that came from. The math is simple; they take the easy money and melt back into the doorway. You keep walking, lighter and untouched.";
  return "You reach for your money and they reach faster — they take the roll and come at you anyway. You break their circle and run the last block hard, rattled and whole, a little poorer for the lesson.";
}

function kirosReply(reply, choice, bribeWin) {
  if (reply === 'quiet') return '"Quiet keeps you alive out here. Good." He watches you over the cup. "Though the street\'s never quite as quiet as men your size like to pretend."';
  if (reply === 'nosay') return '"Fair. I didn\'t need the story — I needed to see you move, and I did." He sets the cup down. "You\'ll do."';
  if (choice === 'fists') return '"And they\'re still breathing. Restraint, when you didn\'t have to — that\'s rarer than a steady hand out here, and worth more. I can use that."';
  if (bribeWin) return '"Talked your way clear and kept your rounds in the mag. Cheaper than blood, and quieter. I can use that too."';
  return '"Tried their luck and found yours a little short. No shame in a hard mile — you\'re here, and whole enough."';
}
