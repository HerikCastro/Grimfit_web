import React, { useState, useRef, useEffect } from 'react'

export default function Select({ options = [], value, onChange, placeholder = 'Selecionar', multiple = false }) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function fechar(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  function toggle(val) {
    if (multiple) {
      const atual = Array.isArray(value) ? value : []
      const novo = atual.includes(val) ? atual.filter(v => v !== val) : [...atual, val]
      onChange(novo)
    } else {
      onChange(val)
      setAberto(false)
    }
  }

  const label = multiple
    ? (Array.isArray(value) && value.length > 0
        ? options.filter(o => value.includes(o.value)).map(o => o.label).join(', ')
        : placeholder)
    : (options.find(o => o.value === value)?.label || placeholder)

  const ativo = v => multiple ? (Array.isArray(value) && value.includes(v)) : value === v

  return (
    <div className="ui-select" ref={ref}>
      <button type="button" className={`ui-select-trigger ${aberto ? 'aberto' : ''}`} onClick={() => setAberto(a => !a)}>
        <span className="ui-select-label">{label}</span>
        <span className={`ui-select-arrow ${aberto ? 'up' : ''}`}>▾</span>
      </button>
      {aberto && (
        <div className="ui-select-dropdown">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`ui-select-option ${ativo(opt.value) ? 'selecionado' : ''}`}
              onClick={() => toggle(opt.value)}
            >
              {multiple && <span className="ui-check">{ativo(opt.value) ? '✓' : ''}</span>}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
