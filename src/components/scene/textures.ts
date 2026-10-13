// Small procedural canvas textures (no external assets). Seeded so every load looks the same.
import { CanvasTexture, SRGBColorSpace } from 'three'

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function toTexture(c: HTMLCanvasElement) {
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  return t
}

const memo = new Map<string, CanvasTexture>()
function cached(key: string, make: () => CanvasTexture) {
  let t = memo.get(key)
  if (!t) memo.set(key, (t = make()))
  return t
}

/** Blue sky with soft white clouds above a band of tree tops, as seen through the window in the reference. */
export function skyTexture() {
  return cached('sky', () => {
    const [c, g] = canvas(512, 512)
    const grad = g.createLinearGradient(0, 0, 0, 512)
    grad.addColorStop(0, '#5aa9de')
    grad.addColorStop(1, '#9fd0ee')
    g.fillStyle = grad
    g.fillRect(0, 0, 512, 512)
    const r = rng(7)
    g.fillStyle = '#ffffff'
    for (const [cx, cy, s] of [[120, 90, 0.8], [360, 50, 0.7], [300, 160, 0.6], [70, 190, 0.5]]) {
      for (let i = 0; i < 9; i++) {
        g.beginPath()
        g.arc(cx + (r() - 0.5) * 120 * s, cy + (r() - 0.5) * 40 * s, (18 + r() * 26) * s, 0, Math.PI * 2)
        g.fill()
      }
    }
    // tree tops filling the lower half (the camera looks down through the window)
    const greens = ['#4f6b45', '#5f7d4c', '#6e8b52', '#7c9a5a', '#c98a3c', '#d9a24a']
    for (let i = 0; i < 900; i++) {
      const x = r() * 512
      const y = 250 + Math.pow(r(), 0.7) * 262 - Math.sin(x / 40) * 18
      g.fillStyle = greens[Math.floor(r() * greens.length)]
      g.beginPath()
      g.ellipse(x, y, 8 + r() * 12, 5 + r() * 7, r() * Math.PI, 0, Math.PI * 2)
      g.fill()
    }
    return toTexture(c)
  })
}

/**
 * Foliage just outside the window: opaque leaf clusters on transparent background.
 * Seen through the window it reads as the trees in the reference; lit by the sun it casts the
 * dappled leaf shadows onto the bed and floor.
 */
export function foliageTexture() {
  return cached('foliage', () => {
    const [c, g] = canvas(512, 512)
    const r = rng(11)
    const colors = ['#4f6b45', '#5f7d4c', '#6e8b52', '#c98a3c', '#7c9a5a']
    // clusters: [x, y, radius] in canvas px — dense along the bottom and the sides, open in the middle
    const clusters: [number, number, number][] = [
      [40, 470, 120], [170, 500, 110], [330, 490, 120], [480, 460, 110],
      [20, 300, 80], [500, 280, 70], [60, 110, 55], [470, 80, 50],
    ]
    for (const [cx, cy, rad] of clusters) {
      for (let i = 0; i < 48; i++) {
        const a = r() * Math.PI * 2
        const d = Math.sqrt(r()) * rad
        const x = cx + Math.cos(a) * d
        const y = cy + Math.sin(a) * d
        g.fillStyle = colors[Math.floor(r() * colors.length)]
        g.beginPath()
        // a leaf: small rotated ellipse
        g.ellipse(x, y, 7 + r() * 9, 4 + r() * 5, r() * Math.PI, 0, Math.PI * 2)
        g.fill()
      }
    }
    return toTexture(c)
  })
}

/**
 * Light cookie for the floor beams: two long window-pane shapes (bright) separated by the
 * mullion, with a cross bar and leaf shadows nibbling at them, on black (no light).
 * Drawn rotated a quarter turn so the beams run along the light's heading once projected.
 */
