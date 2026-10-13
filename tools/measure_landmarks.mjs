// Projects key 3D landmarks of the current layout through the default camera and compares them
// with the same points read off the reference illustration (1672x941).
//   node tools/measure_landmarks.mjs            -> table + JSON summary
// World coordinates mirror src/config/room.ts; update them together when the layout changes.
import { PerspectiveCamera, Vector3 } from 'three'

const W = 1672, H = 941
const CAMERA = { position: [-0.014, 3.662, 3.315], target: [-0.006, 0, -0.702], fov: 30.09, roll: 0.143 }

const L = -3.254 / 2, R = 3.254 / 2, B = -3.894 / 2
const bed = { x: -0.784, w: 1.47 + 0.06, head: B + 0.06, headH: 0.64 }
const shelf = { left: L + 0.03, right: L + 0.03 + 1.33, front: B + 2.37 + 0.08 + 0.42, h: 1.02 }
const ward = { l: 0.7725 - 0.4875, r: 0.7725 + 0.4875, front: B + 0.4 }
const door = { front: -1.544 + 0.353, back: -1.544 - 0.353 }
const poster = { back: 0.184 - 0.35 - 0.03, front: 0.184 + 0.35 + 0.03, top: 1.42 + 0.46 + 0.03, bottom: 1.42 - 0.46 - 0.03 }
const desk = { left: R - 0.518, back: 0.719 - 0.7, h: 0.76 }
const rug = { c: [0.155, 0.645], rot: -0.4207, w: 0.823, l: 1.6 }
const rugCorner = (sx, sz) => {
  const ux = [Math.cos(rug.rot), -Math.sin(rug.rot)], uz = [Math.sin(rug.rot), Math.cos(rug.rot)]
  return [rug.c[0] + ux[0] * sx * rug.w / 2 + uz[0] * sz * rug.l / 2, 0, rug.c[1] + ux[1] * sx * rug.w / 2 + uz[1] * sz * rug.l / 2]
}

// [name, world point, reference pixel]
const LANDMARKS = [
  ['headboard top-left', [bed.x - bed.w / 2, bed.headH, bed.head], [429, 21]],
  ['headboard top-right', [bed.x + bed.w / 2, bed.headH, bed.head], [886, 132]],
  ['wardrobe bottom front-left', [ward.l, 0, ward.front], [950, 279]],
  ['wardrobe bottom front-right', [ward.r, 0, ward.front], [1222, 354]],
  ['door bottom front', [R, 0, door.front], [1365, 436]],
  ['door frame bottom back', [R, 0, door.back], [1315, 325]],
  ['poster top-back', [R, poster.top, poster.back], [1625, 125]],
  ['poster bottom-back', [R, poster.bottom, poster.back], [1505, 395]],
  ['poster bottom-front', [R, poster.bottom, poster.front], [1590, 615]],
  ['shelf top front-left', [shelf.left + 0.05, shelf.h, shelf.front], [46, 492]],
  ['shelf top front-right', [shelf.right, shelf.h, shelf.front], [704, 657]],
  ['shelf bottom front-right', [shelf.right, 0, shelf.front], [636, 914]],
  ['trophy', [L + 0.15, shelf.h + 0.14, shelf.front - 0.21], [118, 425]],
  ['desk top back-left', [desk.left, desk.h, desk.back], [1276, 521]],
  ['desk top back-right', [R, desk.h, desk.back], [1497, 512]],
  ['rug far-left', rugCorner(-1, -1), [861, 577]],
  ['rug far-right', rugCorner(1, -1), [1118, 703]],
  ['chair seat center', [1.032, 0.45, 0.597], [1236, 757]],
]

const cam = new PerspectiveCamera(CAMERA.fov, W / H, 0.1, 100)
cam.position.set(...CAMERA.position)
cam.lookAt(new Vector3(...CAMERA.target))
cam.rotateZ(CAMERA.roll)
cam.updateMatrixWorld()
cam.updateProjectionMatrix()

const diag = Math.hypot(W, H)
let sum = 0
const rows = LANDMARKS.map(([name, w, [u, v]]) => {
  const p = new Vector3(...w).project(cam)
  const pu = ((p.x + 1) / 2) * W, pv = ((1 - p.y) / 2) * H
  const err = Math.hypot(pu - u, pv - v)
  sum += err * err
  return { name, ref: [u, v], render: [Math.round(pu), Math.round(pv)], errorPx: Math.round(err), errorPctOfDiagonal: +((100 * err) / diag).toFixed(1) }
})
for (const r of rows) console.log(`${r.name.padEnd(28)} ref ${String(r.ref).padEnd(10)} render ${String(r.render).padEnd(10)} err ${String(r.errorPx).padStart(3)} px (${r.errorPctOfDiagonal}% of diagonal)`)
const rms = Math.sqrt(sum / rows.length)
console.log(`RMS ${rms.toFixed(1)} px = ${((100 * rms) / diag).toFixed(2)}% of the image diagonal`)
console.log(JSON.stringify({ rmsPx: +rms.toFixed(1), rows }))
