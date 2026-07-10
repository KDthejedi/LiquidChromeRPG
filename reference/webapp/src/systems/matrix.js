// CHRONICLES · CHROME — the nonspace.
//
// A small requestAnimationFrame backdrop for the run screen: "lines of light
// ranged in the nonspace of the mind, clusters and constellations of data."
// Receding grid, drifting data-stars, and a trace-front that climbs from the
// bottom as the intrusion trace wakes up to you. No assets, no deps.
//
// Usage:
//   const m = createMatrix(canvas);
//   m.start();
//   m.set({ trace: 0..1, nerve: 0..1 });  // per frame from the component
//   m.stop();

export function createMatrix(canvas) {
  const ctx = canvas.getContext('2d');
  let raf = 0, t = 0, dpr = 1;
  let W = 0, H = 0;
  const state = { trace: 0, nerve: 1 };

  // drifting data-stars
  const stars = [];
  const seedStars = () => {
    stars.length = 0;
    const n = 70;
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        z: 0.3 + Math.random() * 0.7,
        p: Math.random() * Math.PI * 2, // twinkle phase
      });
    }
  };

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame() {
    t += 1;
    const jitter = (1 - state.nerve) * 3; // low nerve = the grid shakes
    const jx = jitter ? (Math.sin(t * 0.7) * jitter) : 0;
    const jy = jitter ? (Math.cos(t * 0.9) * jitter) : 0;

    ctx.clearRect(0, 0, W, H);

    // deep background wash — dead-channel colour, faint magenta bruise
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#04070d');
    bg.addColorStop(1, '#0a0410');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(jx, jy);

    // ── receding grid to a vanishing point ──
    const vpX = W * 0.5, vpY = H * 0.42;
    const horizon = H * 0.42;
    ctx.lineWidth = 1;
    // verticals converging on the vanishing point
    ctx.strokeStyle = 'rgba(45,212,191,0.16)';
    for (let i = -10; i <= 10; i++) {
      const fx = W * 0.5 + i * (W / 10);
      ctx.beginPath();
      ctx.moveTo(fx, H);
      ctx.lineTo(vpX, vpY);
      ctx.stroke();
    }
    // horizontal rungs, spaced so they bunch toward the horizon (perspective)
    for (let k = 1; k <= 14; k++) {
      const f = k / 14;
      const y = horizon + (H - horizon) * (f * f);
      const a = 0.05 + 0.16 * (1 - f);
      ctx.strokeStyle = `rgba(56,189,248,${a})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // ── data-stars above the horizon ──
    for (const st of stars) {
      const x = st.x * W;
      const y = st.y * horizon;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.03 + st.p));
      ctx.globalAlpha = tw * st.z;
      ctx.fillStyle = st.z > 0.6 ? '#7dd3fc' : '#a78bfa';
      const s = st.z * 1.8;
      ctx.fillRect(x, y, s, s);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    // ── the trace-front: the lethal trace climbing from the bottom ──
    if (state.trace > 0) {
      const th = H * state.trace;
      const grad = ctx.createLinearGradient(0, H - th, 0, H);
      const heat = state.trace;
      grad.addColorStop(0, `rgba(244,63,94,0)`);
      grad.addColorStop(1, `rgba(244,63,94,${0.12 + 0.30 * heat})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, H - th, W, th);
      // a bright scanning line at the front
      ctx.strokeStyle = `rgba(255,90,110,${0.5 + 0.4 * heat})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, H - th);
      ctx.lineTo(W, H - th + Math.sin(t * 0.3) * 2);
      ctx.stroke();
    }

    raf = requestAnimationFrame(frame);
  }

  return {
    start() {
      resize();
      seedStars();
      window.addEventListener('resize', resize);
      if (!raf) raf = requestAnimationFrame(frame);
    },
    set(next) { Object.assign(state, next); },
    stop() {
      cancelAnimationFrame(raf); raf = 0;
      window.removeEventListener('resize', resize);
    },
  };
}
