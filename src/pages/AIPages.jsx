import { useState, useEffect } from 'react'
import { C, Dots, Empty, ErrorBox, SectionHeader, Peppers, StarRating, Modal, Btn, Pill } from '../components/UI.jsx'
import { askClaude, PROMPTS, getMonthYear } from '../lib/claude.js'
import { archiveSave, archiveGet, favoriteToggle, favoritesGet, getCoupleId } from '../lib/supabase.js'

function AICard({ item, section, saved, onToggle, accentColor = C.gold, extra }) {
  const [open, setOpen] = useState(false)
  const title   = item.title || item.question || '—'
  const sub1    = item.description || item.why || item.spark || ''
  const sub2    = item.detail || item.note || item.spark || ''
  const tag     = item.vibe || item.category || item.type || ''

  return (
    <div onClick={() => setOpen(o => !o)} style={{
      background: open ? `${accentColor}0D` : 'rgba(255,255,255,.03)',
      border:`1px solid ${open ? accentColor+'45' : 'rgba(255,255,255,.08)'}`,
      borderRadius:12, padding:'18px 20px', cursor:'pointer', transition:'all .3s', marginBottom:10,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          {tag && <div style={{ fontSize:10, letterSpacing:3, color:accentColor, textTransform:'uppercase', marginBottom:5 }}>{tag}</div>}
          <div style={{ fontSize:17, fontFamily:"'Playfair Display',serif", color:C.cream }}>{title}</div>
          {item.peppers > 0 && <div style={{ marginTop:6 }}><Peppers count={item.peppers} /></div>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
          <button onClick={e => { e.stopPropagation(); onToggle() }}
            style={{ background:'none', border:'none', color: saved ? '#e07057' : 'rgba(255,255,255,.18)', fontSize:18, padding:'4px 6px' }}>
            {saved ? '♥' : '♡'}
          </button>
          <span style={{ color:`${accentColor}88`, transform: open?'rotate(45deg)':'none', transition:'transform .3s', display:'inline-block' }}>✦</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop:14, borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:14, animation:'fadeUp .3s ease' }}>
          {sub1 && <p style={{ color:'rgba(245,236,215,.8)', fontSize:15, lineHeight:1.75, margin:'0 0 12px', fontStyle:'italic' }}>{sub1}</p>}
          {sub2 && sub2 !== sub1 && (
            <div style={{ display:'flex', gap:8 }}>
              <span style={{ color:accentColor, flexShrink:0 }}>→</span>
              <p style={{ color:`${accentColor}CC`, fontSize:13, margin:0, lineHeight:1.6 }}>{sub2}</p>
            </div>
          )}
          {extra}
        </div>
      )}
    </div>
  )
}

function ArchivePull({ coupleId, section, onUse }) {
  const [archive, setArchive]   = useState([])
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await archiveGet(coupleId, section)
    const all = data.flatMap(d => (d.items || []).map(i => ({ ...i, _month: d.month, _year: d.year })))
    setArchive(all)
    setLoading(false)
    setShow(true)
  }

  if (!show) return (
    <button onClick={load} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)',
      borderRadius:10, padding:'10px 16px', color:'rgba(245,236,215,.4)', fontSize:12,
      letterSpacing:1, textTransform:'uppercase', width:'100%', marginBottom:16 }}>
      {loading ? '…' : '↩ Surface from Archive'}
    </button>
  )

  if (!archive.length) return <p style={{ color:'rgba(245,236,215,.3)', fontSize:13, textAlign:'center', marginBottom:16 }}>No archive yet</p>

  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:11, letterSpacing:2, color:'rgba(201,168,76,.4)', textTransform:'uppercase', marginBottom:10 }}>From the Archive</div>
      {archive.slice(0,5).map((item,i) => (
        <div key={i} style={{ background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.07)',
          borderRadius:10, padding:'14px 16px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, color:'rgba(201,168,76,.4)', letterSpacing:1, textTransform:'uppercase' }}>{item._month} {item._year}</div>
            <div style={{ fontSize:15, color:C.cream, fontFamily:"'Playfair Display',serif", marginTop:3 }}>{item.title||item.question}</div>
          </div>
          <button onClick={() => onUse(item)} style={{ background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.3)',
            borderRadius:8, color:C.gold, fontSize:11, padding:'6px 12px' }}>Use</button>
        </div>
      ))}
      <button onClick={() => setShow(false)} style={{ background:'none', border:'none', color:'rgba(245,236,215,.25)', fontSize:12, marginTop:4 }}>Hide archive</button>
    </div>
  )
}

