import { createContext, useContext, type ReactNode } from 'react'
import { Edges, RoundedBox } from '@react-three/drei'
import type { Vec3 } from '../../config/room'
import { EDGE_COLOR, PALETTE, type MaterialRole } from '../../config/palette'

export const DebugContext = createContext({ edges: true })

export function RoleMaterial({ role }: { role: MaterialRole }) {
  const transparent = role === 'glass'
  return (
    <meshStandardMaterial
      color={PALETTE[role]}
      roughness={1}
      metalness={0}
      transparent={transparent}
      opacity={transparent ? 0.35 : 1}
    />
  )
}

interface BlockProps {
  role: MaterialRole
  /** Full size [x, y, z]. */
  size: Vec3
  position?: Vec3
  rotation?: Vec3
  /** Rounded corner radius; 0 = plain box. */
  radius?: number
  castShadow?: boolean
  children?: ReactNode
}

/** The basic primitive every piece of furniture is built from. */
export function Block({ role, size, position, rotation, radius = 0, castShadow = true, children }: BlockProps) {
  const { edges } = useContext(DebugContext)
  const outline = edges && <Edges threshold={20} color={EDGE_COLOR} />

  if (radius > 0) {
    return (
      <RoundedBox
        args={size}
        radius={Math.min(radius, ...size.map((s) => s / 2 - 0.001))}
        smoothness={3}
        position={position}
        rotation={rotation}
        castShadow={castShadow}
        receiveShadow
      >
        <RoleMaterial role={role} />
        {outline}
        {children}
      </RoundedBox>
    )
  }

  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow>
      <boxGeometry args={size} />
      <RoleMaterial role={role} />
      {outline}
      {children}
    </mesh>
  )
}

interface CylinderProps {
  role: MaterialRole
  radiusTop: number
  radiusBottom?: number
  height: number
  position?: Vec3
  rotation?: Vec3
  segments?: number
}

export function Cylinder({ role, radiusTop, radiusBottom = radiusTop, height, position, rotation, segments = 24 }: CylinderProps) {
  const { edges } = useContext(DebugContext)
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, segments]} />
      <RoleMaterial role={role} />
      {edges && <Edges threshold={30} color={EDGE_COLOR} />}
    </mesh>
  )
}

export function Sphere({ role, radius, position }: { role: MaterialRole; radius: number; position?: Vec3 }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <sphereGeometry args={[radius, 24, 16]} />
      <RoleMaterial role={role} />
    </mesh>
  )
}
