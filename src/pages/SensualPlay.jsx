import { useState, useEffect } from 'react'
import { C, Dots, Empty, SectionHeader, Peppers, StarRating, Modal, Btn, Pill, ErrorBox, Textarea } from '../components/UI.jsx'
import { askClaude, PROMPTS, getMonthYear } from '../lib/claude.js'
import { sensualGetAll, sensualAdd, sensualRate, sensualLogTried, sensualPartnerRespond,
  archiveSave, getCoupleId, getMyToken } from '../lib/supabase.js'

const CATS = ['All','Positions','Techniques','Challenges','Toys']
const INT_COL = { 1:'#e8a87c', 2:'#e07057', 3:'#8b1a4a' }

function SensualCard({ item, myToken, onRate, onTried, onRespond }) {
  const [open, setOpen]     = useState(false)
  const [triedModal, setTriedModal] = useState(false)
  const [triedRating, setTriedRating] = useState(0)
  const [triedNote, setTriedNote]    = useState('')

  const isAnon    = !!item.submitter_token
  const isMine    = item.submitter_token === myToken
  const isPartners= isAnon && !isMine
  const hasPartnerResponse = !!item.partner_response

  const pepColor = INT_COL[item.pepper_rating] || C.gold

  return (
    <>
      <div onClick={() => setOpen(o => !o)} style={{
        background: open ? `${pepColor}0D` : 'rgba(255,255,255,.02)',
        border:`1px solid ${open ? pepColor+'45' : 'rgba(255,255,255,.07)'}`,
        borderRadius:12, padding:'18px 20px', cursor:'pointer', transition:'all .3s', marginBottom:10,
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ fontSize:10, letterSpacing:2, color:`${pepColor}BB`, textTransform:'uppercase',
                background:`${pepColor}18`, padding:'2px 8px', borderRadius:20 }}>{item.category}</span>
              {isAnon && <span style={{ fontSize:10, color:'rgba(245,236,215,.35)', letterSpacing:1 }}>
                {isMine ? '· your suggestion' : '· partner suggestion'}
              </span>}
              {item.tried && <span style={{ fontSize:10, color:C.green, letterSpacing:1 }}>· tried ✓</span>}
            </div>
            <div style={{ fontSize:17, fontFamily:"'Playfair Display',serif", color:C.cream }}>{item.title}</div>
            <div style={{ marginTop:6 }}><Peppers count={item.pepper_rating||1} /></div>
          </div>
          <span style={{ color:`${pepColor}66`, transform:open?'rotate(45deg)':'none',
            transition:'transform .3s', display:'inline-block', flexShrink:0, marginLeft:8 }}>✦</span>
        </div>

        {open && (
          <div style={{ marginTop:14, borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:14, animation:'fadeUp .3s ease' }}
            onClick={e => e.stopPropagation()}>

            {item.description && <p style={{ color:'rgba(245,236,215,.8)', fontSize:15, lineHeight:1.75,
              margin:'0 0 12px', fontStyle:'italic' }}>{item.description}</p>}
            {item.note && <p style={{ color:`${pepColor}BB`, fontSize:13, margin:'0 0 16px', lineHeight:1.6 }}>{item.note}</p>}

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, letterSpacing:2, color:'rgba(201,168,76,.4)', textTransform:'uppercase', marginBottom:8 }}>Heat Level</div>
              <Peppers count={item.pepper_rating||1} max={3} onChange={p => onRate(item.id, p)} />
            </div>

            {isPartners && !hasPartnerResponse && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, color:'rgba(245,236,215,.4)', marginBottom:8 }}>Your partner suggested this — are you in?</div>
                <div style={{ display:'flex', gap:8 }}>
                  {['no_way','explore','hell_yes'].map(v => {
                    const labels = { no_way:'No Way', explore:'Maybe', hell_yes:'Hell Yes' }
                    const colors = { no_way:C.rose, explore:C.gold, hell_yes:C.green }
                    return (
                      <button key={v} onClick={() => onRespond(item.id, v)} style={{
                        flex:1, padding:'8px', borderRadius:8, fontSize:11, letterSpacing:.5,
                        textTransform:'uppercase', background:`${colors[v]}15`,
                        border:`1px solid ${colors[v]}40`, color:colors[v],
                      }}>{labels[v]}</button>
                    )
                  })}
                </div>
              </div>
            )}

            {isMine && hasPartnerResponse && (
              <div style={{ background:'rgba(255,255,255,.04)', borderRadius:8, padding:'10px 14px', marginBottom:14 }}>
                <div style={{ fontSize:11, color:'rgba(245,236,215,.4)', marginBottom:4 }}>Partner responded:</div>
                <div style={{ color: item.partner_response==='hell_yes'?C.green:item.partner_response==='explore'?C.gold:C.rose,
                  fontSize:13, fontWeight:'bold', letterSpacing:1, textTransform:'uppercase' }}>
                  {item.partner_response==='hell_yes'?'Hell Yes ✓':item.partner_response==='explore'?'Willing to Explore':'No Way'}
                </div>
              </div>
            )}

            {item.tried && item.tried_rating && (
              <div style={{ background:'rgba(169,200,160,.08)', border:'1px solid rgba(169,200,160,.2)',
                borderRadius:8, padding:'10px 14px', marginBottom:14 }}>
                <div style={{ fontSize:11, color:`${C.green}AA`, marginBottom:6 }}>You tried this!</div>
                <StarRating value={item.tried_rating} />
                {item.tried_note && <p style={{ color:'rgba(245,236,215,.6)', fontSize:13, margin:'8px 0 0', fontStyle:'italic' }}>{item.tried_note}</p>}
              </div>
            )}

            {!item.tried && (
              <Btn onClick={() => setTriedModal(true)} variant="ghost" style={{ width:'100%' }}>
                Log as Tried ✓
              </Btn>
            )}
          </div>
        )}
      </div>

      <Modal open={triedModal} onClose={() => setTriedModal(false)} title="How was it?">
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, letterSpacing:2, color:`${C.gold}80`, textTransform:'uppercase', marginBottom:12 }}>Rate the experience</div>
          <StarRating value={triedRating} onChange={setTriedRating} />
        </div>
        <Textarea label="Notes (optional)" value={triedNote} onChange={setTriedNote}
          placeholder="How did it go? What would you do differently?" rows={3} />
        <Btn onClick={() => { onTried(item.id, triedRating, triedNote); setTriedModal(false) }}
          style={{ width:'100%' }} disabled={!triedRating}>Save</Btn>
      </Modal>
    </>
  )
}

