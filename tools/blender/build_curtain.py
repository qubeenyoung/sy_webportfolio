"""
Builds the two window curtain panels and exports public/models/curtain.glb.

Headless (reproducible build):
    blender --background --factory-startup --python tools/blender/build_curtain.py
Live Blender (via MCP): exec this file; it builds into a separate "work_curtain" scene and
never resets or deletes anything in the user's scenes. To export from there, switch to that scene
in one call, then call export_glb() in the next (see its docstring).

Dimensions follow WINDOW.curtain in src/config/room.ts. Coordinates are the Window component's
local frame (wall plane z = 0, room interior +z, x along the wall), converted to Blender as
three (x, y, z) -> Blender (x, -z, y). Material name "curtain" is a palette role.
"""

import math
import os

import bmesh
import bpy

# --- WINDOW.curtain in src/config/room.ts ------------------------------------------------------
ROD_HEIGHT = 2.3
PANEL_WIDTH = 0.4
DROP = 1.75
OFFSET_FROM_WALL = 0.08
PANEL_OFFSETS = (-0.65, 0.65)
SILL_HEIGHT = 0.85  # WINDOW.sillHeight; the sill sticks out 0.12 from the wall
SILL_CLEARANCE = 0.12  # below the sill the curtain bows out this much so the sill stays covered

# --- shape ---------------------------------------------------------------------------------------
FOLDS = 3  # big soft folds per panel
FOLD_DEPTH_TOP = 0.03  # half-depth of a fold at the rod (gathered)
FOLD_DEPTH_BOTTOM = 0.065  # folds open up toward the hem
FOLD_ROUNDNESS = 0.55  # < 1 widens crests and valleys into soft rounded tubes instead of a sine "corrugation"
FLARE = 0.1  # extra width at the hem, added on the side away from the window
HEM_DIP = 0.02  # the hem hangs slightly lower under each fold crest
FOLD_VARIATION = (1.0, 0.8, 1.15)  # uneven fold depths so it doesn't look machine-made
THICKNESS = 0.012

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "models", "curtain.glb")
WORK_SCENE = "work_curtain"


def to_blender(x, y, z):
    return (x, -z, y)


def curtain_material():
    mat = bpy.data.materials.get("curtain") or bpy.data.materials.new("curtain")
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (0.93, 0.74, 0.25, 1)  # preview only; the web uses the palette
    bsdf.inputs["Roughness"].default_value = 1.0
    return mat


def panel(name, center_x, outward, collection, cols=30, rows=16):
    """One panel: a sheet with a few broad sine folds, slightly flared toward the hem."""
    bm = bmesh.new()
    grid = []
    for r in range(rows + 1):
        t = r / rows  # 0 at the rod, 1 at the hem
        depth = FOLD_DEPTH_TOP + (FOLD_DEPTH_BOTTOM - FOLD_DEPTH_TOP) * t**1.5
        width = PANEL_WIDTH + FLARE * t**2
        # keep the window-side edge fixed; flare grows outward (away from the window)
        x0 = center_x - PANEL_WIDTH / 2 if outward > 0 else center_x + PANEL_WIDTH / 2 - width
        row = []
        for c in range(cols + 1):
            u = c / cols
            fold = int(min(u * FOLDS, FOLDS - 1))
            amp = depth * FOLD_VARIATION[fold % len(FOLD_VARIATION)]
            s = math.sin(u * FOLDS * 2 * math.pi)
            wave = math.copysign(abs(s) ** FOLD_ROUNDNESS, s)
            z = OFFSET_FROM_WALL + amp * wave
            y_plain = ROD_HEIGHT - 0.02 - DROP * t
            bow = min(max((SILL_HEIGHT + 0.35 - y_plain) / 0.3, 0.0), 1.0)
            z += SILL_CLEARANCE * (3 * bow**2 - 2 * bow**3)  # smoothstep
            y = ROD_HEIGHT - 0.02 - DROP * t - HEM_DIP * t**4 * max(wave, 0)
            row.append(bm.verts.new(to_blender(x0 + width * u, y, z)))
        grid.append(row)
    for r in range(rows):
        for c in range(cols):
            bm.faces.new((grid[r][c], grid[r][c + 1], grid[r + 1][c + 1], grid[r + 1][c]))

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    mesh.materials.append(curtain_material())

    sol = obj.modifiers.new("solidify", "SOLIDIFY")
    sol.thickness = THICKNESS
    sol.offset = 0
    sub = obj.modifiers.new("subsurf", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 1
    for poly in mesh.polygons:
        poly.use_smooth = True
    return obj


def build(collection):
    # panel at negative x hangs on one side of the window, positive x on the other;
    # "outward" means away from the window opening
    return [
        panel("curtain_a", PANEL_OFFSETS[0], -1, collection),
        panel("curtain_b", PANEL_OFFSETS[1], 1, collection),
    ]


def work_scene():
    """A separate scene for live work, so the user's scenes are never touched."""
    scene = bpy.data.scenes.get(WORK_SCENE) or bpy.data.scenes.new(WORK_SCENE)
    for obj in list(scene.collection.objects):
        if obj.name.startswith("curtain_"):
            bpy.data.objects.remove(obj)
    return scene


def export_glb(objects, path=OUT):
    """Exports the given objects from the *active* scene.
    In live Blender, make the work scene active first (window.scene = ...) in a separate call;
    combining a scene switch with a context override in one step crashed Blender 4.5.9."""
    view_layer = bpy.context.view_layer
    # objects linked from a script have no view-layer Base until the layer syncs;
    # without this, select_set silently skips them (and the stale state can crash the depsgraph)
    view_layer.update()
    names = {o.name for o in objects}
    for obj in view_layer.objects:
        obj.select_set(obj.name in names)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=False,
        export_materials="EXPORT",
    )
    print(f"exported {path} ({os.path.getsize(path) / 1024:.0f} KB)")


if bpy.app.background:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    export_glb(build(bpy.context.scene.collection))
elif __name__ == "__main__":
    scene = work_scene()
    objs = build(scene.collection)
    print("built in scene", scene.name, [o.name for o in objs])
