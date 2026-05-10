import { useState, useEffect } from 'react'
import { C, Dots, Empty, SectionHeader, Peppers, StarRating, Modal, Btn, Pill, ErrorBox, Textarea } from '../components/UI.jsx'
import { askClaude, PROMPTS, getMonthYear } from '../lib/claude.js'
import { sensualGetAll, sensualAdd, sensualRate, sensualLogTried, sensualPartnerRespond, archiveSave, getCoupleId, getMyToken } from '../lib/supabase.js'

const CATS = ['All','Positions','Techniques','Challenges','Toys']
const INT_COL = { 1:'#e8a87c', 2:'#e07057', 3:'#8b1a4a' }

export default function SensualPlay({ onAddBucket }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cat, setCat] = useState('All')
  const coupleId = getCoupleId()
  const myToken = getMyToken()
  const { month, year } = getMonthYear()

  useEffect(() => { load(); generateAI() }, [])

  const load = async () => {
    const data = await sensualGetAll(coupleId)
    setItems(data)
  }

  const generateAI = async () => {
    setLoading(true); setError(null)
    try {
      const result = await askClaude(PROMPTS.sensual(month, year))
      for (const item of result) {
        await sensualAdd(coupleId, { title:item.title, category:item.category||'Techniques', pepper_rating:item.peppers||1, description:item.description, note:item.note })
      }
      await load()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleRate = async (id, p) => { await sensualRate(id, p); await load() }
  const handleTried = async (id, r, n) => { await sensualLogTried(id, r, n); await load() }
  const handleRespond = async (id, response) => { await sensualPartnerRespond(id, response); await load() }

  const filtered = cat === 'All' ? items : items.filter(i => i.category === cat)

  return (
    <div className="fade-up">
      <SectionHeader tagline="Ignite & explore" title="Sensual Play" onNew={generateAI} loading={loading} newLabel="↻ New Ideas" />
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:18 }}>
        {CATS.map(c => <Pill key={c} label={c} active={cat===c} onClick={()=>setCat(c)} />)}
      </div>
      {error && <ErrorBox msg={error} onRetry={generateAI} />}
      {filtered.map(item => {
        const col = INT_COL[item.pepper_rating] || C.gold
        return (
          <div key={item.id} style={{ background:'rgba(255,255,255,.02)', border:`1px solid rgba(255,255,255,.07)`, borderRadius:12, padding:'18px 20px', marginBottom:10 }}>
            <div style={{ fontSize:10, letterSpacing:2, color:`${col}BB`, textTransform:'uppercase', marginBottom:4 }}>{item.category}</div>
            <div style={{ fontSize:17, fontFamily:"'Playfair Display',serif", color:C.cream }}>{item.title}</div>
            <div style={{ marginTop:6 }}><Peppers count={item.pepper_rating||1} /></div>
            {item.description && <p style={{ color:'rgba(245,236,215,.7)', fontSize:14, lineHeight:1.7, margin:'10px 0 0', fontStyle:'italic' }}>{item.description}</p>}
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <button onClick={() => handleRate(item.id, Math.min((item.pepper_rating||1)+1, 3))} style={{ fontSize:11, padding:'6px 12px', borderRadius:8, background:`${col}15`, border:`1px solid ${col}40`, color:col }}>🌶️ Rate</button>
              {item.submitter_token && item.submitter_token !== myToken && !item.partner_response && (
                <>
                  {['no_way','explore','hell_yes'].map(v => {
                    const labels = { no_way:'No Way', explore:'Maybe', hell_yes:'Hell Yes' }
                    const colors = { no_way:C.rose, explore:C.gold, hell_yes:C.green }
                    return <button key={v} onClick={() => handleRespond(item.id, v)} style={{ flex:1, padding:'6px', borderRadius:8, fontSize:11, background:`${colors[v]}15`, border:`1px solid ${colors[v]}40`, color:colors[v] }}>{labels[v]}</button>
                  })}
                </>
              )}
              {!item.tried && <button onClick={() => handleTried(item.id, 5, '')} style={{ fontSize:11, padding:'6px 12px', borderRadius:8, background:'rgba(168,197,160,.1)', border:'1px solid rgba(168,197,160,.3)', color:C.green }}>✓ Tried</button>}
            </div>
          </div>
        )
      })}
      {!filtered.length && !loading && <Empty icon="❋" msg="No items yet — tap ↻ New Ideas" />}
    </div>
  )
}
