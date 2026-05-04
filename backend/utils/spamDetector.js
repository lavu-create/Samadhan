/**
 * spamDetector.js
 * ───────────────
 * AI-inspired rule-based spam / invalid complaint detection.
 * No external APIs or ML models required — uses linguistic heuristics
 * that are easy to explain and audit.
 *
 * Usage:
 *   const { isSpam, reason } = detectSpam(description);
 *   if (isSpam) return res.status(400).json({ success: false, message: ... });
 */

// ── Known meaningless / test words ───────────────────────────────────────────
const SPAM_WORDS = new Set([
  'test', 'testing', 'hello', 'hi', 'hey', 'dummy', 'spam', 'abc', 'xyz',
  'asdf', 'qwerty', 'qwertyuiop', 'zxcvbn', 'foo', 'bar', 'baz', 'blah',
  'lol', 'ok', 'okay', 'nothing', 'na', 'n/a', 'none', 'idk', 'dunno',
  'random', 'sample', 'placeholder', 'lorem', 'ipsum',
]);

// ── Explicit banned phrases (detected anywhere in the text) ───────────────────
const BANNED_PHRASES = [
  /\btest\s+test\b/i,
  /\bhello\s+hello\b/i,
  /\basdf(\s+asdf){1,}/i,
  /\brandom\s+random\b/i,
  /\bdummy\s+complaint\b/i,
  /\bqwertyuiop\b/i,
];

// ── Keyboard-mash character sequences ────────────────────────────────────────
const KEYBOARD_MASH_PATTERNS = [
  /^[asdfghjkl;']+$/i,    // home row
  /^[qwertyuiop\[\]]+$/i, // top row
  /^[zxcvbnm,./]+$/i,     // bottom row
  /^[aeiou]+$/i,           // only vowels
  /^[0-9\s]+$/,            // only digits
];

/**
 * @param {string} text — the complaint description
 * @returns {{ isSpam: boolean, reason: string }}
 */
function detectSpam(text) {
  if (!text || typeof text !== 'string') {
    return { isSpam: true, reason: 'Description is missing or invalid.' };
  }

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  console.log(`[spamDetector] Analyzing: "${trimmed.slice(0, 80)}" (len=${trimmed.length})`);

  // ── Rule 1: Too short ─────────────────────────────────────────────────────
  if (trimmed.length < 15) {
    return { isSpam: true, reason: 'Description is too short (min 15 characters).' };
  }

  // ── Rule 2: Single repeated character (e.g. "aaaaaaa", "!!!!!!") ─────────
  if (/^(.)\1{4,}$/.test(trimmed.replace(/\s/g, ''))) {
    return { isSpam: true, reason: 'Description appears to be repeated characters.' };
  }

  // ── Rule 3: Explicit banned phrases ──────────────────────────────────────
  for (const pattern of BANNED_PHRASES) {
    if (pattern.test(lower)) {
      console.log(`[spamDetector] REJECTED by banned phrase: ${pattern}`);
      return { isSpam: true, reason: 'Description contains a banned/test phrase.' };
    }
  }

  const words = lower.split(/\s+/).filter(Boolean);

  // ── Rule 4: All words are the same (e.g. "random random random") ─────────
  if (words.length > 1 && words.every(w => w === words[0])) {
    return { isSpam: true, reason: 'Description repeats the same word.' };
  }

  // ── Rule 5: Composed entirely of spam/test words ──────────────────────────
  const nonSpamWords = words.filter(w => !SPAM_WORDS.has(w.replace(/[^a-z]/g, '')));
  if (words.length >= 2 && nonSpamWords.length === 0) {
    return { isSpam: true, reason: 'Description contains only meaningless or test words.' };
  }

  // ── Rule 6: Keyboard mash (entire body is mash characters) ───────────────
  const noSpaces = trimmed.replace(/\s/g, '');
  if (noSpaces.length >= 6) {
    for (const pattern of KEYBOARD_MASH_PATTERNS) {
      if (pattern.test(noSpaces)) {
        return { isSpam: true, reason: 'Description looks like random keystrokes.' };
      }
    }
  }

  // ── Rule 7: Very low unique-word ratio (high repetition) ──────────────────
  if (words.length >= 4) {
    const uniqueRatio = new Set(words).size / words.length;
    if (uniqueRatio < 0.35) {
      return { isSpam: true, reason: 'Description repeats the same words too many times.' };
    }
  }

  // ── Rule 8: Majority of words are spam words ──────────────────────────────
  if (words.length >= 3) {
    const spamWordCount = words.filter(w => SPAM_WORDS.has(w.replace(/[^a-z]/g, ''))).length;
    if (spamWordCount / words.length > 0.7) {
      return { isSpam: true, reason: 'Description is mostly spam or test words.' };
    }
  }

  console.log('[spamDetector] PASSED — looks like a valid complaint.');
  return { isSpam: false, reason: '' };
}

module.exports = { detectSpam };
