// Port of unit.py's mark(): [[g:…]] grammar · [[c:…]] collocation · [[w:…]] word · [[x:…]] cert term
export function mark(s: string): string {
  if (!s) return ''
  return s.replace(/\[\[([gcwx]):(.+?)\]\]/g, (_m, k, txt) => `<b class="${k}">${txt}</b>`)
}
