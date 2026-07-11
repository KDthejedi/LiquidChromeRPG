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

// hex color -> rgba() at the given alpha
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

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
    {
      id: 'crates', label: 'the crates',
      cells: [[10, 7], [11, 7]], color: PALETTE.teal, height: 0.55,
      text: 'Sealed crates, consortium stencils sanded off. Kiros’s people left them. You haven’t asked what’s inside. They haven’t said.',
    },
  ],
};

// Hybrid backdrop (the step past D5's pure code-drawn look): if a painted
// isometric backdrop exists at `src`, it replaces the code-drawn architecture
// and furniture; actors, light animation, captions and interactivity render
// on top. `origin` is where the grid's (0,0) corner sits in image pixels;
// `tileW` is one tile's width in image pixels — tune both against the real
// image with dev/scene-preview.html?bg=...&calx=&caly=&caltw=.
const BACKDROP = {
  src: 'assets/interiors/safehouse.jpg',
  origin: { x: 1048, y: 352 },
  tileW: 146,
  // the painted room has its own geometry and furniture stations; this
  // layout re-shapes the walkable grid, remaps object footprints to the
  // paint, and re-voices captions where the paint shows different furniture.
  layout: {
    w: 10, h: 10,
    start: { x: 4, y: 6 },
    cells: {
      deck: [[0, 3], [0, 4], [0, 5], [1, 3], [1, 4], [1, 5]],
      bench: [[1, 1], [2, 1], [1, 2], [2, 2]],
      crates: [[5, 2], [6, 2]],
      cot: [[7, 2], [8, 2], [9, 2], [7, 3], [8, 3], [9, 3]],
      lamp: [[6, 1]],
      door: [[9, 0], [9, 1]],
    },
    overrides: {
      cot: {
        text: 'A real bed, a real blanket — Kiros’s people again. Seven months you slept under your coat. You keep it folded at the foot anyway. Habit.',
      },
      bench: {
        label: 'the shelves',
        text: 'Parts, bottles, a microwave older than you are. Everything on these shelves is half of something. Story of the district.',
      },
      crates: {
        label: 'the gear rack',
        text: 'The duffel’s packed. It’s been packed for seven months. Some habits you don’t unlearn — you just keep them where you can grab them.',
      },
    },
    // wedge hugging the painted right wall — the paint's wall base is
    // steeper than true 2:1, so these cells sit inside the wall
    blocked: [[5, 0], [6, 0], [7, 0], [8, 0], [5, 1], [7, 1], [8, 1]],
  },
};

// Per-operative figure builds: same skeleton, different body. sh/hem scale
// the coat, h the height, bob the idle/walk sway, hood the hood depth, puff
// the footstep dust, gadget the signature gear.
const FIGURES = {
  zen: { sh: 0.85, hem: 1.12, h: 2.42, bob: 1.0, hood: 1.0, puff: 0.8, gadget: 'deck' },
  socrates: { sh: 1.08, hem: 1.5, h: 2.3, bob: 0.65, hood: 0.55, puff: 1.0, gadget: 'satchel' },
  jackal: { sh: 1.25, hem: 1.28, h: 2.5, bob: 0.45, hood: 0.25, puff: 1.5, gadget: 'holster' },
  hemlock: { sh: 0.78, hem: 1.05, h: 2.28, bob: 0.35, hood: 1.35, puff: 0.4, gadget: 'blade' },
};