export function beamCookieTexture() {
  return cached('beam-cookie', () => {
    const [c, g] = canvas(512, 512)
    g.fillStyle = '#000'
    g.fillRect(0, 0, 512, 512)
    g.translate(256, 256)
    g.rotate(Math.PI / 2)
    g.translate(-256, -256)
    g.fillStyle = '#fff'
    // two panes per column, slightly skewed like light through a window at an angle
    const panes: [number, number, number, number][] = [
      [128, 40, 92, 190], [292, 30, 92, 190],
      [136, 250, 92, 215], [300, 240, 92, 215],
    ]
    for (const [x, y, w, h] of panes) {
      g.beginPath()
      g.moveTo(x + 14, y)
      g.lineTo(x + w + 14, y)
      g.lineTo(x + w, y + h)
      g.lineTo(x, y + h)
      g.closePath()
      g.fill()
    }
    // leaf shadows along the beam edges
    const r = rng(23)
    g.fillStyle = '#000'
    for (let i = 0; i < 140; i++) {
      const edge = r() < 0.5 ? 118 + r() * 40 : 340 + r() * 50
      const x = r() < 0.7 ? edge : 120 + r() * 270
      const y = 30 + r() * 440
      g.beginPath()
      g.ellipse(x, y, 5 + r() * 9, 3 + r() * 6, r() * Math.PI, 0, Math.PI * 2)
      g.fill()
    }
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return t
  })
}

/** Small wall pictures and notes from the reference: a landscape photo, a blue card, a memo. */
export function pictureTexture(kind: 'landscape' | 'card' | 'note') {
  return cached(`picture|${kind}`, () => {
    const [c, g] = canvas(128, 128)
    if (kind === 'landscape') {
      g.fillStyle = '#7fbde0'
      g.fillRect(0, 0, 128, 128)
      g.fillStyle = '#f3efe2'
      g.beginPath(); g.arc(40, 40, 16, 0, Math.PI * 2); g.fill()
      g.fillStyle = '#4f7d8f'
      g.beginPath(); g.moveTo(0, 96); g.lineTo(52, 50); g.lineTo(92, 84); g.lineTo(128, 64); g.lineTo(128, 128); g.lineTo(0, 128); g.fill()
      g.fillStyle = '#d98a3c'
      g.fillRect(0, 104, 128, 24)
    } else if (kind === 'card') {
      g.fillStyle = '#f4f0e6'
      g.fillRect(0, 0, 128, 128)
      g.fillStyle = '#3f8fcf'
      g.fillRect(12, 14, 104, 64)
      g.fillStyle = '#f4f0e6'
      g.beginPath(); g.moveTo(40, 60); g.lineTo(64, 34); g.lineTo(84, 60); g.fill()
      g.fillStyle = '#9aa3ab'
      for (let i = 0; i < 3; i++) g.fillRect(18, 90 + i * 11, 90 - i * 20, 4)
    } else {
      g.fillStyle = '#f2e3a6'
      g.fillRect(0, 0, 128, 128)
      g.fillStyle = '#b9a56b'
      for (let i = 0; i < 6; i++) g.fillRect(16, 30 + i * 15, 96 - (i % 3) * 18, 4)
    }
    return toTexture(c)
  })
}

/** Book spine / box face label: solid background with vertical (spine) or horizontal text. */
export function labelTexture(text: string, bg: string, fg: string, vertical: boolean, extra?: 'exit') {
  return cached(`label|${text}|${bg}|${fg}|${vertical}|${extra ?? ''}`, () => {
    const [w, h] = vertical ? [64, 256] : [256, 128]
    const [c, g] = canvas(w, h)
    g.fillStyle = bg
    g.fillRect(0, 0, w, h)
    if (extra === 'exit') {
      // the "EXIT" game boxes: dark red-black pixel pattern behind the title
      const r = rng(5)
      for (let i = 0; i < 90; i++) {
        g.fillStyle = ['#7a1f1c', '#b23a2a', '#3a1d1a', '#d0563a'][Math.floor(r() * 4)]
        g.fillRect(Math.floor(r() * 16) * 16, Math.floor(r() * 8) * 16, 16, 16)
      }
    }
    if (text) {
      g.fillStyle = fg
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      if (vertical) {
        g.translate(w / 2, h / 2)
        g.rotate(Math.PI / 2)
        g.font = 'bold 34px "Segoe UI", Arial, sans-serif'
        g.fillText(text, 0, 2)
      } else {
        g.font = `bold ${extra === 'exit' ? 64 : 44}px "Segoe UI", Arial, sans-serif`
        g.fillText(text, w / 2, h / 2 + 2)
      }
    }
    return toTexture(c)
  })
}
