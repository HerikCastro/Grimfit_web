import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getEstilos, setPreferencias } from '../api'
import { useToast } from '../components/ToastContext'
import logo from '../assets/grimfit-logo.png'

export default function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const { show } = useToast()
  const [estilos, setEstilos] = useState([])
  const [selecionados, setSelecionados] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    getEstilos()
      .then(setEstilos)
      .catch(() => setEstilos([]))
      .finally(() => setCarregando(false))
  }, [])

  function toggleEstilo(id) {
    setSelecionados(ant =>
      ant.includes(id) ? ant.filter(i => i !== id) : [...ant, id]
    )
  }

  async function handleContinuar() {
    setSalvando(true)
    try {
      await setPreferencias(selecionados)
      show('Preferências salvas!', 'success')
      navigate(location.state?.from || '/')
    } catch (err) {
      show('Erro ao salvar preferências', 'error')
    } finally {
      setSalvando(false)
    }
  }

  function handlePular() {
    navigate(location.state?.from || '/')
  }

  return (
    <div className="onboarding-page">
      <img src={logo} alt="GRIMFIT" className="onboarding-logo" />
      <h1>Qual é o seu estilo?</h1>
      <p className="muted">Escolha um ou mais estilos pra personalizarmos sua experiência. Você pode mudar depois no perfil.</p>

      {carregando ? (
        <div className="estilos-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="estilo-chip estilo-chip-skeleton" aria-hidden="true" />
          ))}
        </div>
      ) : estilos.length === 0 ? (
        <p className="muted">Nenhum estilo cadastrado ainda.</p>
      ) : (
        <div className="estilos-grid">
          {estilos.map(e => (
            <button
              key={e.id}
              type="button"
              className={`estilo-chip ${selecionados.includes(e.id) ? 'selecionado' : ''}`}
              onClick={() => toggleEstilo(e.id)}
              aria-pressed={selecionados.includes(e.id)}
            >
              {e.nome}
            </button>
          ))}
        </div>
      )}

      <div className="onboarding-acoes">
        <button className="btn primary" onClick={handleContinuar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Continuar'}
        </button>
        <button className="btn" onClick={handlePular}>Pular por agora</button>
      </div>
    </div>
  )
}
