// v2
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export async function askClaude(prompt, maxTokens = 1200) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`API ${res.status}: ${txt.slice(0, 200)}`)
  }

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)

  const text = (data.content || []).map(b => b.text || '').join('').trim()
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const start = clean.indexOf('[')
  const end   = clean.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('No JSON array: ' + clean.slice(0, 100))
  return JSON.parse(clean.slice(start, end + 1))
}

export function getMonthYear() {
  const d = new Date()
  return { month: MONTHS[d.getMonth()], year: d.getFullYear() }
}

export const PROMPTS = {
  dates: (m, y) =>
    `Generate 4 creative date night ideas for a married couple in ${m} ${y}. Mix indoor/outdoor, free/splurge. Reply ONLY with a JSON array: [{"title":"","vibe":"","description":"","detail":""}]`,

  talk: (m, y) =>
    `Generate 5 deep conversation starters for a married couple in ${m} ${y}. Reply ONLY with a JSON array: [{"question":"","category":"Dreams|Shadow|Gratitude|Fantasy|Growth","why":""}]`,

  sensual: (m, y) =>
    `Generate 4 intimacy ideas for a married couple in ${m} ${y}. Reply ONLY with a JSON array: [{"title":"","category":"Positions|Techniques|Challenges|Toys","peppers":1,"description":"","note":""}] where peppers is 1-3`,

  mind: (m, y) =>
    `Generate 4 intellectual connection ideas for a married couple in ${m} ${y}. Reply ONLY with a JSON array: [{"title":"","type":"Read|Create|Explore|Debate|Experience","description":"","spark":""}]`,

  challenge: (m, y) =>
    `Generate 1 fun couples challenge for this week in ${m} ${y}. Reply ONLY with a JSON array of 1 item: [{"title":"","description":"","category":"Intimacy|Adventure|Connection|Growth"}]`,

  kinkSuggestions: () =>
    `Generate 20 sexual/intimacy topics for a couples preference quiz. Mix mild to adventurous. Reply ONLY with a JSON array: [{"title":"","category":"Positions|Roleplay|Toys|Fantasy|Sensation|Location|Timing|Other"}]`,

  tripIdeas: (dest) =>
    `Generate 5 romantic kid-free trip ideas${dest ? ` near or including ${dest}` : ''} for a couple. Reply ONLY with a JSON array: [{"destination":"","vibe":"","duration":"","highlight":"","budget":"budget|moderate|luxury"}]`,
}