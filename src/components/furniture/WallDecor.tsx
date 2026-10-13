import { useTexture } from '@react-three/drei'
import { SRGBColorSpace } from 'three'
import { POSTER, WALL_FRAMES, type FrameSpec } from '../../config/room'
import { Block } from '../scene/Block'
import { Placed } from '../scene/Placed'

// Local space for all wall decor: the wall plane is z = 0, the room interior is +z.

export function Poster() {
  const texture = useTexture(POSTER.image)
  texture.colorSpace = SRGBColorSpace
  const { width: w, height: h } = POSTER
  const frame = 0.035

  return (
    <Placed name="poster" placement={POSTER.placement}>
      <Block role="woodDark" size={[w + 2 * frame, h + 2 * frame, 0.025]} position={[0, 0, 0.0125]} />
      <mesh position={[0, 0, 0.026]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} roughness={1} metalness={0} />
      </mesh>
    </Placed>
  )
}

function WallFrame({ spec }: { spec: FrameSpec }) {
  const { width: w, height: h } = spec
  return (
    <Placed name={spec.id} placement={spec.placement}>
      {spec.kind === 'picture' ? (
        <>
          <Block role="woodDark" size={[w, h, 0.015]} position={[0, 0, 0.0075]} />
          <Block role="paper" size={[w - 0.03, h - 0.03, 0.004]} position={[0, 0, 0.016]} />
        </>
      ) : (
        <Block role="paper" size={[w, h, 0.004]} position={[0, 0, 0.002]} />
      )}
    </Placed>
  )
}

export function WallFrames() {
  return (
    <>
      {WALL_FRAMES.map((spec) => (
        <WallFrame key={spec.id} spec={spec} />
      ))}
    </>
  )
}
