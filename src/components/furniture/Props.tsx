import { PROPS } from '../../config/room'
import { BOOK_COLORS } from '../../config/palette'
import { Block, Cylinder, Sphere, getMaterial, Outline } from '../scene/Block'
import { labelTexture } from '../scene/textures'

// Small objects from the reference. Each group's origin sits on the surface it rests on.

export function Trophy() {
  return (
    <group name="trophy" position={PROPS.trophy}>
      <Block role="black" size={[0.1, 0.045, 0.1]} position={[0, 0.0225, 0]} />
      <Cylinder role="gold" radiusTop={0.012} height={0.05} position={[0, 0.07, 0]} segments={12} />
      <Cylinder role="gold" radiusTop={0.055} radiusBottom={0.022} height={0.09} position={[0, 0.14, 0]} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.06, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.022, 0.006, 6, 16, Math.PI]} />
          <primitive object={getMaterial('gold')} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

/** White dome lamp on a black base and arm, at the near end of the desk, shade tipped toward the room. */
export function DeskLamp() {
  return (
    <group name="desk-lamp" position={PROPS.deskLamp}>
      <Cylinder role="black" radiusTop={0.065} radiusBottom={0.075} height={0.035} position={[0, 0.0175, 0]} />
      <Cylinder role="black" radiusTop={0.01} height={0.3} position={[0, 0.17, 0]} segments={10} />
      <Cylinder role="black" radiusTop={0.008} height={0.16} position={[-0.06, 0.31, 0]} rotation={[0, 0, 1.0]} segments={10} />
      <Sphere role="white" radius={0.095} position={[-0.13, 0.31, 0]} scale={[1, 0.8, 1]} />
    </group>
  )
}

/** Upright books against the wall, spines facing into the room. */
export function DeskBooks() {
  const books: [keyof typeof BOOK_COLORS, number][] = [
    ['navy', 0.25], ['teal', 0.23], ['cream', 0.26], ['blue', 0.22], ['white', 0.24], ['olive', 0.21],
  ]
  return (
    <group name="desk-books" position={PROPS.deskBooks} rotation={[0, -Math.PI / 2, 0]}>
      {books.map(([color, h], i) => (
        <mesh key={i} position={[(i - books.length / 2) * 0.042, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.038, h, 0.17]} />
          <primitive object={getMaterial('paper', undefined, labelTexture('', BOOK_COLORS[color], '#fff', true))} attach="material" />
          <Outline />
        </mesh>
      ))}
    </group>
  )
}

/** The big grey-green book with the red apple on top. */
export function DeskNotebook() {
  return (
    <>
      <group name="desk-big-book" position={PROPS.deskNotebook}>
        <Block role="bookCover" size={[0.27, 0.04, 0.35]} position={[0, 0.02, 0]} radius={0.006} />
        <Block role="paper" size={[0.26, 0.03, 0.335]} position={[0.006, 0.02, 0]} noOutline />
      </group>
      <group name="apple" position={PROPS.apple}>
        <Sphere role="apple" radius={0.045} position={[0, 0.04, 0]} scale={[1, 0.92, 1]} />
        <Cylinder role="woodDark" radiusTop={0.004} height={0.03} position={[0.004, 0.09, 0]} rotation={[0, 0, -0.3]} segments={6} noOutline />
      </group>
      <group name="notepad" position={PROPS.notepad}>
        <Block role="notepad" size={[0.15, 0.03, 0.2]} position={[0, 0.015, 0]} radius={0.004} />
      </group>
      <group name="spiral-notebook" position={PROPS.spiralNotebook} rotation={[0, 0.15, 0]}>
        <Block role="paper" size={[0.22, 0.014, 0.3]} position={[0, 0.007, 0]} />
        <Block role="bookCover" size={[0.12, 0.016, 0.2]} position={[-0.03, 0.016, -0.06]} />
        <Cylinder role="black" radiusTop={0.006} height={0.15} position={[0.04, 0.02, 0.05]} rotation={[Math.PI / 2, 0, 0.6]} segments={8} />
      </group>
    </>
  )
}

/** Red cup with a few pens. */
export function PenHolder() {
  return (
    <group name="pen-holder" position={PROPS.penHolder}>
      <Cylinder role="apple" radiusTop={0.04} radiusBottom={0.036} height={0.1} position={[0, 0.05, 0]} />
      {[[-0.012, 0.15], [0.012, -0.1], [0, 0.05]].map(([dx, tilt], i) => (
        <Cylinder key={i} role={i === 1 ? 'black' : 'metal'} radiusTop={0.005} height={0.16} position={[dx, 0.13, 0]} rotation={[0, 0, tilt]} segments={6} noOutline />
      ))}
    </group>
  )
}

export function Phone() {
  return (
    <group name="phone" position={PROPS.phone}>
      <Block role="black" size={[0.08, 0.012, 0.16]} position={[0, 0.006, 0]} rotation={[0, 0.5, 0]} radius={0.005} />
    </group>
  )
}
