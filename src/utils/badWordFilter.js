const BAD_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'bastard', 'dick', 'piss',
  'crap', 'hell', 'slut', 'whore', 'cunt', 'fag', 'nigger', 'nigga',
  'retard', 'moron', 'idiot', 'stupid', 'dumb', 'loser', 'suck',
  'stfu', 'wtf', 'lmfao', 'bullshit', 'asshole', 'douchebag',
  'motherfucker', 'fucker', 'dipshit', 'shitty', 'bitchy', 'dumbass',
]

export function filterBadWords(text) {
  let filtered = text
  for (const word of BAD_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    filtered = filtered.replace(regex, '*'.repeat(word.length))
  }
  return filtered
}

export function containsBadWords(text) {
  const lower = text.toLowerCase()
  return BAD_WORDS.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower))
}
