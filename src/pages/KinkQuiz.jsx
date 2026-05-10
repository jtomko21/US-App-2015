import { useState, useEffect } from 'react'
import { C, Empty, SectionHeader } from '../components/UI.jsx'
import { kinkGetAll, kinkAdd, kinkAnswer, kinkReveal, kinkGetAnswers, getCoupleId, getMyToken } from '../lib/supabase.js'

export default function KinkQuiz() {
  const [items, setItems] = useState([])
  const [answers, setAnswers] = useState([])
  const coupleId = getCoupleId()
  const myToken = getMyToken()

  useEffect(() => { load() }, [])
  const load = async () => {
    const [i, a] = await Promise.all([kinkGetAll(coupleId), kinkGetAnswers(coupleId)])
    setItems(i); setAnswers(a)
  }

  const handleAnswer = async (itemId, answer) => {
    await kinkAnswer(itemId, coupleId, answer)
    await load()
  }

  return (
    <div className="fade-up">
      <SectionHeader tagline="Discover each other" title="Kink & Preference Quiz" />
      {items.map(item => {
        const mine = answers.find(a => a.item_id===item.id && a.user_token===myToken)
        return (
          <div key={item.id} style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, padding:'18px 20px', marginBottom:10 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:2, marginBottom:6 }}>{item.category}</div>
            <div style={{ fontSize:16, fontFamily:"'Playfair Display',serif", color:C.cream, marginBottom:12 }}>{item.title}</div>
            {!mine && (
              <div style={{ display:'flex', gap:8 }}>
                {['no_way','explore','hell_yes'].map(v => {
                  const labels = { no_way:'No Way', explore:'Explore', hell_yes:'Hell Yes' }
                  const colors = { no_way:C.rose, explore:C.gold, hell_yes:C.green }
                  return <button key={v} onClick={() => handleAnswer(item.id, v)} style={{ flex:1, padding:'8px', borderRadius:8, fontSize:11, textTransform:'uppercase', background:`${colors[v]}15`, border:`1px solid ${colors[v]}40`, color:colors[v] }}>{labels[v]}</button>
                })}
              </div>
            )}
            {mine && <div style={{ fontSize:13, color:C.gold }}>Your answer: {mine.answer.replace('_',' ')}</div>}
          </div>
        )
      })}
      {!items.length && <Empty icon="◈" msg="No questions yet" />}
    </div>
  )
}
