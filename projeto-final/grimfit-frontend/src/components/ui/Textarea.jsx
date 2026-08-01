import React, { useRef, useEffect } from 'react'

// Cresce automaticamente conforme o texto aumenta.
// Remove completamente o resize manual (resize: none no CSS).
export default function Textarea({ value, onChange, placeholder, minRows = 3, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.style.height = 'auto'
    ref.current.style.height = ref.current.scrollHeight + 'px'
  }, [value])

  return (
    <textarea
      ref={ref}
      className="ui-textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={minRows}
      style={{ resize: 'none', overflow: 'hidden' }}
      {...props}
    />
  )
}
