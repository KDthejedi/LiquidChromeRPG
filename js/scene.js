// Isometric safehouse — D5: code-drawn neon wireframe, actor as a glow-ring
// chip, tap-to-move. No sprites anywhere; the palette does the work.

const PALETTE = {
  ink: '#04070d',
  teal: '#2dd4bf',
  blue: '#38bdf8',
  violet: '#a78bfa',
  rose: '#f43f5e',
  amber: '#fbbf24',
  dim: '#64748b',
};

// Safehouse grid: 12 wide (x), 9 deep (y). Objects block their cells; clicking
// one walks the player adjacent and surfaces its line.
const ROOM = {
  w: 12,
  h: 9,
  objects: [
    {
      id: 'cot', label: 'the cot',
      cells: [[1, 1], [2, 1]], color: PALETTE.dim, height: 0.35,
      text: 'A cot, and a coat for a blanket. Seven months of learning exactly how thin both are. You slept worse places. You’re just out of the habit of naming them.',
    },
    {
      id: 'deck', label: 'the deck',
      cells: [[9, 1], [10, 1]], color: PALETTE.blue, height: 0.55,
      text: 'The deck hums when your palm crosses it, like it knows you’re wired again. The grid’s out there past the wall — bright, humming, yours. Not tonight. Kiros’s jobs come first.',
    },
    {
      id: 'bench', label: 'the workbench',
      cells: [[1, 6], [2, 6]], color: PALETTE.violet, height: 0.5,
      text: 'Solvent, contact glue, a stripped pistol nobody’s coming back for. Everything on this bench is half of something. Story of the district.',
    },
    {
      id: 'lamp', label: 'the lamp',
      cells: [[6, 4]], color: PALETTE.amber, height: 0.9,
      text: 'One warm bulb in a district of cold neon. You paid too much for it. You’d pay it again.',
    },
    {
      id: 'door', label: 'the door',
      cells: [[11, 4]], color: PALETTE.rose, height: 1.0,
      text: 'The deep end’s three blocks that way, and past it, the old market. Nothing out there tonight is worth the walk. That changes soon.',
    },
  ],
};

export class SafehouseScene {
  constructor(canvas, { accent, initial, portrait, onCaption }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.accent = accent;
    this.initial = initial;
    this.onCaption = onCaption;

    this.portrait = null;
    if (portrait) {
      const img = new Image();
      img.onload = () => { this.portrait = img; };
      img.src = portrait;
    }

    this.player = { x: 5, y: 5 };  // grid position, fractional while walking
    this.path = [];                // remaining cells to walk
    this.pendingObject = null;     // object to read once we arrive
    this.marker = null;            // {x, y, t} click ripple

    this.blocked = new Set();
    for (const obj of ROOM.objects) {
      for (const [cx, cy] of obj.cells) this.blocked.add(`${cx},${cy}`);
    }

    // ambient detail state — deterministic layouts, animated per frame
    const frac = (i, k) => ((i * k) % 97) / 97;
    this.rain = Array.from({ length: 26 }, (_, i) => ({
      wx: 4.2 + frac(i + 1, 37) * 3.55,
      speed: 0.5 + frac(i + 1, 53) * 0.55,
      phase: frac(i + 1, 71),
      len: 0.07 + frac(i + 1, 29) * 0.08,
    }));
    this.cityscape = [
      { wx: 4.25, w: 0.7, h: 0.34 }, { wx: 5.1, w: 0.5, h: 0.52 },
      { wx: 5.75, w: 0.85, h: 0.28 }, { wx: 6.75, w: 0.55, h: 0.46 },
      { wx: 7.4, w: 0.5, h: 0.24 },
    ];
    this.cityLights = Array.from({ length: 14 }, (_, i) => {
      const b = this.cityscape[i % this.cityscape.length];
      return {
        wx: b.wx + 0.12 + frac(i + 1, 41) * (b.w - 0.24),
        f: 0.24 + frac(i + 1, 59) * (b.h - 0.1),
        rate: 0.2 + frac(i + 1, 31) * 0.5,
        seed: frac(i + 1, 83) * Math.PI * 2,
      };
    });
    this.motes = Array.from({ length: 7 }, (_, i) => ({
      seed: frac(i + 1, 61) * Math.PI * 2,
      rx: 0.25 + frac(i + 1, 43) * 0.45,
      rate: 0.12 + frac(i + 1, 23) * 0.2,
    }));

    this._resize = this.resize.bind(this);
    window.addEventListener('resize', this._resize);
    canvas.addEventListener('pointerdown', (e) => this.onTap(e));
    this.resize();

    this.lastT = performance.now();
    this._raf = requestAnimationFrame((t) => this.frame(t));
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._resize);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.viewW = rect.width;
    this.viewH = rect.height;

