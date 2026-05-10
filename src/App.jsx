import { useState, useEffect } from 'react'
import { C, Btn, Input } from './components/UI.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { DateNights, DeepTalks, MindSoul } from './pages/AIPages.jsx'
import SensualPlay from './pages/SensualPlay.jsx'
import KinkQuiz from './pages/KinkQuiz.jsx'
import { Vault, BucketList, TripPlanner, Milestones } from './pages/OtherPages.jsx'

const SETUP_SQL = `-- Already done! Your tables are ready.`

function SetupScreen({ onComplete }) {
  const [url,     setUrl]    = useState('')
  const [key,     setKey]    = useState('')
  const [code,    setCode]   = useState('')
  const [partner, setPartner]= useState('')
  const [testing, setTesting]= useState(false)
  const [err,     setErr]    = useState('')

  const connect = async () => {
    setErr(''); setTesting(true)
    try {
      const cfg = { url: url.trim().replace(/\/$/,''), key: key.trim(), coupleId: code.trim().toLowerCase() }
      const res = await fetch(`${cfg.url}/rest/v1/vault_items?limit=1`, {
        headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` }
      })
      if (!res.ok) throw new Error(`Connection failed (${res.status})`)
      localStorage.setItem('us:supabaseUrl',  cfg.url)
      localStorage.setItem('us:supabaseKey',  cfg.key)
      localStorage.setItem('us:coupleId',     cfg.coupleId)
      localStorage.setItem('us:partner',      partner)
      onComplete()
    } catch(e) { setErr(e.message) }
    finally { setTesting(false) }
  }

  const numStyle = {
    width:28, height:28, borderRadius:'50%', background:'rgba(201,168,76,.15)',
    border:'1px solid rgba(201,168,76,.35)', color:C.gold, fontSize:13,
    display:'inline-flex', alignItems:'center', justifyContent:'center', marginRight:10, flexShrink:0,
  }
  const cardStyle = {
    background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.07)',
    borderRadius:12, padding:'20px', marginBottom:14,
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1a0a12 0%,#220d18 45%,#1c1008 100%)',
      fontFamily:"'Cormorant Garamond',Georgia,serif", color:C.cream, padding:'0 18px 80px' }}>
      <div style={{ maxWidth:520, margin:'0 auto' }}>
        <div style={{ textAlign:'center', paddingTop:52, paddingBottom:36 }}>
          <div style={{ fontSize:11, letterSpacing:5, color:'rgba(201,168,76,.45)', textTransform:'uppercase', marginBottom:10 }}>First time setup</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:40, fontWeight:400, margin:'0 0 8px',
            background:'linear-gradient(135deg,#f5ecd7,#c9a84c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Us</h1>
          <p style={{ color:'rgba(245,236,215,.35)', fontSize:14, margin:0 }}>Connect your database so both phones stay in sync</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:16 }}>
            <span style={numStyle}>1</span>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:C.cream }}>Enter your Supabase credentials</span>
          </div>
          <p style={{ color:'rgba(245,236,215,.4)', fontSize:13, lineHeight:1.6, margin:'0 0 18px' }}>
            Find these in Supabase → Project Settings → API
          </p>
          <Input label="Project URL" value={url} onChange={setUrl} placeholder="https://xxxx.supabase.co" mono />
          <Input label="Anon / Public Key" value={key} onChange={setKey} placeholder="eyJhbGc…" mono />
          <Input label="Couple Code" value={code} onChange={setCode} placeholder="e.g. us2025 or john-and-jane" />
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, letterSpacing:2, color:`${C.gold}80`,
              textTransform:'uppercase', marginBottom:10 }}>I am</label>
            <div style={{ display:'flex', gap:10 }}>
              {['Partner 1','Partner 2'].map(p => (
                <button key={p} onClick={() => setPartner(p)} style={{ flex:1, padding:'12px', borderRadius:10,
                  background: partner===p ? 'rgba(201,168,76,.15)' : 'rgba(255,255,255,.04)',
                  border:`1px solid ${partner===p ? 'rgba(201,168,76,.5)' : 'rgba(255,255,255,.1)'}`,
                  color: partner===p ? C.gold : 'rgba(245,236,215,.4)', fontSize:13, transition:'all .2s' }}>{p}</button>
              ))}
            </div>
          </div>
          {err && (
            <div style={{ background:'rgba(224,112,87,.08)', border:'1px solid rgba(224,112,87,.25)',
              borderRadius:8, padding:'12px 14px', marginBottom:16 }}>
              <p style={{ color:'rgba(224,112,87,.85)', fontSize:13, margin:0 }}>{err}</p>
            </div>
          )}
          <Btn onClick={connect} disabled={testing || !url || !key || !code || !partner}
            style={{ width:'100%', padding:'15px' }}>
            {testing ? 'Connecting…' : 'Connect & Start'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

const NAV = [
  { id:'home',       label:'Home',     icon:'⌂' },
  { id:'dates',      label:'Dates',    icon:'✦' },
  { id:'talk',       label:'Talks',    icon:'◈' },
  { id:'sensual',    label:'Sensual',  icon:'❋' },
  { id:'quiz',       label:'Quiz',     icon:'◐' },
  { id:'mind',       label:'Mind',     icon:'◎' },
  { id:'bucket',     label:'Bucket',   icon:'⟁' },
  { id:'trips',      label:'Trips',    icon:'✈' },
  { id:'vault',      label:'Vault',    icon:'♦' },
  { id:'milestones', label:'Timeline', icon:'♡' },
]

function BottomNav({ active, onNav }) {
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(18,6,14,.96)',
      backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,.07)',
      display:'flex', overflowX:'auto', zIndex:100,
      paddingBottom:'env(safe-area-inset-bottom)', scrollbarWidth:'none' }}>
      {NAV.map(n => (
        <button key={n.id} onClick={() => onNav(n.id)} style={{
          flexShrink:0, minWidth:60, padding:'10px 8px 8px', background:'none', border:'none',
          display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          color: active===n.id ? C.gold : 'rgba(245,236,215,.28)', transition:'color .2s',
        }}>
          <span style={{ fontSize:18 }}>{n.icon}</span>
          <span style={{ fontSize:9, letterSpacing:.5, textTransform:'uppercase' }}>{n.label}</span>
          {active===n.id && <div style={{ width:20, height:2, background:C.gold, borderRadius:1, marginTop:2 }} />}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const [ready,      setReady]     = useState(false)
  const [configured, setConfigured]= useState(false)
  const [page,       setPage]      = useState('home')
  const [bucketAdd,  setBucketAdd] = useState(null)

  useEffect(() => {
    const url  = localStorage.getItem('us:supabaseUrl')
    const key  = localStorage.getItem('us:supabaseKey')
    const code = localStorage.getItem('us:coupleId')
    if (url && key && code) setConfigured(true)
    setReady(true)
  }, [])

  const handleComplete = () => { window.location.reload() }

  const handleAddBucket = (title, category) => {
    setBucketAdd({ title, category })
    setPage('bucket')
  }

  const reset = () => {
    ['us:supabaseUrl','us:supabaseKey','us:coupleId','us:partner'].forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  if (!ready) return null
  if (!configured) return <SetupScreen onComplete={handleComplete} />

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1a0a12 0%,#220d18 45%,#1c1008 100%)',
      fontFamily:"'Cormorant Garamond',Georgia,serif", color:C.cream }}>

      <div style={{ position:'fixed', top:-80, right:-80, width:360, height:360, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(180,40,80,.09) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:80, left:-80, width:420, height:420, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(201,168,76,.055) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      <div style={{ maxWidth:560, margin:'0 auto', padding:'0 18px 90px', position:'relative', zIndex:1 }}>
        {page==='home'        && <Dashboard onNavigate={setPage} notifications={{}} />}
        {page==='dates'       && <DateNights onAddBucket={handleAddBucket} />}
        {page==='talk'        && <DeepTalks />}
        {page==='sensual'     && <SensualPlay onAddBucket={handleAddBucket} />}
        {page==='quiz'        && <KinkQuiz />}
        {page==='mind'        && <MindSoul />}
        {page==='bucket'      && <BucketList initialAdd={bucketAdd} />}
        {page==='trips'       && <TripPlanner />}
        {page==='vault'       && <Vault />}
        {page==='milestones'  && <Milestones />}
      </div>

      <BottomNav active={page} onNav={p => { setPage(p); setBucketAdd(null) }} />

      <div style={{ position:'fixed', top:8, right:12, zIndex:200 }}>
        <button onClick={reset} style={{ background:'none', border:'none',
          color:'rgba(245,236,215,.1)', fontSize:10, cursor:'pointer' }}>⚙</button>
      </div>
    </div>
  )
}
