import { BOOKSHELF } from '../../config/room'
import { Block } from '../scene/Block'
import { Placed } from '../scene/Placed'

// Cubbies that hold placeholder books/boxes: [column, row (0 = bottom), item count, item kind].
const FILLED_CELLS: [number, number, number, 'book' | 'box'][] = [
  [0, 2, 3, 'book'],
  [1, 2, 1, 'box'],
  [2, 2, 3, 'book'],
  [1, 1, 1, 'box'],
  [0, 1, 2, 'book'],
  [2, 0, 1, 'box'],
  [1, 0, 2, 'book'],
]

// Local space: open face toward +z, back against the bed's foot at -z.
export function Bookshelf() {
  const { width: w, depth: d, height: h, rows, columns } = BOOKSHELF
  const board = 0.04
  const rowH = (h - board) / rows
  const colW = w / columns

  return (
    <Placed name="bookshelf" placement={BOOKSHELF.placement}>
      {Array.from({ length: rows + 1 }, (_, i) => (
        <Block key={`row-${i}`} role="white" size={[w, board, d]} position={[0, i * rowH + board / 2, 0]} radius={i === rows ? 0.02 : 0} />
      ))}
      {Array.from({ length: columns + 1 }, (_, j) => (
        <Block key={`col-${j}`} role="white" size={[0.03, h, d]} position={[-w / 2 + j * colW, h / 2, 0]} />
      ))}
      <Block role="white" size={[w, h, 0.015]} position={[0, h / 2, -d / 2 + 0.0075]} />

      {FILLED_CELLS.map(([col, row, count, kind]) => {
        const x0 = -w / 2 + col * colW
        const y0 = row * rowH + board
        const inner = rowH - board
        if (kind === 'box') {
          return (
            <Block
              key={`${col}-${row}`}
              role="paper"
              size={[colW * 0.75, inner * 0.55, d * 0.75]}
              position={[x0 + colW / 2, y0 + (inner * 0.55) / 2, 0.02]}
            />
          )
        }
        const bookW = 0.05
        return Array.from({ length: count }, (_, k) => (
          <Block
            key={`${col}-${row}-${k}`}
            role="paper"
            size={[bookW, inner * 0.82, d * 0.7]}
            position={[x0 + 0.04 + bookW / 2 + k * (bookW + 0.005), y0 + (inner * 0.82) / 2, 0.02]}
          />
        ))
      })}
    </Placed>
  )
}
