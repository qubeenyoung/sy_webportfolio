// Material roles → colors. Geometry never hardcodes colors; it asks for a role.
// Stage 1 uses neutral greys only, so the layout can be judged without style.
// Stage 2 (art style) replaces this table (and the material in Block.tsx), not the furniture.

export type MaterialRole =
  | 'wall'
  | 'floor'
  | 'wood'
  | 'woodDark'
  | 'white'
  | 'fabric'
  | 'fabricAccent'
  | 'curtain'
  | 'metal'
  | 'paper'
  | 'glass'
  | 'rug'
  | 'placeholder'

export const PALETTE: Record<MaterialRole, string> = {
  wall: '#e8e5e0',
  floor: '#c9c2b7',
  wood: '#bdb3a6',
  woodDark: '#a39889',
  white: '#f3f1ed',
  fabric: '#dedad4',
  fabricAccent: '#cdc8c1',
  curtain: '#d6d1c8',
  metal: '#86837f',
  paper: '#e4e0d8',
  glass: '#d2e0e6',
  rug: '#ebe8e2',
  placeholder: '#d9b8c4',
}

export const EDGE_COLOR = '#55514c'
