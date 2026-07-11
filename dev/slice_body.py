#!/usr/bin/env python3
"""Slice a character turnaround sheet into per-pose transparent PNGs.

Usage: python3 dev/slice_body.py <sheet.(png|jpg)> <out-prefix> [n_poses]

Keys out a soft-gradient background by modeling the background color per row
from the sheet's outer margins, then removing pixels within a color-distance
threshold. Columns with no remaining figure separate the poses. Output:
<out-prefix>-1.png ... one per pose, cropped tight, feathered alpha.
"""
import sys

from PIL import Image, ImageFilter
import numpy as np


def main():
    src, prefix = sys.argv[1], sys.argv[2]
    n_hint = int(sys.argv[3]) if len(sys.argv) > 3 else None

    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.int32)
    h, w, _ = a.shape

    # background model: per-row median of the outer margins
    margin = max(8, w // 100)
    bg = np.median(np.concatenate([a[:, :margin], a[:, -margin:]], axis=1), axis=1)  # h x 3

    dist = np.sqrt(((a - bg[:, None, :]) ** 2).sum(axis=2))
    fg = dist > 42  # foreground mask

    # clean the mask: drop tiny speckle, then feather
    mask = Image.fromarray((fg * 255).astype(np.uint8))
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(5))
    mask = mask.filter(ImageFilter.GaussianBlur(1.2))
    m = np.asarray(mask)

    # find pose columns: contiguous column ranges containing foreground
    col_has = (m > 90).sum(axis=0) > h * 0.04
    runs, start = [], None
    for x, v in enumerate(col_has):
        if v and start is None:
            start = x
        if not v and start is not None:
            runs.append((start, x)); start = None
    if start is not None:
        runs.append((start, w))
    runs = [r for r in runs if r[1] - r[0] > w * 0.05]
    if n_hint and len(runs) != n_hint:
        print(f'warning: found {len(runs)} poses, expected {n_hint}')

    rgba = np.dstack([np.asarray(im), m]).astype(np.uint8)
    for i, (x0, x1) in enumerate(runs, 1):
        pad = 6
        x0, x1 = max(0, x0 - pad), min(w, x1 + pad)
        piece = rgba[:, x0:x1]
        ys = np.where((piece[:, :, 3] > 90).any(axis=1))[0]
        if len(ys) == 0:
            continue
        piece = piece[max(0, ys[0] - pad):min(h, ys[-1] + pad)]
        out = f'{prefix}-{i}.png'
        Image.fromarray(piece).save(out)
        print(f'{out}  {piece.shape[1]}x{piece.shape[0]}')


if __name__ == '__main__':
    main()
