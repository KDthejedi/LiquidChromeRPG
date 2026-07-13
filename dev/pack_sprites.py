#!/usr/bin/env python3
"""Pack Blender-rendered sprite frames into a game sheet + frame map.

Usage: python3 dev/pack_sprites.py <render-dir>/<anim> <out-prefix> [cell_h]

Expects <render-dir>/<anim>/d{0..7}/f*.png. Computes one union bounding box
across every frame and direction (stable anchor), crops all frames to it,
scales to cell_h, and packs a sheet with 8 rows (directions) x N cols
(frames). Writes <out-prefix>.png and <out-prefix>.json.
"""
import json
import os
import sys

from PIL import Image
import numpy as np


def main():
    src, prefix = sys.argv[1], sys.argv[2]
    cell_h = int(sys.argv[3]) if len(sys.argv) > 3 else 256

    dirs = sorted(d for d in os.listdir(src) if d.startswith('d'))
    frames = sorted(f for f in os.listdir(os.path.join(src, dirs[0])) if f.endswith('.png'))

    # union bbox across everything
    lo_x = lo_y = 10**9
    hi_x = hi_y = -10**9
    for d in dirs:
        for f in frames:
            a = np.asarray(Image.open(os.path.join(src, d, f)))
            ys, xs = np.where(a[:, :, 3] > 8)
            lo_x, hi_x = min(lo_x, xs.min()), max(hi_x, xs.max())
            lo_y, hi_y = min(lo_y, ys.min()), max(hi_y, ys.max())
    pad = 4
    box = (max(0, lo_x - pad), max(0, lo_y - pad), hi_x + pad, hi_y + pad)
    bw, bh = box[2] - box[0], box[3] - box[1]
    scale = cell_h / bh
    cell_w = round(bw * scale)

    sheet = Image.new('RGBA', (cell_w * len(frames), cell_h * len(dirs)), (0, 0, 0, 0))
    for di, d in enumerate(dirs):
        for fi, f in enumerate(frames):
            im = Image.open(os.path.join(src, d, f)).crop(box).resize((cell_w, cell_h), Image.LANCZOS)
            sheet.paste(im, (fi * cell_w, di * cell_h), im)
    sheet.save(f'{prefix}.png')

    meta = {
        'img': os.path.basename(prefix) + '.png',
        'cellW': cell_w, 'cellH': cell_h,
        'dirs': len(dirs), 'frames': len(frames),
        # feet anchor: bottom-center of the cell
        'anchorX': cell_w / 2, 'anchorY': cell_h - pad * scale,
    }
    with open(f'{prefix}.json', 'w') as fp:
        json.dump(meta, fp, indent=2)
    print(json.dumps(meta))


if __name__ == '__main__':
    main()
