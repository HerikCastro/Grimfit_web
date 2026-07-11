import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type='info', ttl=4000) => {
    const id = Math.random().toString(36).slice(2,9)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(()=> setToasts(t => t.filter(x=>x.id!==id)), ttl)
  },[])

  const remove = useCallback((id)=> setToasts(t => t.filter(x=>x.id!==id)), [])

  return (
    <ToastContext.Provider value={{ show, remove }}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
