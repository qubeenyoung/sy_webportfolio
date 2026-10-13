"""
Builds the bed (frame, headboard, mattress, pillows, duvet) and exports public/models/bed.glb.

Run headless (Blender 4.2+):
    blender --background --factory-startup --python tools/blender/build_bed.py
    blender --background --factory-startup --python tools/blender/build_bed.py -- --preview out.png

Dimensions must match BED in src/config/room.ts.
Material names are palette roles (src/config/palette.ts); the web app replaces them with its own
materials, so colors here only matter for the Blender preview.

Axes: Blender is Z-up; the glTF exporter converts to Y-up. The bed's head is at Blender +Y,
which becomes three.js -Z — the same local frame the blockout Bed component uses.
"""

import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

# --- parameters (keep in sync with BED in src/config/room.ts) ---------------------------------
WIDTH = 1.35  # mattress width
LENGTH = 2.1
MATTRESS_TOP = 0.5
HEADBOARD_HEIGHT = 0.95
FRAME_TOP = MATTRESS_TOP - 0.2
FRAME_WIDTH = WIDTH + 0.06

PILLOW_SIZE = (0.62, 0.46)  # width, depth
PILLOW_THICKNESS = 0.21
PILLOW_TILT = 0.75  # radians, leaning against the headboard

DUVET_OVERHANG = 0.22  # how far the duvet hangs past the mattress sides
DUVET_FOOT_OVERHANG = 0.05  # small: the bookshelf stands right at the foot of the bed
DUVET_TOP_GAP = 0.5  # distance from the headboard to the duvet's top edge
DUVET_THICKNESS = 0.05

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "models", "bed.glb")

PREVIEW_COLORS = {
    "wood": (0.51, 0.45, 0.38, 1),
    "fabric": (0.73, 0.71, 0.67, 1),
    "fabricAccent": (0.62, 0.59, 0.55, 1),
}


def material(role):
    mat = bpy.data.materials.get(role) or bpy.data.materials.new(role)
    mat.diffuse_color = PREVIEW_COLORS[role]
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = PREVIEW_COLORS[role]
    bsdf.inputs["Roughness"].default_value = 1.0
    return mat


def box(name, size, location, role, bevel=0.0, segments=3):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = segments
        mod.limit_method = "NONE"
    obj.data.materials.append(material(role))
    return obj


def smooth(obj, angle=math.radians(40)):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth_by_angle(angle=angle)
    obj.select_set(False)


def apply_modifiers(obj):
    """Bake modifiers into the mesh (works in background mode, unlike some modifier_apply cases)."""
    depsgraph = bpy.context.evaluated_depsgraph_get()
    mesh = bpy.data.meshes.new_from_object(obj.evaluated_get(depsgraph))
    obj.modifiers.clear()
    old = obj.data
    obj.data = mesh
    bpy.data.meshes.remove(old)


# --- parts -------------------------------------------------------------------------------------


def build_frame():
    rail_h = FRAME_TOP - 0.08
    frame = box("frame", (FRAME_WIDTH, LENGTH, rail_h), (0, 0, 0.08 + rail_h / 2), "wood", bevel=0.012)
    legs = []
    for sx in (-1, 1):
        for sy in (-1, 1):
            legs.append(
                box("leg", (0.07, 0.07, 0.08), (sx * (FRAME_WIDTH / 2 - 0.06), sy * (LENGTH / 2 - 0.06), 0.04), "wood", bevel=0.006)
            )
    headboard = box(
        "headboard",
        (FRAME_WIDTH, 0.06, HEADBOARD_HEIGHT),
        (0, LENGTH / 2 - 0.03, HEADBOARD_HEIGHT / 2),
        "wood",
        bevel=0.02,
        segments=4,
    )
    for obj in [frame, headboard, *legs]:
        apply_modifiers(obj)
        smooth(obj)
    # merge legs into the frame so the model stays a handful of named parts
    bpy.ops.object.select_all(action="DESELECT")
    for obj in [frame, *legs]:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = frame
    bpy.ops.object.join()
    return frame, headboard


def build_mattress():
    mattress = box(
        "mattress",
        (WIDTH, LENGTH - 0.08, MATTRESS_TOP - FRAME_TOP),
        (0, -0.02, (FRAME_TOP + MATTRESS_TOP) / 2),
        "fabric",
        bevel=0.06,
        segments=6,
    )
    apply_modifiers(mattress)
    smooth(mattress, math.radians(60))
    return mattress


