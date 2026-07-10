import { html, useRef, useState, useEffect } from '../ui.js';
import { neighbours, randInt } from '../engine.js';
import { createMatrix } from '../systems/matrix.js';
import { sfx } from '../systems/audio.js';

// The run: trace a path through the lattice, left to right, from entry to core,
// before the trace-front (the intrusion detection waking to you) climbs past
// 100. Firewalled nodes need an exploit, or you brute-force them and the trace
// spikes. Data nodes pay. The core is the pull.
export function Run({ state, dispatch }) {
  const L = state.lattice;
  const canvasRef = useRef(null);
  const matrixRef = useRef(null);
  const traceRef = useRef(0);
  const forcedRef = useRef(0);   // firewalls brute-forced (no exploit) — hurts intel
  const doneRef = useRef(false);

  const [path, setPath] = useState([L.entryId]);
  const [breakers, setBreakers] = useState(state.breakersMax);
  const [gained, setGained] = useState(0);
  const [trace, setTrace] = useState(0);
  const [msg, setMsg] = useState('You are in. The grid opens like a hand.');

  const hereId = path[path.length - 1];
  const nerveRatio = Math.max(0.12, state.nerve / state.nerveMax);

  // Backdrop + trace clock. One rAF loop advances the trace and feeds the
  // nonspace canvas. Low nerve speeds the trace and shakes the grid.
  useEffect(() => {
    const m = createMatrix(canvasRef.current);
    matrixRef.current = m;
    m.start();
    let raf = 0, last = 0;
    const ghost = state.ghost ? 0.7 : 1.0;
    const resist = state.traceMult || 1.0; // speed + stealth slow the trace
    const rate = L.traceRate * resist * ghost * (1 + (1 - nerveRatio) * 0.6);
    const tick = (ts) => {
      if (!last) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      if (!doneRef.current) {
        traceRef.current = Math.min(101, traceRef.current + rate * dt);
        setTrace(traceRef.current);
        m.set({ trace: traceRef.current / 100, nerve: nerveRatio });
        if (traceRef.current >= 100) { caught(); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); m.stop(); };
  }, []); // eslint-disable-line

  function finish(caughtFlag, gainedNow) {
    if (doneRef.current) return;
    doneRef.current = true;
    dispatch({ type: 'RUN_RESOLVE', caught: caughtFlag, gained: gainedNow,
      traceAtPull: Math.round(traceRef.current), forced: forcedRef.current });
  }
  function caught() { sfx.play('caught'); finish(true, 0); }

  function step(node) {
    if (doneRef.current) return;
    const reach = neighbours(L, hereId).some(n => n.id === node.id);
    if (!reach) return;

    let g = gained;
    if (node.type === 'ice' && !node.cut) {
      if (breakers > 0) {
        setBreakers(b => b - 1);
        node.cut = true;
        sfx.play('cut');
        setMsg('The exploit lands. The firewall opens, grudging.');
      } else {
        // brute-force it — the firewall screams your address at the trace
        forcedRef.current += 1;
        traceRef.current = Math.min(99, traceRef.current + 20);
        setTrace(traceRef.current);
        node.cut = true;
        setMsg('No exploit left. You brute-force it, and something behind the firewall turns to look at you.');
      }
    } else if (node.type === 'data') {
      // marksmanship — the steady, precise pull — takes more clear
      const take = Math.round(randInt(120, 340) * (1 + (state.marks || 5) * 0.03));
      g = gained + take;
      setGained(g);
      sfx.play('buy');
      setMsg(`Loose data — ${take} credits. You take it because you always take it.`);
    } else {
      sfx.play('move');
    }

    node.taken = true;
    setPath(p => [...p, node.id]);

    if (node.type === 'core') { sfx.play('pull'); finish(false, g); }
  }

  const reachIds = new Set(neighbours(L, hereId).map(n => n.id));
  const pathSet = new Set(path);

  return html`
    <div class="wrap fade">
      <div class="run-bar">
        <span class="dim">exploits <b class="teal">${breakers}</b></span>
        <span class="dim">${gained ? '· ' + gained + ' credits' : ''}</span>
        <span class="trace-meter"><span style=${{ width: Math.min(100, trace) + '%' }}></span></span>
        <span class="dim">${trace < 70 ? 'trace' : 'TRACE'} ${Math.round(trace)}</span>
      </div>

      <div class="run-stage">
        <canvas class="run-canvas" ref=${canvasRef}></canvas>

        <svg class="lattice" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${L.nodes.flatMap(a => neighbours(L, a.id).map(b => {
            const live = a.id === hereId && reachIds.has(b.id);
            return html`<line key=${a.id + '-' + b.id}
              class=${'edge-svg' + (live ? ' live' : '')}
              x1=${xp(L, a)} y1=${yp(L, a)} x2=${xp(L, b)} y2=${yp(L, b)}
              stroke=${live ? 'var(--teal)' : 'rgba(45,212,191,0.22)'}
              stroke-width=${live ? 0.6 : 0.3} />`;
          }))}
        </svg>

        <div class="lattice">
          ${L.nodes.map(n => {
            const cls = ['node'];
            if (n.type === 'core') cls.push('core');
            else if (n.type === 'ice' && !n.cut) cls.push('ice');
            else if (n.type === 'data' && !pathSet.has(n.id)) cls.push('data');
            if (n.id === hereId) cls.push('here');
            else if (pathSet.has(n.id)) cls.push('taken');
            else if (reachIds.has(n.id)) cls.push('reachable');
            const label = n.type === 'core' ? 'CORE'
              : n.id === hereId ? 'YOU'
              : n.type === 'ice' && !n.cut ? 'FW'
              : n.type === 'data' && !pathSet.has(n.id) ? 'CR' : '·';
            return html`<div key=${n.id} class=${cls.join(' ')}
              style=${{ left: xp(L, n) + '%', top: yp(L, n) + '%' }}
              onClick=${() => reachIds.has(n.id) && step(n)}>${label}</div>`;
          })}
        </div>
      </div>

      <div class="run-msg">${msg}</div>
    </div>`;
}

// node → stage percentage. Columns spread across x, rows down y, both inset.
function xp(L, n) { return 8 + (n.col / Math.max(1, L.cols - 1)) * 84; }
function yp(L, n) { return 16 + (n.row / Math.max(1, L.rows - 1)) * 68; }
