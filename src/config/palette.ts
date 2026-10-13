// Material roles → colors. Geometry never hardcodes colors; it asks for a role.
// Colors are sampled from the reference illustration (docs/reference-match/reference-original.png),
// taken from evenly lit areas so the toon shading (Block.tsx) can add the light/shadow steps itself.

export type MaterialRole =
  | 'wall'
  | 'floor'
  | 'wood'
  | 'woodDark'
  | 'wardrobe'
  | 'white'
  | 'fabric'
  | 'fabricAccent'
  | 'sheet'
  | 'curtain'
  | 'metal'
  | 'black'
  | 'paper'
  | 'glass'
  | 'rug'
  | 'chair'
  | 'gold'
  | 'apple'
  | 'bookCover'
  | 'notepad'
  | 'door'
  | 'placeholder'

export const PALETTE: Record<MaterialRole, string> = {
  wall: '#ecdcbc', // warm cream plaster
  floor: '#9c6a3e', // honey-brown wood planks
  wood: '#b98552', // bed frame, desk
  woodDark: '#7a5233', // frames, legs, plinths
  wardrobe: '#a8683a', // the wardrobe reads a little more orange than the desk
  white: '#f1ebdc', // bookshelf, window frame (off-white, not pure)
  fabric: '#f3eee2', // duvet, cream
  fabricAccent: '#efe9dc', // pillows
  sheet: '#8cc3cf', // light-blue fitted sheet
  curtain: '#f6c43c', // yellow curtains
  metal: '#4a4744', // rods, handles, chair frame
  black: '#2b2725',
  paper: '#efe6d2',
  glass: '#cfe6f2',
  rug: '#f1e5cc',
  chair: '#b8402d', // red chair
  gold: '#c9a043',
  apple: '#b5352a',
  bookCover: '#a8a57a', // grey-green big book under the apple
  notepad: '#e7b13c',
  door: '#dccdb1', // greyish beige door leaf
  placeholder: '#d9b8c4',
}

// Pattern colors (stripes, borders, plank seams)
export const ACCENTS = {
  stripe: '#4f9fd3', // blue stripes on the duvet and pillows
  rugBorder: '#d96a55', // thin red line inset on the rug
  plankSeam: '#8a5c33',
}

// Book and box covers seen on the shelf and desk in the reference
export const BOOK_COLORS = {
  white: '#ece6d6',
  teal: '#2f8a8f',
  blue: '#2f63b0',
  navy: '#2c3e63',
  olive: '#7f8a55',
  brown: '#8a6a4a',
  cream: '#e6d6b2',
  exit: '#3a1d1a',
}

export const EDGE_COLOR = '#3b2f27' // warm dark brown, like a pencil line
