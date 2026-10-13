import { DOOR, FACING, ROOM } from '../../config/room'
import { Block } from '../scene/Block'
import { Placed } from '../scene/Placed'

// Local space: the wall plane is z = 0, the room interior is +z.
export function Door() {
  const { width: w, height: h } = DOOR
  const casing = 0.07

  return (
    <Placed name="door" placement={{ position: [ROOM.width / 2, 0, DOOR.z], rotationY: FACING.left }}>
      <Block role="white" size={[casing, h + casing, 0.03]} position={[-w / 2 - casing / 2, (h + casing) / 2, 0.015]} />
      <Block role="white" size={[casing, h + casing, 0.03]} position={[w / 2 + casing / 2, (h + casing) / 2, 0.015]} />
      <Block role="white" size={[w + 2 * casing, casing, 0.03]} position={[0, h + casing / 2, 0.015]} />
      <Block role="fabricAccent" size={[w - 0.02, h - 0.01, 0.04]} position={[0, h / 2, 0.02]} />
      <Block role="metal" size={[0.12, 0.025, 0.04]} position={[w / 2 - 0.12, 1.0, 0.07]} />
    </Placed>
  )
}
