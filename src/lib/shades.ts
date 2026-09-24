// Port of gen.py's colorsys-based shades() — same hue math as the Python engine.
export type Hue = [number, number, number] // [h(0-360), s(0-1), l(0-1)]

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

function hlsToRgb(h: number, l: number, s: number): [number, number, number] {
  if (s === 0) return [l, l, l]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)]
}

function hexOf(h: number, s: number, l: number): string {
  const [r, g, b] = hlsToRgb(h / 360, l, s)
  const to255 = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase()
  return `#${to255(r)}${to255(g)}${to255(b)}`
}

export interface Shades {
  hero: string
  sub: string
  txt: string
  chip: string
  chipInk: string
}

export function shades(hue: Hue): Shades {
  const [h, s, l] = hue
  return {
    hero: hexOf(h, s, l),
    sub: hexOf(h, 0.3, 0.74),
    txt: hexOf(h, 0.28, 0.86),
    chip: hexOf(h, 0.55, 0.94),
    chipInk: hexOf(h, 0.6, 0.32),
  }
}
