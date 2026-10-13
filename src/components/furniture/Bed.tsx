import { BED } from '../../config/room'
import { Block } from '../scene/Block'
import { Placed } from '../scene/Placed'

// Local space: head at -z, foot at +z, width along x.
export function Bed() {
  const { width: w, length: l, mattressTop, headboardHeight } = BED
  const frameTop = mattressTop - 0.2
  const duvetLength = l * 0.68

  return (
    <Placed name="bed" placement={BED.placement}>
      <Block role="wood" size={[w + 0.06, frameTop, l]} position={[0, frameTop / 2, 0]} />
      <Block role="wood" size={[w + 0.06, headboardHeight, 0.06]} position={[0, headboardHeight / 2, -l / 2 + 0.03]} />
      <Block role="fabric" size={[w, 0.2, l - 0.08]} position={[0, frameTop + 0.1, 0.02]} radius={0.03} />
      <Block
        role="fabric"
        size={[w + 0.08, 0.1, duvetLength]}
        position={[0, mattressTop + 0.04, l / 2 - duvetLength / 2 - 0.02]}
        radius={0.04}
      />
      {[-0.29, 0.29].map((x) => (
        <Block
          key={x}
          role="fabricAccent"
          size={[0.55, 0.14, 0.38]}
          position={[x, mattressTop + 0.14, -l / 2 + 0.28]}
          rotation={[0.5, 0, 0]}
          radius={0.06}
        />
      ))}
    </Placed>
  )
}
