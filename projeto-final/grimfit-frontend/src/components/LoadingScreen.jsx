import React from 'react'
import logo from '../assets/grimfit-logo.png'

export default function LoadingScreen() {
  return (
    <div className="tela-carregamento" role="status" aria-live="polite">
      <img src={logo} alt="Carregando GRIMFIT" className="logo-pulsando" />
    </div>
  )
}
