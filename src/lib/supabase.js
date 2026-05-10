import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export function getMyToken() {
  let t = localStorage.getItem('us:token')
  if (!t) { t = crypto.randomUUID(); localStorage.setItem('us:token', t) }
  return t
}
export function getCoupleId()  { return localStorage.getItem('us:coupleId') || '' }
export function getPartnerNum(){ return localStorage.getItem('us:partner') || '' }

export async function vaultGetAll(coupleId) {
  const { data } = await supabase.from('vault_items')
    .select('*').eq('couple_id', coupleId).order('created_at', { ascending: false })
  return data || []
}
export async function vaultAdd(coupleId, text, category) {
  const { data } = await supabase.from('vault_items')
    .insert({ couple_id: coupleId, text, category, submitter_token: getMyToken(), votes: 0, revealed: false })
    .select().single()
  return data
}
export async function vaultVote(id) {
  const { data: row } = await supabase.from('vault_items').select('votes').eq('id', id).single()
  await supabase.from('vault_items').update({ votes: (row?.votes || 0) + 1 }).eq('id', id)
}
export async function vaultDelete(id) {
  await supabase.from('vault_items').delete().eq('id', id)
}
export async function vaultRevealAll(coupleId) {
  await supabase.from('vault_items').update({ revealed: true }).eq('couple_id', coupleId).eq('revealed', false)
}

export async function sensualGetAll(coupleId) {
  const { data } = await supabase.from('sensual_items')
    .select('*').eq('couple_id', coupleId).order('created_at', { ascending: false })
  return data || []
}
export async function sensualAdd(coupleId, item) {
  const { data } = await supabase.from('sensual_items')
    .insert({ couple_id: coupleId, submitter_token: getMyToken(), ...item }).select().single()
  return data
}
export async function sensualRate(id, pepper) {
  await supabase.from('sensual_items').update({ pepper_rating: pepper }).eq('id', id)
}
export async function sensualLogTried(id, rating, note) {
  await supabase.from('sensual_items')
    .update({ tried: true, tried_rating: rating, tried_note: note, tried_date: new Date().toISOString() }).eq('id', id)
}
export async function sensualPartnerRespond(id, response) {
  const myToken = getMyToken()
  await supabase.from('sensual_items')
    .update({ partner_response: response, partner_token: myToken, partner_responded_at: new Date().toISOString() }).eq('id', id)
}

export async function kinkGetAll(coupleId) {
  const { data } = await supabase.from('kink_items')
    .select('*').eq('couple_id', coupleId).order('created_at', { ascending: false })
  return data || []
}
export async function kinkAdd(coupleId, title, category, isAnonymous = false) {
  const { data } = await supabase.from('kink_items')
    .insert({ couple_id: coupleId, title, category, submitter_token: isAnonymous ? getMyToken() : null, is_anonymous: isAnonymous })
    .select().single()
  return data
}
export async function kinkAnswer(itemId, coupleId, answer) {
  const myToken = getMyToken()
  await supabase.from('kink_answers').upsert({
    item_id: itemId, couple_id: coupleId, user_token: myToken, answer, revealed: false
  }, { onConflict: 'item_id,user_token' })
}
export async function kinkReveal(itemId, coupleId) {
  const myToken = getMyToken()
  await supabase.from('kink_answers')
    .update({ revealed: true }).eq('item_id', itemId).eq('couple_id', coupleId).eq('user_token', myToken)
}
export async function kinkGetAnswers(coupleId) {
  const { data } = await supabase.from('kink_answers')
    .select('*').eq('couple_id', coupleId)
  return data || []
}

