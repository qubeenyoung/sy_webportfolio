import { DESK } from '../../config/room'
import { Block } from '../scene/Block'
import { Placed } from '../scene/Placed'

// Local space: the sitting side is +z, width along x (-x = the end by the poster).
// As in the reference: a solid side panel at the far end, two legs at the near end.
export function Desk() {
  const { width: w, depth: d, height: h } = DESK
  const top = 0.035
  const leg = 0.045
  const legH = h - top

  return (
    <Placed name="desk" placement={DESK.placement}>
      <Block role="wood" size={[w, top, d]} position={[0, h - top / 2, 0]} />
      <Block role="wood" size={[0.03, legH, d - 0.04]} position={[-w / 2 + 0.05, legH / 2, 0]} />
      {[-1, 1].map((sz) => (
        <Block key={sz} role="wood" size={[leg, legH, leg]} position={[w / 2 - leg, legH / 2, sz * (d / 2 - leg)]} />
      ))}
      <Block role="woodDark" size={[w - 0.1, 0.08, 0.02]} position={[0.02, h - top - 0.04, -d / 2 + 0.03]} />
    </Placed>
  )
}
