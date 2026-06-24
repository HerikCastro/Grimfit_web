import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

function setDebugBanner(text, styles = {}){
  const b = document.getElementById('debug-banner')
  if (!b) return
  b.textContent = text
  Object.assign(b.style, styles)
}

try{
  setDebugBanner('MONTANDO APP...')
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
  // mounted successfully
  // inspect root to help diagnose visibility issues
  try{
    const rootEl = document.getElementById('root')
    const childCount = rootEl ? rootEl.childElementCount : 0
    const htmlLen = rootEl ? Math.min(600, rootEl.innerHTML.length) : 0
    setDebugBanner(`APP MONTADO — children: ${childCount} — innerHTML len: ${htmlLen}`, { background: '#e6f4ea', color: '#0b6623' })
    // add visible outline to root so we can see its box
    if (rootEl){
      rootEl.style.outline = '3px dashed rgba(138,43,226,0.6)'
      rootEl.style.background = 'transparent'
    }
    // keep banner a bit longer so user can inspect; remove after 4s
    setTimeout(()=>{
      const b = document.getElementById('debug-banner')
      if (b) b.remove()
    }, 4000)
  }catch(e){
    console.error('error inspecting root', e)
  }
}catch(err){
  console.error('Error mounting React app', err)
  setDebugBanner('ERRO AO MONTAR APP — veja console', { background: '#fff0f0', color: '#900' })
}
