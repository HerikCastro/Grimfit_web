import React from 'react'

// Paginação inteligente: desabilita "Anterior" na página 1
// e "Próxima" quando não há mais itens.
export default function Pagination({ pagina, temProxima, onChange }) {
  return (
    <div className="pagination" role="navigation" aria-label="Paginação">
      <button
        className="pagination-btn"
        onClick={() => onChange(pagina - 1)}
        disabled={pagina <= 1}
        aria-label="Página anterior"
      >
        ← Anterior
      </button>
      <span className="pagination-pagina">Página {pagina}</span>
      <button
        className="pagination-btn"
        onClick={() => onChange(pagina + 1)}
        disabled={!temProxima}
        aria-label="Próxima página"
      >
        Próxima →
      </button>
    </div>
  )
}