export class SafehouseScene {
  constructor(canvas, {
    accent, initial, portrait, body, bodyBack, bodySide, rig, rigBack, rigSide,
    onCaption, onInteract, onSfx, figure, backdrop,
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.accent = accent;
    this.initial = initial;
    this.onCaption = onCaption;
    this.onInteract = onInteract || null;
    this.onSfx = onSfx || (() => {});
    this.fig = FIGURES[figure] || FIGURES.zen;

    this.portrait = null;
    if (portrait) {
      const img = new Image();
      img.onload = () => { this.portrait = img; };
      img.src = portrait;
    }

    // full-body art (transparent PNG): replaces the code-drawn figure while
    // keeping shadow, reflection, dust, bob, lean, and facing mirror
    this.body = null;
    if (body) {
      const img = new Image();
      img.onload = () => { this.body = img; };
      img.src = body;
    }
    this.bodyBack = null;
    if (bodyBack) {
      const img = new Image();
      img.onload = () => { this.bodyBack = img; };
      img.src = bodyBack;
    }
    this.bodySide = null;
    if (bodySide) {
      const img = new Image();
      img.onload = () => { this.bodySide = img; };
      img.src = bodySide;
    }
    this.view = 'front';   // front | back | side — chosen per walk from net direction
    this.strideV = 0;      // eased stride speed 0..1 (accelerate in, settle out)
    this.pathT = 0;        // seconds since the current walk began

    // cutout rigs (core + legs + pivots): when present, the legs scissor and
    // the torso counter-sways while walking
    this.rigFront = null;
    this.rigBack = null;
    this.rigSide = null;
    if (rig) this.loadRig(rig, (r) => { this.rigFront = r; });
    if (rigBack) this.loadRig(rigBack, (r) => { this.rigBack = r; });
    if (rigSide) this.loadRig(rigSide, (r) => { this.rigSide = r; });

    // painted backdrop, if the asset exists — 404 falls back to code-drawn
    this.backdropCal = backdrop || BACKDROP;
    this.calibrate = !!backdrop?.calibrate;
    this.backdrop = null;
    {
      const img = new Image();
      img.onload = () => { this.backdrop = img; };
      img.onerror = () => { this.backdrop = null; };
      img.src = this.backdropCal.src;
    }

    // the active room: the painted backdrop's layout reshapes the grid and
    // furniture stations; otherwise the code-drawn ROOM as authored
    const layout = (backdrop || BACKDROP).layout;
    this.room = layout
      ? {
        w: layout.w, h: layout.h,
        objects: ROOM.objects
          .filter((o) => layout.cells[o.id])
          .map((o) => ({ ...o, cells: layout.cells[o.id], ...(layout.overrides?.[o.id] ?? {}) })),
      }
      : ROOM;

    const start = layout?.start ?? { x: 5, y: 5 };
    this.player = { ...start };    // grid position, fractional while walking
    this.path = [];                // remaining cells to walk
    this.pendingObject = null;     // object to read once we arrive
    this.marker = null;            // {x, y, t} click ripple
    this.facing = 1;               // screen-space: 1 faces right, -1 faces left
    this.walkT = 0;                // distance walked, drives the leg cycle

    this.blocked = new Set();
    for (const obj of this.room.objects) {
      for (const [cx, cy] of obj.cells) this.blocked.add(`${cx},${cy}`);
    }
    for (const [cx, cy] of layout?.blocked ?? []) this.blocked.add(`${cx},${cy}`);

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
    this.puffs = [];        // footstep dust
    this.lastLegSign = 1;
    // accessibility floor: honor prefers-reduced-motion by stilling the
    // decorative loops (rain, drone, haze, motes, steam, grain jitter)
    this.still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // film grain: a small noise tile, pattern-tiled with a frame jitter
    const noise = document.createElement('canvas');
    noise.width = noise.height = 128;
    const nctx = noise.getContext('2d');
    const nd = nctx.createImageData(128, 128);
    for (let i = 0; i < nd.data.length; i += 4) {
      const v = 120 + Math.random() * 135;
      nd.data[i] = nd.data[i + 1] = nd.data[i + 2] = v;
      nd.data[i + 3] = Math.random() < 0.35 ? 14 : 0;
    }
    nctx.putImageData(nd, 0, 0);
    this.grain = this.ctx.createPattern(noise, 'repeat');

    this._resize = this.resize.bind(this);
    window.addEventListener('resize', this._resize);
    canvas.addEventListener('pointerdown', (e) => this.onTap(e));
    this.resize();

    this.lastT = performance.now();
    this._raf = requestAnimationFrame((t) => this.frame(t));
  }

  loadRig(url, cb) {
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((meta) => {
        if (!meta) return;
        const base = url.slice(0, url.lastIndexOf('/') + 1);
        const parts = {};
        const arms = ['armL', 'armR'].filter((k) => meta[k]);
        let left = 3 + arms.length;
        const done = () => { left -= 1; if (left === 0) cb({ ...meta, ...parts }); };
        for (const k of ['core', 'legL', 'legR']) {
          const img = new Image();
          img.onload = () => { parts[k] = img; done(); };
          img.src = base + meta[k];
        }
        for (const k of arms) {
          const img = new Image();
          img.onload = () => { parts[k + 'Img'] = img; done(); };
          img.src = base + meta[k].img;
        }
      })
      .catch(() => {});
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
    const tw = Math.min(fitW / ((this.room.w + this.room.h) / 2), (fitH * 2) / ((this.room.w + this.room.h) / 2));
    this.tileW = tw;
    this.tileH = tw / 2;
    this.originX = this.viewW / 2;
    this.originY = (this.viewH - ((this.room.w + this.room.h) / 2) * this.tileH) / 2 + this.tileH * 1.5;
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
    if (cell.x < 0 || cell.y < 0 || cell.x >= this.room.w || cell.y >= this.room.h) return;

    this.onCaption(null);
    const obj = this.room.objects.find((o) => o.cells.some(([cx, cy]) => cx === cell.x && cy === cell.y));
    const target = obj ? this.nearestOpenNeighbor(obj, this.player) : cell;
    if (!target || this.blocked.has(`${target.x},${target.y}`)) return;

    const path = this.findPath(
      { x: Math.round(this.player.x), y: Math.round(this.player.y) },
      target,
    );
    if (!path) return;
    this.onSfx('move');
    this.startWalk(path);
    this.pendingObject = obj || null;
    this.marker = { x: target.x, y: target.y, t: 0 };
    if (path.length === 0 && obj) {
      // already standing next to it
      this.resolveInteract(obj);
      this.pendingObject = null;
    }
  }

  startWalk(path) {
    this.path = path;
    this.pathT = 0;
    if (this.body && path.length) {
      const end = path[path.length - 1];
      const ndx = end.x - Math.round(this.player.x);
      const ndy = end.y - Math.round(this.player.y);
      const sdx = ndx - ndy;
      const sdy = ndx + ndy;
      if (this.bodySide && Math.abs(sdx) >= 1.8 * Math.abs(sdy)) this.view = 'side';
      else this.view = sdy < 0 ? 'back' : 'front';
      if (sdx) this.facing = Math.sign(sdx);
    }
  }

  resolveInteract(obj) {
    if (this.onInteract) this.onInteract(obj);
    else this.onCaption(obj.text);
  }

  nearestOpenNeighbor(obj, from) {
    let best = null;
    let bestD = Infinity;
    for (const [cx, cy] of obj.cells) {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= this.room.w || ny >= this.room.h) continue;
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
        if (nx < 0 || ny < 0 || nx >= this.room.w || ny >= this.room.h) continue;
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

    // walk the path — ease in on the first step, settle on the last
    if (this.path.length) {
      this.pathT += dt;
      const next = this.path[0];
      const dx = next.x - this.player.x;
      const dy = next.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      const remaining = (this.path.length - 1) + dist;
      const accel = Math.min(1, this.pathT * 3.5);
      const settle = remaining < 0.8 ? Math.max(0.4, remaining / 0.8) : 1;
      this.strideV = accel * settle;
      const step = 4.2 * this.strideV * dt;
      const screenDx = dx - dy; // iso: +x goes right, +y goes left
      if (!this.body && Math.abs(screenDx) > 0.01) this.facing = Math.sign(screenDx);
      this.walkT += step;
      // a puff of dust at each footfall
      const legSign = Math.sign(Math.sin(this.walkT * 9)) || 1;
      if (legSign !== this.lastLegSign) {
        this.lastLegSign = legSign;
        this.onSfx('step');
        const c = this.iso(this.player.x + 0.5, this.player.y + 0.5);
        this.puffs.push({ x: c.x, y: c.y, t: 0 });
        if (this.puffs.length > 6) this.puffs.shift();
      }
      if (dist <= step) {
        this.player.x = next.x;
        this.player.y = next.y;
        this.path.shift();
        if (!this.path.length) {
          this.strideV = 0;
          if (this.pendingObject) {
            this.resolveInteract(this.pendingObject);
            this.pendingObject = null;
          }
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
    for (const p of this.puffs) p.t += dt;
    this.puffs = this.puffs.filter((p) => p.t < 0.55);

    this.draw(t);
    this._raf = requestAnimationFrame((tt) => this.frame(tt));
  }

  draw(t) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewW, this.viewH);

    // painted backdrop mode: the image is the room; code renders the living
    // layers (light, ripple, actor, air, grain) and all interactivity on top
    if (this.backdrop) {
      const cal = this.backdropCal;
      const s = this.tileW / cal.tileW;
      ctx.drawImage(
        this.backdrop,
        this.originX - cal.origin.x * s, this.originY - cal.origin.y * s,
        this.backdrop.width * s, this.backdrop.height * s,
      );
      // whisper of the walkable grid so taps have somewhere to land
      ctx.save();
      ctx.strokeStyle = PALETTE.teal;
      ctx.globalAlpha = this.calibrate ? 0.5 : 0.045;
      for (let x = 0; x <= this.room.w; x++) {
        const a = this.iso(x, 0), b = this.iso(x, this.room.h);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      for (let y = 0; y <= this.room.h; y++) {
        const a = this.iso(0, y), b = this.iso(this.room.w, y);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (this.calibrate) {
        // object footprints, for lining the paint up with the stations
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = PALETTE.rose;
        for (const obj of this.room.objects) {
          for (const [cx, cy] of obj.cells) {
            this.tracePoly([
              this.iso(cx, cy), this.iso(cx + 1, cy),
              this.iso(cx + 1, cy + 1), this.iso(cx, cy + 1),
            ]);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // the paint carries its own light; code adds only the living layers
      this.drawMarker();
      this.drawPlayer(t);
      this.drawGrain(t);
      return;
    }

    // poured-slab floor: alternating 3x3 concrete panels under the grid
    ctx.save();
    for (let px = 0; px < this.room.w / 3; px++) {
      for (let py = 0; py < this.room.h / 3; py++) {
        ctx.fillStyle = PALETTE.teal;
        ctx.globalAlpha = 0.015 + ((px + py) % 2) * 0.022;
        this.tracePoly([
          this.iso(px * 3, py * 3), this.iso(px * 3 + 3, py * 3),
          this.iso(px * 3 + 3, py * 3 + 3), this.iso(px * 3, py * 3 + 3),
        ]);
        ctx.fill();
      }
    }
    ctx.restore();

    // concrete grime: noise texture clipped to the slab
    if (this.grain) {
      ctx.save();
      this.tracePoly([
        this.iso(0, 0), this.iso(this.room.w, 0), this.iso(this.room.w, this.room.h), this.iso(0, this.room.h),
      ]);
      ctx.clip();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = this.grain;
      ctx.fillRect(0, 0, this.viewW, this.viewH);
      ctx.restore();
    }

    // light cast onto the floor by everything that glows
    this.drawLightPools(t);

    // floor grid, with brighter seams on the panel joints
    ctx.save();
    ctx.strokeStyle = PALETTE.teal;
    ctx.lineWidth = 1;
    ctx.shadowColor = PALETTE.teal;
    ctx.shadowBlur = 6;
    for (let x = 0; x <= this.room.w; x++) {
      ctx.globalAlpha = x % 3 === 0 ? 0.4 : 0.2;
      const a = this.iso(x, 0), b = this.iso(x, this.room.h);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    for (let y = 0; y <= this.room.h; y++) {
      ctx.globalAlpha = y % 3 === 0 ? 0.4 : 0.2;
      const a = this.iso(0, y), b = this.iso(this.room.w, y);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.restore();

    // back walls (north edge y=0, west edge x=0) and what hangs on them
    this.drawWalls();
    this.drawWallDetails(t);
    this.drawFloorDetails();

    this.drawMarker();

    // soft shadows under the furniture, then depth-sorted drawables
    this.drawObjectShadows();
    const drawables = this.room.objects.map((o) => ({
      depth: Math.max(...o.cells.map(([cx, cy]) => cx + cy)),
      fn: () => this.drawObject(o, t),
    }));
    drawables.push({
      depth: this.player.x + this.player.y + 0.01,
      fn: () => this.drawPlayer(t),
    });
    drawables.sort((a, b) => a.depth - b.depth);
    for (const d of drawables) d.fn();

    // room air: slow haze bands, then dust in the lamplight
    this.drawHaze(t);
    this.drawMotes(t);

    // vignette + scanlines + grain
    this.drawGrain(t);
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

    // solid wall surfaces: dark gradient panels so the room encloses
    for (const [pt, span] of [[this.wallN.bind(this), this.room.w], [this.wallW.bind(this), this.room.h]]) {
      const base0 = pt(0, 0), base1 = pt(span, 0);
      const grad = ctx.createLinearGradient(base0.x, base0.y - wallH, base0.x, base0.y);
      grad.addColorStop(0, hexA(PALETTE.blue, 0.015));
      grad.addColorStop(1, hexA(PALETTE.blue, 0.07));
      ctx.fillStyle = '#060a13';
      ctx.globalAlpha = 0.82;
      this.tracePoly([
        { x: base0.x, y: base0.y - wallH }, { x: base1.x, y: base1.y - wallH },
        { x: base1.x, y: base1.y }, { x: base0.x, y: base0.y },
      ]);
      ctx.fill();
      ctx.fillStyle = grad;
      ctx.globalAlpha = 1;
      this.tracePoly([
        { x: base0.x, y: base0.y - wallH }, { x: base1.x, y: base1.y - wallH },
        { x: base1.x, y: base1.y }, { x: base0.x, y: base0.y },
      ]);
      ctx.fill();
    }

    ctx.strokeStyle = PALETTE.blue;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.shadowColor = PALETTE.blue;
    ctx.shadowBlur = 8;
    // verticals + top rails
    const topN0 = this.iso(0, 0), topNe = this.iso(this.room.w, 0), topSw = this.iso(0, this.room.h);
    for (let x = 0; x <= this.room.w; x++) {
      const p = this.iso(x, 0);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - wallH); ctx.stroke();
    }
    for (let y = 0; y <= this.room.h; y++) {
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
    // a freighter drone crossing the skyline, running light blinking
    const acX = this.still ? 5.4 : 4.3 + ((s / 14) % 1) * 3.4;
    const acF = 0.72 - ((s / 14) % 1) * 0.06;
    const ac = this.wallN(acX, acF);
    ctx.fillStyle = PALETTE.dim;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(ac.x - 2, ac.y, 4, 1.5);
    if (Math.sin(s * 6) > 0.4) {
      ctx.fillStyle = PALETTE.rose;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(ac.x + 2.5, ac.y, 1.5, 1.5);
    }

    // rain, stitched down the glass
    ctx.strokeStyle = PALETTE.teal;
    ctx.lineWidth = 1;
    for (const d of this.rain) {
      const fall = this.still ? d.phase : (s * d.speed + d.phase) % 1;
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

    // --- cables sagging along the top of the north wall ---
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.35;
    for (const [ax, bx, sag] of [[0.3, 2.1, 0.1], [2.1, 3.9, 0.13], [8.2, 10.4, 0.09], [10.4, 11.8, 0.12]]) {
      const a = this.wallN(ax, 0.96), b = this.wallN(bx, 0.96);
      const m = this.wallN((ax + bx) / 2, 0.96 - sag);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(m.x, m.y, b.x, b.y);
      ctx.stroke();
    }

    // --- wall clock (N wall), keeping honest time ---
    const ck = this.wallN(3.3, 0.78);
    const now = new Date();
    ctx.strokeStyle = PALETTE.teal;
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.arc(ck.x, ck.y, 6, 0, Math.PI * 2); ctx.stroke();
    const hA = ((now.getHours() % 12) / 12 + now.getMinutes() / 720) * Math.PI * 2 - Math.PI / 2;
    const mA = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(ck.x, ck.y); ctx.lineTo(ck.x + Math.cos(hA) * 3, ck.y + Math.sin(hA) * 3);
    ctx.moveTo(ck.x, ck.y); ctx.lineTo(ck.x + Math.cos(mA) * 4.8, ck.y + Math.sin(mA) * 4.8);
    ctx.stroke();

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

    // --- the plan, taped to the west wall: a marked-up district map ---
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.5;
    this.tracePoly(this.wallQuad('W', 4.55, 5.5, 0.42, 0.78));
    ctx.stroke();
    // tape corners
    ctx.fillStyle = PALETTE.dim;
    ctx.globalAlpha = 0.4;
    for (const [wy, f] of [[4.55, 0.78], [5.5, 0.78], [4.55, 0.42], [5.5, 0.42]]) {
      const p = this.wallW(wy, f);
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    // a coastline, a route, and the X that matters
    ctx.strokeStyle = PALETTE.teal;
    ctx.globalAlpha = 0.4;
    this.tracePoly([
      this.wallW(4.65, 0.72), this.wallW(4.9, 0.66), this.wallW(4.82, 0.58),
      this.wallW(5.1, 0.52), this.wallW(5.4, 0.55),
    ], false);
    ctx.stroke();
    ctx.setLineDash([2, 2]);
    this.tracePoly([this.wallW(4.7, 0.48), this.wallW(5.0, 0.56), this.wallW(5.22, 0.63)], false);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = PALETTE.rose;
    ctx.globalAlpha = 0.6;
    const xm = this.wallW(5.24, 0.64);
    ctx.beginPath();
    ctx.moveTo(xm.x - 2.5, xm.y - 2.5); ctx.lineTo(xm.x + 2.5, xm.y + 2.5);
    ctx.moveTo(xm.x + 2.5, xm.y - 2.5); ctx.lineTo(xm.x - 2.5, xm.y + 2.5);
    ctx.stroke();

    // --- a spare coat on a peg (W wall, near the south end) ---
    const peg = this.wallW(7.9, 0.72);
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.moveTo(peg.x, peg.y); ctx.lineTo(peg.x, peg.y + 3); ctx.stroke();
    const coatHang = [
      { x: peg.x, y: peg.y + 3 },
      { x: peg.x - 6, y: peg.y + 10 },
      { x: peg.x - 5, y: peg.y + 30 },
      { x: peg.x + 6, y: peg.y + 30 },
      { x: peg.x + 5, y: peg.y + 9 },
    ];
    ctx.fillStyle = PALETTE.ink;
    ctx.globalAlpha = 0.85;
    this.tracePoly(coatHang);
    ctx.fill();
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.5;
    this.tracePoly(coatHang);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(peg.x, peg.y + 4); ctx.lineTo(peg.x - 1, peg.y + 28);
    ctx.stroke();

    // --- neon sign fragment (W wall, 5.8..7.1) — salvage, still arguing ---
    const buzz = Math.sin(s * 40) * 0.08;
    const dropout = Math.sin(s * 1.9 + 1.3) > 0.94;
    ctx.globalCompositeOperation = 'lighter';
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
    ctx.globalCompositeOperation = 'source-over';
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

    // a worn rug under the middle of the room, corner kicked up
    ctx.strokeStyle = PALETTE.violet;
    ctx.globalAlpha = 0.45;
    this.tracePoly([this.iso(4.2, 4.4), this.iso(8.8, 4.4), this.iso(8.8, 6.6), this.iso(4.2, 6.6)]);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    this.tracePoly([this.iso(4.5, 4.7), this.iso(8.5, 4.7), this.iso(8.5, 6.3), this.iso(4.5, 6.3)]);
    ctx.stroke();
    ctx.fillStyle = PALETTE.violet;
    ctx.globalAlpha = 0.04;
    this.tracePoly([this.iso(4.2, 4.4), this.iso(8.8, 4.4), this.iso(8.8, 6.6), this.iso(4.2, 6.6)]);
    ctx.fill();
    // kicked-up corner fold
    ctx.globalAlpha = 0.3;
    const foldA = this.iso(8.8, 6.6), foldB = this.iso(8.35, 6.6), foldC = this.iso(8.8, 6.15);
    ctx.strokeStyle = PALETTE.violet;
    ctx.beginPath();
    ctx.moveTo(foldB.x, foldB.y); ctx.lineTo(foldA.x, foldA.y - this.tileH * 0.22); ctx.lineTo(foldC.x, foldC.y);
    ctx.stroke();

    // oil stain bleeding out from under the workbench
    const stain = this.iso(2.7, 5.35);
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(stain.x, stain.y, this.tileW * 0.34, this.tileH * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.14;
    ctx.beginPath();
    ctx.ellipse(stain.x, stain.y, this.tileW * 0.34, this.tileH * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // power cable from the bench to the wall conduit
    ctx.strokeStyle = PALETTE.blue;
    ctx.globalAlpha = 0.28;
    this.tracePoly([this.iso(1.4, 6.05), this.iso(0.7, 5.7), this.iso(0.12, 5.55), this.wallW(5.5, 0.06)], false);
    ctx.stroke();

    // threshold plates in front of the door
    ctx.strokeStyle = PALETTE.rose;
    ctx.globalAlpha = 0.3;
    for (const off of [0, 0.12]) {
      const a = this.iso(10.8 + off, 4.05), b = this.iso(10.8 + off, 4.95);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    // scuffed floor where the pacing happens
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.12;
    for (const [x, y, r] of [[5.4, 5.3, 0.55], [3.1, 3.2, 0.4], [10.6, 4.6, 0.45]]) {
      const c = this.iso(x, y);
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, this.tileW * 0.01 + this.tileW * r * 0.4, this.tileH * r * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // drain grate, because everything down here eventually leaks
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.35;
    this.tracePoly([this.iso(4.35, 7.35), this.iso(4.95, 7.35), this.iso(4.95, 7.95), this.iso(4.35, 7.95)]);
    ctx.stroke();
    for (let i = 1; i <= 3; i++) {
      const a = this.iso(4.35 + i * 0.15, 7.38), b = this.iso(4.35 + i * 0.15, 7.92);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.3;
    this.tracePoly([this.iso(4.35, 7.35), this.iso(4.95, 7.35), this.iso(4.95, 7.95), this.iso(4.35, 7.95)]);
    ctx.fill();

    // gaffer-tape cross where gear gets staged before a job
    ctx.strokeStyle = PALETTE.teal;
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 2;
    const tc = this.iso(9.7, 4.5);
    ctx.beginPath();
    ctx.moveTo(tc.x - 7, tc.y - 3.5); ctx.lineTo(tc.x + 7, tc.y + 3.5);
    ctx.moveTo(tc.x + 7, tc.y - 3.5); ctx.lineTo(tc.x - 7, tc.y + 3.5);
    ctx.stroke();
    ctx.lineWidth = 1;

    // empties beside the cot
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.4;
    for (const [bx, by, bh] of [[3.25, 1.35, 9], [3.42, 1.6, 7]]) {
      const p = this.iso(bx, by);
      ctx.beginPath(); ctx.moveTo(p.x - 1.5, p.y); ctx.lineTo(p.x - 1.5, p.y - bh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x + 1.5, p.y); ctx.lineTo(p.x + 1.5, p.y - bh); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 1.5, 0.8, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(p.x, p.y - bh, 1.5, 0.8, 0, 0, Math.PI * 2); ctx.stroke();
    }

    // crumpled pages that didn't survive the planning
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.3;
    for (const [px, py] of [[8.6, 2.3], [9.05, 2.7]]) {
      const p = this.iso(px, py);
      this.tracePoly([
        { x: p.x - 3, y: p.y - 1 }, { x: p.x - 1, y: p.y - 3 }, { x: p.x + 2.5, y: p.y - 2 },
        { x: p.x + 3, y: p.y + 1 }, { x: p.x - 0.5, y: p.y + 2.5 },
      ]);
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
      const a = (this.still ? 0 : s * m.rate * Math.PI * 2) + m.seed;
      const x = lampTop.x + Math.cos(a) * this.tileW * m.rx * 0.5;
      const y = lampTop.y - h * (0.45 + 0.35 * Math.sin(a * 0.7 + m.seed));
      ctx.globalAlpha = 0.18 + 0.14 * Math.sin(a * 1.3);
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    ctx.restore();
  }

  // height unit: 1.0 == the old full-box height
  u(h) { return this.tileH * 2.2 * h; }

  liftedQuad(x0, y0, x1, y1, h) {
    const d = this.u(h);
    return [this.iso(x0, y0), this.iso(x1, y0), this.iso(x1, y1), this.iso(x0, y1)]
      .map((p) => ({ x: p.x, y: p.y - d }));
  }

  // slab between heights h0 and h1 over the footprint. solid=true fills the
  // three camera-facing faces (ink base + tinted shading) so the object
  // occludes what's behind it — surfaces, not line cages.
  drawSlab(x0, y0, x1, y1, h0, h1, solid = false, tint = null) {
    const ctx = this.ctx;
    const bot = this.liftedQuad(x0, y0, x1, y1, h0);
    const top = this.liftedQuad(x0, y0, x1, y1, h1);
    if (solid) {
      const color = tint || ctx.strokeStyle;
      const alphaWas = ctx.globalAlpha;
      // corners: 0 NW, 1 NE, 2 SE, 3 SW. Camera sees the S (3-2) and E (1-2)
      // sides plus the top.
      const south = [bot[3], bot[2], top[2], top[3]];
      const east = [bot[1], bot[2], top[2], top[1]];
      for (const [face, shade] of [[south, 0.07], [east, 0.04]]) {
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = PALETTE.ink;
        this.tracePoly(face); ctx.fill();
        ctx.globalAlpha = shade;
        ctx.fillStyle = color;
        this.tracePoly(face); ctx.fill();
      }
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = PALETTE.ink;
      this.tracePoly(top); ctx.fill();
      ctx.globalAlpha = 0.13;
      ctx.fillStyle = color;
      this.tracePoly(top); ctx.fill();
      ctx.globalAlpha = alphaWas;
    }
    this.tracePoly(bot); ctx.stroke();
    this.tracePoly(top); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(bot[i].x, bot[i].y); ctx.lineTo(top[i].x, top[i].y); ctx.stroke();
    }
  }

  // four corner legs from the floor up to height h, inset from the footprint
  drawLegs(x0, y0, x1, y1, h, inset = 0.12) {
    const ctx = this.ctx;
    const d = this.u(h);
    for (const [lx, ly] of [
      [x0 + inset, y0 + inset], [x1 - inset, y0 + inset],
      [x1 - inset, y1 - inset], [x0 + inset, y1 - inset],
    ]) {
      const p = this.iso(lx, ly);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - d); ctx.stroke();
    }
  }

  drawObject(obj, t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = obj.color;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = obj.color;
    ctx.shadowBlur = 10;
    switch (obj.id) {
      case 'cot': this.drawCot(); break;
      case 'deck': this.drawDeck(t); break;
      case 'bench': this.drawBench(t); break;
      case 'lamp': this.drawLamp(t); break;
      case 'door': this.drawDoor(t); break;
      case 'crates': this.drawCrates(); break;
      default: this.drawSlab(
        Math.min(...obj.cells.map(([x]) => x)), Math.min(...obj.cells.map(([, y]) => y)),
        Math.max(...obj.cells.map(([x]) => x)) + 1, Math.max(...obj.cells.map(([, y]) => y)) + 1,
        0, obj.height,
      );
    }
    ctx.restore();
  }

  drawCot() {
    const ctx = this.ctx;
    ctx.strokeStyle = PALETTE.dim;
    this.drawLegs(1, 1, 3, 2, 0.18);
    this.drawSlab(1, 1, 3, 2, 0.18, 0.3, true);
    // pillow at the head end
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.6;
    this.tracePoly(this.liftedQuad(1.1, 1.15, 1.55, 1.85, 0.36));
    ctx.stroke();
    // blanket, violet, folded back — the one soft thing in the room
    ctx.strokeStyle = PALETTE.violet;
    ctx.globalAlpha = 0.55;
    this.tracePoly(this.liftedQuad(1.85, 1.02, 2.95, 1.98, 0.33));
    ctx.stroke();
    const fa = this.liftedQuad(1.85, 1.02, 1.85, 1.98, 0.33);
    ctx.beginPath(); ctx.moveTo(fa[0].x, fa[0].y + 3); ctx.lineTo(fa[2].x, fa[2].y + 3); ctx.stroke();
  }

  drawDeck(t) {
    const ctx = this.ctx;
    // desk slab + legs
    ctx.strokeStyle = PALETTE.dim;
    this.drawLegs(9, 1, 11, 2, 0.42);
    this.drawSlab(9, 1, 11, 2, 0.42, 0.5, true, PALETTE.blue);
    // two monitors standing on the back edge, screens lit
    const flick = 0.06 + 0.025 * Math.sin(t / 320) + (Math.sin(t / 1370) > 0.97 ? -0.06 : 0);
    ctx.strokeStyle = PALETTE.blue;
    for (const [mx0, mx1, hTop] of [[9.15, 9.8, 0.95], [9.95, 10.7, 1.02]]) {
      const b0 = this.liftedQuad(mx0, 1.2, mx1, 1.2, 0.52);
      const t0 = this.liftedQuad(mx0, 1.2, mx1, 1.2, hTop);
      const quad = [b0[0], b0[1], t0[1], t0[0]];
      ctx.globalAlpha = 0.8;
      this.tracePoly(quad);
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = PALETTE.teal;
      ctx.globalAlpha = Math.max(0, flick);
      this.tracePoly(quad);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    // keyboard on the front of the desktop
    ctx.strokeStyle = PALETTE.dim;
    ctx.globalAlpha = 0.6;
    this.tracePoly(this.liftedQuad(9.35, 1.55, 10.35, 1.85, 0.52));
    ctx.stroke();
    // a mug that's been cold for hours
    const mug = this.iso(10.55, 1.65);
    const mh = this.u(0.52);
    ctx.strokeStyle = PALETTE.violet;
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(mug.x - 2, mug.y - mh); ctx.lineTo(mug.x - 2, mug.y - mh - 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mug.x + 2, mug.y - mh); ctx.lineTo(mug.x + 2, mug.y - mh - 5); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(mug.x, mug.y - mh - 5, 2, 1, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(mug.x + 3.5, mug.y - mh - 2.5, 1.6, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  }

  drawBench(t) {
    const ctx = this.ctx;
    ctx.strokeStyle = PALETTE.violet;
    this.drawLegs(1, 6, 3, 7, 0.38);
    this.drawSlab(1, 6, 3, 7, 0.38, 0.46, true);
    // under-shelf with a stowed box
    ctx.globalAlpha = 0.5;
    this.tracePoly(this.liftedQuad(1.1, 6.1, 2.9, 6.9, 0.16));
    ctx.stroke();
    ctx.strokeStyle = PALETTE.dim;
    this.drawSlab(1.25, 6.2, 1.95, 6.8, 0, 0.15, true);
    // clutter on top: parts boxes, a standing tool
    ctx.globalAlpha = 0.7;
    this.drawSlab(1.15, 6.15, 1.55, 6.55, 0.46, 0.6, true);
    this.drawSlab(2.45, 6.25, 2.85, 6.8, 0.46, 0.56, true);
    const toolBase = this.iso(2.1, 6.4);
    ctx.beginPath();
    ctx.moveTo(toolBase.x, toolBase.y - this.u(0.46));
    ctx.lineTo(toolBase.x, toolBase.y - this.u(0.72));
    ctx.stroke();
    ctx.strokeRect(toolBase.x - 4, toolBase.y - this.u(0.78), 8, 4);
    // hotplate and kettle, the only thing here that gets daily use
    const kb = this.iso(2.65, 6.15);
    const kh = this.u(0.46);
    ctx.strokeStyle = PALETTE.amber;
    ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.ellipse(kb.x, kb.y - kh, 4.5, 2.2, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(kb.x, kb.y - kh - 5, 3.2, 1.6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(kb.x - 3.2, kb.y - kh - 5); ctx.lineTo(kb.x - 2.2, kb.y - kh - 1);
    ctx.moveTo(kb.x + 3.2, kb.y - kh - 5); ctx.lineTo(kb.x + 2.2, kb.y - kh - 1);
    ctx.moveTo(kb.x + 3, kb.y - kh - 6.5); ctx.lineTo(kb.x + 5, kb.y - kh - 8);
    ctx.stroke();
    // steam, when you look closely
    ctx.strokeStyle = PALETTE.dim;
    for (let i = 0; i < 3; i++) {
      const ph = this.still ? i * 0.33 : ((t / 2600) + i * 0.33) % 1;
      const sy = kb.y - kh - 8 - ph * 16;
      const sway = Math.sin(ph * Math.PI * 3 + i) * 2.5;
      ctx.globalAlpha = 0.28 * (1 - ph);
      ctx.beginPath();
      ctx.moveTo(kb.x + sway, sy);
      ctx.quadraticCurveTo(kb.x + sway + 2, sy - 3, kb.x + sway, sy - 6);
      ctx.stroke();
    }
  }

  drawLamp(t) {
    const ctx = this.ctx;
    const base = this.iso(6.5, 4.5);
    const flicker = Math.sin(t / 300) * 3;
    ctx.strokeStyle = PALETTE.amber;
    ctx.shadowColor = PALETTE.amber;
    ctx.shadowBlur = 14 + flicker;
    // weighted base + pole
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.ellipse(base.x, base.y, this.tileW * 0.12, this.tileH * 0.12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(base.x, base.y); ctx.lineTo(base.x, base.y - this.u(0.92));
    ctx.stroke();
    // cone shade
    const shadeY = base.y - this.u(0.68);
    ctx.beginPath();
    ctx.ellipse(base.x, shadeY, this.tileW * 0.2, this.tileH * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(base.x - this.tileW * 0.2, shadeY); ctx.lineTo(base.x, base.y - this.u(0.92));
    ctx.moveTo(base.x + this.tileW * 0.2, shadeY); ctx.lineTo(base.x, base.y - this.u(0.92));
    ctx.stroke();
    // the bulb — actually lit, blooming
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = PALETTE.amber;
    ctx.globalAlpha = 0.75 + 0.1 * Math.sin(t / 300);
    ctx.beginPath();
    ctx.arc(base.x, shadeY + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    const halo = ctx.createRadialGradient(base.x, shadeY + 4, 1, base.x, shadeY + 4, 14);
    halo.addColorStop(0, hexA(PALETTE.amber, 0.22));
    halo.addColorStop(1, hexA(PALETTE.amber, 0));
    ctx.fillStyle = halo;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(base.x, shadeY + 4, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  drawDoor(t) {
    const ctx = this.ctx;
    ctx.strokeStyle = PALETTE.rose;
    // frame posts and lintel on the east edge of the cell
    const p0 = this.iso(12, 4), p1 = this.iso(12, 5);
    const H = this.u(1.15);
    ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p0.x, p0.y - H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p1.x, p1.y - H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y - H); ctx.lineTo(p1.x, p1.y - H); ctx.stroke();
    // the slab itself, inset, with panel seams — solid, it's a door
    const q0 = this.iso(12, 4.08), q1 = this.iso(12, 4.92);
    const hS = this.u(1.06);
    const slabQuad = [
      { x: q0.x, y: q0.y }, { x: q1.x, y: q1.y },
      { x: q1.x, y: q1.y - hS }, { x: q0.x, y: q0.y - hS },
    ];
    ctx.fillStyle = PALETTE.ink;
    ctx.globalAlpha = 0.85;
    this.tracePoly(slabQuad); ctx.fill();
    ctx.fillStyle = PALETTE.rose;
    ctx.globalAlpha = 0.06;
    this.tracePoly(slabQuad); ctx.fill();
    ctx.globalAlpha = 0.55;
    this.tracePoly(slabQuad);
    ctx.stroke();
    for (const f of [0.35, 0.7]) {
      ctx.beginPath();
      ctx.moveTo(q0.x, q0.y - hS * f); ctx.lineTo(q1.x, q1.y - hS * f);
      ctx.stroke();
    }
    // keypad, armed and patient
    const pip = Math.sin(t / 900) > 0 ? 0.9 : 0.35;
    const k = this.iso(12, 3.88);
    ctx.fillStyle = PALETTE.rose;
    ctx.globalAlpha = pip;
    ctx.fillRect(k.x - 1.5, k.y - this.u(0.55), 3, 3);
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(k.x - 4, k.y - this.u(0.58), 8, 9);
  }

  drawCrates() {
    const ctx = this.ctx;
    // duffel slumped against the stack, strap trailing
    const df = this.iso(9.55, 7.55);
    ctx.fillStyle = PALETTE.ink;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(df.x, df.y - 5, 11, 6, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.teal;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(df.x, df.y - 5, 11, 6, -0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(df.x - 4, df.y - 10.5); ctx.quadraticCurveTo(df.x, df.y - 13, df.x + 4, df.y - 10.5);
    ctx.moveTo(df.x + 9, df.y - 2); ctx.quadraticCurveTo(df.x + 14, df.y + 1, df.x + 17, df.y - 1);
    ctx.stroke();

    ctx.strokeStyle = PALETTE.teal;
    ctx.globalAlpha = 0.75;
    // big crate with an X brace on the camera-facing side
    this.drawSlab(10.05, 7.05, 10.95, 7.95, 0, 0.55, true);
    const f0 = this.iso(10.05, 7.95), f1 = this.iso(10.95, 7.95);
    const d = this.u(0.55);
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(f0.x, f0.y); ctx.lineTo(f1.x, f1.y - d);
    ctx.moveTo(f0.x, f0.y - d); ctx.lineTo(f1.x, f1.y);
    ctx.stroke();
    // smaller one stacked on top, nudged
    ctx.globalAlpha = 0.75;
    this.drawSlab(10.2, 7.15, 10.8, 7.75, 0.55, 0.95, true);
    // third crate beside, strapped
    this.drawSlab(11.05, 7.1, 11.9, 7.9, 0, 0.5, true);
    ctx.globalAlpha = 0.4;
    this.tracePoly(this.liftedQuad(11.42, 7.1, 11.52, 7.9, 0.5), false);
    ctx.stroke();
  }

  drawPlayer(t) {
    const ctx = this.ctx;
    const c = this.iso(this.player.x + 0.5, this.player.y + 0.5);
    const fig = this.fig;
    const walking = this.path.length > 0;
    const H = this.tileH * fig.h;                    // figure height, floor to crown
    const r = Math.max(this.tileH * 0.46, 9);        // head-chip radius
    const bob = (walking ? Math.sin(this.walkT * 9) * 1.6 : Math.sin(t / 900) * 1.2) * fig.bob;
    const lean = walking ? this.facing * H * 0.045 : 0;
    const legPhase = Math.sin(this.walkT * 9);

    const hemY = c.y - H * 0.16 + bob * 0.3;
    const beltY = c.y - H * 0.45 + bob * 0.6;
    const shoulderY = c.y - H * 0.68 + bob;
    const headY = c.y - H * 0.68 - r - 2 + bob;
    const shW = r * 0.95 * fig.sh;                   // half shoulder width
    const hemW = r * 1.3 * fig.hem;                  // half coat hem width — coats flare down

    ctx.save();
    // footstep dust, fading behind the walk
    for (const p of this.puffs) {
      const life = p.t / 0.55;
      ctx.strokeStyle = PALETTE.dim;
      ctx.globalAlpha = 0.3 * (1 - life);
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, (2 + life * 6) * fig.puff, (1 + life * 2.5) * fig.puff, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // wet-floor reflection of the figure's glow, smeared toward camera
    ctx.globalCompositeOperation = 'lighter';
    this.streak(c.x, c.y + 2, r * 1.6, this.tileH * 2.2, this.accent, 0.07);
    ctx.globalCompositeOperation = 'source-over';

    // ground shadow, stretching slightly with the stride
    const shadowStretch = walking ? 1 + Math.abs(legPhase) * 0.14 * this.strideV : 1;
    ctx.fillStyle = this.accent;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, r * 1.1 * shadowStretch, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // body art mode: the image is the figure — mirrored by facing, bobbing
    // with the stride, tilted into the walk, glowing into the wet floor
    if (this.body) {
      const view = this.view;
      const img = (view === 'back' && this.bodyBack) ? this.bodyBack
        : (view === 'side' && this.bodySide) ? this.bodySide : this.body;
      const rig = view === 'back' ? this.rigBack
        : view === 'side' ? this.rigSide : this.rigFront;
      // the side art faces screen-left; mirror it when heading right
      const flip = (view === 'side' ? -this.facing : this.facing) || 1;
      const v = walking ? this.strideV : 0;
      const glow = walking ? 15 : 11 + 3 * Math.sin(t / 900);
      const bh = H * 1.12;
      const bw = bh * (img.width / img.height);
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.translate(c.x + lean * 0.5 * v, c.y + 2 + bob * 0.4);
      if (walking) ctx.rotate(0.035 * this.facing * v);
      ctx.scale(flip, 1);
      if (rig) {
        const sx = bw / rig.w;
        const sy = bh / rig.h;
        const swing = walking ? legPhase * 0.26 * (0.45 + 0.55 * v) : 0;
        const legY = -bh + rig.y0 * sy;
        const legH = (rig.h - rig.y0) * sy;
        ctx.shadowBlur = 0;
        for (const [key, pivot, ang] of [['legL', rig.pivotL, swing], ['legR', rig.pivotR, -swing]]) {
          const px = -bw / 2 + pivot[0] * sx;
          const py = -bh + pivot[1] * sy;
          const lift = walking ? Math.max(0, -ang) * bh * 0.12 : 0;
          ctx.save();
          ctx.translate(px, py - lift);
          ctx.rotate(ang);
          ctx.drawImage(rig[key], -bw / 2 - px, legY - py, bw, legH);
          ctx.restore();
        }
        // torso counter-sway + coat follow-through a beat behind the stride;
        // at rest, a slow breath through the chest
        const coatLag = walking ? Math.sin(this.walkT * 9 - 0.9) * 0.04 * v : 0;
        const breath = walking ? 0 : Math.sin(t / 1300) * 0.008;
        const hipY = -bh + rig.pivotL[1] * sy;
        ctx.save();
        ctx.translate(0, hipY);
        ctx.rotate(-swing * 0.3 + coatLag);
        ctx.shadowColor = this.accent;
        ctx.shadowBlur = glow;
        ctx.drawImage(rig.core, -bw / 2, -bh - hipY - bh * breath, bw, bh * (1 + breath));
        ctx.restore();
        // forearms swing opposite the legs, pivoted at the elbows
        if (rig.armLImg || rig.armRImg) {
          const armSwing = walking ? -legPhase * 0.2 * (0.45 + 0.55 * v) : 0;
          ctx.shadowBlur = 0;
          for (const [part, img, ang] of [
            [rig.armL, rig.armLImg, armSwing], [rig.armR, rig.armRImg, -armSwing],
          ]) {
            if (!img) continue;
            const px = -bw / 2 + part.pivot[0] * sx;
            const py = -bh + part.pivot[1] * sy;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(ang);
            ctx.drawImage(img, -bw / 2 - px, -bh - py, bw, bh);
            ctx.restore();
          }
        }
      } else {
        ctx.shadowColor = this.accent;
        ctx.shadowBlur = glow;
        ctx.drawImage(img, -bw / 2, -bh, bw, bh);
      }
      ctx.restore();
      ctx.restore();
      return;
    }

    // lower legs below the coat hem — scissor while walking, settle when still
    ctx.strokeStyle = this.accent;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.75;
    const stride = walking ? legPhase * r * 0.55 : r * 0.22;
    const footL = { x: c.x - r * 0.3 - stride, y: c.y };
    const footR = { x: c.x + r * 0.3 + (walking ? -stride : 0), y: c.y - (walking ? Math.abs(legPhase) * 1.5 : 0) };
    ctx.beginPath();
    ctx.moveTo(c.x - r * 0.3 + lean * 0.3, hemY);
    ctx.lineTo(footL.x, footL.y);
    ctx.moveTo(c.x + r * 0.3 + lean * 0.3, hemY);
    ctx.lineTo(footR.x, footR.y);
    ctx.stroke();
    // boots — a short foot line in the facing direction
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(footL.x, footL.y); ctx.lineTo(footL.x + this.facing * r * 0.38, footL.y - 0.5);
    ctx.moveTo(footR.x, footR.y); ctx.lineTo(footR.x + this.facing * r * 0.38, footR.y - 0.5);
    ctx.stroke();
    ctx.lineWidth = 1.6;

    // the coat — hooded silhouette, ink-filled, accent rim, flaring to the hem
    // hem corners kick with the stride
    const kick = walking ? Math.sin(this.walkT * 9 + Math.PI / 3) * r * 0.16 : 0;
    const coat = [
      { x: c.x - shW + lean, y: shoulderY },
      { x: c.x + shW + lean, y: shoulderY },
      { x: c.x + hemW + lean * 0.3 + kick, y: hemY - Math.abs(kick) * 0.4 },
      { x: c.x - hemW + lean * 0.3 - kick, y: hemY - Math.abs(kick) * 0.4 },
    ];
    // bag on the off-side hip, mostly hidden behind the coat — the medics
    // carry the big satchel, the poisoner a slim pouch, the rest travel light
    const bagScale = fig.gadget === 'satchel' ? 1.15 : fig.gadget === 'blade' ? 0.7 : 0;
    const bagX = c.x + this.facing * (hemW * 0.92) + lean * 0.4;
    const bagY = beltY + (hemY - beltY) * 0.5;
    if (bagScale) {
      ctx.fillStyle = PALETTE.ink;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.ellipse(bagX, bagY, r * 0.4 * bagScale, r * 0.3 * bagScale, -0.2 * this.facing, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.accent;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.ellipse(bagX, bagY, r * 0.4 * bagScale, r * 0.3 * bagScale, -0.2 * this.facing, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = PALETTE.ink;
    ctx.globalAlpha = 0.92;
    this.tracePoly(coat);
    ctx.fill();
    ctx.strokeStyle = this.accent;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1.3;
    ctx.shadowColor = this.accent;
    ctx.shadowBlur = 8;
    this.tracePoly(coat);
    ctx.stroke();
    ctx.shadowBlur = 0;
    // rim light down the facing edge
    const rimTop = coat[this.facing > 0 ? 1 : 0];
    const rimBot = coat[this.facing > 0 ? 2 : 3];
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(rimTop.x, rimTop.y); ctx.lineTo(rimBot.x, rimBot.y);
    ctx.stroke();
    ctx.lineWidth = 1.3;
    // coat seam + belt
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(c.x + lean, shoulderY + 2);
    ctx.lineTo(c.x + lean * 0.3, hemY - 1);
    ctx.stroke();
    const beltW = shW + (hemW - shW) * 0.55;
    ctx.beginPath();
    ctx.moveTo(c.x - beltW + lean * 0.6, beltY);
    ctx.lineTo(c.x + beltW + lean * 0.6, beltY);
    ctx.stroke();
    // belt buckle glint
    ctx.fillStyle = this.accent;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(c.x + lean * 0.6 - 1.5, beltY - 1.5, 3, 3);
    // signature gear per operative
    ctx.strokeStyle = this.accent;
    if (fig.gadget === 'holster') {
      // Jackal: squared epaulets, a second belt line, a holster at the hip
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x - shW + lean, shoulderY - 1); ctx.lineTo(c.x - shW * 0.55 + lean, shoulderY - 1);
      ctx.moveTo(c.x + shW + lean, shoulderY - 1); ctx.lineTo(c.x + shW * 0.55 + lean, shoulderY - 1);
      ctx.stroke();
      ctx.lineWidth = 1.3;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(c.x - beltW + lean * 0.6, beltY + 3.5);
      ctx.lineTo(c.x + beltW + lean * 0.6, beltY + 3.5);
      ctx.stroke();
      ctx.globalAlpha = 0.7;
      ctx.strokeRect(c.x + this.facing * beltW * 0.7 + lean * 0.6 - 2, beltY + 1, 4, 7);
    } else if (fig.gadget === 'blade') {
      // Hemlock: a sheathed blade over the off shoulder
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x - this.facing * shW * 0.6 + lean, shoulderY + 1);
      ctx.lineTo(c.x - this.facing * (shW * 0.6 + r * 0.9) + lean, headY - r * 0.55);
      ctx.stroke();
      ctx.lineWidth = 1.3;
    } else if (fig.gadget === 'deck') {
      // Zen: the slim deck slung across the back, edge over the shoulder
      ctx.globalAlpha = 0.7;
      const dxs = -this.facing;
      ctx.strokeRect(c.x + dxs * (shW * 0.9) + lean - 3, shoulderY - r * 0.5, 6, r * 0.8);
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(c.x + dxs * shW * 0.9 + lean, shoulderY + 2);
      ctx.lineTo(c.x + this.facing * beltW * 0.85 + lean * 0.5, beltY + 2);
      ctx.stroke();
    } else {
      // Socrates: satchel strap, and a slow diagnostic pulse on the bag
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(c.x - this.facing * shW * 0.7 + lean, shoulderY + 2);
      ctx.lineTo(c.x + this.facing * beltW * 0.85 + lean * 0.5, beltY + 2);
      ctx.stroke();
      ctx.fillStyle = this.accent;
      ctx.globalAlpha = 0.35 + 0.3 * Math.sin(t / 500);
      ctx.fillRect(bagX - 1, bagY - 1, 2, 2);
    }
    // arms — a swing against the legs when walking
    const swing = walking ? legPhase * r * 0.4 : 0;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(c.x - shW * 0.95 + lean, shoulderY + 3);
    ctx.lineTo(c.x - beltW * 0.95 + swing + lean * 0.5, beltY + 3);
    ctx.moveTo(c.x + shW * 0.95 + lean, shoulderY + 3);
    ctx.lineTo(c.x + beltW * 0.95 - swing + lean * 0.5, beltY + 3);
    ctx.stroke();

    // hood behind the head — a filled crescent of ink over the shoulders,
    // deeper on the ones who live in it
    ctx.fillStyle = PALETTE.ink;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(c.x + lean, headY - 1, r + 2 + 2.5 * fig.hood, 0, Math.PI * 2);
    ctx.fill();
    // collar rising to meet it
    ctx.strokeStyle = this.accent;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(c.x - shW * 0.55 + lean, shoulderY);
    ctx.lineTo(c.x - r * 0.75 + lean, headY + r * 0.75);
    ctx.moveTo(c.x + shW * 0.55 + lean, shoulderY);
    ctx.lineTo(c.x + r * 0.75 + lean, headY + r * 0.75);
    ctx.stroke();

    // head: portrait-chip with glow ring (initial as fallback while loading)
    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.ink;
    ctx.strokeStyle = this.accent;
    ctx.lineWidth = 2;
    ctx.shadowColor = this.accent;
    ctx.shadowBlur = 12 + 4 * Math.sin(t / 600);
    ctx.beginPath();
    ctx.arc(c.x + lean, headY, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (this.portrait) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(c.x + lean, headY, r - 1, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.portrait, c.x + lean - r, headY - r, r * 2, r * 2);
      ctx.restore();
    } else {
      ctx.fillStyle = this.accent;
      ctx.font = `${Math.round(r)}px "SF Mono", Menlo, Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.initial, c.x + lean, headY + 1);
    }
    // hood line over the chip
    ctx.strokeStyle = this.accent;
    ctx.globalAlpha = 0.3 + 0.25 * fig.hood;
    ctx.beginPath();
    ctx.arc(c.x + lean, headY, r + 1 + 2 * fig.hood, Math.PI * 0.85, Math.PI * 2.15);
    ctx.stroke();

    // Zen only: the ghost glitch — the ring splits chromatic for a blink
    if (fig.gadget === 'deck' && (t / 1000) % 4 < 0.14) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = PALETTE.rose;
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(c.x + lean + 2, headY, r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = PALETTE.teal;
      ctx.beginPath(); ctx.arc(c.x + lean - 2, headY, r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  drawMarker() {
    if (!this.marker) return;
    const ctx = this.ctx;
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

  // a wet-floor reflection streak: light smeared toward the camera
  streak(x, y, w, len, hex, alpha) {
    const ctx = this.ctx;
    const g = ctx.createLinearGradient(x, y, x, y + len);
    g.addColorStop(0, hexA(hex, alpha));
    g.addColorStop(1, hexA(hex, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - w / 2, y, w, len);
  }

  // pools of light on the floor from every source that glows
  drawLightPools(t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // wet-floor streaks under everything lit: the window panes, the wall
    // screen, the neon sign, the lamp, the door keypad
    for (let i = 0; i < 5; i++) {
      const p = this.iso(4.4 + i * 0.75, 0.05);
      this.streak(p.x, p.y, 5 + (i % 2) * 3, this.tileH * (2.2 + (i % 3) * 0.8), PALETTE.blue, 0.05);
    }
    const scr = this.iso(9.7, 0.05);
    this.streak(scr.x, scr.y, this.tileW * 0.5, this.tileH * 2.4, PALETTE.teal, 0.045);
    const neon = this.iso(0.05, 6.45);
    this.streak(neon.x, neon.y, this.tileW * 0.4, this.tileH * 1.8, PALETTE.rose, 0.05);
    const lampP = this.iso(6.5, 4.55);
    this.streak(lampP.x, lampP.y, this.tileW * 0.3, this.tileH * 1.6, PALETTE.amber, 0.06);
    const doorP = this.iso(11.6, 4.5);
    this.streak(doorP.x, doorP.y, this.tileW * 0.35, this.tileH * 1.4, PALETTE.rose, 0.035);

    // cold wash falling in from the window, stretched across the floor
    const w0 = this.iso(6, 0), w1 = this.iso(7.6, 2.8);
    const wash = ctx.createLinearGradient(w0.x, w0.y, w1.x, w1.y);
    wash.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
    wash.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = wash;
    this.tracePoly([this.iso(4, 0), this.iso(8, 0), this.iso(9.4, 2.8), this.iso(2.6, 2.8)]);
    ctx.fill();

    // monitor spill by the deck, breathing with the flicker
    const deckC = this.iso(9.9, 2.1);
    const mg = ctx.createRadialGradient(deckC.x, deckC.y, 2, deckC.x, deckC.y, this.tileW * 1.7);
    const mA = 0.045 + 0.012 * Math.sin(t / 320);
    mg.addColorStop(0, `rgba(45, 212, 191, ${mA})`);
    mg.addColorStop(1, 'rgba(45, 212, 191, 0)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.ellipse(deckC.x, deckC.y, this.tileW * 1.7, this.tileH * 1.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // neon bleed at the base of the west wall
    const nC = this.iso(0.8, 6.4);
    const ng = ctx.createRadialGradient(nC.x, nC.y, 1, nC.x, nC.y, this.tileW * 1.2);
    const nDrop = Math.sin(t / 1000 * 1.9 + 1.3) > 0.94 ? 0.15 : 1;
    ng.addColorStop(0, `rgba(244, 63, 94, ${0.04 * nDrop})`);
    ng.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.ellipse(nC.x, nC.y, this.tileW * 1.2, this.tileH * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawObjectShadows() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.32;
    for (const [x, y, rx, ry] of [
      [2, 1.5, 1.15, 0.62], [10, 1.55, 1.15, 0.62], [2, 6.5, 1.15, 0.62],
      [6.5, 4.55, 0.4, 0.28], [10.95, 7.5, 1.1, 0.62],
    ]) {
      const c = this.iso(x, y);
      ctx.beginPath();
      ctx.ellipse(c.x, c.y + 2, this.tileW * rx * 0.52, this.tileH * ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawHaze(t) {
    const ctx = this.ctx;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const drift = this.still ? 0 : Math.sin(t / 9000 + i * 2.1) * this.tileW * 0.8;
      const c = this.iso(3.5 + i * 2.6, 2.5 + i * 1.8);
      const g = ctx.createRadialGradient(c.x + drift, c.y - 24, 4, c.x + drift, c.y - 24, this.tileW * 2.4);
      g.addColorStop(0, 'rgba(45, 212, 191, 0.016)');
      g.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(c.x + drift, c.y - 24, this.tileW * 2.4, this.tileH * 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawGrain(t) {
    const ctx = this.ctx;
    ctx.save();
    // scanlines
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#000';
    for (let y = 0; y < this.viewH; y += 4) ctx.fillRect(0, y, this.viewW, 1);
    // film grain, jittered so it lives
    if (this.grain) {
      const j = this.still ? 0 : Math.floor(t / 80) % 4;
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(-j * 37, -j * 23);
      ctx.fillStyle = this.grain;
      ctx.fillRect(0, 0, this.viewW + 148, this.viewH + 92);
      ctx.restore();
    }
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
