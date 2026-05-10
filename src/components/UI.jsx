import { useState } from 'react'

// ── Design tokens ─────────────────────────────────────────────────────────────
export const C = {
  gold:   '#c9a84c',
  rose:   '#c0445a',
  wine:   '#8b1a4a',
  cream:  '#f5ecd7',
  blue:   '#7ca5b8',
  green:  '#a8c5a0',
  purple: '#b07fb8',
  orange: '#e07057',
  warm:   '#e8a87c',
}

export const cardBase = (active, color = C.gold) => ({
  background:   active ? `${color}10` : 'rgba(255,255,255,.03)',
  border:       `1px solid ${active ? color + '50' : 'rgba(255,255,255,.08)'}`,
  borderRadius: 12,
  padding:      '18px 20px',
  cursor:       'pointer',
  transition:   'all .3s',
  marginBottom: 10,
})

export function Dots() {
  return (
    <div style={{ display:'flex', gap:7, justifyContent:'center', padding:'56px 0', alignItems:'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:C.gold,
          animation:'pulse 1.2s ease-in-out infinite', animationDelay:`${i*.2}s` }} />
      ))}
    </div>
  )
}

export function Empty({ icon, msg }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(245,236,215,.2)' }}>
      <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
      <p style={{ fontStyle:'italic', fontSize:14, margin:0 }}>{msg}</p>
    </div>
  )
}

export function Hr({ color = C.gold }) {
  return <div style={{ height:1, background:`linear-gradient(90deg,${color}50,transparent)`, margin:'13px 0 20px' }} />
}

export function Badge({ count }) {
  if (!count) return null
  return (
    <span style={{ background:C.rose, color:'#fff', borderRadius:20, fontSize:10,
      padding:'1px 6px', marginLeft:4, fontFamily:'monospace' }}>{count}</span>
  )
}

export function Pill({ label, active, onClick, color = C.gold }) {
  return (
    <button onClick={onClick} style={{
      background: active ? `${color}22` : 'rgba(255,255,255,.04)',
      border: `1px solid ${active ? color+'66' : 'rgba(255,255,255,.1)'}`,
      borderRadius: 20, padding:'5px 14px', color: active ? color : 'rgba(245,236,215,.38)',
      fontSize:11, letterSpacing:1, textTransform:'uppercase', transition:'all .2s',
    }}>{label}</button>
  )
}

export function Btn({ children, onClick, disabled, variant='primary', style:s={} }) {
  const styles = {
    primary: { background:`rgba(201,168,76,.14)`, border:`1px solid rgba(201,168,76,.4)`, color:C.gold },
    danger:  { background:`rgba(192,68,90,.12)`,  border:`1px solid rgba(192,68,90,.35)`, color:C.rose },
    ghost:   { background:'transparent', border:'1px solid rgba(255,255,255,.12)', color:'rgba(245,236,215,.5)' },
    success: { background:'rgba(100,180,100,.12)', border:'1px solid rgba(100,180,100,.4)', color:'#9dce9d' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      borderRadius:10, padding:'11px 20px', fontSize:13, letterSpacing:1.5,
      textTransform:'uppercase', transition:'all .25s', opacity: disabled ? .5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer', ...s,
    }}>{children}</button>
  )
}

export function Input({ label, value, onChange, placeholder, type='text', mono=false }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:11, letterSpacing:2, color:`${C.gold}80`,
        textTransform:'uppercase', marginBottom:8 }}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', background:'rgba(0,0,0,.3)', border:'1px solid rgba(255,255,255,.12)',
          borderRadius:10, padding:'13px 16px', color:C.cream, fontSize:14,
          fontFamily: mono ? 'monospace' : 'inherit', boxSizing:'border-box', transition:'border-color .2s',
          outline:'none' }}
        onFocus={e=>e.target.style.borderColor=`${C.gold}60`}
        onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.12)'} />
    </div>
  )
}

