import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const cart = useCart()
  const count = cart.reduce((s,i)=>s+i.qty,0)
  const { user, logout } = useAuth()

  return (
    <header className="site-header">
      <div className="logo">
        <Link to="/">GRIMFIT</Link>
      </div>
      <nav className="nav">
        <Link to="/catalog">Loja</Link>
        <Link to="/catalog?style=sportlife">Estilos</Link>
        <Link to="/cart">Carrinho{count>0?` (${count})`:''}</Link>
        {user ? (
          <>
            <Link to="/perfil">{user.nome || user.email}</Link>
            <a href="#" onClick={(e)=>{e.preventDefault(); logout()}}>Sair</a>
          </>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
      </nav>
    </header>
  )
}
