// Subset of gen.py's icon set (I dict) — stroke-based 24x24 SVGs, inherit currentColor.
const PATHS: Record<string, string> = {
  flag: '<path d="M5 21V4"/><path d="M5 5h11l-2 3 2 3H5"/>',
  handshake: '<path d="m8 12 3-3 3 3 3-3"/><path d="M3 10h4l4 4 2-2 3 3h5"/>',
  layers: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 14 9 5 9-5"/>',
  quote: '<path d="M8 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3V7Zm0 0c0 5-1 7-4 8"/><path d="M19 7h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3V7Zm0 0c0 5-1 7-4 8"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M8 7h7M8 11h7"/>',
  mic: '<rect x="9" y="3" width="6" height="10" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>',
  pencil: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14 7 3 3"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  clip: '<path d="M14 3v6h6"/><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-5-6Z"/>',
}

export function ico(name: string, size = 15): string {
  const p = PATHS[name] || ''
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`
}
