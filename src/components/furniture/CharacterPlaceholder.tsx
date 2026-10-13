import { useContext, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { DoubleSide, PerspectiveCamera, SRGBColorSpace, Vector3 } from 'three'
import { CAMERA, CHARACTER } from '../../config/room'
import { Block, DebugContext, Sphere } from '../scene/Block'

// `?character=placeholder` shows the old volume stand-in instead of the 2D character layer.
const variant = new URLSearchParams(window.location.search).get('character') ?? CHARACTER.variant

export function Character() {
  return variant === 'placeholder' ? <CharacterPlaceholder /> : <CharacterLayer />
}

/** The default camera, rebuilt from config (independent of the live camera, which may orbit). */
function defaultCamera() {
  const cam = new PerspectiveCamera(CAMERA.fov, CAMERA.aspect, 0.1, 100)
  cam.position.set(...CAMERA.position)
  cam.lookAt(new Vector3(...CAMERA.target))
  cam.rotateZ(CAMERA.roll)
  cam.updateMatrixWorld()
  return cam
}

/**
 * The character cut out of the reference (tools/extract_character.py), placed as a camera-facing
 * card so that, from the default camera, it covers exactly the area she occupies in the reference.
 * Its depth comes from where her hips meet the duvet. She is drawn on top in the default view (nothing
 * in the room is in front of her there); in free view she is depth-tested like everything else.
 * Limitation: as a flat card she reads correctly only from (near) the default camera.
 */
function CharacterLayer() {
  const texture = useTexture(CHARACTER.image)
  texture.colorSpace = SRGBColorSpace
  const { free } = useContext(DebugContext)

  const { position, quaternion, width, height } = useMemo(() => {
    const cam = defaultCamera()
    const { x, y, width: w, height: h, refWidth, refHeight } = CHARACTER.rect
    const toNdc = (u: number, v: number) => new Vector3((u / refWidth) * 2 - 1, 1 - (v / refHeight) * 2, 0.5)

    // depth: cast a ray through her hips and intersect the duvet surface
    const [hu, hv] = CHARACTER.hipPixel
    const hip = toNdc(hu, hv).unproject(cam).sub(cam.position).normalize()
    const t = (CHARACTER.hipHeight - cam.position.y) / hip.y
    const hipWorld = cam.position.clone().addScaledVector(hip, t)
    const forward = new Vector3(0, 0, -1).applyQuaternion(cam.quaternion)
    const depth = hipWorld.clone().sub(cam.position).dot(forward)

    // a point at that depth for any reference pixel
    const at = (u: number, v: number) => {
      const dir = toNdc(u, v).unproject(cam).sub(cam.position)
      return cam.position.clone().addScaledVector(dir, depth / dir.dot(forward))
    }
    const tl = at(x, y)
    const tr = at(x + w, y)
    const bl = at(x, y + h)
    const center = at(x + w / 2, y + h / 2)
    return { position: center, quaternion: cam.quaternion.clone(), width: tl.distanceTo(tr), height: tl.distanceTo(bl) }
  }, [])

  return (
    <mesh name="character" position={position} quaternion={quaternion} renderOrder={free ? 0 : 10}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.05} depthTest={free} depthWrite={false} side={DoubleSide} toneMapped={false} />
    </mesh>
  )
}

/** Original volume stand-in for the character sitting against the pillows with a laptop. */
function CharacterPlaceholder() {
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