    // Fit the room with margins; classic 2:1 iso tiles.
    const fitW = this.viewW * 0.86;
    const fitH = this.viewH * 0.8;
    const tw = Math.min(fitW / ((ROOM.w + ROOM.h) / 2), (fitH * 2) / ((ROOM.w + ROOM.h) / 2));
    this.tileW = tw;
    this.tileH = tw / 2;
    this.originX = this.viewW / 2;
    this.originY = (this.viewH - ((ROOM.w + ROOM.h) / 2) * this.tileH) / 2 + this.tileH * 1.5;
  }

  // grid → screen (cell corner; +0.5 each for cell center)
  iso(x, y) {
    return {
      x: this.originX + (x - y) * (this.tileW / 2),
      y: this.originY + (x + y) * (this.tileH / 2),
    };
  }

  // screen → grid cell
  unIso(px, py) {
    const dx = (px - this.originX) / (this.tileW / 2);
    const dy = (py - this.originY) / (this.tileH / 2);
    return { x: Math.floor((dx + dy) / 2), y: Math.floor((dy - dx) / 2) };
  }

  onTap(e) {
    const rect = this.canvas.getBoundingClientRect();
    const cell = this.unIso(e.clientX - rect.left, e.clientY - rect.top);
    if (cell.x < 0 || cell.y < 0 || cell.x >= ROOM.w || cell.y >= ROOM.h) return;

    this.onCaption(null);
    const obj = ROOM.objects.find((o) => o.cells.some(([cx, cy]) => cx === cell.x && cy === cell.y));
    const target = obj ? this.nearestOpenNeighbor(obj, this.player) : cell;
    if (!target || this.blocked.has(`${target.x},${target.y}`)) return;

    const path = this.findPath(
      { x: Math.round(this.player.x), y: Math.round(this.player.y) },
      target,
    );
    if (!path) return;
    this.path = path;
    this.pendingObject = obj || null;
    this.marker = { x: target.x, y: target.y, t: 0 };
    if (path.length === 0 && obj) {
      // already standing next to it
      this.onCaption(obj.text);
      this.pendingObject = null;
    }
  }

  nearestOpenNeighbor(obj, from) {
    let best = null;
    let bestD = Infinity;
    for (const [cx, cy] of obj.cells) {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= ROOM.w || ny >= ROOM.h) continue;
        if (this.blocked.has(`${nx},${ny}`)) continue;
        const d = Math.abs(nx - from.x) + Math.abs(ny - from.y);
        if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
      }
    }
    return best;
  }

  findPath(from, to) {
    if (from.x === to.x && from.y === to.y) return [];
    const key = (x, y) => `${x},${y}`;
    const prev = new Map([[key(from.x, from.y), null]]);
    const queue = [from];
    while (queue.length) {
      const cur = queue.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cur.x + dx, ny = cur.y + dy;
        const k = key(nx, ny);
        if (nx < 0 || ny < 0 || nx >= ROOM.w || ny >= ROOM.h) continue;
        if (this.blocked.has(k) || prev.has(k)) continue;
        prev.set(k, cur);
        if (nx === to.x && ny === to.y) {
          const path = [];
          let node = { x: nx, y: ny };
          while (node && !(node.x === from.x && node.y === from.y)) {
            path.unshift(node);
            node = prev.get(key(node.x, node.y));
          }
          return path;
        }
        queue.push({ x: nx, y: ny });
      }
    }
    return null;
  }

  frame(t) {
    const dt = Math.min((t - this.lastT) / 1000, 0.1);
    this.lastT = t;

    // walk the path
    if (this.path.length) {
      const next = this.path[0];
      const speed = 4.2; // tiles/sec
      const dx = next.x - this.player.x;
      const dy = next.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      const step = speed * dt;
      if (dist <= step) {
        this.player.x = next.x;
        this.player.y = next.y;
        this.path.shift();
        if (!this.path.length && this.pendingObject) {
          this.onCaption(this.pendingObject.text);
          this.pendingObject = null;
        }
      } else {
        this.player.x += (dx / dist) * step;
        this.player.y += (dy / dist) * step;
      }
    }

    if (this.marker) {
      this.marker.t += dt;
      if (this.marker.t > 0.8) this.marker = null;
    }

    this.draw(t);
    this._raf = requestAnimationFrame((tt) => this.frame(tt));
  }

  draw(t) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewW, this.viewH);

    // floor grid
    ctx.save();
    ctx.strokeStyle = PALETTE.teal;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 1;
    ctx.shadowColor = PALETTE.teal;
    ctx.shadowBlur = 6;
    for (let x = 0; x <= ROOM.w; x++) {
      const a = this.iso(x, 0), b = this.iso(x, ROOM.h);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    for (let y = 0; y <= ROOM.h; y++) {
      const a = this.iso(0, y), b = this.iso(ROOM.w, y);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.restore();

    // back walls (north edge y=0, west edge x=0) and what hangs on them
    this.drawWalls();
    this.drawWallDetails(t);
    this.drawFloorDetails();

    // click ripple
    if (this.marker) {
      const c = this.iso(this.marker.x + 0.5, this.marker.y + 0.5);
      const p = this.marker.t / 0.8;
      ctx.save();
      ctx.strokeStyle = this.accent;
      ctx.globalAlpha = (1 - p) * 0.8;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, this.tileW * 0.32 * p + 4, this.tileH * 0.32 * p + 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // depth-sorted drawables: objects + player
    const drawables = ROOM.objects.map((o) => ({
      depth: Math.max(...o.cells.map(([cx, cy]) => cx + cy)),
      fn: () => this.drawObject(o, t),
    }));
    drawables.push({
      depth: this.player.x + this.player.y + 0.01,
      fn: () => this.drawPlayer(t),
    });
    drawables.sort((a, b) => a.depth - b.depth);
    for (const d of drawables) d.fn();

    // dust in the lamplight sits over everything in the room
    this.drawMotes(t);

    // vignette + scanlines
    this.drawGrain();
  }

  wallH() { return this.tileH * 2.6; }

  // point on the north wall (grid x = wx, y = 0) or west wall (x = 0, y = wy)
  // lifted to a fraction f of wall height
  wallN(wx, f) { const p = this.iso(wx, 0); return { x: p.x, y: p.y - this.wallH() * f }; }
  wallW(wy, f) { const p = this.iso(0, wy); return { x: p.x, y: p.y - this.wallH() * f }; }

  drawWalls() {
    const ctx = this.ctx;
    const wallH = this.wallH();
    ctx.save();
    ctx.strokeStyle = PALETTE.blue;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.shadowColor = PALETTE.blue;
    ctx.shadowBlur = 8;
    // verticals + top rails
    const topN0 = this.iso(0, 0), topNe = this.iso(ROOM.w, 0), topSw = this.iso(0, ROOM.h);
    for (let x = 0; x <= ROOM.w; x++) {
      const p = this.iso(x, 0);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - wallH); ctx.stroke();
    }
    for (let y = 0; y <= ROOM.h; y++) {
      const p = this.iso(0, y);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - wallH); ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(topNe.x, topNe.y - wallH); ctx.lineTo(topN0.x, topN0.y - wallH); ctx.lineTo(topSw.x, topSw.y - wallH);
    ctx.stroke();

    // "window" — a brighter slab on the north wall, the city implied beyond
    const w1 = this.iso(4, 0), w2 = this.iso(8, 0);
    ctx.globalAlpha = 0.16;
    const grad = ctx.createLinearGradient(w1.x, w1.y - wallH, w1.x, w1.y);
    grad.addColorStop(0, PALETTE.violet);
    grad.addColorStop(1, PALETTE.teal);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(w1.x, w1.y - wallH * 0.9);
    ctx.lineTo(w2.x, w2.y - wallH * 0.9);
    ctx.lineTo(w2.x, w2.y - wallH * 0.2);
    ctx.lineTo(w1.x, w1.y - wallH * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // quad helper on a wall: axis 'N'|'W', span [a0,a1] along the wall, band [f0,f1] of height
  wallQuad(axis, a0, a1, f0, f1) {
    const pt = axis === 'N' ? this.wallN.bind(this) : this.wallW.bind(this);
    return [pt(a0, f1), pt(a1, f1), pt(a1, f0), pt(a0, f0)];
  }

  tracePoly(pts, close = true) {
    const ctx = this.ctx;
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    if (close) ctx.closePath();
  }

  drawWallDetails(t) {
    const ctx = this.ctx;
    const s = t / 1000;

    // --- the window (N wall, 4..8): city outside, rain on the glass ---
    ctx.save();
    this.tracePoly(this.wallQuad('N', 4.05, 7.95, 0.22, 0.88));
    ctx.clip();

    // skyline silhouettes, a district that never sleeps
    ctx.fillStyle = PALETTE.violet;
    ctx.globalAlpha = 0.13;
    for (const b of this.cityscape) {
      this.tracePoly(this.wallQuad('N', b.wx, b.wx + b.w, 0.22, 0.22 + b.h));
      ctx.fill();
    }
    // lit windows blinking shift change
    for (const l of this.cityLights) {
      const on = Math.sin(s * l.rate * Math.PI * 2 + l.seed);
      if (on < 0.2) continue;
      const p = this.wallN(l.wx, l.f);
      ctx.globalAlpha = 0.35 * Math.min(1, on * 2);
      ctx.fillStyle = Math.sin(l.seed) > 0.3 ? PALETTE.teal : PALETTE.blue;
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
    // rain, stitched down the glass
    ctx.strokeStyle = PALETTE.teal;
    ctx.lineWidth = 1;
    for (const d of this.rain) {
      const fall = (s * d.speed + d.phase) % 1;
      const top = 0.88 - fall * 0.66;
      const a = this.wallN(d.wx, top);
      const b = this.wallN(d.wx + 0.06, Math.max(0.22, top - d.len));
      ctx.globalAlpha = 0.16 + 0.1 * Math.sin(d.phase * 7);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.restore();

    // window frame
    ctx.save();
    ctx.strokeStyle = PALETTE.blue;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    this.tracePoly(this.wallQuad('N', 4.05, 7.95, 0.22, 0.88));
    ctx.stroke();

    // --- wall screen (N wall, 8.8..10.6), fed by the deck below ---
    const flickOut = Math.sin(s * 11.7) > 0.985;
    this.tracePoly(this.wallQuad('N', 8.8, 10.6, 0.34, 0.74));
    ctx.globalAlpha = 0.45;
    ctx.stroke();
    if (!flickOut) {
      ctx.fillStyle = PALETTE.teal;
      ctx.globalAlpha = 0.05 + 0.02 * Math.sin(s * 1.4);
      this.tracePoly(this.wallQuad('N', 8.8, 10.6, 0.34, 0.74));
      ctx.fill();
      // rows of data crawling somewhere it shouldn't
      ctx.strokeStyle = PALETTE.teal;
      for (let row = 0; row < 4; row++) {
        const f = 0.66 - row * 0.08;
        const shift = (s * (0.25 + row * 0.09)) % 1;
        ctx.globalAlpha = 0.3;
        for (let k = 0; k < 5; k++) {
          const x0 = 8.95 + ((k * 0.37 + shift) % 1) * 1.35;
          const a = this.wallN(x0, f);
          const b = this.wallN(Math.min(x0 + 0.14 + (k % 3) * 0.06, 10.45), f);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    // --- vent grate (N wall, 1.3..2.4) ---
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.4;
    this.tracePoly(this.wallQuad('N', 1.3, 2.4, 0.52, 0.7));
    ctx.stroke();
    for (let i = 1; i <= 3; i++) {
      const f = 0.52 + (0.18 / 4) * i;
      const a = this.wallN(1.38, f), b = this.wallN(2.32, f);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    // --- shelves (W wall, 2..4.2): parts, bottles, nothing whole ---
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.5;
    for (const f of [0.38, 0.58]) {
      const a = this.wallW(2, f), b = this.wallW(4.2, f);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      // brackets
      for (const wy of [2.1, 4.1]) {
        const p = this.wallW(wy, f), q = this.wallW(wy, f - 0.07);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
    // clutter on the shelves
    ctx.globalAlpha = 0.45;
    const clutter = [
      [2.25, 0.38, 0.14, 0.1], [2.6, 0.38, 0.1, 0.16], [3.3, 0.38, 0.22, 0.08],
      [2.4, 0.58, 0.12, 0.12], [3.1, 0.58, 0.09, 0.18], [3.7, 0.58, 0.16, 0.07],
    ];
    for (const [wy, f, w, h] of clutter) {
      this.tracePoly(this.wallQuad('W', wy, wy + w, f, f + h));
      ctx.stroke();
    }

    // --- neon sign fragment (W wall, 5.8..7.1) — salvage, still arguing ---
    const buzz = Math.sin(s * 40) * 0.08;
    const dropout = Math.sin(s * 1.9 + 1.3) > 0.94;
    ctx.strokeStyle = PALETTE.rose;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = PALETTE.rose;
    ctx.shadowBlur = dropout ? 2 : 10;
    ctx.globalAlpha = dropout ? 0.12 : 0.55 + buzz;
    const sg = [
      [[5.9, 0.5], [5.9, 0.78]],
      [[6.1, 0.5], [6.45, 0.78], [6.45, 0.5]],
      [[6.7, 0.62], [7.05, 0.62]],
    ];
    for (const stroke of sg) {
      this.tracePoly(stroke.map(([wy, f]) => this.wallW(wy, f)), false);
      ctx.stroke();
    }
    ctx.restore();

    // --- conduit along both wall bases, junction boxes where it elbows ---
    ctx.save();
    ctx.strokeStyle = PALETTE.blue;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    this.tracePoly([this.wallW(8.8, 0.06), this.wallW(0.15, 0.06), this.wallN(0.15, 0.06), this.wallN(11.85, 0.06)], false);
    ctx.stroke();
    ctx.globalAlpha = 0.45;
    for (const p of [this.wallN(3.6, 0.06), this.wallN(8.5, 0.06), this.wallW(5.2, 0.06)]) {
      ctx.strokeRect(p.x - 2.5, p.y - 5, 5, 6);
    }
    // riser from the conduit up to the wall screen
    ctx.globalAlpha = 0.3;
    this.tracePoly([this.wallN(9.7, 0.06), this.wallN(9.7, 0.34)], false);
    ctx.stroke();
    ctx.restore();
  }

  drawFloorDetails() {
    const ctx = this.ctx;
    ctx.save();

    // warm pool under the lamp — the one amber allowance
    const lampC = this.iso(6.5, 4.5);
    const pool = ctx.createRadialGradient(lampC.x, lampC.y, 2, lampC.x, lampC.y, this.tileW * 1.6);
    pool.addColorStop(0, 'rgba(251, 191, 36, 0.10)');
    pool.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.ellipse(lampC.x, lampC.y, this.tileW * 1.6, this.tileH * 1.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // cable from the deck down the floor and up to the wall screen riser
    ctx.strokeStyle = PALETTE.blue;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    this.tracePoly([
      this.iso(9.4, 1.15), this.iso(9.65, 0.6), this.iso(9.7, 0.1), this.wallN(9.7, 0.06),
    ], false);
    ctx.stroke();

    // scuffed floor where the pacing happens
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.12;
    for (const [x, y, r] of [[5.4, 5.3, 0.55], [3.1, 3.2, 0.4], [10.6, 4.6, 0.45]]) {
      const c = this.iso(x, y);
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, this.tileW * 0.01 + this.tileW * r * 0.4, this.tileH * r * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawMotes(t) {
    const ctx = this.ctx;
    const s = t / 1000;
    const lampTop = this.iso(6.5, 4.5);
    const h = this.tileH * 2.2 * 0.9;
    ctx.save();
    ctx.fillStyle = PALETTE.amber;
    for (const m of this.motes) {
      const a = s * m.rate * Math.PI * 2 + m.seed;
      const x = lampTop.x + Math.cos(a) * this.tileW * m.rx * 0.5;
      const y = lampTop.y - h * (0.45 + 0.35 * Math.sin(a * 0.7 + m.seed));
      ctx.globalAlpha = 0.18 + 0.14 * Math.sin(a * 1.3);
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    ctx.restore();
  }

  drawObject(obj, t) {
    const ctx = this.ctx;
    const h = this.tileH * 2.2 * obj.height;
    ctx.save();
    ctx.strokeStyle = obj.color;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = obj.color;
    ctx.shadowBlur = obj.id === 'lamp' ? 16 + Math.sin(t / 300) * 3 : 10;

    // wireframe box over the object's cell span
    const xs = obj.cells.map(([x]) => x), ys = obj.cells.map(([, y]) => y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs) + 1;
    const y0 = Math.min(...ys), y1 = Math.max(...ys) + 1;
    const base = [this.iso(x0, y0), this.iso(x1, y0), this.iso(x1, y1), this.iso(x0, y1)];

    ctx.beginPath();
    base.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    base.forEach((p, i) => {
      const q = { x: p.x, y: p.y - h };
      if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y);
    });
    ctx.closePath();
    ctx.stroke();

    for (const p of base) {
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - h); ctx.stroke();
    }
    ctx.restore();
  }

  drawPlayer(t) {
    const ctx = this.ctx;
    const c = this.iso(this.player.x + 0.5, this.player.y + 0.5);
    const r = Math.max(this.tileH * 0.62, 12);
    const bob = Math.sin(t / 450) * 2;
    const cy = c.y - r - 6 + bob;

    ctx.save();
    // ground shadow ellipse
    ctx.fillStyle = this.accent;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, r * 0.8, r * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    // portrait-chip with glow ring (initial as fallback while loading)
    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.ink;
    ctx.strokeStyle = this.accent;
    ctx.lineWidth = 2;
    ctx.shadowColor = this.accent;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(c.x, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    if (this.portrait) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(c.x, cy, r - 1, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.portrait, c.x - r, cy - r, r * 2, r * 2);
      ctx.restore();
    } else {
      ctx.fillStyle = this.accent;
      ctx.font = `${Math.round(r)}px "SF Mono", Menlo, Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.initial, c.x, cy + 1);
    }
    ctx.restore();
  }

  drawGrain() {
    const ctx = this.ctx;
    ctx.save();
    // scanlines
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#000';
    for (let y = 0; y < this.viewH; y += 4) ctx.fillRect(0, y, this.viewW, 1);
    // vignette
    const g = ctx.createRadialGradient(
      this.viewW / 2, this.viewH / 2, Math.min(this.viewW, this.viewH) * 0.35,
      this.viewW / 2, this.viewH / 2, Math.max(this.viewW, this.viewH) * 0.75,
    );
    g.addColorStop(0, 'rgba(4,7,13,0)');
    g.addColorStop(1, 'rgba(4,7,13,0.85)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    ctx.restore();
  }
}
