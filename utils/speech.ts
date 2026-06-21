let lastSpoken = 0;
const COOLDOWN = 3000;

function stripEmojis(text: string): string {
  // Remove all emoji unicode characters so TTS doesn't read "grinning face" etc.
  return text
    .replace(/\p{Emoji}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speak(text: string, force = false) {
  if (typeof window === 'undefined') return;
  if (!force && Date.now() - lastSpoken < COOLDOWN) return;

  const clean = stripEmojis(text);
  if (!clean) return;

  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'hi-IN';
  u.rate = 0.9;
  u.pitch = 1.05;

  const voices = speechSynthesis.getVoices();
  const v =
    voices.find((v) => v.lang === 'hi-IN') ||
    voices.find((v) => v.lang.startsWith('hi'));
  if (v) u.voice = v;

  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  lastSpoken = Date.now();
}

export function resetSpeechCooldown() {
  lastSpoken = 0;
}