export function Textarea({ label, value, onChange, placeholder, rows=4 }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:11, letterSpacing:2, color:`${C.gold}80`,
        textTransform:'uppercase', marginBottom:8 }}>{label}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width:'100%', background:'rgba(0,0,0,.3)', border:'1px solid rgba(255,255,255,.12)',
          borderRadius:10, padding:'13px 16px', color:C.cream, fontSize:14, lineHeight:1.6,
          boxSizing:'border-box', transition:'border-color .2s', outline:'none' }}
        onFocus={e=>e.target.style.borderColor=`${C.gold}60`}
        onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.12)'} />
    </div>
  )
}

export function SectionHeader({ tagline, title, onNew, loading, newLabel='↻ New' }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:3, color:'rgba(201,168,76,.38)', textTransform:'uppercase', marginBottom:3 }}>{tagline}</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:23, fontWeight:400, margin:0, color:C.cream }}>{title}</h2>
        </div>
        {onNew && (
          <button onClick={onNew} disabled={loading} style={{ background:'rgba(201,168,76,.1)',
            border:'1px solid rgba(201,168,76,.3)', borderRadius:8, color:C.gold,
            fontSize:11, letterSpacing:1.5, textTransform:'uppercase', padding:'8px 14px',
            opacity: loading ? .5 : 1, cursor: loading ? 'not-allowed' : 'pointer', transition:'all .2s' }}>
            {loading ? '…' : newLabel}
          </button>
        )}
      </div>
      <Hr />
    </div>
  )
}

export function ErrorBox({ msg, onRetry }) {
  return (
    <div style={{ background:'rgba(224,112,87,.07)', border:'1px solid rgba(224,112,87,.22)',
      borderRadius:10, padding:'18px 20px' }}>
      <p style={{ color:'rgba(224,112,87,.85)', fontSize:13, margin:'0 0 10px' }}>Something went wrong</p>
      <p style={{ color:'rgba(245,236,215,.35)', fontSize:11, margin:'0 0 14px', fontFamily:'monospace',
        wordBreak:'break-all', lineHeight:1.6 }}>{msg}</p>
      {onRetry && <Btn onClick={onRetry}>Try Again</Btn>}
    </div>
  )
}

export function Peppers({ count, max=3, onChange }) {
  return (
    <div style={{ display:'flex', gap:3, alignItems:'center' }}>
      {Array.from({length:max}).map((_,i) => (
        <span key={i} onClick={onChange ? ()=>onChange(i+1) : undefined}
          style={{ fontSize:16, cursor: onChange?'pointer':'default',
            opacity: i < count ? 1 : .2, transition:'opacity .2s' }}>🌶️</span>
      ))}
    </div>
  )
}

export function ExpandCard({ children, open, onToggle, color=C.gold }) {
  return (
    <div onClick={onToggle} style={cardBase(open, color)}>
      {children}
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:1000,
      display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'#1f0e18', borderRadius:'20px 20px 0 0', padding:'28px 20px 40px',
        width:'100%', maxWidth:560, maxHeight:'85vh', overflowY:'auto',
        animation:'fadeUp .3s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:400, color:C.cream }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(245,236,215,.4)', fontSize:22 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function StarRating({ value, onChange, max=5 }) {
  return (
    <div style={{ display:'flex', gap:6 }}>
      {Array.from({length:max}).map((_,i) => (
        <span key={i} onClick={()=>onChange&&onChange(i+1)}
          style={{ fontSize:22, cursor:onChange?'pointer':'default',
            color: i < value ? C.gold : 'rgba(255,255,255,.15)', transition:'color .15s' }}>★</span>
      ))}
    </div>
  )
}

export function AnswerBtn({ label, value, selected, onClick, color }) {
  const colors = { 'no_way': C.rose, 'explore': C.gold, 'hell_yes': C.green }
  const c = color || colors[value] || C.gold
  return (
    <button onClick={onClick} style={{
      flex:1, padding:'10px 8px', borderRadius:10, fontSize:12, letterSpacing:.8,
      textTransform:'uppercase', transition:'all .2s',
      background: selected ? `${c}25` : 'rgba(255,255,255,.04)',
      border: `1px solid ${selected ? c : 'rgba(255,255,255,.1)'}`,
      color: selected ? c : 'rgba(245,236,215,.4)',
    }}>{label}</button>
  )
}
