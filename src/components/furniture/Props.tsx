import { PROPS } from '../../config/room'
import { Block, Cylinder, Sphere } from '../scene/Block'

// Small objects. Each group's origin sits on the surface it rests on.

export function Trophy() {
  return (
    <group name="trophy" position={PROPS.trophy}>
      <Block role="woodDark" size={[0.09, 0.04, 0.09]} position={[0, 0.02, 0]} />
      <Cylinder role="metal" radiusTop={0.012} height={0.06} position={[0, 0.07, 0]} />
      <Cylinder role="metal" radiusTop={0.05} radiusBottom={0.025} height={0.08} position={[0, 0.14, 0]} />
    </group>
  )
}

export function DeskLamp() {
  return (
    <group name="desk-lamp" position={PROPS.deskLamp}>
      <Cylinder role="metal" radiusTop={0.07} height={0.03} position={[0, 0.015, 0]} />
      <Cylinder role="metal" radiusTop={0.012} height={0.32} position={[0, 0.17, 0]} rotation={[0, 0, 0.25]} />
      <Sphere role="white" radius={0.09} position={[-0.1, 0.36, 0]} />
    </group>
  )
}

export function DeskBooks() {
  const books = [0.24, 0.22, 0.26, 0.2, 0.23]
  return (
    <group name="desk-books" position={PROPS.deskBooks}>
      {books.map((h, i) => (
        <Block key={i} role="paper" size={[0.17, h, 0.04]} position={[0, h / 2, i * 0.045]} />
      ))}
    </group>
  )
}

export function DeskNotebook() {
  return (
    <group name="desk-notebook" position={PROPS.deskNotebook}>
      <Block role="paper" size={[0.3, 0.04, 0.38]} position={[0, 0.02, 0]} />
    </group>
  )
}

export function PenHolder() {
  return (
    <group name="pen-holder" position={PROPS.penHolder}>
      <Cylinder role="fabricAccent" radiusTop={0.04} height={0.1} position={[0, 0.05, 0]} />
    </group>
  )
}

export function Phone() {
  return (
    <group name="phone" position={PROPS.phone}>
      <Block role="metal" size={[0.08, 0.012, 0.16]} position={[0, 0.006, 0]} rotation={[0, 0.3, 0]} radius={0.005} />
    </group>
  )
}
