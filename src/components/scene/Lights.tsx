import { useLayoutEffect, useRef } from 'react'
import type { DirectionalLight } from 'three'

// Sun comes from outside the left wall and enters only through the window.
const SUN_POSITION: [number, number, number] = [-5, 4.5, -3.5]
const SUN_TARGET: [number, number, number] = [0.5, 0, 0.5]

export function Lights() {
  const sun = useRef<DirectionalLight>(null)

  useLayoutEffect(() => {
    sun.current?.target.position.set(...SUN_TARGET)
    sun.current?.target.updateMatrixWorld()
  }, [])

  return (
    <>
      <hemisphereLight args={['#ffffff', '#cfc8bd', 1.6]} />
      <directionalLight
        ref={sun}
        position={SUN_POSITION}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      {/* soft fill from above, no shadows, keeps shaded faces readable */}
      <directionalLight position={[1, 6, 4]} intensity={0.5} />
    </>
  )
}
