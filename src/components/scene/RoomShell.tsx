import { DoubleSide, FrontSide } from 'three'
import { ROOM, WINDOW } from '../../config/room'
import { ACCENTS } from '../../config/palette'
import { Block } from './Block'

const BASEBOARD = { height: 0.07, depth: 0.015 }

/** Floor, back wall, left wall (with window opening) and right wall. No front wall: cutaway view. */
export function RoomShell() {
  const { width: W, depth: D, height: H, wallThickness: t } = ROOM
  const L = -W / 2
  const R = W / 2
  const B = -D / 2
  const F = D / 2

  // Left wall is split into four pieces around the window opening so sunlight can pass through.
  const winBack = WINDOW.z - WINDOW.width / 2
  const winFront = WINDOW.z + WINDOW.width / 2
  const winTop = WINDOW.sillHeight + WINDOW.height
  const lx = L - t / 2
  const leftZ0 = B - t

  return (
    <group name="room-shell">
      {/* planks run toward the back wall, as in the reference */}
      <Block
        role="floor"
        size={[W + 2 * t, 0.06, D + t]}
        position={[0, -0.03, -t / 2]}
        castShadow={false}
        noOutline
        pattern={{ kind: 'stripes', axis: 0, period: 0.17, width: 0.007, color: ACCENTS.plankSeam }}
      />

      <Block noOutline role="wall" size={[W + 2 * t, H, t]} position={[0, H / 2, B - t / 2]} />

      <group name="left-wall">
        <Block noOutline role="wall" size={[t, WINDOW.sillHeight, F - leftZ0]} position={[lx, WINDOW.sillHeight / 2, (F + leftZ0) / 2]} />
        <Block noOutline role="wall" size={[t, H - winTop, F - leftZ0]} position={[lx, (H + winTop) / 2, (F + leftZ0) / 2]} />
        <Block noOutline role="wall" size={[t, WINDOW.height, winBack - leftZ0]} position={[lx, WINDOW.sillHeight + WINDOW.height / 2, (winBack + leftZ0) / 2]} />
        <Block noOutline role="wall" size={[t, WINDOW.height, F - winFront]} position={[lx, WINDOW.sillHeight + WINDOW.height / 2, (F + winFront) / 2]} />
      </group>

      <Block noOutline role="wall" size={[t, H, D + t]} position={[R + t / 2, H / 2, -t / 2]} />

      {/* baseboards: the only lines where the walls meet the floor */}
      <Block role="woodDark" size={[W, BASEBOARD.height, BASEBOARD.depth]} position={[0, BASEBOARD.height / 2, B + BASEBOARD.depth / 2]} />
      <Block role="woodDark" size={[BASEBOARD.depth, BASEBOARD.height, D]} position={[L + BASEBOARD.depth / 2, BASEBOARD.height / 2, 0]} />
      <Block role="woodDark" size={[BASEBOARD.depth, BASEBOARD.height, D]} position={[R - BASEBOARD.depth / 2, BASEBOARD.height / 2, 0]} />

      <ShadowCeiling />
    </group>
  )
}

/**
 * Invisible to the camera (its front face points down, the camera looks from above),
 * but it casts shadows so sunlight only enters through the window, as in a real room.
 */
function ShadowCeiling() {
  return (
    <mesh position={[0, ROOM.height, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <planeGeometry args={[ROOM.width + 1, ROOM.depth + 1]} />
      <meshBasicMaterial side={FrontSide} shadowSide={DoubleSide} colorWrite={false} depthWrite={false} />
    </mesh>
  )
}
