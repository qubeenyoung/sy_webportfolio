// Single source of truth for room geometry, furniture placement and camera.
// Units are meters. Axes: +x = right, +y = up, +z = toward the camera.
// The room footprint spans x ∈ [-width/2, width/2], z ∈ [-depth/2, depth/2]; the floor top is y = 0.
// The front wall (camera side) is intentionally omitted — it's a cutaway view.

export type Vec3 = [number, number, number]

export interface Placement {
  position: Vec3
  /** Rotation around Y in radians. Each furniture model's "front" is its local +z. */
  rotationY?: number
}

export const ROOM = {
  width: 3.6,
  depth: 4.2,
  height: 2.5,
  wallThickness: 0.1,
}

const L = -ROOM.width / 2 // left wall inner face
const R = ROOM.width / 2 // right wall inner face
const B = -ROOM.depth / 2 // back wall inner face

// Rotations that turn a model's local +z front toward the room interior.
export const FACING = {
  front: 0, // against the back wall, facing the camera
  right: Math.PI / 2, // against the left wall, facing +x
  left: -Math.PI / 2, // against the right wall, facing -x
}

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

export type CameraType = 'perspective' | 'orthographic'

export const CAMERA = {
  /** The reference shows both side walls at once, which needs perspective. */
  defaultType: 'perspective' as CameraType,
  // Least-squares fit to landmarks in the reference (FOV fixed at 45°). The reference
  // has fisheye-like distortion no pinhole camera matches exactly; this is the closest natural-looking fit.
  position: [0.37, 2.86, 2.33] as Vec3,
  target: [0, 0, -0.71] as Vec3,
  fov: 45,
  /** Camera roll in radians (the reference's horizontals tilt slightly). */
  roll: -0.087,
  /** World-units visible vertically when in orthographic mode. */
  orthoViewHeight: 3.5,
  /** Aspect of the reference illustration — the stage is locked to it so the overlay lines up. */
  aspect: 1672 / 941,
}

// ---------------------------------------------------------------------------
// Openings in walls
// ---------------------------------------------------------------------------

export type ModelVariant = 'model' | 'blockout'

export const WINDOW = {
  /** Center of the opening along the left wall. */
  z: -1.25,
  width: 1.1,
  sillHeight: 0.85,
  height: 1.3,
  curtain: {
    /** 'model' = GLB built by tools/blender/build_curtain.py; 'blockout' = original boxes. */
    variant: 'model' as ModelVariant,
    modelUrl: `${import.meta.env.BASE_URL}models/curtain.glb`,
    rodHeight: 2.3,
    rodLength: 1.9,
    panelWidth: 0.4,
    drop: 1.75,
    offsetFromWall: 0.08,
    /** Panel centers relative to window center, along the wall. */
    panelOffsets: [-0.65, 0.65],
  },
}

export const DOOR = {
  /** Center along the right wall. */
  z: -1.35,
  width: 0.85,
  height: 2.05,
}

// ---------------------------------------------------------------------------
// Furniture
// ---------------------------------------------------------------------------

export type BedVariant = 'model' | 'blockout'

export const BED = {
  /** 'model' = GLB built by tools/blender/build_bed.py; 'blockout' = original primitive boxes. */
  variant: 'model' as BedVariant,
  modelUrl: `${import.meta.env.BASE_URL}models/bed.glb`,
  placement: { position: [-0.95, 0, B + 1.05], rotationY: FACING.front } as Placement,
  width: 1.35,
  length: 2.1,
  mattressTop: 0.5,
  headboardHeight: 0.95,
}

export const BOOKSHELF = {
  placement: { position: [L + 0.78, 0, B + 2.1 + 0.21], rotationY: FACING.front } as Placement,
  width: 1.56,
  depth: 0.38,
  height: 0.92,
  rows: 3,
  columns: 4,
}

export const WARDROBE = {
  placement: { position: [0.6, 0, B + 0.3], rotationY: FACING.front } as Placement,
  width: 1.05,
  depth: 0.6,
  height: 2.0,
}

export const DESK = {
  placement: { position: [R - 0.325, 0, 1.0], rotationY: FACING.left } as Placement,
  width: 1.4,
  depth: 0.65,
  height: 0.74,
}

export const CHAIR = {
  placement: { position: [1.0, 0, 1.0], rotationY: FACING.right } as Placement,
  seatHeight: 0.45,
  seatSize: 0.45,
  backHeight: 0.42,
}

export const RUG = {
  position: [0.3, 0, 1.15] as Vec3,
  width: 1.0,
  length: 1.7,
}

// ---------------------------------------------------------------------------
// Wall decor
// ---------------------------------------------------------------------------

export const POSTER = {
  /** The festival poster image, used as-is as a texture. */
  image: `${import.meta.env.BASE_URL}textures/festival-poster.jpg`,
  placement: { position: [R, 1.45, 0.35], rotationY: FACING.left } as Placement,
  width: 0.72,
  height: 0.95,
}

export interface FrameSpec {
  id: string
  placement: Placement
  width: number
  height: number
  kind: 'picture' | 'note'
}

export const WALL_FRAMES: FrameSpec[] = [
  { id: 'back-photo-1', kind: 'picture', width: 0.25, height: 0.2, placement: { position: [-1.05, 2.05, B], rotationY: FACING.front } },
  { id: 'back-photo-2', kind: 'picture', width: 0.2, height: 0.25, placement: { position: [-0.7, 2.1, B], rotationY: FACING.front } },
  { id: 'back-note-1', kind: 'note', width: 0.15, height: 0.15, placement: { position: [-0.32, 1.95, B], rotationY: FACING.front } },
  { id: 'back-photo-3', kind: 'picture', width: 0.2, height: 0.25, placement: { position: [-0.1, 1.85, B], rotationY: FACING.front } },
  { id: 'right-note-1', kind: 'note', width: 0.15, height: 0.2, placement: { position: [R, 1.6, -0.6], rotationY: FACING.left } },
  { id: 'right-note-2', kind: 'note', width: 0.15, height: 0.2, placement: { position: [R, 1.3, -0.3], rotationY: FACING.left } },
  { id: 'right-note-3', kind: 'note', width: 0.15, height: 0.2, placement: { position: [R, 1.4, 1.05], rotationY: FACING.left } },
]

// ---------------------------------------------------------------------------
// Small props
// ---------------------------------------------------------------------------

const deskTop = DESK.height

export const PROPS = {
  trophy: [L + 0.15, BOOKSHELF.height, B + 2.31] as Vec3,
  deskLamp: [R - 0.2, deskTop, 1.55] as Vec3,
  deskBooks: [R - 0.12, deskTop, 0.95] as Vec3,
  deskNotebook: [R - 0.35, deskTop, 0.65] as Vec3,
  penHolder: [R - 0.1, deskTop, 0.6] as Vec3,
  phone: [-1.3, BED.mattressTop + 0.065, -1.0] as Vec3, // rests on the duvet surface
}

/** Character placeholder — final character will be a 2D illustration placed in 3D. */
export const CHARACTER = {
  position: [-0.85, BED.mattressTop + 0.1, -1.45] as Vec3,
}
