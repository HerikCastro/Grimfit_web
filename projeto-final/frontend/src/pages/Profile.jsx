import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/ToastContext'

export default function Profile(){
  const { user, logout } = useAuth()
  const [form, setForm] = useState({ nome:'', email:'', telefone:'', cpf:'' })
  const navigate = useNavigate()
  const { show } = useToast()

  useEffect(()=>{
    async function load(){
      if (!user) return
      setForm({ nome: user.nome || '', email: user.email || '', telefone: user.telefone || '', cpf: user.cpf || '' })
    }
    load()
  },[user])

  // Profile is read-only: update and delete user are not available on backend

  if (!user) return <div>Carregando perfil...</div>

  return (
    <div className="profile-page" style={{padding:16}}>
      <h1>Meu Perfil</h1>
      <div style={{display:'grid',gap:8,maxWidth:520}}>
        <label>Nome</label>
        <input value={form.nome} disabled />
        <label>Email</label>
        <input value={form.email} disabled />
        <label>Telefone</label>
        <input value={form.telefone} disabled />
        <label>CPF</label>
        <input value={form.cpf} disabled />
      </div>
    </div>
  )
}

