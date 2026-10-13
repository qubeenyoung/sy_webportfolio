import { useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'
import type { Vec3 } from '../../config/room'
import type { MaterialRole } from '../../config/palette'
import { Outline, RoleMaterial } from './Block'

/** Rounded rectangle in plan (x by z) with per-corner radii: [back-left, back-right, front-right, front-left]. */
function slabGeometry(width: number, depth: number, thickness: number, radii: [number, number, number, number]) {
  const [bl, br, fr, fl] = radii.map((r) => Math.min(r, width / 2, depth / 2))
  const x0 = -width / 2, x1 = width / 2, y0 = -depth / 2, y1 = depth / 2
  // shape lives in XY with +y = front (later rotated so +y maps to +z)
  const s = new Shape()
  s.moveTo(x0 + bl, y0)
  s.lineTo(x1 - br, y0)
  s.quadraticCurveTo(x1, y0, x1, y0 + br)
  s.lineTo(x1, y1 - fr)
  s.quadraticCurveTo(x1, y1, x1 - fr, y1)
  s.lineTo(x0 + fl, y1)
  s.quadraticCurveTo(x0, y1, x0, y1 - fl)
  s.lineTo(x0, y0 + bl)
  s.quadraticCurveTo(x0, y0, x0 + bl, y0)
  const bevel = Math.min(0.006, thickness / 4)
  const g = new ExtrudeGeometry(s, { depth: thickness - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 12 })
  // extrusion runs along +z; turn it into a horizontal slab of the given thickness centred on y = 0
  g.rotateX(Math.PI / 2)
  g.translate(0, thickness / 2 - bevel, 0)
  g.computeVertexNormals()
  return g
}

interface RoundedSlabProps {
  role: MaterialRole
  width: number
  depth: number
  thickness: number
  radii: [number, number, number, number]
  position?: Vec3
}

/** A board with rounded corners in plan — the soft, rounded furniture silhouette of the reference. */
export function RoundedSlab({ role, width, depth, thickness, radii, position }: RoundedSlabProps) {
  const geometry = useMemo(() => slabGeometry(width, depth, thickness, radii), [width, depth, thickness, radii])
  return (
    <mesh geometry={geometry} position={position} castShadow receiveShadow>
      <RoleMaterial role={role} />
      <Outline />
    </mesh>
  )
}
