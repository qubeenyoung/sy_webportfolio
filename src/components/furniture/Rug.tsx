import { RUG } from '../../config/room'
import { Block } from '../scene/Block'

export function Rug() {
  const [x, , z] = RUG.position
  return <Block role="rug" size={[RUG.width, 0.012, RUG.length]} position={[x, 0.006, z]} castShadow={false} />
}
