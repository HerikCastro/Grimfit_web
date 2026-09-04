import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

export default function RequireAuth({ children, adminOnly = false }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  // Espera confirmar se tem sessão salva antes de decidir redirecionar
  // — sem isso, dar F5 numa rota protegida jogaria pro login por um
  // instante mesmo com token válido.
  if (!ready) {
    return <div className="rota-carregando" aria-hidden="true" />
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (adminOnly && user.role !== 'admin' && user.tipo !== 'admin') {
    return (
      <div className="acesso-negado">
        <h2>Acesso restrito</h2>
        <p>Essa área é só para administradores.</p>
      </div>
    )
  }

  return children
}
