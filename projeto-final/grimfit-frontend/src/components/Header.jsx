import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/grimfit-logo.png'
import Img from './Img'

export default function Header() {
  const { count } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  function fecharMenu() { setMenuAberto(false) }
  function alternarMenu() { setMenuAberto(a => !a) }

  function handleLogout(e) {
    e.preventDefault()
    fecharMenu()
    logout()
    navigate('/')
  }

  return (
    <header className="cabecalho">
      {/* ──── mobile: linha topo ──── */}
      <div className="cabecalho-topo">
        <nav className="nav-esquerda" aria-label="Navegação principal">
          <ul className="nav-links">
            <li><Link to="/catalog" onClick={fecharMenu}>Loja</Link></li>
            <li><Link to="/catalog?aba=estilos" onClick={fecharMenu}>Estilos</Link></li>
          </ul>
        </nav>

        <Link to="/" className="logo-centro" onClick={fecharMenu}>
          <img src={logo} alt="GRIMFIT" className="logo-imagem" />
        </Link>

        <nav className="nav-direita" aria-label="Conta e carrinho">
          <ul className="nav-links">
            <li>
              <Link to="/cart" onClick={fecharMenu} className="nav-carrinho" aria-label={`Carrinho com ${count} itens`}>
                <span className="nav-carrinho-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 4H5L3 9v2h2l3.6 7.59c.18.37.55.61.96.61H19v-2h-7.44l-.9-1.63L17.7 11H6.21l-.94-2H2V7h2l1-2h4V4zm0 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                  </svg>
                </span>
                <span className="nav-carrinho-text">Carrinho</span>
                {count > 0 && <span className="badge-count">{count}</span>}
              </Link>
            </li>
            {user ? (
              <li className="nav-usuario">
                <button
                  className="nav-avatar"
                  onClick={alternarMenu}
                  aria-expanded={menuAberto}
                  aria-label="Menu do usuário"
                >
                  {user.foto_url ? <Img src={user.foto_url} alt="Foto de perfil" /> : (user.nome?.[0]?.toUpperCase() || 'U')}
                </button>
                {menuAberto && (
                  <div className="nav-dropdown" role="menu">
                    <span className="nav-dropdown-nome">{user.nome}</span>
                    {user.tipo === 'admin' && (
                      <Link to="/admin" onClick={fecharMenu} role="menuitem">Painel Admin</Link>
                    )}
                    <Link to="/perfil" onClick={fecharMenu} role="menuitem">Perfil</Link>
                    <a href="#" onClick={handleLogout} role="menuitem">Sair</a>
                  </div>
                )}
              </li>
            ) : (
              <li><Link to="/login" onClick={fecharMenu}>Entrar</Link></li>
            )}
          </ul>
        </nav>

        {/* hamburguer só no mobile */}
        <button
          className="botao-menu"
          aria-controls="menu-mobile"
          aria-expanded={menuAberto}
          onClick={alternarMenu}
        >
          <span className={`hamburger ${menuAberto ? 'aberto' : ''}`}>
            <span /><span /><span />
          </span>
        </button>
      </div>

      {/* ──── menu mobile ──── */}
      <div id="menu-mobile" className={`menu-mobile ${menuAberto ? 'menu-aberto' : ''}`}>
        <Link to="/catalog" onClick={fecharMenu}>Loja</Link>
        <Link to="/catalog?aba=estilos" onClick={fecharMenu}>Estilos</Link>
        <Link to="/cart" onClick={fecharMenu}>Carrinho {count > 0 ? `(${count})` : ''}</Link>
        {user ? (
          <>
            {user.tipo === 'admin' && <Link to="/admin" onClick={fecharMenu}>Painel Admin</Link>}
            <Link to="/perfil" onClick={fecharMenu}>Perfil</Link>
            <a href="#" onClick={handleLogout}>Sair</a>
          </>
        ) : (
          <Link to="/login" onClick={fecharMenu}>Entrar</Link>
        )}
      </div>
    </header>
  )
}