export async function bucketGetAll(coupleId) {
  const { data } = await supabase.from('bucket_list')
    .select('*').eq('couple_id', coupleId).order('created_at', { ascending: false })
  return data || []
}
export async function bucketAdd(coupleId, title, category, peppers = 0) {
  const { data } = await supabase.from('bucket_list')
    .insert({ couple_id: coupleId, title, category, peppers, completed: false }).select().single()
  return data
}
export async function bucketComplete(id, rating) {
  await supabase.from('bucket_list').update({ completed: true, rating, completed_date: new Date().toISOString() }).eq('id', id)
}
export async function bucketDelete(id) {
  await supabase.from('bucket_list').delete().eq('id', id)
}

export async function tripGet(coupleId, tripType) {
  const { data } = await supabase.from('trips')
    .select('*, trip_todos(*)').eq('couple_id', coupleId).eq('trip_type', tripType).single()
  return data
}
export async function tripUpsert(coupleId, tripType, fields) {
  const existing = await tripGet(coupleId, tripType)
  if (existing) {
    await supabase.from('trips').update(fields).eq('id', existing.id)
  } else {
    await supabase.from('trips').insert({ couple_id: coupleId, trip_type: tripType, ...fields })
  }
}
export async function tripTodoAdd(tripId, text) {
  const { data } = await supabase.from('trip_todos')
    .insert({ trip_id: tripId, text, completed: false }).select().single()
  return data
}
export async function tripTodoToggle(id, completed) {
  await supabase.from('trip_todos').update({ completed }).eq('id', id)
}
export async function tripTodoDelete(id) {
  await supabase.from('trip_todos').delete().eq('id', id)
}

export async function milestonesGet(coupleId) {
  const { data } = await supabase.from('milestones')
    .select('*').eq('couple_id', coupleId).order('milestone_date', { ascending: false })
  return data || []
}
export async function milestoneAdd(coupleId, fields) {
  const { data } = await supabase.from('milestones')
    .insert({ couple_id: coupleId, ...fields }).select().single()
  return data
}
export async function milestoneDelete(id) {
  await supabase.from('milestones').delete().eq('id', id)
}

export async function archiveSave(coupleId, section, month, year, items) {
  await supabase.from('archive').upsert({
    couple_id: coupleId, section, month, year, items
  }, { onConflict: 'couple_id,section,month,year' })
}
export async function archiveGet(coupleId, section) {
  const { data } = await supabase.from('archive')
    .select('*').eq('couple_id', coupleId).eq('section', section)
    .order('year', { ascending: false }).order('month', { ascending: false })
  return data || []
}

export async function challengeGet(coupleId) {
  const weekStart = getWeekStart()
  const { data } = await supabase.from('weekly_challenge')
    .select('*').eq('couple_id', coupleId).eq('week_start', weekStart).single()
  return data
}
export async function challengeSave(coupleId, text) {
  const weekStart = getWeekStart()
  await supabase.from('weekly_challenge').upsert(
    { couple_id: coupleId, week_start: weekStart, challenge: text, completed: false },
    { onConflict: 'couple_id,week_start' }
  )
}
export async function challengeComplete(coupleId) {
  const weekStart = getWeekStart()
  await supabase.from('weekly_challenge')
    .update({ completed: true }).eq('couple_id', coupleId).eq('week_start', weekStart)
}

function getWeekStart() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split('T')[0]
}

export async function favoritesGet(coupleId) {
  const { data } = await supabase.from('favorites')
    .select('*').eq('couple_id', coupleId)
  const out = { dates:[], talk:[], sensual:[], mind:[] }
  ;(data||[]).forEach(r => { if (out[r.section]) out[r.section].push(r.item_data) })
  return out
}
export async function favoriteToggle(coupleId, section, item) {
  const key = item.title || item.question || ''
  const { data: existing } = await supabase.from('favorites')
    .select('id').eq('couple_id', coupleId).eq('section', section).eq('item_key', key)
  if (existing?.length) {
    await supabase.from('favorites').delete().eq('id', existing[0].id)
    return false
  }
  await supabase.from('favorites').insert({ couple_id: coupleId, section, item_key: key, item_data: item })
  return true
}