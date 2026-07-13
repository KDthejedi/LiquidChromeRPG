#!/usr/bin/env python3
"""Blender headless: render a rigged+animated GLB to isometric sprite frames.

Usage:
  blender -b -P dev/render_sprites.py -- \
      --glb <model.glb> --out <dir> --anim walk [--frames 8] [--size 512] \
      [--elev 30]

Renders every sampled animation frame from 8 compass yaws (0=facing camera-
south, stepping 45° CCW) with an orthographic camera, transparent background,
constant scale across all frames and directions.
"""
import argparse
import math
import os
import sys

import bpy
from mathutils import Vector


def parse_args():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument('--glb', required=True)
    p.add_argument('--out', required=True)
    p.add_argument('--anim', default='walk')
    p.add_argument('--frames', type=int, default=8)
    p.add_argument('--size', type=int, default=512)
    p.add_argument('--elev', type=float, default=30.0)
    return p.parse_args(argv)


def main():
    args = parse_args()

    # clean scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    bpy.ops.import_scene.gltf(filepath=args.glb)

    # animation range
    actions = bpy.data.actions
    if not actions:
        raise SystemExit('no animations in glb')
    action = actions[0]
    f0, f1 = action.frame_range
    print(f'action: {action.name} frames {f0}..{f1}')

    # world bbox across a few sampled frames so no pose clips the frame
    def scene_bbox():
        lo = Vector((1e9, 1e9, 1e9))
        hi = Vector((-1e9, -1e9, -1e9))
        deps = bpy.context.evaluated_depsgraph_get()
        for ob in scene.objects:
            if ob.type != 'MESH':
                continue
            ev = ob.evaluated_get(deps)
            for v in ev.to_mesh().vertices:
                w = ev.matrix_world @ v.co
                lo = Vector(map(min, lo, w))
                hi = Vector(map(max, hi, w))
            ev.to_mesh_clear()
        return lo, hi

    lo = Vector((1e9,) * 3)
    hi = Vector((-1e9,) * 3)
    for probe in [f0, (f0 + f1) / 2, f1 - 1]:
        scene.frame_set(int(probe))
        a, b = scene_bbox()
        lo = Vector(map(min, lo, a))
        hi = Vector(map(max, hi, b))
    center = (lo + hi) / 2
    span = max(hi.x - lo.x, hi.y - lo.y, hi.z - lo.z)
    print('bbox span', span)

    # camera rig: empty at model center, camera orbiting it
    pivot = bpy.data.objects.new('pivot', None)
    scene.collection.objects.link(pivot)
    pivot.location = center

    cam_data = bpy.data.cameras.new('cam')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = span * 1.25
    cam = bpy.data.objects.new('cam', cam_data)
    scene.collection.objects.link(cam)
    cam.parent = pivot
    elev = math.radians(args.elev)
    dist = span * 4
    cam.location = (0, -math.cos(elev) * dist, math.sin(elev) * dist)
    cam.rotation_euler = (math.pi / 2 - elev, 0, 0)
    scene.camera = cam

    # lighting: soft sun + ambient so the texture reads flat and even
    sun_data = bpy.data.lights.new('sun', 'SUN')
    sun_data.energy = 3.0
    sun = bpy.data.objects.new('sun', sun_data)
    scene.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(50), 0, math.radians(-30))
    world = bpy.data.worlds.new('w')
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs[0].default_value = (1, 1, 1, 1)
    world.node_tree.nodes['Background'].inputs[1].default_value = 0.7
    scene.world = world

    # render settings
    try:
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
    except TypeError:
        scene.render.engine = 'BLENDER_EEVEE'
    scene.render.film_transparent = True
    scene.render.resolution_x = args.size
    scene.render.resolution_y = args.size
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

    frames = [f0 + (f1 - f0) * i / args.frames for i in range(args.frames)]
    for d in range(8):
        pivot.rotation_euler = (0, 0, math.radians(d * 45))
        for i, fr in enumerate(frames):
            scene.frame_set(int(round(fr)))
            path = os.path.join(args.out, args.anim, f'd{d}', f'f{i:02d}.png')
            scene.render.filepath = path
            bpy.ops.render.render(write_still=True)
    print('done')


if __name__ == '__main__':
    main()
