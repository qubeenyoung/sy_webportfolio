import { ROOM, WINDOW, FACING } from '../../config/room'
import { Block, Cylinder } from '../scene/Block'
import { Placed } from '../scene/Placed'

// Local space: the wall plane is z = 0, the room interior is +z, x runs along the wall.
export function Window() {
  const { width: w, height: h, sillHeight, curtain } = WINDOW
  const t = ROOM.wallThickness
  const bar = 0.06
  const cy = sillHeight + h / 2

  return (
    <Placed name="window" placement={{ position: [-ROOM.width / 2, 0, WINDOW.z], rotationY: FACING.right }}>
      {/* frame */}
      <Block role="white" size={[w, bar, t + 0.02]} position={[0, sillHeight + h - bar / 2, -t / 2]} />
      <Block role="white" size={[w, bar, t + 0.02]} position={[0, sillHeight + bar / 2, -t / 2]} />
      <Block role="white" size={[bar, h, t + 0.02]} position={[-w / 2 + bar / 2, cy, -t / 2]} />
      <Block role="white" size={[bar, h, t + 0.02]} position={[w / 2 - bar / 2, cy, -t / 2]} />
      <Block role="white" size={[0.04, h, 0.05]} position={[0, cy, -t / 2]} />
      <Block role="glass" size={[w - 2 * bar, h - 2 * bar, 0.01]} position={[0, cy, -t / 2]} castShadow={false} />

      {/* sill */}
      <Block role="white" size={[w + 0.12, 0.04, 0.12]} position={[0, sillHeight - 0.02, 0.06]} />

      {/* curtain rod + panels */}
      <Cylinder
        role="metal"
        radiusTop={0.015}
        height={curtain.rodLength}
        position={[0, curtain.rodHeight, curtain.offsetFromWall]}
        rotation={[0, 0, Math.PI / 2]}
      />
      {curtain.panelOffsets.map((x) => (
        <Block
          key={x}
          role="curtain"
          size={[curtain.panelWidth, curtain.drop, 0.05]}
          position={[x, curtain.rodHeight - curtain.drop / 2, curtain.offsetFromWall]}
          radius={0.02}
        />
      ))}
    </Placed>
  )
}
