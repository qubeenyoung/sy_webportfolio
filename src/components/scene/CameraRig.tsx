import { useLayoutEffect, useRef, type ComponentRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import { CAMERA, type CameraType } from '../../config/room'

/** Latest camera pose, readable from outside the Canvas (for "copy camera" in the debug panel). */
export const cameraProbe = {
  position: [...CAMERA.position] as number[],
  target: [...CAMERA.target] as number[],
}

const round = (v: number) => Math.round(v * 1000) / 1000

interface CameraRigProps {
  type: CameraType
  /** Free orbit for inspecting the room; off = locked to the configured composition. */
  free: boolean
}

export function CameraRig({ type, free }: CameraRigProps) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const camera = useThree((s) => s.camera)
  const height = useThree((s) => s.size.height)
  const target = new Vector3(...CAMERA.target)

  // Orthographic sits farther back along the same view direction; distance doesn't change its framing.
  const orthoPosition = new Vector3(...CAMERA.position).sub(target).multiplyScalar(3).add(target)

  useLayoutEffect(() => {
    camera.lookAt(target)
    if (!free) camera.rotateZ(CAMERA.roll)
    camera.updateProjectionMatrix()
    // Re-aim whenever the camera object is swapped or the composition is reset.
  }, [camera, type, free])

  useFrame(() => {
    cameraProbe.position = camera.position.toArray().map(round)
    cameraProbe.target = (controls.current?.target.toArray() ?? CAMERA.target).map(round)
  })

  return (
    <>
      {type === 'perspective' ? (
        <PerspectiveCamera key={`p-${free}`} makeDefault position={CAMERA.position} fov={CAMERA.fov} near={0.1} far={100} />
      ) : (
        <OrthographicCamera
          key={`o-${free}`}
          makeDefault
          position={orthoPosition.toArray()}
          zoom={height / CAMERA.orthoViewHeight}
          near={0.1}
          far={100}
        />
      )}
      {free && <OrbitControls ref={controls} target={CAMERA.target} makeDefault />}
    </>
  )
}
