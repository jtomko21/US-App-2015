import { useState, useEffect } from 'react'
import { C, Btn, Dots } from '../components/UI.jsx'
import { challengeGet, challengeSave, challengeComplete, getCoupleId } from '../lib/supabase.js'
import { askClaude, PROMPTS, getMonthYear } from '../lib/claude.js'

function Countdown() {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const friday = new Date()
      friday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7))
      friday.setHours(18,0,0,0)
      const diff = friday - now
      if (diff <= 0) { setTimeLeft('Tonight!'); return }
      const d = Math.floor(diff/86400000)
      const h = Math.floor((diff%86400000)/3600000)
      const m = Math.floor((diff%3600000)/60000)
      setTimeLeft(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`)
    }
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [])
  return <span style={{ color: C.gold, fontFamily:'monospace', fontSize:13 }}>{timeLeft}</span>
}

export default function Dashboard({ onNavigate, notifications }) {
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const coupleId = getCoupleId()
  const { month, year } = getMonthYear()

  useEffect(() => { loadChallenge() }, [])

  const loadChallenge = async () => {
    const c = await challengeGet(coupleId)
    if (c) { setChallenge(c); setDone(c.completed) }
  }

  const generateChallenge = async () => {
    setLoading(true)
    try {
      const [item] = await askClaude(PROMPTS.challenge(month, year), 400)
      await challengeSave(coupleId, JSON.stringify(item))
      setChallenge({ challenge: JSON.stringify(item), completed: false })
      setDone(false)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const markDone = async () => {
    await challengeComplete(coupleId)
    setDone(true)
  }

  let challengeObj = null
  try { if (challenge?.challenge) challengeObj = JSON.parse(challenge.challenge) } catch {}

  const catColor = { Intimacy: C.rose, Adventure: C.gold, Connection: C.blue, Growth: C.green }

  const quickLinks = [
    { id:'dates',     label:'Date Nights',  icon:'✦', color: C.gold   },
    { id:'sensual',   label:'Sensual Play', icon:'❋', color: C.rose   },
    { id:'quiz',      label:'Kink Quiz',    icon:'◈', color: C.purple },
    { id:'vault',     label:'Our Vault',    icon:'⟁', color: C.gold   },
    { id:'trips',     label:'Trip Planner', icon:'✈', color: C.blue   },
    { id:'milestones',label:'Milestones',   icon:'♡', color: C.rose   },
  ]

  const totalNotifs = Object.values(notifications||{}).reduce((a,b)=>a+(b||0),0)

  return (
    <div className="fade-up">
      <div style={{ textAlign:'center', paddingTop:48, paddingBottom:32 }}>
        <div style={{ fontSize:11, letterSpacing:5, color:'rgba(201,168,76,.45)', textTransform:'uppercase', marginBottom:10 }}>
          {month} {year}
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:48, fontWeight:400,
          background:'linear-gradient(135deg,#f5ecd7,#c9a84c)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:'0 0 6px' }}>Us</h1>
        <p style={{ color:'rgba(245,236,215,.25)', fontSize:13, letterSpacing:1 }}>a space just for two</p>
        {totalNotifs > 0 && (
          <div style={{ marginTop:12, display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(192,68,90,.12)', border:'1px solid rgba(192,68,90,.3)',
            borderRadius:20, padding:'6px 14px' }}>
            <span style={{ color:C.rose, fontSize:13 }}>●</span>
            <span style={{ color:'rgba(245,236,215,.7)', fontSize:12 }}>{totalNotifs} item{totalNotifs!==1?'s':''} awaiting your response</span>
          </div>
        )}
      </div>

      <div style={{ background:'rgba(201,168,76,.07)', border:'1px solid rgba(201,168,76,.25)',
        borderRadius:14, padding:'20px', marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:3, color:'rgba(201,168,76,.5)', textTransform:'uppercase', marginBottom:4 }}>This Week's Challenge</div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:'rgba(245,236,215,.4)', fontSize:12 }}>Weekend in</span>
              <Countdown />
            </div>
          </div>
          <button onClick={generateChallenge} disabled={loading}
            style={{ background:'none', border:'1px solid rgba(201,168,76,.3)', borderRadius:8,
              color:C.gold, fontSize:11, padding:'7px 12px', letterSpacing:1, opacity:loading?.5:1 }}>
            {loading ? '…' : '↻'}
          </button>
        </div>

        {loading && <Dots />}

        {challengeObj && !loading && (
          <div>
            <div style={{ flex:1 }}>
              <span style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase',
                color: catColor[challengeObj.category] || C.gold,
                background:`${catColor[challengeObj.category] || C.gold}18`,
                padding:'2px 8px', borderRadius:20 }}>{challengeObj.category}</span>
              <div style={{ fontSize:18, fontFamily:"'Playfair Display',serif", color:C.cream, marginTop:8 }}>
                {challengeObj.title}
              </div>
              <p style={{ color:'rgba(245,236,215,.65)', fontSize:14, lineHeight:1.65, margin:'8px 0 16px', fontStyle:'italic' }}>
                {challengeObj.description}
              </p>
            </div>
            {!done
              ? <Btn onClick={markDone} style={{ width:'100%' }}>Mark as Done ✓</Btn>
              : <div style={{ textAlign:'center', color:'#9dce9d', fontSize:14, padding:'10px 0' }}>✓ Completed this week!</div>
            }
          </div>
        )}

        {!challengeObj && !loading && (
          <div style={{ textAlign:'center', padding:'10px 0' }}>
            <Btn onClick={generateChallenge}>Generate This Week's Challenge</Btn>
          </div>
        )}
      </div>

      <div style={{ fontSize:11, letterSpacing:3, color:'rgba(201,168,76,.35)', textTransform:'uppercase', marginBottom:14 }}>
        Quick Access
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:32 }}>
        {quickLinks.map(l => (
          <button key={l.id} onClick={() => onNavigate(l.id)} style={{
            background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)',
            borderRadius:12, padding:'16px', textAlign:'left', transition:'all .2s',
            display:'flex', alignItems:'center', gap:12,
          }}>
            <span style={{ fontSize:22, color:l.color }}>{l.icon}</span>
            <div>
              <div style={{ fontSize:14, color:C.cream }}>{l.label}</div>
              {notifications?.[l.id] > 0 && (
                <div style={{ fontSize:11, color:l.color, marginTop:2 }}>{notifications[l.id]} pending</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
