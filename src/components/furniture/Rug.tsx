import { RUG } from '../../config/room'
import { ACCENTS } from '../../config/palette'
import { Block } from '../scene/Block'

export function Rug() {
  const [x, , z] = RUG.position
  return (
    <group name="rug" position={[x, 0, z]} rotation={[0, RUG.rotationY, 0]}>
      <Block
        role="rug"
        size={[RUG.width, 0.012, RUG.length]}
        position={[0, 0.006, 0]}
        castShadow={false}
        pattern={{ kind: 'border', half: [RUG.width / 2, RUG.length / 2], inset: 0.06, width: 0.008, color: ACCENTS.rugBorder }}
      />
    </group>
  )
}
