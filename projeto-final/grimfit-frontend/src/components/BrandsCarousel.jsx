import React, { useRef } from 'react'
import Img from './Img'

export default function BrandsCarousel({ brands = [] }){
  const listRef = useRef()

  function scroll(dir){
    if (!listRef.current) return
    listRef.current.scrollBy({ left: dir * 180, behavior: 'smooth' })
  }

  return (
    <section className="brands">
      <button className="bubble-arrow left" onClick={()=>scroll(-1)}>&larr;</button>
      <div className="bubbles" ref={listRef}>
        {brands.map(b => (
          <div className="bubble" key={b.id} title={b.name}>
            <Img src={b.logo} alt={b.name} />
            <div className="brand-name">{b.name}</div>
          </div>
        ))}
      </div>
      <button className="bubble-arrow right" onClick={()=>scroll(1)}>&rarr;</button>
    </section>
  )
}