export function DateNights({ onAddBucket }) {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [favs,    setFavs]    = useState({})
  const coupleId = getCoupleId()
  const { month, year } = getMonthYear()

  useEffect(() => { generate(); loadFavs() }, [])

  const loadFavs = async () => {
    const f = await favoritesGet(coupleId)
    setFavs(f)
  }

  const generate = async () => {
    setLoading(true); setError(null)
    try {
      const result = await askClaude(PROMPTS.dates(month, year))
      setItems(result)
      await archiveSave(coupleId, 'dates', month, year, result)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const toggleFav = async (item) => {
    await favoriteToggle(coupleId, 'dates', item)
    await loadFavs()
  }

  const isSaved = item => (favs.dates||[]).some(x=>x.title===item.title)

  return (
    <div className="fade-up">
      <SectionHeader tagline="Craft the moment" title="Date Nights" onNew={generate} loading={loading} />
      <ArchivePull coupleId={coupleId} section="dates" onUse={item => setItems(p=>[item,...p])} />
      {loading && <Dots />}
      {error && !loading && <ErrorBox msg={error} onRetry={generate} />}
      {!loading && !error && items.map((item,i) => (
        <AICard key={i} item={item} section="dates" saved={isSaved(item)}
          onToggle={() => toggleFav(item)}
          extra={
            <div style={{ marginTop:12 }}>
              <button onClick={e=>{e.stopPropagation();onAddBucket&&onAddBucket(item.title,'dates')}}
                style={{ background:'none', border:'1px solid rgba(255,255,255,.12)', borderRadius:8,
                  color:'rgba(245,236,215,.5)', fontSize:11, padding:'6px 12px', letterSpacing:1 }}>
                + Add to Bucket List
              </button>
            </div>
          }
        />
      ))}
      {!loading && !error && !items.length && <Empty icon="✦" msg="Tap New to generate date ideas" />}
    </div>
  )
}

export function DeepTalks() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [favs,    setFavs]    = useState({})
  const coupleId = getCoupleId()
  const { month, year } = getMonthYear()

  const catColor = { Dreams:C.gold, Shadow:'rgba(180,140,200,1)', Gratitude:C.green, Fantasy:C.rose, Growth:C.blue }
  const catIcon  = { Dreams:'✦', Shadow:'◐', Gratitude:'❋', Fantasy:'◈', Growth:'◎' }

  useEffect(() => { generate(); loadFavs() }, [])
  const loadFavs = async () => { const f = await favoritesGet(coupleId); setFavs(f) }

  const generate = async () => {
    setLoading(true); setError(null)
    try {
      const result = await askClaude(PROMPTS.talk(month, year))
      setItems(result)
      await archiveSave(coupleId, 'talk', month, year, result)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const toggleFav = async (item) => { await favoriteToggle(coupleId, 'talk', item); await loadFavs() }
  const isSaved = item => (favs.talk||[]).some(x=>x.question===item.question)

  return (
    <div className="fade-up">
      <SectionHeader tagline="Speak the unsaid" title="Deep Talks" onNew={generate} loading={loading} />
      <ArchivePull coupleId={coupleId} section="talk" onUse={item => setItems(p=>[item,...p])} />
      {loading && <Dots />}
      {error && !loading && <ErrorBox msg={error} onRetry={generate} />}
      {!loading && !error && items.map((item,i) => {
        const col = catColor[item.category] || C.gold
        const icon = catIcon[item.category] || '◈'
        return (
          <div key={i} style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.07)',
            borderRadius:12, padding:'18px 20px', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:`${col}18`,
                border:`1px solid ${col}35`, display:'flex', alignItems:'center', justifyContent:'center',
                color:col, flexShrink:0 }}>{icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, letterSpacing:2, color:`${col}BB`, textTransform:'uppercase' }}>{item.category}</div>
                <p style={{ color:C.cream, fontSize:15, margin:'4px 0 0', fontFamily:"'Playfair Display',serif", lineHeight:1.5 }}>{item.question}</p>
                {item.why && <p style={{ color:'rgba(245,236,215,.5)', fontSize:13, margin:'8px 0 0', fontStyle:'italic', lineHeight:1.6 }}>{item.why}</p>}
              </div>
              <button onClick={()=>toggleFav(item)} style={{ background:'none', border:'none',
                color: isSaved(item)?'#e07057':'rgba(255,255,255,.18)', fontSize:18, padding:'4px 6px', flexShrink:0 }}>
                {isSaved(item)?'♥':'♡'}
              </button>
            </div>
          </div>
        )
      })}
      {!loading && !error && !items.length && <Empty icon="◈" msg="Tap New to generate conversation starters" />}
    </div>
  )
}

export function MindSoul() {
  const typeColor = { Read:C.blue, Create:C.green, Explore:C.gold, Debate:C.purple, Experience:C.orange }
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [favs,    setFavs]    = useState({})
  const coupleId = getCoupleId()
  const { month, year } = getMonthYear()

  useEffect(() => { generate(); loadFavs() }, [])
  const loadFavs = async () => { const f = await favoritesGet(coupleId); setFavs(f) }

  const generate = async () => {
    setLoading(true); setError(null)
    try {
      const result = await askClaude(PROMPTS.mind(month, year))
      setItems(result)
      await archiveSave(coupleId, 'mind', month, year, result)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const toggleFav = async (item) => { await favoriteToggle(coupleId, 'mind', item); await loadFavs() }
  const isSaved = item => (favs.mind||[]).some(x=>x.title===item.title)

  return (
    <div className="fade-up">
      <SectionHeader tagline="Grow together" title="Mind & Soul" onNew={generate} loading={loading} />
      <ArchivePull coupleId={coupleId} section="mind" onUse={item => setItems(p=>[item,...p])} />
      {loading && <Dots />}
      {error && !loading && <ErrorBox msg={error} onRetry={generate} />}
      {!loading && !error && items.map((item,i) => {
        const col = typeColor[item.type] || C.gold
        return (
          <AICard key={i} item={item} section="mind" saved={isSaved(item)}
            onToggle={() => toggleFav(item)} accentColor={col} />
        )
      })}
      {!loading && !error && !items.length && <Empty icon="◎" msg="Tap New to generate ideas" />}
    </div>
  )
}
