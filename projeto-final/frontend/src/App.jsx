import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import { ToastProvider } from './components/ToastContext'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import CartPage from './pages/CartPage'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <div className="app-root">
          <Header />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
            </Routes>
          </main>
          <Footer />
          </div>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}
