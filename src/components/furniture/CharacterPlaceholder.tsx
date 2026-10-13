import { CHARACTER } from '../../config/room'
import { Block, Sphere } from '../scene/Block'

/**
 * Volume stand-in for the character sitting against the pillows with a laptop.
 * Will be replaced by a 2D character illustration placed in the 3D scene.
 */
export function CharacterPlaceholder() {
  return (
    <group name="character" position={CHARACTER.position}>
      <Block role="placeholder" size={[0.34, 0.5, 0.2]} position={[0, 0.2, -0.05]} rotation={[-0.8, 0, 0]} radius={0.06} />
      <Sphere role="placeholder" radius={0.11} position={[0, 0.46, -0.3]} />
      {[-0.08, 0.08].map((x) => (
        <group key={x}>
          <Block role="placeholder" size={[0.12, 0.12, 0.42]} position={[x, 0.1, 0.27]} rotation={[0.45, 0, 0]} radius={0.04} />
          <Block role="placeholder" size={[0.11, 0.11, 0.42]} position={[x, 0.1, 0.62]} rotation={[-0.45, 0, 0]} radius={0.04} />
        </group>
      ))}

      <group name="laptop" position={[0, 0.2, 0.22]}>
        <Block role="white" size={[0.32, 0.02, 0.22]} position={[0, 0, 0]} rotation={[0.2, 0, 0]} />
        <Block role="white" size={[0.32, 0.22, 0.012]} position={[0, 0.12, 0.13]} rotation={[0.35, 0, 0]} />
      </group>
    </group>
  )
}
