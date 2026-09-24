// English TTS via the browser's own speechSynthesis — same voice-picking logic as
// the original Python engine's SPEAK script (gen.py), ported to a Vue-callable helper.

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices()
  return (
    voices.find((v) => /en[-_]CA/i.test(v.lang)) ||
    voices.find((v) => /Aria|Jenny|Guy|Natural/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0]
  )
}

// [[g:...]] [[c:...]] [[w:...]] [[x:...]] -> plain text, and strip any other HTML tags
export function stripForSpeech(s: string): string {
  return s
    .replace(/\[\[[gcwx]:(.+?)\]\]/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim()
}

let primed = false

export function speak(text: string, rate = 1): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  if (!primed) {
    speechSynthesis.getVoices() // warms up the voice list on first use
    primed = true
  }
  speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(stripForSpeech(text))
  utter.rate = rate
  utter.lang = 'en-CA'
  const voice = pickVoice()
  if (voice) utter.voice = voice
  speechSynthesis.speak(utter)
}

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
