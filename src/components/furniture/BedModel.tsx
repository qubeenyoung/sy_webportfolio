// Started from `npx gltfjsx public/models/bed.glb --types --shadows --keepnames`, then adapted:
// materials come from the palette (by role) instead of the GLB, so the art style stays in one place.
// The GLB is built by tools/blender/build_bed.py.

import { useGLTF } from '@react-three/drei'
import type { Mesh } from 'three'
import { BED } from '../../config/room'
import { ACCENTS, type MaterialRole } from '../../config/palette'
import { Outline, RoleMaterial, type Pattern } from '../scene/Block'
import { Placed } from '../scene/Placed'

type BedNode = 'frame' | 'headboard' | 'mattress' | 'pillow_back_left' | 'pillow_back_right' | 'pillow_left' | 'pillow_right' | 'duvet'

// Blue stripes run along the bed's length on the duvet and front-to-back on the pillows,
// as in the reference. Both are functions of the mesh's local x (its width axis).
const DUVET_STRIPES: Pattern = { kind: 'stripes', axis: 0, period: 0.105, width: 0.012, color: ACCENTS.stripe }
const PILLOW_STRIPES: Pattern = { kind: 'stripes', axis: 0, period: 0.085, width: 0.01, color: ACCENTS.stripe, offset: 0.5 }

const PARTS: { node: BedNode; role: MaterialRole; pattern?: Pattern }[] = [
  { node: 'frame', role: 'wood' },
  { node: 'headboard', role: 'wood' },
  { node: 'mattress', role: 'sheet' },
  // plain pillows propped against the headboard, striped ones lying in front
  { node: 'pillow_back_left', role: 'fabricAccent' },
  { node: 'pillow_back_right', role: 'fabricAccent' },
  { node: 'pillow_left', role: 'fabricAccent', pattern: PILLOW_STRIPES },
  { node: 'pillow_right', role: 'fabricAccent', pattern: PILLOW_STRIPES },
  { node: 'duvet', role: 'fabric', pattern: DUVET_STRIPES },
]

export function BedModel() {
  const { nodes } = useGLTF(BED.modelUrl) as unknown as { nodes: Record<BedNode, Mesh> }

  return (
    <Placed name="bed" placement={BED.placement}>
      {PARTS.map(({ node, role, pattern }) => {
        const src = nodes[node]
        return (
          <mesh
            key={node}
            name={node}
            geometry={src.geometry}
            position={src.position}
            rotation={src.rotation}
            castShadow
            receiveShadow
          >
            <RoleMaterial role={role} pattern={pattern} />
            <Outline />
          </mesh>
        )
      })}
    </Placed>
  )
}

useGLTF.preload(BED.modelUrl)
