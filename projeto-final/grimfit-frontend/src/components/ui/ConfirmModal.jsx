import React, { useState } from 'react'

// Modal de confirmação com campo de senha obrigatório
// para ações destrutivas. Chama onConfirm(senha) e
// o chamador decide o que fazer com ela.
export default function ConfirmModal({ mensagem, onConfirm, onCancel, loading = false }) {
  const [senha, setSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')

  function handleConfirm(e) {
    e.preventDefault()
    if (!senha) {
      setErroSenha('Digite sua senha pra confirmar')
      return
    }
    setErroSenha('')
    onConfirm(senha)
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-box">
        <h3 className="modal-titulo">Confirmar ação</h3>
        <p className="modal-mensagem">{mensagem}</p>
        <form onSubmit={handleConfirm} className="modal-form">
          <label htmlFor="modal-senha">Confirme sua senha</label>
          <input
            id="modal-senha"
            type="password"
            autoFocus
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="Sua senha"
            className={erroSenha ? 'campo-invalido' : ''}
          />
          {erroSenha && (
            <small className="erro-campo" role="alert" aria-live="polite">{erroSenha}</small>
          )}
          <div className="modal-acoes">
            <button type="button" className="btn" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn danger" disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
