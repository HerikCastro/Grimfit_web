import React, { useEffect, useState } from 'react'
import { resolveImage } from '../utils/images'

export default function Img({ src, alt = '', className, style, onLoad, loading = 'lazy', ...rest }){
  const [current, setCurrent] = useState(() => resolveImage(src))

  useEffect(()=>{
    setCurrent(resolveImage(src))
  },[src])

  function handleError(){
    // fallback to a local svg asset if image not found
    if (current !== '/src/assets/shoe1.svg') setCurrent('/src/assets/shoe1.svg')
  }

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      onLoad={onLoad}
      loading={loading}
      {...rest}
    />
  )
}