export default function SensualPlay({ onAddBucket }) {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [cat,      setCat]      = useState('All')
  const [addModal, setAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCat,   setNewCat]   = useState('Positions')
  const [newPep,   setNewPep]   = useState(1)
  const [newDesc,  setNewDesc]  = useState('')
  const [anon,     setAnon]     = useState(true)

  const coupleId = getCoupleId()
  const myToken  = getMyToken()
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
        const exists = items.find(i => i.title === item.title)
        if (!exists) await sensualAdd(coupleId, { title:item.title, category:item.category||'Techniques',
          pepper_rating:item.peppers||1, description:item.description, note:item.note })
      }
      await load()
      await archiveSave(coupleId, 'sensual', month, year, result)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleRate    = async (id, p) => { await sensualRate(id, p); await load() }
  const handleTried   = async (id, r, n) => { await sensualLogTried(id, r, n); await load() }
  const handleRespond = async (id, response) => { await sensualPartnerRespond(id, response); await load() }

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    await sensualAdd(coupleId, {
      title: newTitle.trim(), category: newCat, pepper_rating: newPep,
      description: newDesc, submitter_token: anon ? myToken : null,
    })
    setNewTitle(''); setNewDesc(''); setNewPep(1); setAddModal(false)
    await load()
  }

  const filtered = cat === 'All' ? items : items.filter(i => i.category === cat)
  const pendingResponses = items.filter(i => i.submitter_token && i.submitter_token !== myToken && !i.partner_response).length

  return (
    <div className="fade-up​​​​​​​​​​​​​​​​
