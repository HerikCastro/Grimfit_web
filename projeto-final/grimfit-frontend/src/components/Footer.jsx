import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} GRIMFIT</span>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link to="/catalog">Loja</Link>
        <Link to="/catalog?aba=estilos">Estilos</Link>
        <Link to="/perfil">Minha conta</Link>
      </div>
    </footer>
  )
}
