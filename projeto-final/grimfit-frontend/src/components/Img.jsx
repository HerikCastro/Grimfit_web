import React, { useState } from 'react'

const FALLBACK = '/src/assets/shoe1.svg'

export default function Img({ src, alt = '', className = '', onLoad, ...props }) {
  const [erro, setErro] = useState(false)
  const resolvedSrc = erro || !src ? FALLBACK : src

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setErro(true)}
      onLoad={onLoad}
      {...props}
    />
  )
}
