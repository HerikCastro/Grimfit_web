import React, { useRef, useEffect, useState } from 'react'
import ProductCard from './ProductCard'

export default function NovidadesCarousel({ items = [] }){
  const listRef = useRef()
  const [active, setActive] = useState(0)
  const AUTOPLAY_MS = 3500
  const autoplayRef = useRef(null)

  function scrollToIndex(idx){
    const list = listRef.current
    if (!list) return
    const child = list.children[idx]
    if (!child) return
    list.scrollTo({ left: child.offsetLeft, behavior: 'smooth' })
    setActive(idx)
  }

  function prev(){
    const next = Math.max(0, active - 1)
    scrollToIndex(next)
  }

  function next(){
    const nextIdx = Math.min(items.length - 1, active + 1)
    scrollToIndex(nextIdx)
  }

  useEffect(()=>{
    // autoplay
    if (!items || items.length === 0) return
    autoplayRef.current = setInterval(()=>{
      setActive(a => {
        const n = (a + 1) % items.length
        scrollToIndex(n)
        return n
      })
    }, AUTOPLAY_MS)
    return ()=> clearInterval(autoplayRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[items])

  // update active on manual scroll
  useEffect(()=>{
    const list = listRef.current
    if (!list) return
    function onScroll(){
      const children = Array.from(list.children)
      const left = list.scrollLeft
      let idx = 0
      for (let i=0;i<children.length;i++){
        if (left >= children[i].offsetLeft - 10) idx = i
      }
      setActive(idx)
    }
    list.addEventListener('scroll', onScroll, { passive: true })
    return ()=> list.removeEventListener('scroll', onScroll)
  },[])

  return (
    <section className="novidades-carousel" onMouseEnter={()=>clearInterval(autoplayRef.current)} onMouseLeave={()=>{ autoplayRef.current = setInterval(()=>{ setActive(a => { const n = (a + 1) % items.length; scrollToIndex(n); return n }) }, AUTOPLAY_MS) }}>
      <div className="nov-header">
        <h2>Novidades</h2>
        <div className="nov-controls">
          <button onClick={prev} className="nov-arrow">◀</button>
          <button onClick={next} className="nov-arrow">▶</button>
        </div>
      </div>
      <div className="nov-list" ref={listRef}>
        {items.map((p, i) => (
          <div className="nov-item" key={p.id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <div className="nov-dots">
        {items.map((_,i) => (
          <button key={i} className={`nov-dot ${i===active? 'active':''}`} onClick={()=>scrollToIndex(i)} aria-label={`Go to slide ${i+1}`}></button>
        ))}
      </div>
    </section>
  )
}