def pillow_mesh(name, width, depth, thickness, res=28):
    """Parametric pillow: two puffed halves joined at a seam, edges bowed inward between the corners."""
    bm = bmesh.new()
    pinch = 0.12  # how far the seam edges bow inward

    def point(u, v, side):
        x = u * width / 2 * (1 - pinch * (1 - v * v))
        y = v * depth / 2 * (1 - pinch * (1 - u * u))
        puff = max((1 - u * u) * (1 - v * v), 0.0) ** 0.45
        return Vector((x, y, side * thickness / 2 * puff))

    steps = [-1 + 2 * i / res for i in range(res + 1)]
    # seam vertices are shared by the top and bottom halves so the pillow is closed
    verts = {}
    for side in (1, -1):
        for i, u in enumerate(steps):
            for j, v in enumerate(steps):
                on_seam = i in (0, res) or j in (0, res)
                key = ("seam", i, j) if on_seam else (side, i, j)
                if key not in verts:
                    verts[key] = bm.verts.new(point(u, v, side if not on_seam else 0))
    for side in (1, -1):
        def vk(i, j):
            on_seam = i in (0, res) or j in (0, res)
            return verts[("seam", i, j) if on_seam else (side, i, j)]

        for i in range(res):
            for j in range(res):
                quad = [vk(i, j), vk(i + 1, j), vk(i + 1, j + 1), vk(i, j + 1)]
                if side < 0:
                    quad.reverse()
                bm.faces.new(quad)

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    obj.data.materials.append(material("fabricAccent"))
    return obj


def build_pillows():
    pillows = []
    w, d = PILLOW_SIZE
    for name, x in (("pillow_left", -0.33), ("pillow_right", 0.33)):
        p = pillow_mesh(name, w, d, PILLOW_THICKNESS)
        # resting on the mattress, back edge propped against the headboard
        p.location = (x, LENGTH / 2 - 0.06 - d / 2 * math.cos(PILLOW_TILT), MATTRESS_TOP + 0.03 + d / 2 * math.sin(PILLOW_TILT) * 0.8)
        p.rotation_euler = (PILLOW_TILT, 0, 0)
        pillows.append(p)
    return pillows


def build_duvet(colliders):
    """Drop a cloth sheet onto the mattress so it drapes over the sides and foot, then thicken it."""
    top_y = LENGTH / 2 - DUVET_TOP_GAP
    foot_y = -LENGTH / 2 - DUVET_FOOT_OVERHANG
    size_x = WIDTH + 2 * DUVET_OVERHANG
    size_y = top_y - foot_y
    bpy.ops.mesh.primitive_grid_add(
        x_subdivisions=36, y_subdivisions=42, size=1, location=(0, (top_y + foot_y) / 2, MATTRESS_TOP + 0.04)
    )
    duvet = bpy.context.active_object
    duvet.name = "duvet"
    duvet.scale = (size_x, size_y, 1)
    bpy.ops.object.transform_apply(scale=True)

    for c in colliders:
        col = c.modifiers.new("collision", "COLLISION")
        c.collision.thickness_outer = 0.012
        c.collision.cloth_friction = 8

    cloth = duvet.modifiers.new("cloth", "CLOTH")
    s = cloth.settings
    s.quality = 8
    s.mass = 0.6
    s.tension_stiffness = 30
    s.compression_stiffness = 30
    s.shear_stiffness = 10
    s.bending_stiffness = 6  # stiff enough to stay soft and smooth instead of wrinkly
    s.air_damping = 2
    cloth.collision_settings.distance_min = 0.01
    cloth.collision_settings.use_self_collision = False
    cloth.point_cache.frame_start = 1
    cloth.point_cache.frame_end = 60

    scene = bpy.context.scene
    for f in range(1, 46):
        scene.frame_set(f)
    apply_modifiers(duvet)

    for c in colliders:
        for m in [m for m in c.modifiers if m.type == "COLLISION"]:
            c.modifiers.remove(m)

    # remove leftover micro-wrinkles, then give it a puffy thickness and soft rounded rim
    sm = duvet.modifiers.new("smooth", "SMOOTH")
    sm.factor = 0.6
    sm.iterations = 4
    sol = duvet.modifiers.new("solidify", "SOLIDIFY")
    sol.thickness = DUVET_THICKNESS
    sol.offset = 1
    sol.use_rim = True
    sub = duvet.modifiers.new("subsurf", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 1
    apply_modifiers(duvet)
    for poly in duvet.data.polygons:
        poly.use_smooth = True
    duvet.data.materials.append(material("fabric"))
    return duvet


# --- preview + export --------------------------------------------------------------------------


def render_preview(path):
    """Workbench render from (roughly) the site camera, expressed in bed-local coordinates."""
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_shadows = True
    scene.render.resolution_x, scene.render.resolution_y = 1200, 900
    cam_data = bpy.data.cameras.new("cam")
    cam_data.sensor_fit = "VERTICAL"
    cam_data.angle = math.radians(32)
    cam = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(cam)
    cam.location = (1.32, -3.38, 2.86)
    direction = Vector((0.0, 0.2, 0.3)) - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam)


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    preview = argv[argv.index("--preview") + 1] if "--preview" in argv else None

    bpy.ops.wm.read_factory_settings(use_empty=True)
    frame, headboard = build_frame()
    mattress = build_mattress()
    pillows = build_pillows()
    duvet = build_duvet([mattress, frame])

    for obj in bpy.context.scene.objects:
        obj.select_set(obj.type == "MESH")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUT,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=False,
        export_materials="EXPORT",
    )
    print(f"exported {OUT} ({os.path.getsize(OUT) / 1024:.0f} KB)")
    for obj in [frame, headboard, mattress, *pillows, duvet]:
        print(f"  {obj.name:14s} verts={len(obj.data.vertices):6d} dims={tuple(round(d, 3) for d in obj.dimensions)}")

    if preview:
        render_preview(os.path.abspath(preview))


main()
