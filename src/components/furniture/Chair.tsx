import { CHAIR } from '../../config/room'
import { Block } from '../scene/Block'
import { Placed } from '../scene/Placed'

// Local space: the seated person faces +z; the backrest is at -z.
export function Chair() {
  const { seatHeight: sh, seatSize: s, backHeight: bh } = CHAIR
  const leg = 0.025
  const seat = 0.06

  return (
    <Placed name="chair" placement={CHAIR.placement}>
      <Block role="fabricAccent" size={[s, seat, s]} position={[0, sh - seat / 2, 0]} radius={0.02} />
      <Block
        role="fabricAccent"
        size={[s, bh, 0.05]}
        position={[0, sh + 0.08 + bh / 2, -s / 2 + 0.02]}
        rotation={[-0.1, 0, 0]}
        radius={0.02}
      />
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([sx, sz]) => (
        <Block
          key={`${sx}${sz}`}
          role="metal"
          size={[leg, sh - seat, leg]}
          position={[sx * (s / 2 - leg), (sh - seat) / 2, sz * (s / 2 - leg)]}
        />
      ))}
      {[-1, 1].map((sx) => (
        <Block key={sx} role="metal" size={[leg, bh + 0.1, leg]} position={[sx * (s / 2 - leg), sh + bh / 2, -s / 2 + 0.01]} rotation={[-0.1, 0, 0]} />
      ))}
    </Placed>
  )
}
