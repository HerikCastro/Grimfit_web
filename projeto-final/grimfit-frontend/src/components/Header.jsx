import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/grimfit-logo.png'

export default function Header() {
  const { count } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [menuAberto, setMenuAberto] = useState(false)
  const [busca, setBusca] = useState('')

  function alternarMenu() {
    setMenuAberto((aberto) => !aberto)
  }

  function fecharMenu() {
    setMenuAberto(false)
  }

  function handleBuscar(evento) {
    evento.preventDefault()
    fecharMenu()
    navigate(`/catalog?busca=${encodeURIComponent(busca.trim())}`)
  }

  function handleLogout(evento) {
    evento.preventDefault()
    fecharMenu()
    logout()
    navigate('/')
  }

  return (
    <header className="cabecalho">
      <div className="cabecalho-topo">
        <div className="logo">
          <Link to="/" onClick={fecharMenu}>
            <img src={logo} alt="GRIMFIT" className="logo-imagem" />
          </Link>
        </div>

        <button
          className="botao-menu"
          aria-controls="menu-principal"
          aria-expanded={menuAberto}
          onClick={alternarMenu}
        >
          {menuAberto ? 'Fechar menu' : 'Abrir menu'}
        </button>
      </div>

      <form className="busca-form" onSubmit={handleBuscar}>
        <input
          type="search"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar produto"
        />
        <button type="submit">Buscar</button>
      </form>

      <nav>
        <ul id="menu-principal" className={`menu-lista ${menuAberto ? 'menu-aberto' : ''}`}>
          <li><Link to="/catalog" onClick={fecharMenu}>Loja</Link></li>
          <li><Link to="/catalog" onClick={fecharMenu}>Estilos</Link></li>
          <li>
            <Link to="/cart" onClick={fecharMenu}>
              Carrinho{count > 0 ? ` (${count})` : ''}
            </Link>
          </li>
          {user ? (
            <>
              {user.tipo === 'admin' && (
                <li><Link to="/admin" onClick={fecharMenu}>Admin</Link></li>
              )}
              <li><Link to="/perfil" onClick={fecharMenu}>{user.nome || user.email}</Link></li>
              <li><a href="#" onClick={handleLogout}>Sair</a></li>
            </>
          ) : (
            <li><Link to="/login" onClick={fecharMenu}>Entrar</Link></li>
          )}
        </ul>
      </nav>
    </header>
  )
}
