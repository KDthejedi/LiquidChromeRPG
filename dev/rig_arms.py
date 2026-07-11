#!/usr/bin/env python3
"""Add elbow-pivoted forearms to an existing cutout rig.

Usage: python3 dev/rig_arms.py <rig-prefix> <armL:x0,y0,x1,y1> <armR:x0,y0,x1,y1>

Boxes are fractions of the source image. Each arm is lifted out of the core
(the forearm hangs over background, so the erasure leaves silhouette, not a
hole) and saved as its own layer with a pivot at the top-center of its box.
Pass '-' to skip a side. Updates <prefix>-rig.json in place.
"""
import json
import sys

from PIL import Image
import numpy as np


def cut(core, box_frac, w, h):
    x0, y0, x1, y1 = [float(v) for v in box_frac.split(',')]
    x0, x1 = int(x0 * w), int(x1 * w)
    y0, y1 = int(y0 * h), int(y1 * h)
    arm = np.zeros_like(core)
    arm[y0:y1, x0:x1] = core[y0:y1, x0:x1]
    core[y0:y1, x0:x1, 3] = 0
    m = arm[:, :, 3].astype(np.float64)
    xs = np.arange(w)
    cx = float((m.sum(axis=0) * xs).sum() / max(m.sum(), 1))
    return arm, [round(cx, 1), y0]


def main():
    prefix, boxL, boxR = sys.argv[1], sys.argv[2], sys.argv[3]
    meta = json.load(open(f'{prefix}-rig.json'))
    core = np.asarray(Image.open(f'{prefix}-core.png').convert('RGBA')).copy()
    h, w, _ = core.shape

    for side, box in [('armL', boxL), ('armR', boxR)]:
        if box == '-':
            continue
        arm, pivot = cut(core, box, w, h)
        name = f'{prefix}-{side}.png'
        Image.fromarray(arm).save(name)
        meta[side] = {'img': name.split('/')[-1], 'pivot': pivot}
        print(side, 'pivot', pivot)

    Image.fromarray(core).save(f'{prefix}-core.png')
    json.dump(meta, open(f'{prefix}-rig.json', 'w'), indent=2)
    print('updated', f'{prefix}-rig.json')


if __name__ == '__main__':
    main()
