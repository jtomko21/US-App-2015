import { useState, useEffect } from 'react'
import { C, Dots, Empty, SectionHeader, Peppers, StarRating, Modal, Btn, Pill, Input, Textarea, Hr } from '../components/UI.jsx'
import { askClaude, PROMPTS } from '../lib/claude.js'
import {
  vaultGetAll, vaultAdd, vaultVote, vaultDelete, vaultRevealAll,
  bucketGetAll, bucketAdd, bucketComplete, bucketDelete,
  tripGet, tripUpsert, tripTodoAdd, tripTodoToggle, tripTodoDelete,
  milestonesGet, milestoneAdd, milestoneDelete,
  getCoupleId, getMyToken,
} from '../lib/supabase.js'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// ═══════════════════════════════════════════════════════════════════════════════
// VAULT
// ═══════════════════════════════════════════════════════════════════════════════
const VAULT_CATS = ['Date Idea','Deep Talk','Sensual','Mind & Soul','Other']
const VAULT_COL  = { 'Date Idea':C.gold,'Deep Talk':C.blue,'Sensual':C.rose,'Mind & Soul':C.green,'Other':'rgba(245,236,215,.4)' }

export function Vault() {
  const [items,   setItems]   = useState([])
  const [text,    setText]    = useState('')
  const [cat,     setCat]     = useState('Date Idea')
  const [flash,   setFlash]   = useState(false)
  const [loading, setLoading] = useState(false)

  const coupleId  = getCoupleId()
  const myToken   = getMyToken()
  const now       = new Date()
  const isFirst   = now.getDate() === 1
  const nextFirst = new Date(now.getFullYear(), now.getMonth()+1, 1)
  const daysLeft  = Math.ceil((nextFirst - now) / 86400000)

  useEffect(() => { load() }, [])
  const load = async () => { setLoading(true); setItems(await vaultGetAll(coupleId)); setLoading(false) }

  const submit = async () => {
    if (!text.trim()) return
    await vaultAdd(coupleId, text.trim(), cat)
    setText(''); setFlash(true); setTimeout(() => setFlash(false), 2500)
    await load()
  }

  const vote   = async (id) => { await vaultVote(id); await load() }
  const del    = async (id) => { await vaultDelete(id); await load() }
  const reveal = async ()   => { await vaultRevealAll(coupleId); await load() }

  const revealed   = items.filter(i => i.revealed)
  const unrevealed = items.filter(i => !i.revealed)

  return (
    <div className="fade-up">
      <SectionHeader tagline="Anonymous wishes" title="Our Vault" />

      <div style={{ background:'rgba(201,168,76,.07)', border:'1px solid rgba(201,168,76,.2)',
        borderRadius:12, padding:'14px 18px', marginBottom:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:3, color:'rgba(201,168,76,.5)', textTransform:'uppercase', marginBottom:4 }}>
              {isFirst ? 'Reveal Day!' : `Reveals in ${daysLeft} day${daysLeft!==1?'s':''}`}
            </div>
            <p style={{ margin:0, fontSize:13, color:'rgba(245,236,215,.6)', lineHeight:1.5 }}>
              {unrevealed.length} item{unrevealed.length!==1?'s':''} sealed · opened on the 1st
            </p>
          </div>
          {isFirst && unrevealed.length > 0 && (
            <Btn onClick={reveal}>Open the Vault ✦</Btn>
          )}
        </div>
      </div>

      <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'20px', marginBottom:24 }}>
        <div style={{ fontSize:11, letterSpacing:3, color:'rgba(201,168,76,.4)', textTransform:'uppercase', marginBottom:14 }}>Drop something in</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          {VAULT_CATS.map(c => {
            const col = VAULT_COL[c]||'rgba(245,236,215,.4)'
            return <button key={c} onClick={() => setCat(c)} style={{
              background: cat===c?`${col}22`:'rgba(255,255,255,.04)',
              border:`1px solid ${cat===c?col+'66':'rgba(255,255,255,.1)'}`,
              borderRadius:20, padding:'5px 12px', color:cat===c?col:'rgba(245,236,215,.38)',
              fontSize:11, letterSpacing:1, textTransform:'uppercase', transition:'all .2s',
            }}>{c}</button>
          })}
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)}
          placeholder="Your idea, fantasy, or wish… submitted anonymously."
          rows={3} style={{ width:'100%', background:'rgba(0,0,0,.3)', border:'1px solid rgba(255,255,255,.1)',
            borderRadius:10, padding:'12px 14px', color:C.cream, fontSize:14, lineHeight:1.6,
            boxSizing:'border-box', outline:'none', resize:'vertical', fontFamily:'inherit' }}
          onFocus={e=>e.target.style.borderColor=`${C.gold}60`}
          onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.1)'} />
        <button onClick={submit} style={{ marginTop:12, width:'100%', padding:'13px',
          background: flash?'rgba(100,180,100,.12)':'rgba(201,168,76,.12)',
          border:`1px solid ${flash?'rgba(100,180,100,.4)':'rgba(201,168,76,.35)'}`,
          borderRadius:10, color:flash?'#9dce9d':C.gold, fontSize:13, letterSpacing:2,
          textTransform:'uppercase', transition:'all .3s' }}>
          {flash ? '✓  Dropped into the vault' : 'Submit Anonymously'}
        </button>
      </div>

      {revealed.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, letterSpacing:3, color:`${C.gold}66`, textTransform:'uppercase', marginBottom:12 }}>Revealed ✦</div>
          {revealed.map(item => {
            const col = VAULT_COL[item.category]||'rgba(245,236,215,.4)'
            return (
              <div key={item.id} style={{ background:'rgba(201,168,76,.06)', border:'1px solid rgba(201,168,76,.2)',
                borderRadius:12, padding:'16px 18px', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, letterSpacing:2, color:col, textTransform:'uppercase', marginBottom:6 }}>{item.category}</div>
                    <p style={{ color:'rgba(245,236,215,.85)', fontSize:15, margin:0, lineHeight:1.6, fontStyle:'italic' }}>{item.text}</p>
                    {item.votes > 0 && <div style={{ marginTop:8, fontSize:12, color:C.gold }}>♥ {item.votes} vote{item.votes!==1?'s':''}</div>}
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button onClick={() => vote(item.id)} style={{ background:'rgba(192,68,90,.1)', border:'1px solid rgba(192,68,90,.3)',
                      borderRadius:8, color:C.rose, fontSize:12, padding:'6px 10px' }}>♥ Yes</button>
                    <button onClick={() => del(item.id)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.15)', fontSize:16 }}>✕</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {unrevealed.length > 0 && (
        <div>
          <div style={{ fontSize:11, letterSpacing:3, color:'rgba(255,255,255,.2)', textTransform:'uppercase', marginBottom:12 }}>
            Sealed — {unrevealed.length} item{unrevealed.length!==1?'s':''}
          </div>
          {unrevealed.map(item => (
            <div key={item.id} style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)',
              borderRadius:12, padding:'14px 18px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:10, letterSpacing:2, color:'rgba(255,255,255,.2)', textTransform:'uppercase', marginBottom:4 }}>{item.category}</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,.15)', filter:'blur(4px)', userSelect:'none' }}>••••••••••••••</div>
              </div>
              <button onClick={() => del(item.id)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.12)', fontSize:16 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {!items.length && !loading && <Empty icon="⟁" msg="The vault is empty. Be the first to drop something in." />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUCKET LIST
// ═══════════════════════════════════════════════════════════════════════════════
export function BucketList() {
  const [items,    setItems]    = useState([])
  const [tab,      setTab]      = useState('dates')
  const [addModal, setAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPep,   setNewPep]   = useState(1)
  const [rateModal,setRateModal]= useState(null)
  const [rating,   setRating]   = useState(0)
  const coupleId = getCoupleId()

  useEffect(() => { load() }, [])
  const load = async () => { setItems(await bucketGetAll(coupleId)) }

  const add = async () => {
    if (!newTitle.trim()) return
    await bucketAdd(coupleId, newTitle.trim(), tab, tab==='sexuality'?newPep:0)
    setNewTitle(''); setNewPep(1); setAddModal(false); await load()
  }

  const complete = async (id) => { await bucketComplete(id, rating); setRateModal(null); setRating(0); await load() }
  const del = async (id) => { await bucketDelete(id); await load() }

  const filtered = items.filter(i => i.category === tab)
  const done     = filtered.filter(i => i.completed)
  const pending  = filtered.filter(i => !i.completed)

  return (
    <div className="fade-up">
      <SectionHeader tagline="Dream together" title="Bucket List" />
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['dates','✦ Date Nights'],['sexuality','❋ Sexuality']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex:1, padding:'10px', borderRadius:10, fontSize:13,
            background: tab===id?'rgba(201,168,76,.15)':'rgba(255,255,255,.03)',
            border:`1px solid ${tab===id?'rgba(201,168,76,.5)':'rgba(255,255,255,.07)'}`,
            color: tab===id?C.gold:'rgba(245,236,215,.35)' }}>{label}</button>
        ))}
      </div>

      <button onClick={() => setAddModal(true)} style={{ width:'100%', padding:'12px',
        background:'rgba(255,255,255,.03)', border:'1px dashed rgba(255,255,255,.15)',
        borderRadius:10, color:'rgba(245,236,215,.4)', fontSize:13, letterSpacing:1,
        textTransform:'uppercase', marginBottom:20 }}>
        + Add to {tab==='dates'?'Date Night':'Sexuality'} Bucket
      </button>

      {pending.map(item => (
        <div key={item.id} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)',
          borderRadius:12, padding:'16px 18px', marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:16, color:C.cream, fontFamily:"'Playfair Display',serif" }}>{item.title}</div>
              {item.peppers > 0 && <div style={{ marginTop:6 }}><Peppers count={item.peppers} /></div>}
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              <button onClick={() => setRateModal(item.id)} style={{ background:'rgba(168,197,160,.1)',
                border:'1px solid rgba(168,197,160,.3)', borderRadius:8, color:C.green, fontSize:11, padding:'6px 12px' }}>Done ✓</button>
              <button onClick={() => del(item.id)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.15)', fontSize:16 }}>✕</button>
            </div>
          </div>
        </div>
      ))}

      {done.length > 0 && (
        <div style={{ marginTop:24 }}>
          <div style={{ fontSize:11, letterSpacing:3, color:`${C.green}66`, textTransform:'uppercase', marginBottom:12 }}>Completed ✓</div>
          {done.map(item => (
            <div key={item.id} style={{ background:'rgba(168,197,160,.05)', border:'1px solid rgba(168,197,160,.15)',
              borderRadius:12, padding:'14px 18px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:15, color:'rgba(245,236,215,.5)', textDecoration:'line-through',
                  fontFamily:"'Playfair Display',serif" }}>{item.title}</div>
                {item.rating && <StarRating value={item.rating} />}
              </div>
              <button onClick={() => del(item.id)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.12)', fontSize:16 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {!pending.length && !done.length && <Empty icon={tab==='dates'?'✦':'❋'} msg="Nothing in the bucket yet" />}

      <Modal open={addModal} onClose={() => setAddModal(false)} title={`Add to ${tab==='dates'?'Date Night':'Sexuality'} Bucket`}>
        <div style={{ marginBottom:16 }}>
          <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="What do you want to do together?"
            style={{ width:'100%', background:'rgba(0,0,0,.3)', border:'1px solid rgba(255,255,255,.12)',
              borderRadius:10, padding:'13px 16px', color:C.cream, fontSize:14, boxSizing:'border-box', outline:'none', fontFamily:'inherit' }} />
        </div>
        {tab === 'sexuality' && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, letterSpacing:2, color:`${C.gold}80`, textTransform:'uppercase', marginBottom:10 }}>Heat Level</div>
            <Peppers count={newPep} max={3} onChange={setNewPep} />
          </div>
        )}
        <Btn onClick={add} style={{ width:'100%' }} disabled={!newTitle.trim()}>Add to Bucket List</Btn>
      </Modal>

      <Modal open={!!rateModal} onClose={() => setRateModal(null)} title="How was it?">
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, color:'rgba(245,236,215,.6)', marginBottom:12 }}>Rate the experience</div>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <Btn onClick={() => complete(rateModal)} style={{ width:'100%' }} disabled={!rating}>Save & Complete</Btn>
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRIP PLANNER
// ═══════════════════════════════════════════════════════════════════════════════
function TripPanel({ tripType, label, icon }) {
  const [trip,     setTrip]     = useState(null)
  const [todos,    setTodos]    = useState([])
  const [editing,  setEditing]  = useState(false)
  const [dest,     setDest]     = useState('')
  const [budget,   setBudget]   = useState('')
  const [dates,    setDates]    = useState('')
  const [todoText, setTodoText] = useState('')
  const [ideas,    setIdeas]    = useState([])
  const [loadIdeas,setLoadIdeas]= useState(false)
  const coupleId = getCoupleId()

  useEffect(() => { load() }, [])

  const load = async () => {
    const t = await tripGet(coupleId, tripType)
    if (t) { setTrip(t); setTodos(t.trip_todos||[]); setDest(t.destination||''); setBudget(t.budget||''); setDates(t.dates||'') }
  }

  const save = async () => {
    await tripUpsert(coupleId, tripType, { destination:dest, budget, dates })
    setEditing(false); await load()
  }

  const addTodo = async () => {
    if (!todoText.trim() || !trip?.id) return
    await tripTodoAdd(trip.id, todoText.trim())
    setTodoText(''); await load()
  }

  const toggleTodo = async (id, completed) => { await tripTodoToggle(id, !completed); await load() }
  const delTodo    = async (id) => { await tripTodoDelete(id); await load() }

  const getIdeas = async () => {
    setLoadIdeas(true)
    try { const result = await askClaude(PROMPTS.tripIdeas(dest), 800); setIdeas(result) }
    catch(e) { console.error(e) }
    finally { setLoadIdeas(false) }
  }

  const doneTodos    = todos.filter(t => t.completed)
  const pendingTodos = todos.filter(t => !t.completed)

  return (
    <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'20px', marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:3, color:`${C.blue}80`, textTransform:'uppercase', marginBottom:4 }}>{icon}</div>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:400, color:C.cream, margin:0 }}>{label}</h3>
        </div>
        <button onClick={() => setEditing(e=>!e)} style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)',
          borderRadius:8, color:'rgba(245,236,215,.5)', fontSize:11, padding:'7px 12px', letterSpacing:1 }}>
          {editing ? 'Cancel' : trip ? 'Edit' : 'Set Up'}
        </button>
      </div>

      {editing ? (
        <div>
          <Input label="Destination" value={dest} onChange={setDest} placeholder="e.g. Napa Valley, Cancún…" />
          <Input label="Budget" value={budget} onChange={setBudget} placeholder="e.g. $3,000 total" />
          <Input label="Target Dates" value={dates} onChange={setDates} placeholder="e.g. September 2025" />
          <div style={{ display:'flex', gap:10 }}>
            <Btn onClick={save} style={{ flex:1 }}>Save</Btn>
            <button onClick={getIdeas} disabled={loadIdeas} style={{ flex:1, padding:'11px', borderRadius:10, fontSize:12,
              background:'rgba(123,165,184,.1)', border:'1px solid rgba(123,165,184,.3)', color:C.blue,
              letterSpacing:1, textTransform:'uppercase', opacity:loadIdeas?.6:1 }}>
              {loadIdeas?'…':'✦ Get Ideas'}
            </button>
          </div>
          {ideas.length > 0 && (
            <div style={{ marginTop:16 }}>
              {ideas.map((idea,i) => (
                <div key={i} onClick={() => { setDest(idea.destination); setEditing(true) }}
                  style={{ background:'rgba(123,165,184,.08)', border:'1px solid rgba(123,165,184,.2)',
                    borderRadius:10, padding:'12px 14px', marginBottom:8, cursor:'pointer' }}>
                  <div style={{ fontSize:14, color:C.cream, fontFamily:"'Playfair Display',serif" }}>{idea.destination}</div>
                  <div style={{ fontSize:12, color:`${C.blue}AA`, marginTop:3 }}>{idea.vibe} · {idea.duration} · {idea.budget}</div>
                  <div style={{ fontSize:12, color:'rgba(245,236,215,.5)', marginTop:4, fontStyle:'italic' }}>{idea.highlight}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : trip ? (
        <div>
          {trip.destination && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {[['✈ Destination', trip.destination],['💰 Budget', trip.budget],['📅 Dates', trip.dates]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} style={{ background:'rgba(255,255,255,.04)', borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, color:'rgba(245,236,215,.35)', marginBottom:3 }}>{k}</div>
                  <div style={{ fontSize:13, color:C.cream }}>{v}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, letterSpacing:2, color:'rgba(201,168,76,.4)', textTransform:'uppercase', marginBottom:10 }}>To-Do / Packing</div>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <input value={todoText} onChange={e=>setTodoText(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addTodo()}
                placeholder="Add item…" style={{ flex:1, background:'rgba(0,0,0,.3)',
                  border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'10px 12px',
                  color:C.cream, fontSize:13, outline:'none', fontFamily:'inherit' }} />
              <button onClick={addTodo} style={{ background:'rgba(201,168,76,.12)', border:'1px solid rgba(201,168,76,.3)',
                borderRadius:8, color:C.gold, fontSize:18, padding:'0 14px' }}>+</button>
            </div>
            {pendingTodos.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <button onClick={()=>toggleTodo(t.id,t.completed)} style={{ width:20, height:20, borderRadius:'50%',
                  border:'1px solid rgba(255,255,255,.25)', background:'none', flexShrink:0 }} />
                <span style={{ flex:1, fontSize:14, color:'rgba(245,236,215,.8)' }}>{t.text}</span>
                <button onClick={()=>delTodo(t.id)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.15)', fontSize:14 }}>✕</button>
              </div>
            ))}
            {doneTodos.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, opacity:.5 }}>
                <button onClick={()=>toggleTodo(t.id,t.completed)} style={{ width:20, height:20, borderRadius:'50%',
                  border:`1px solid ${C.green}`, background:`${C.green}30`, flexShrink:0, color:C.green, fontSize:12 }}>✓</button>
                <span style={{ flex:1, fontSize:14, color:'rgba(245,236,215,.4)', textDecoration:'line-through' }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Empty icon={icon} msg={`Tap Set Up to plan your ${label.toLowerCase()}`} />
      )}
    </div>
  )
}

export function TripPlanner() {
  return (
    <div className="fade-up">
      <SectionHeader tagline="Just the two of you" title="Trip Planner" />
      <TripPanel tripType="annual" label="Annual Kid-Free Trip" icon="✈" />
      <TripPanel tripType="bucket" label="Ultimate Bucket List Trip" icon="🌍" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MILESTONES
// ═══════════════════════════════════════════════════════════════════════════════
const MS_CATS   = ['Anniversary','First','Experience','Intimate','Growth','Other']
const MS_COLORS = { Anniversary:C.gold, First:C.rose, Experience:C.blue, Intimate:C.purple, Growth:C.green, Other:'rgba(245,236,215,.5)' }

export function Milestones() {
  const [items,    setItems]    = useState([])
  const [addModal, setAddModal] = useState(false)
  const [title,    setTitle]    = useState('')
  const [date,     setDate]     = useState('')
  const [cat,      setCat]      = useState('Anniversary')
  const [notes,    setNotes]    = useState('')
  const [rating,   setRating]   = useState(0)
  const coupleId = getCoupleId()

  useEffect(() => { load() }, [])
  const load = async () => { setItems(await milestonesGet(coupleId)) }

  const add = async () => {
    if (!title.trim()) return
    await milestoneAdd(coupleId, {
      title: title.trim(),
      milestone_date: date || new Date().toISOString().split('T')[0],
      category: cat, notes, rating
    })
    setTitle(''); setDate(''); setNotes(''); setRating(0); setAddModal(false); await load()
  }

  const del = async (id) => { await milestoneDelete(id); await load() }

  return (
    <div className="fade-up">
      <SectionHeader tagline="Your story together" title="Milestones" />

      <button onClick={() => setAddModal(true)} style={{ width:'100%', padding:'12px',
        background:'rgba(255,255,255,.03)', border:'1px dashed rgba(255,255,255,.15)',
        borderRadius:10, color:'rgba(245,236,215,.4)', fontSize:13, letterSpacing:1,
        textTransform:'uppercase', marginBottom:24 }}>+ Add Milestone</button>

      {items.map(item => {
        const col    = MS_COLORS[item.category] || 'rgba(245,236,215,.5)'
        const d      = new Date(item.milestone_date)
        const dateStr= `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
        return (
          <div key={item.id} style={{ background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.07)',
            borderRadius:12, padding:'16px 18px', marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                  <span style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:col,
                    background:`${col}18`, padding:'2px 8px', borderRadius:20 }}>{item.category}</span>
                  <span style={{ fontSize:11, color:'rgba(245,236,215,.3)' }}>{dateStr}</span>
                </div>
                <div style={{ fontSize:16, color:C.cream, fontFamily:"'Playfair Display',serif" }}>{item.title}</div>
                {item.rating > 0 && <div style={{ marginTop:6 }}><StarRating value={item.rating} /></div>}
                {item.notes && <p style={{ color:'rgba(245,236,215,.5)', fontSize:13, margin:'8px 0 0', fontStyle:'italic', lineHeight:1.5 }}>{item.notes}</p>}
              </div>
              <button onClick={() => del(item.id)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.15)', fontSize:16, flexShrink:0 }}>✕</button>
            </div>
          </div>
        )
      })}

      {!items.length && <Empty icon="♡" msg="Add your first milestone — an anniversary, a first, or something you tried together." />}

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Milestone">
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, letterSpacing:2, color:`${C.gold}80`, textTransform:'uppercase', marginBottom:10 }}>Category</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {MS_CATS.map(c => <Pill key={c} label={c} active={cat===c} onClick={()=>setCat(c)} color={MS_COLORS[c]||C.gold} />)}
          </div>
        </div>
        <Input label="Title" value={title} onChange={setTitle} placeholder="e.g. First trip abroad, Tried something new…" />
        <Input label="Date" value={date} onChange={setDate} type="date" />
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, letterSpacing:2, color:`${C.gold}80`, textTransform:'uppercase', marginBottom:10 }}>Rating (optional)</div>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <Textarea label="Notes (optional)" value={notes} onChange={setNotes}
          placeholder="How was it? What made it special?" rows={3} />
        <Btn onClick={add} style={{ width:'100%' }} disabled={!title.trim()}>Add Milestone</Btn>
      </Modal>
    </div>
  )
}
