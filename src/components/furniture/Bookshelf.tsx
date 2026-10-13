import { useMemo } from 'react'
import { BOOKSHELF } from '../../config/room'
import { BOOK_COLORS } from '../../config/palette'
import { Block, Outline, getMaterial } from '../scene/Block'
import { Placed } from '../scene/Placed'
import { RoundedSlab } from '../scene/RoundedSlab'
import { labelTexture } from '../scene/textures'

type BookColor = keyof typeof BOOK_COLORS

interface ItemSpec {
  kind: 'book' | 'lying' | 'exit'
  color: BookColor
  label?: string
  /** relative height (books) or thickness (lying) */
  size?: number
}

// What sits in each cubby, following the reference: [column (0 = left), row (0 = bottom), items].
const CONTENTS: [number, number, ItemSpec[]][] = [
  [0, 2, [
    { kind: 'book', color: 'white', label: 'Python', size: 0.86 },
    { kind: 'book', color: 'teal', label: 'React', size: 0.9 },
    { kind: 'book', color: 'blue', label: 'React', size: 0.88 },
  ]],
  [1, 2, [
    { kind: 'lying', color: 'blue', label: 'Kubernetes', size: 0.05 },
    { kind: 'lying', color: 'white', label: 'Docker', size: 0.08 },
  ]],
  [0, 1, [
    { kind: 'book', color: 'teal', size: 0.8 },
    { kind: 'book', color: 'olive', size: 0.84 },
    { kind: 'book', color: 'navy', size: 0.78 },
  ]],
  [1, 1, [{ kind: 'exit', color: 'exit', label: 'EXIT' }]],
  [2, 1, [
    { kind: 'book', color: 'teal', label: 'CURD', size: 0.88 },
    { kind: 'book', color: 'brown', size: 0.84 },
    { kind: 'book', color: 'navy', size: 0.86 },
    { kind: 'book', color: 'white', label: 'RAG', size: 0.85 },
  ]],
  [1, 0, [
    { kind: 'lying', color: 'navy', size: 0.04 },
    { kind: 'lying', color: 'blue', size: 0.045 },
  ]],
  [2, 0, [{ kind: 'exit', color: 'exit', label: 'EXIT' }]],
]

/** A box whose front (+z) face carries a printed label; the other faces are plain. */
function LabeledBox({ size, position, color, label, vertical, exit }: {
  size: [number, number, number]
  position: [number, number, number]
  color: BookColor
  label?: string
  vertical: boolean
  exit?: boolean
}) {
  const materials = useMemo(() => {
    const bg = BOOK_COLORS[color]
    const fg = color === 'white' ? '#2b2725' : exit ? '#f2c230' : '#f4efe4'
    const plain = getMaterial('paper', undefined, labelTexture('', bg, fg, false))
    const front = getMaterial('paper', undefined, labelTexture(label ?? '', bg, fg, vertical, exit ? 'exit' : undefined))
    return [plain, plain, plain, plain, front, plain]
  }, [color, label, vertical, exit])
  return (
    <mesh position={position} material={materials} castShadow receiveShadow>
      <boxGeometry args={size} />
      <Outline />
    </mesh>
  )
}

// Local space: open face toward +z, back toward the bed at -z.
export function Bookshelf() {
  const { width: w, depth: d, height: h, rows, columns } = BOOKSHELF
  const board = 0.035
  const rowH = (h - board) / rows
  const colW = w / columns
  const side = 0.03
  const R = 0.13 // big rounded front corners, the shelf's signature shape in the reference

  return (
    <Placed name="bookshelf" placement={BOOKSHELF.placement}>
      {Array.from({ length: rows + 1 }, (_, i) => (
        <RoundedSlab
          key={`row-${i}`}
          role="white"
          width={i === rows ? w + 0.04 : w}
          depth={i === rows ? d + 0.03 : d}
          thickness={board}
          radii={[0.03, 0.03, R, R]}
          position={[0, i * rowH + board / 2, i === rows ? 0.012 : 0]}
        />
      ))}
      {Array.from({ length: columns - 1 }, (_, j) => (
        <Block key={`div-${j}`} role="white" size={[0.025, h - board, d - 0.04]} position={[-w / 2 + (j + 1) * colW, (h - board) / 2, -0.02]} />
      ))}
      {[-1, 1].map((s) => (
        <Block key={`end-${s}`} role="white" size={[side, h - board, d - R * 0.9]} position={[s * (w / 2 - side / 2), (h - board) / 2, -R * 0.45]} />
      ))}
      <Block role="white" size={[w - 0.02, h - board, 0.012]} position={[0, (h - board) / 2, -d / 2 + 0.006]} />

      {CONTENTS.flatMap(([col, row, items]) => {
        const x0 = -w / 2 + col * colW + 0.03
        const y0 = row * rowH + board
        const inner = rowH - board
        let x = x0
        let y = y0
        return items.map((it, k) => {
          const key = `${col}-${row}-${k}`
          if (it.kind === 'exit') {
            const bw = colW * 0.72, bh = inner * 0.42, bd = d * 0.62
            return <LabeledBox key={key} size={[bw, bh, bd]} position={[x0 + bw / 2 + 0.005, y0 + bh / 2, 0.03]} color="exit" label="EXIT" vertical={false} exit />
          }
          if (it.kind === 'lying') {
            const bw = colW * 0.78, bh = it.size ?? 0.05, bd = d * 0.6
            const node = <LabeledBox key={key} size={[bw, bh, bd]} position={[x0 + bw / 2, y + bh / 2, 0.03]} color={it.color} label={it.label} vertical={false} />
            y += bh
            return node
          }
          const bw = 0.052, bh = inner * (it.size ?? 0.85), bd = d * 0.62
          const node = <LabeledBox key={key} size={[bw, bh, bd]} position={[x + bw / 2, y0 + bh / 2, 0.03]} color={it.color} label={it.label} vertical />
          x += bw + 0.004
          return node
        })
      })}
    </Placed>
  )
}
