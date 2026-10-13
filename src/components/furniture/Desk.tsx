import { DESK } from '../../config/room'
import { Block } from '../scene/Block'
import { Placed } from '../scene/Placed'

// Local space: the sitting side is +z, width along x.
export function Desk() {
  const { width: w, depth: d, height: h } = DESK
  const top = 0.04
  const leg = 0.05
  const legH = h - top

  return (
    <Placed name="desk" placement={DESK.placement}>
      <Block role="wood" size={[w, top, d]} position={[0, h - top / 2, 0]} />
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([sx, sz]) => (
        <Block
          key={`${sx}${sz}`}
          role="woodDark"
          size={[leg, legH, leg]}
          position={[sx * (w / 2 - leg), legH / 2, sz * (d / 2 - leg)]}
        />
      ))}
      <Block role="woodDark" size={[w - 2 * leg, 0.1, 0.02]} position={[0, h - top - 0.05, -d / 2 + leg]} />
    </Placed>
  )
}
