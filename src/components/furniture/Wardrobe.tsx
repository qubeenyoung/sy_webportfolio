import { WARDROBE } from '../../config/room'
import { Block } from '../scene/Block'
import { Placed } from '../scene/Placed'

// Local space: doors face +z.
export function Wardrobe() {
  const { width: w, depth: d, height: h } = WARDROBE
  const plinth = 0.06

  return (
    <Placed name="wardrobe" placement={WARDROBE.placement}>
      <Block role="woodDark" size={[w - 0.04, plinth, d - 0.04]} position={[0, plinth / 2, 0]} />
      <Block role="wardrobe" size={[w, h - plinth, d]} position={[0, plinth + (h - plinth) / 2, 0]} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Block role="wardrobe" size={[w / 2 - 0.02, h - plinth - 0.06, 0.02]} position={[(side * w) / 4, plinth + (h - plinth) / 2, d / 2 + 0.01]} />
          <Block role="metal" size={[0.025, 0.3, 0.03]} position={[side * 0.06, 1.2, d / 2 + 0.035]} radius={0.008} />
        </group>
      ))}
    </Placed>
  )
}
