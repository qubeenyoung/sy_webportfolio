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
  // Width/depth come from a joint camera + layout fit to the reference (see docs/REFERENCE_MATCH_REPORT.md).
  width: 3.254,
  depth: 3.894,
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
  // Jointly fitted with the furniture layout to 21 landmarks in the reference (~22 px RMS at 1672x941).
  // A radial-distortion term was tested and gave no real gain, so this is a plain pinhole camera.
  position: [-0.014, 3.662, 3.315] as Vec3,
  target: [-0.006, 0, -0.702] as Vec3,
  fov: 30.09,
  /** Camera roll in radians (the reference's horizontals tilt). */
  roll: 0.143,
  /** World-units visible vertically when in orthographic mode. */
  orthoViewHeight: 2.92,
  /** Aspect of the reference illustration — the stage is locked to it so the overlay lines up. */
  aspect: 1672 / 941,
}

// ---------------------------------------------------------------------------
// Openings in walls
// ---------------------------------------------------------------------------

export type ModelVariant = 'model' | 'blockout'

export const WINDOW = {
  /** Center of the opening along the left wall. */
  z: -0.12,
  width: 1.1,
  sillHeight: 0.85,
  /** How far the sill sticks out into the room. */
  sillDepth: 0.045,
  height: 1.3,
  curtain: {
    /** 'model' = GLB built by tools/blender/build_curtain.py; 'blockout' = original boxes. */
    variant: 'model' as ModelVariant,
    modelUrl: `${import.meta.env.BASE_URL}models/curtain.glb`,
    rodHeight: 2.3,
    rodLength: 1.9,
    panelWidth: 0.42,
    drop: 1.66,
    /** The panel nearer the camera is shorter: it ends at the bookshelf top. */
    frontDrop: 1.24,
    offsetFromWall: 0.09,
    /** Panel centers relative to window center, along the wall. */
    panelOffsets: [-0.66, 0.66],
  },
}

export const DOOR = {
  /** Center along the right wall. */
  z: -1.544,
  width: 0.706,
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
  placement: { position: [-0.784, 0, B + 1.185], rotationY: FACING.front } as Placement,
  width: 1.47,
  length: 2.37,
  mattressTop: 0.5,
  headboardHeight: 0.64,
}

export const BOOKSHELF = {
  // stands 8 cm past the bed's foot (hidden from the main camera by the taller shelf)
  placement: { position: [L + 0.03 + 0.665, 0, B + 2.37 + 0.08 + 0.21], rotationY: FACING.front } as Placement,
  width: 1.33,
  depth: 0.42,
  height: 1.02,
  rows: 3,
  columns: 4,
}

export const WARDROBE = {
  placement: { position: [0.7725, 0, B + 0.2], rotationY: FACING.front } as Placement,
  width: 0.975,
  depth: 0.4,
  height: 2.15,
}

export const DESK = {
  placement: { position: [R - 0.259, 0, 0.719], rotationY: FACING.left } as Placement,
  width: 1.4,
  depth: 0.518,
  height: 0.76,
}

export const CHAIR = {
  placement: { position: [1.032, 0, 0.597], rotationY: FACING.right } as Placement,
  seatHeight: 0.45,
  seatSize: 0.45,
  backHeight: 0.32,
}

export const RUG = {
  position: [0.155, 0, 0.645] as Vec3,
  /** The reference's rug lies at an angle to the walls. */
  rotationY: -0.4207,
  width: 0.823,
  length: 1.6,
}

// ---------------------------------------------------------------------------
// Wall decor
// ---------------------------------------------------------------------------

export const POSTER = {
  /** The festival poster with the Instagram grid lines removed (tools/clean_poster.py); content unchanged. */
  image: `${import.meta.env.BASE_URL}textures/festival-poster-clean.jpg`,
  placement: { position: [R, 1.42, 0.184], rotationY: FACING.left } as Placement,
  width: 0.7,
  height: 0.92,
}

export interface FrameSpec {
  id: string
  placement: Placement
  width: number
  height: number
  kind: 'picture' | 'note'
}

export const WALL_FRAMES: FrameSpec[] = [
  { id: 'back-photo-1', kind: 'picture', width: 0.2, height: 0.16, placement: { position: [-1.2, 0.87, B], rotationY: FACING.front } },
  { id: 'back-photo-2', kind: 'picture', width: 0.15, height: 0.19, placement: { position: [-0.97, 0.9, B], rotationY: FACING.front } },
  { id: 'back-note-1', kind: 'note', width: 0.12, height: 0.12, placement: { position: [-0.38, 0.86, B], rotationY: FACING.front } },
  { id: 'back-photo-3', kind: 'picture', width: 0.17, height: 0.21, placement: { position: [-0.15, 0.85, B], rotationY: FACING.front } },
  { id: 'right-note-1', kind: 'note', width: 0.15, height: 0.2, placement: { position: [R, 1.62, -0.85], rotationY: FACING.left } },
  { id: 'right-note-2', kind: 'note', width: 0.15, height: 0.2, placement: { position: [R, 1.3, -0.5], rotationY: FACING.left } },
  { id: 'right-note-3', kind: 'note', width: 0.15, height: 0.2, placement: { position: [R, 1.25, 0.78], rotationY: FACING.left } },
]

// ---------------------------------------------------------------------------
// Small props
// ---------------------------------------------------------------------------

const deskTop = DESK.height

// Prop positions follow the reference: on the desk, from the poster end toward the camera —
// pen cup and upright books against the wall, the big book with the apple, a small yellow
// notepad, the lamp, and a spiral notebook with a pen at the near end.
export const PROPS = {
  trophy: [L + 0.15, BOOKSHELF.height, BOOKSHELF.placement.position[2]] as Vec3,
  deskLamp: [R - 0.08, deskTop, 1.12] as Vec3,
  deskBooks: [R - 0.09, deskTop, 0.64] as Vec3,
  deskNotebook: [R - 0.24, deskTop, 0.47] as Vec3, // the big book the apple sits on
  apple: [R - 0.24, deskTop + 0.045, 0.47] as Vec3,
  notepad: [R - 0.19, deskTop, 0.86] as Vec3,
  spiralNotebook: [R - 0.28, deskTop, 1.26] as Vec3,
  penHolder: [R - 0.07, deskTop, 0.36] as Vec3,
  phone: [-1.22, BED.mattressTop + 0.1, -0.72] as Vec3, // rests on the duvet surface
}

/**
 * The character is the original figure cut out of the reference (tools/extract_character.py) and
 * placed as a camera-facing card; 'placeholder' is the old volume stand-in.
 */
export const CHARACTER = {
  variant: 'sprite' as 'sprite' | 'placeholder',
  image: `${import.meta.env.BASE_URL}textures/character.png`,
  /** Where the cutout sits in the reference image (written by the extraction script to character.json). */
  rect: { x: 450, y: 32, width: 289, height: 439, refWidth: 1672, refHeight: 941 },
  /** Her hips in the reference, and the duvet height they rest on — sets the card's depth. */
  hipPixel: [600, 335] as [number, number],
  hipHeight: 0.6,
  /** Placeholder only. */
  position: [-0.85, BED.mattressTop + 0.1, -1.2] as Vec3,
}
