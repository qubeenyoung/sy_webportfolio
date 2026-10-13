import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { Outlines, RoundedBox } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Color, DataTexture, NearestFilter, RGBAFormat, type Texture } from 'three'
import { MeshToonMaterial } from 'three'
import type { Vec3 } from '../../config/room'
import { EDGE_COLOR, PALETTE, type MaterialRole } from '../../config/palette'

export const DebugContext = createContext({ edges: true, free: false })

// --- toon shading ---------------------------------------------------------------------------------
// Two lit steps plus a shadow step: flat color areas like the reference, no glossy highlights.
const GRADIENT = (() => {
  const steps = [170, 215, 255]
  const data = new Uint8Array(steps.flatMap((v) => [v, v, v, 255]))
  const tex = new DataTexture(data, steps.length, 1, RGBAFormat)
  tex.minFilter = tex.magFilter = NearestFilter
  tex.needsUpdate = true
  return tex
})()

/** Procedural surface patterns, evaluated in object space so they follow the model. */
export type Pattern =
  | { kind: 'stripes'; axis: 0 | 1 | 2; period: number; width: number; color: string; offset?: number }
  | { kind: 'border'; half: [number, number]; inset: number; width: number; color: string }

const AXIS = ['x', 'y', 'z']

function patternChunk(p: Pattern) {
  if (p.kind === 'stripes') {
    const v = `vObjPos.${AXIS[p.axis]}`
    return /* glsl */ `
      {
        float q = ${v} / ${p.period.toFixed(5)} + ${(p.offset ?? 0).toFixed(4)};
        float d = abs(fract(q) - 0.5) * ${p.period.toFixed(5)};
        float aa = fwidth(${v}) * 0.8 + 1e-5;
        float line = 1.0 - smoothstep(${(p.width / 2).toFixed(5)} - aa, ${(p.width / 2).toFixed(5)} + aa, d);
        diffuseColor.rgb = mix(diffuseColor.rgb, patternColor, line);
      }`
  }
  return /* glsl */ `
    {
      vec2 e = vec2(${p.half[0].toFixed(5)}, ${p.half[1].toFixed(5)}) - abs(vObjPos.xz);
      float d = abs(min(e.x, e.y) - ${p.inset.toFixed(5)});
      float aa = fwidth(vObjPos.x) * 0.8 + 1e-5;
      float line = 1.0 - smoothstep(${(p.width / 2).toFixed(5)} - aa, ${(p.width / 2).toFixed(5)} + aa, d);
      diffuseColor.rgb = mix(diffuseColor.rgb, patternColor, line);
    }`
}

const cache = new Map<string, MeshToonMaterial>()

/** One shared material per (role, pattern, map) so the whole room uses a handful of programs. */
export function getMaterial(role: MaterialRole, pattern?: Pattern, map?: Texture) {
  const key = `${role}|${pattern ? JSON.stringify(pattern) : ''}|${map?.uuid ?? ''}`
  let mat = cache.get(key)
  if (mat) return mat
  const glass = role === 'glass'
  mat = new MeshToonMaterial({
    color: map ? '#ffffff' : PALETTE[role],
    gradientMap: GRADIENT,
    map: map ?? null,
    transparent: glass,
    opacity: glass ? 0.25 : 1,
    depthWrite: !glass,
  })
  if (pattern) {
    const color = new Color(pattern.color)
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.patternColor = { value: color }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;')
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;\nuniform vec3 patternColor;')
        .replace('#include <color_fragment>', `#include <color_fragment>\n${patternChunk(pattern)}`)
    }
    mat.customProgramCacheKey = () => key
  }
  cache.set(key, mat)
  return mat
}

export function RoleMaterial({ role, pattern, map }: { role: MaterialRole; pattern?: Pattern; map?: Texture }) {
  const material = useMemo(() => getMaterial(role, pattern, map), [role, pattern, map])
  return <primitive object={material} attach="material" />
}

// --- outlines -------------------------------------------------------------------------------------
// Inverted-hull outlines with smoothed normals: one consistent pencil-weight line on boxes and
// on soft rounded models alike (threshold "edges" vanish on rounded meshes).
// Constant pixel width, like a pencil line.
// NOTE: in the installed drei (10.7.x) the shader's `screenspace` branches are swapped:
// screenspace={false} offsets in *pixels*, screenspace={true} in *world units*. (Passing
// screenspace with a pixel value made the hull 1.6 m thick and cover the screen.)
export const OUTLINE_PX = 2.2

export function Outline({ thickness = OUTLINE_PX }: { thickness?: number }) {
  const { edges } = useContext(DebugContext)
  // keep the line weight proportional to the picture (2.2 px at the reference's 941 px height)
  const height = useThree((s) => s.size.height)
  if (!edges) return null
  const px = thickness * Math.min(Math.max(height / 941, 0.5), 1.6)
  return <Outlines screenspace={false} thickness={px} color={EDGE_COLOR} angle={Math.PI} />
}

// --- primitives -----------------------------------------------------------------------------------

interface BlockProps {
  role: MaterialRole
  /** Full size [x, y, z]. */
  size: Vec3
  position?: Vec3
  rotation?: Vec3
  /** Rounded corner radius; 0 = plain box. */
  radius?: number
  castShadow?: boolean
  pattern?: Pattern
  /** Skip the outline (tiny or flat parts where a line would read as noise). */
  noOutline?: boolean
  children?: ReactNode
}

/** The basic primitive every piece of furniture is built from. */
export function Block({ role, size, position, rotation, radius = 0, castShadow = true, pattern, noOutline, children }: BlockProps) {
  const body = (
    <>
      <RoleMaterial role={role} pattern={pattern} />
      {!noOutline && role !== 'glass' && <Outline />}
      {children}
    </>
  )
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
        {body}
      </RoundedBox>
    )
  }
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow>
      <boxGeometry args={size} />
      {body}
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
  noOutline?: boolean
}

export function Cylinder({ role, radiusTop, radiusBottom = radiusTop, height, position, rotation, segments = 24, noOutline }: CylinderProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, segments]} />
      <RoleMaterial role={role} />
      {!noOutline && <Outline />}
    </mesh>
  )
}

export function Sphere({ role, radius, position, scale }: { role: MaterialRole; radius: number; position?: Vec3; scale?: Vec3 }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[radius, 24, 16]} />
      <RoleMaterial role={role} />
      <Outline />
    </mesh>
  )
}
