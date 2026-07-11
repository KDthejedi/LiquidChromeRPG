#!/usr/bin/env python3
"""Cut a keyed body PNG into a walk-cycle cutout rig: core + two legs.

Usage: python3 dev/rig_body.py <body.png> <out-prefix> [hem-frac]

hem-frac: where the coat hem sits (0..1 of image height, default 0.78).
The leg strip starts a bit above the hem so the coat overlaps the pivot and
hides the seam. Legs are split at the lowest-alpha column between them.
Outputs <prefix>-core.png, <prefix>-legL.png, <prefix>-legR.png and
<prefix>-rig.json with pivot metadata (source-pixel space).
"""
import json
import os
import sys

from PIL import Image
import numpy as np


def main():
    src, prefix = sys.argv[1], sys.argv[2]
    hem_frac = float(sys.argv[3]) if len(sys.argv) > 3 else 0.78

    im = Image.open(src).convert('RGBA')
    a = np.asarray(im)
    h, w, _ = a.shape
    hem_y = int(h * hem_frac)
    overlap = int(h * 0.07)          # leg strip tucks up under the coat
    y0 = hem_y - overlap

    alpha = a[:, :, 3]

    # split column: the alpha valley between the legs, searched mid-image
    strip = alpha[hem_y:, :]
    lo, hi = int(w * 0.3), int(w * 0.7)
    col_mass = strip[:, lo:hi].astype(np.int64).sum(axis=0)
    split = lo + int(np.argmin(col_mass))

    # legs: full-width strip images with the other side erased
    leg = a[y0:, :].copy()
    legL, legR = leg.copy(), leg.copy()
    legL[:, split:, 3] = 0
    legR[:, :split, 3] = 0

    # core: everything, with rows below the hem erased
    core = a.copy()
    core[hem_y:, :, 3] = 0

    def centroid_x(img):
        m = img[:, :, 3].astype(np.float64)
        if m.sum() == 0:
            return w / 2
        xs = np.arange(img.shape[1])
        return float((m.sum(axis=0) * xs).sum() / m.sum())

    out = {
        'core': f'{os.path.basename(prefix)}-core.png',
        'legL': f'{os.path.basename(prefix)}-legL.png',
        'legR': f'{os.path.basename(prefix)}-legR.png',
        'w': w, 'h': h, 'y0': y0,
        'pivotL': [round(centroid_x(legL), 1), hem_y],
        'pivotR': [round(centroid_x(legR), 1), hem_y],
    }
    Image.fromarray(core).save(f'{prefix}-core.png')
    Image.fromarray(legL).save(f'{prefix}-legL.png')
    Image.fromarray(legR).save(f'{prefix}-legR.png')
    with open(f'{prefix}-rig.json', 'w') as f:
        json.dump(out, f, indent=2)
    print(json.dumps(out))


if __name__ == '__main__':
    main()
