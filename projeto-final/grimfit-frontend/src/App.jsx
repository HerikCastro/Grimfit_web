import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import ErrorBoundary from './components/ErrorBoundary'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { AuthProvider, useAuth } from './context/AuthContext'
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
import Onboarding from './pages/Onboarding'

function AppContent() {
  const { ready } = useAuth()
  const location = useLocation()

  if (!ready) return <LoadingScreen />

  const rotasSemFundo = ['/cart', '/login', '/register', '/onboarding']
  const semFundo = rotasSemFundo.some(r => location.pathname.startsWith(r))

  return (
    <div className={`app-root ${semFundo ? '' : 'fundo-marca'}`}>
      <Header />
      <main className="container">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
            <Route path="/order/:id" element={<RequireAuth><OrderConfirmation /></RequireAuth>} />
            <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth adminOnly><Admin /></RequireAuth>} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
