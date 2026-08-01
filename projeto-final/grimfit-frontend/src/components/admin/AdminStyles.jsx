import React, { useEffect, useState } from 'react'
import { getStyles, adminCreateStyle, adminUpdateStyle, adminDeleteStyle } from '../../api'
import { useToast } from '../ToastContext'

export default function AdminStyles() {
  const { show } = useToast()
  const [estilos, setEstilos] = useState([])
  const [nome, setNome] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    try { setEstilos(await getStyles()) } catch (e) { console.error(e) }
  }

  function resetForm() {
    setNome(''); setEditandoId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      if (editandoId) await adminUpdateStyle(editandoId, { nome })
      else await adminCreateStyle({ nome })
      show('Estilo salvo', 'success')
      resetForm()
      await carregar()
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao salvar estilo', 'error')
    } finally {
      setSalvando(false)
    }
  }

  function editar(e) {
    setEditandoId(e.id)
    setNome(e.nome)
  }

  async function apagar(id) {
    if (!window.confirm('Apagar esse estilo? Produtos que usam ele perdem essa marcação.')) return
    try {
      await adminDeleteStyle(id)
      show('Estilo removido', 'success')
      await carregar()
    } catch (err) {
      show('Erro ao remover estilo', 'error')
    }
  }

  return (
    <div className="admin-secao">
      <h3>{editandoId ? 'Editar estilo' : 'Novo estilo'}</h3>
      <p className="muted">Ex: Gótico, Sportlife, Alfaiataria, Mandrake...</p>
      <form onSubmit={handleSubmit} className="admin-form">
        <input placeholder="Nome do estilo" value={nome} onChange={e => setNome(e.target.value)} required />
        <div className="admin-form-acoes">
          <button type="submit" disabled={salvando}>{editandoId ? 'Salvar' : 'Criar'}</button>
          {editandoId && <button type="button" onClick={resetForm}>Cancelar</button>}
        </div>
      </form>

      <h3>Estilos cadastrados</h3>
      {estilos.length === 0 ? <p className="muted">Nenhum estilo ainda — cadastre antes de criar produtos.</p> : (
        <table className="admin-table">
          <thead><tr><th>Nome</th><th>Ações</th></tr></thead>
          <tbody>
            {estilos.map(e => (
              <tr key={e.id}>
                <td>{e.nome}</td>
                <td>
                  <button onClick={() => editar(e)}>Editar</button>
                  <button onClick={() => apagar(e.id)}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
