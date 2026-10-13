import { useTexture } from '@react-three/drei'
import { SRGBColorSpace } from 'three'
import { POSTER, WALL_FRAMES, type FrameSpec } from '../../config/room'
import { Block, Outline, RoleMaterial, Sphere } from '../scene/Block'
import { Placed } from '../scene/Placed'
import { pictureTexture } from '../scene/textures'

// Local space for all wall decor: the wall plane is z = 0, the room interior is +z.

export function Poster() {
  const texture = useTexture(POSTER.image)
  texture.colorSpace = SRGBColorSpace
  const { width: w, height: h } = POSTER
  const frame = 0.03

  return (
    <Placed name="poster" placement={POSTER.placement}>
      <Block role="woodDark" size={[w + 2 * frame, h + 2 * frame, 0.025]} position={[0, 0, 0.0125]} />
      <mesh position={[0, 0, 0.026]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <RoleMaterial role="paper" map={texture} />
      </mesh>
    </Placed>
  )
}

// Which picture each frame shows (by id), following the reference.
const PICTURE: Record<string, 'landscape' | 'card'> = {
  'back-photo-1': 'landscape',
  'back-photo-2': 'landscape',
  'back-photo-3': 'card',
}

function WallFrame({ spec }: { spec: FrameSpec }) {
  const { width: w, height: h } = spec
  const isPicture = spec.kind === 'picture'
  return (
    <Placed name={spec.id} placement={spec.placement}>
      {isPicture && <Block role="woodDark" size={[w, h, 0.012]} position={[0, 0, 0.006]} />}
      <mesh position={[0, 0, isPicture ? 0.0125 : 0.002]} receiveShadow>
        <boxGeometry args={[isPicture ? w - 0.025 : w, isPicture ? h - 0.025 : h, 0.002]} />
        <RoleMaterial role="paper" map={pictureTexture(isPicture ? PICTURE[spec.id] ?? 'landscape' : 'note')} />
        {!isPicture && <Outline />}
      </mesh>
      {!isPicture && <Sphere role="notepad" radius={0.009} position={[0, h / 2 - 0.02, 0.008]} />}
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
