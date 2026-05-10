import { useState, useEffect } from 'react'
import { C, Dots, Empty, SectionHeader, Modal, Btn, Pill, AnswerBtn, ErrorBox } from '../components/UI.jsx'
import { askClaude, PROMPTS } from '../lib/claude.js'
import { kinkGetAll, kinkAdd, kinkAnswer, kinkReveal, kinkGetAnswers, getCoupleId, getMyToken } from '../lib/supabase.js'

const QUIZ_CATS = ['All','Positions','Roleplay','Toys','Fantasy','Sensation','Location','Timing','Other']
const ANSWER_VALUES = ['no_way','explore','hell_yes']
const ANSWER_LABELS = { no_way:'No Way', explore:'Willing to Explore', hell_yes:'Hell Yes' }
const ANSWER_COLORS = { no_way:C.rose, explore:C.gold, hell_yes:C.green }
const ANSWER_EMOJI  = { no_way:'✗', explore:'~', hell_yes:'✓' }

function QuizCard({ item, myAnswer, partnerAnswer, myRevealed, partnerRevealed, onAnswer, onReveal }) {
  const [open, setOpen] = useState(false)
  const bothAnswered = myAnswer && partnerAnswer
  const bothRevealed = myRevealed && partnerRevealed
  const isMatch      = bothRevealed && myAnswer === partnerAnswer

  const statusColor = isMatch ? C.green : bothRevealed ? C.rose : myAnswer ? C.gold : 'rgba(255,255,255,.2)'
  const statusLabel = bothRevealed
    ? isMatch ? (myAnswer === 'hell_yes' ? '🔥 Match — Hell Yes!' : myAnswer === 'explore' ? '💛 Match — Exploring' : '✗ Both said No Way')
    : 'Different answers'
    : bothAnswered ? 'Both answered — tap Reveal'
    : myAnswer ? 'Waiting for partner…'
    : 'Tap to answer'

  return (
    <div onClick={() => setOpen(o => !o)} style={{
      background: open ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.02)',
      border:`1px solid ${open ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.07)'}`,
      borderRadius:12, padding:'18px 20px', cursor:'pointer', transition:'all .3s', marginBottom:10,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:5 }}>
            <span style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase',
              color:'rgba(255,255,255,.35)', background:'rgba(255,255,255,.06)',
              padding:'2px 8px', borderRadius:20 }}>{item.category}</span>
            {item.is_anonymous && <span style={{ fontSize:10, color:'rgba(255,255,255,.2)' }}>anonymous</span>}
          </div>
          <div style={{ fontSize:16, fontFamily:"'Playfair Display',serif", color:C.cream }}>{item.title}</div>
        </div>
        <div style={{ flexShrink:0, textAlign:'right' }}>
          {myAnswer && (
            <div style={{ fontSize:16, color: ANSWER_COLORS[myAnswer] }}>{ANSWER_EMOJI[myAnswer]}</div>
          )}
          <div style={{ fontSize:10, color:statusColor, marginTop:4, letterSpacing:.5 }}>
            {isMatch ? '♥' : bothAnswered && !bothRevealed ? '!' : ''}
          </div>
        </div>
      </div>

      {open && (
        <div style={{ marginTop:14, borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:14, animation:'fadeUp .3s ease' }}
          onClick={e => e.stopPropagation()}>

          <div style={{ fontSize:12, color:statusColor, marginBottom:14, letterSpacing:.5 }}>{statusLabel}</div>

          {!myAnswer && (
            <div>
              <div style={{ fontSize:11, color:'rgba(245,236,215,.35)', letterSpacing:1, textTransform:'uppercase', marginBottom:10 }}>Your answer</div>
              <div style={{ display:'flex', gap:8 }}>
                {ANSWER_VALUES.map(v => (
                  <AnswerBtn key={v} label={ANSWER_LABELS[v]} value={v} selected={false} onClick={() => onAnswer(item.id, v)} />
                ))}
              </div>
            </div>
          )}

          {myAnswer && !bothRevealed && (
            <div>
              <div style={{ fontSize:13, color:'rgba(245,236,215,.5)', marginBottom:12 }}>
                Your answer: <span style={{ color:ANSWER_COLORS[myAnswer], fontWeight:'bold' }}>{ANSWER_LABELS[myAnswer]}</span>
              </div>
              {bothAnswered && !myRevealed && (
                <Btn onClick={() => onReveal(item.id)} style={{ width:'100%' }}>
                  Reveal My Answer to Partner
                </Btn>
              )}
              {myRevealed && !partnerRevealed && (
                <p style={{ color:'rgba(245,236,215,.35)', fontSize:12, textAlign:'center', fontStyle:'italic' }}>
                  Waiting for partner to reveal…
                </p>
              )}
            </div>
          )}

          {bothRevealed && (
            <div style={{ background: isMatch ? 'rgba(168,197,160,.08)' : 'rgba(255,255,255,.04)',
              border:`1px solid ${isMatch ? C.green+'30' : 'rgba(255,255,255,.1)'}`, borderRadius:10, padding:'14px' }}>
              <div style={{ display:'flex', gap:12 }}>
                <div style={{ flex:1, textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'rgba(245,236,215,.3)', textTransform:'uppercase', marginBottom:6 }}>You</div>
                  <div style={{ fontSize:14, color:ANSWER_COLORS[myAnswer], fontWeight:'bold' }}>{ANSWER_LABELS[myAnswer]}</div>
                </div>
                <div style={{ width:1, background:'rgba(255,255,255,.1)' }} />
                <div style={{ flex:1, textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'rgba(245,236,215,.3)', textTransform:'uppercase', marginBottom:6 }}>Partner</div>
                  <div style={{ fontSize:14, color:ANSWER_COLORS[partnerAnswer], fontWeight:'bold' }}>{ANSWER_LABELS[partnerAnswer]}</div>
                </div>
              </div>
              {isMatch && myAnswer === 'hell_yes' && (
                <div style={{ textAlign:'center', marginTop:12, color:C.green, fontSize:13 }}>🔥 You both want this!</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function KinkQuiz() {
  const [items,      setItems]     = useState([])
  const [answers,    setAnswers]   = useState([])
  const [loading,    setLoading]   = useState(false)
  const [suggesting, setSuggesting]= useState(false)
  const [cat,        setCat]       = useState('All')
  const [addModal,   setAddModal]  = useState(false)
  const [newTitle,   setNewTitle]  = useState('')
  const [newCat,     setNewCat]    = useState('Other')
  const [anon,       setAnon]      = useState(true)
  const [suggestions,setSuggestions]=useState([])
  const [tab,        setTab]       = useState('quiz')

  const coupleId = getCoupleId()
  const myToken  = getMyToken()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [i, a] = await Promise.all([kinkGetAll(coupleId), kinkGetAnswers(coupleId)])
    setItems(i); setAnswers(a)
    setLoading(false)
  }

  const loadSuggestions = async () => {
    setSuggesting(true)
    try {
      const result = await askClaude(PROMPTS.kinkSuggestions(), 1500)
      setSuggestions(result)
    } catch(e) { console.error(e) }
    finally { setSuggesting(false) }
  }

  const handleAnswer = async (itemId, answer) => {
    await kinkAnswer(itemId, coupleId, answer)
    await load()
  }

  const handleReveal = async (itemId) => {
    await kinkReveal(itemId, coupleId)
    await load()
  }

  const handleAdd = async (title, category) => {
    await kinkAdd(coupleId, title, category, anon)
    setNewTitle(''); setAddModal(false)
    await load()
  }

  const addSuggestion = async (s) => {
    await kinkAdd(coupleId, s.title, s.category, false)
    setSuggestions(prev => prev.filter(x => x.title !== s.title))
    await load()
  }

  const getMyAnswer      = (itemId) => answers.find(a => a.item_id===itemId && a.user_token===myToken)
  const getPartnerAnswer = (itemId) => answers.find(a => a.item_id===itemId && a.user_token!==myToken)

  const filtered = cat === 'All' ? items : items.filter(i => i.category === cat)

  const matches = items.filter(item => {
    const mine    = getMyAnswer(item.id)
    const partner = getPartnerAnswer(item.id)
    return mine?.revealed && partner?.revealed && mine.answer === partner.answer && mine.answer === 'hell_yes'
  })

  const pendingPartnerSuggestions = items.filter(i =>
    i.is_anonymous && i.submitter_token !== myToken && !getMyAnswer(i.id)
  ).length

  return (
    <div className="fade-up">
      <SectionHeader tagline="Discover each other" title="Kink & Preference Quiz" />

      {pendingPartnerSuggestions > 0 && (
        <div style={{ background:'rgba(192,68,90,.1)', border:'1px solid rgba(192,68,90,.3)',
          borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
          <span style={{ color:'rgba(245,236,215,.7)', fontSize:13 }}>
            ● {pendingPartnerSuggestions} anonymous suggestion{pendingPartnerSuggestions!==1?'s':''} from your partner need your answer
          </span>
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['quiz','All Questions'],['matches','🔥 Matches']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1, padding:'10px', borderRadius:10, fontSize:13, letterSpacing:.5,
            background: tab===id ? 'rgba(201,168,76,.15)' : 'rgba(255,255,255,.03)',
            border:`1px solid ${tab===id ? 'rgba(201,168,76,.5)' : 'rgba(255,255,255,.07)'}`,
            color: tab===id ? C.gold​​​​​​​​​​​​​​​​
