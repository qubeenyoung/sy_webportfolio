import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { DirectionalLight, SpotLight } from 'three'
import { beamCookieTexture } from './textures'

// Sun comes from outside the left wall and enters only through the window (the invisible shadow
// ceiling blocks the rest). It lights the bed and casts the leaf shadows from the foliage card.
const SUN_TARGET: [number, number, number] = [0.4, 0, 0.1]
const SUN_DIR: [number, number, number] = [-0.74, 0.64, 0.16] // from target toward the sun
const SUN_POSITION: [number, number, number] = SUN_TARGET.map((t, i) => t + SUN_DIR[i] * 8) as [number, number, number]

// The reference also shows long diagonal beams of window light on the floor between the bed and
// the desk, which no physically placed window in this room could produce (the bed would block
// them). They are art-directed: a spotlight inside the room projects a window-pane cookie
// exactly onto the floor area where the beams are in the reference (unprojected from its pixels).
const BEAM_TARGET: [number, number, number] = [0.55, 0, -0.42]
const BEAM_POSITION: [number, number, number] = [-0.26, 2.3, -1.55]

export function Lights() {
  const sun = useRef<DirectionalLight>(null)
  const beam = useRef<SpotLight>(null)
  const scene = useThree((s) => s.scene)

  useLayoutEffect(() => {
    sun.current?.target.position.set(...SUN_TARGET)
    sun.current?.target.updateMatrixWorld()
    const spot = beam.current
    if (spot) {
      spot.target.position.set(...BEAM_TARGET)
      scene.add(spot.target)
      spot.target.updateMatrixWorld()
    }
    return () => {
      if (spot) scene.remove(spot.target)
    }
  }, [scene])

  return (
    <>
      {/* warm ambient: shadowed areas stay readable, like the soft fills in the reference */}
      <hemisphereLight args={['#fff6e8', '#d8b38a', 2.6]} />
      <directionalLight
        ref={sun}
        position={SUN_POSITION}
        color="#ffe9c4"
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      <spotLight
        ref={beam}
        position={BEAM_POSITION}
        color="#ffe9b8"
        intensity={2.6}
        angle={0.42}
        penumbra={0.05}
        decay={0}
        distance={0}
        map={beamCookieTexture()}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
      />
      {/* soft fill from the camera side, no shadows */}
      <directionalLight position={[1, 6, 5]} intensity={0.9} color="#fff8ee" />
    </>
  )
}
