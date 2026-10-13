import { CHAIR } from '../../config/room'
import { Block, Cylinder } from '../scene/Block'
import { Placed } from '../scene/Placed'

// Local space: the seated person faces +z; the backrest is at -z.
// The reference's chair: red padded seat and back on a black tubular frame.
export function Chair() {
  const { seatHeight: sh, seatSize: s, backHeight: bh } = CHAIR
  const pad = 0.07
  const tube = 0.012
  const backTilt = -0.12
  const legX = s / 2 - 0.03

  return (
    <Placed name="chair" placement={CHAIR.placement}>
      <Block role="chair" size={[s, pad, s]} position={[0, sh - pad / 2, 0.01]} radius={0.03} />
      <Block role="chair" size={[s - 0.02, bh, 0.06]} position={[0, sh + 0.06 + bh / 2, -s / 2 + 0.01]} rotation={[backTilt, 0, 0]} radius={0.03} />
      {/* legs, slightly splayed */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <Cylinder
            key={`${sx}${sz}`}
            role="metal"
            radiusTop={tube}
            height={sh - pad + 0.02}
            position={[sx * legX, (sh - pad) / 2, sz * (s / 2 - 0.04)]}
            rotation={[sz * 0.06, 0, -sx * 0.06]}
            segments={10}
          />
        )),
      )}
      {/* back uprights */}
      {[-1, 1].map((sx) => (
        <Cylinder key={sx} role="metal" radiusTop={tube} height={bh + 0.12} position={[sx * legX, sh + bh / 2, -s / 2 - 0.005]} rotation={[backTilt, 0, 0]} segments={10} />
      ))}
    </Placed>
  )
}
