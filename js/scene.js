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
  constructor(canvas, { accent, initial, onCaption }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.accent = accent;
    this.initial = initial;
    this.onCaption = onCaption;

    this.player = { x: 5, y: 5 };  // grid position, fractional while walking
    this.path = [];                // remaining cells to walk
    this.pendingObject = null;     // object to read once we arrive
    this.marker = null;            // {x, y, t} click ripple

    this.blocked = new Set();
    for (const obj of ROOM.objects) {
      for (const [cx, cy] of obj.cells) this.blocked.add(`${cx},${cy}`);
    }

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

    // back walls (north edge y=0, west edge x=0)
    this.drawWalls();

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

    // vignette + scanlines
    this.drawGrain();
  }

  drawWalls() {
    const ctx = this.ctx;
    const wallH = this.tileH * 2.6;
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

    // glow ring chip (portrait-chip placeholder: accent ring + initial)
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
    ctx.fillStyle = this.accent;
    ctx.font = `${Math.round(r)}px "SF Mono", Menlo, Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.initial, c.x, cy + 1);
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
