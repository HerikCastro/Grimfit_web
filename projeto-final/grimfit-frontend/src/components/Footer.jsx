import React from 'react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>© {new Date().getFullYear()} GRIMFIT</div>
      <div className="footer-links">Termos • Privacidade</div>
    </footer>
  )
}
