import type { ReactNode } from 'react'
import type { Placement } from '../../config/room'

/** Applies a config Placement (position + Y rotation) to a furniture model. */
export function Placed({ placement, name, children }: { placement: Placement; name?: string; children: ReactNode }) {
  return (
    <group name={name} position={placement.position} rotation={[0, placement.rotationY ?? 0, 0]}>
      {children}
    </group>
  )
}
