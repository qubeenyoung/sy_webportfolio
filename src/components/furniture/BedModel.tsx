// Started from `npx gltfjsx public/models/bed.glb --types --shadows --keepnames`, then adapted:
// materials come from the palette (by role) instead of the GLB, so the art style stays in one place.
// The GLB is built by tools/blender/build_bed.py.

import { useContext } from 'react'
import { Edges, useGLTF } from '@react-three/drei'
import type { Mesh } from 'three'
import { BED } from '../../config/room'
import { EDGE_COLOR, type MaterialRole } from '../../config/palette'
import { DebugContext, RoleMaterial } from '../scene/Block'
import { Placed } from '../scene/Placed'

type BedNode = 'frame' | 'headboard' | 'mattress' | 'pillow_left' | 'pillow_right' | 'duvet'

const PARTS: { node: BedNode; role: MaterialRole; outline?: boolean }[] = [
  { node: 'frame', role: 'wood', outline: true },
  { node: 'headboard', role: 'wood', outline: true },
  { node: 'mattress', role: 'fabric' },
  { node: 'pillow_left', role: 'fabricAccent' },
  { node: 'pillow_right', role: 'fabricAccent' },
  { node: 'duvet', role: 'fabric' },
]

export function BedModel() {
  const { nodes } = useGLTF(BED.modelUrl) as unknown as { nodes: Record<BedNode, Mesh> }
  const { edges } = useContext(DebugContext)

  return (
    <Placed name="bed" placement={BED.placement}>
      {PARTS.map(({ node, role, outline }) => {
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
            <RoleMaterial role={role} />
            {/* soft fabric parts get no outline: threshold edges on smooth cloth read as noise */}
            {edges && outline && <Edges threshold={40} color={EDGE_COLOR} />}
          </mesh>
        )
      })}
    </Placed>
  )
}

useGLTF.preload(BED.modelUrl)
