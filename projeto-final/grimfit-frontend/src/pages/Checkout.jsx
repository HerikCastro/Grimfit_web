import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getAddresses, createAddress, createOrder } from '../api'
import { useToast } from '../components/ToastContext'

const ENDERECO_VAZIO = {
  apelido: '', cep: '', rua: '', numero: '',
  complemento: '', bairro: '', cidade: '', estado: ''
}

export default function Checkout() {
  const { items, total, refreshCart } = useCart()
  const navigate = useNavigate()
  const { show } = useToast()

  const formatCurrency = (value) => {
    const number = Number(value ?? 0)
    if (!Number.isFinite(number)) return 'R$ 0,00'
    return `R$ ${number.toFixed(2).replace('.', ',')}`
  }

  const [enderecos, setEnderecos] = useState([])
  const [enderecoId, setEnderecoId] = useState('')
  const [novoEndereco, setNovoEndereco] = useState(ENDERECO_VAZIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    carregarEnderecos()
  }, [])

  async function carregarEnderecos() {
    try {
      const lista = await getAddresses()
      setEnderecos(lista || [])
      if (lista && lista.length > 0) setEnderecoId(String(lista[0].id))
      else setMostrarForm(true)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleSalvarEndereco(e) {
    e.preventDefault()
    try {
      await createAddress(novoEndereco)
      show('Endereço salvo', 'success')
      setNovoEndereco(ENDERECO_VAZIO)
      setMostrarForm(false)
      await carregarEnderecos()
    } catch (err) {
      console.error(err)
      show('Erro ao salvar endereço', 'error')
    }
  }

  async function handleFinalizar() {
    if (items.length === 0) {
      show('Carrinho vazio', 'error')
      return
    }
    if (!enderecoId) {
      show('Escolha ou cadastre um endereço', 'error')
      return
    }
    setProcessando(true)
    try {
      const res = await createOrder(Number(enderecoId))
      await refreshCart()
      show('Pedido criado com sucesso', 'success')
      navigate(`/order/${res.pedido_id}`)
    } catch (err) {
      console.error(err)
      show(err?.response?.data?.message || 'Erro ao criar pedido', 'error')
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="checkout-page">
      <h1>Finalizar pedido</h1>

      <div className="checkout-grid">
        <section className="checkout-endereco">
          <h3>Endereço de entrega</h3>

          {enderecos.length > 0 && !mostrarForm && (
            <div className="lista-enderecos">
              {enderecos.map(end => (
                <label key={end.id} className="endereco-opcao">
                  <input
                    type="radio"
                    name="endereco"
                    value={end.id}
                    checked={String(enderecoId) === String(end.id)}
                    onChange={() => setEnderecoId(String(end.id))}
                  />
                  {end.apelido ? `${end.apelido} — ` : ''}{end.rua}, {end.numero} — {end.bairro}, {end.cidade}/{end.estado}
                </label>
              ))}
              <button type="button" className="btn btn-add-endereco" onClick={() => setMostrarForm(true)}>+ Novo endereço</button>
            </div>
          )}

          {mostrarForm && (
            <form onSubmit={handleSalvarEndereco} className="form-endereco">
              <input placeholder="Apelido (ex: Casa)" value={novoEndereco.apelido} onChange={e => setNovoEndereco({ ...novoEndereco, apelido: e.target.value })} />
              <input placeholder="CEP" required value={novoEndereco.cep} onChange={e => setNovoEndereco({ ...novoEndereco, cep: e.target.value })} />
              <input placeholder="Rua" required value={novoEndereco.rua} onChange={e => setNovoEndereco({ ...novoEndereco, rua: e.target.value })} />
              <input placeholder="Número" required value={novoEndereco.numero} onChange={e => setNovoEndereco({ ...novoEndereco, numero: e.target.value })} />
              <input placeholder="Complemento" value={novoEndereco.complemento} onChange={e => setNovoEndereco({ ...novoEndereco, complemento: e.target.value })} />
              <input placeholder="Bairro" required value={novoEndereco.bairro} onChange={e => setNovoEndereco({ ...novoEndereco, bairro: e.target.value })} />
              <input placeholder="Cidade" required value={novoEndereco.cidade} onChange={e => setNovoEndereco({ ...novoEndereco, cidade: e.target.value })} />
              <input placeholder="Estado" required value={novoEndereco.estado} onChange={e => setNovoEndereco({ ...novoEndereco, estado: e.target.value })} />
              <div className="form-endereco-acoes">
                <button type="submit" className="btn primary">Salvar endereço</button>
                {enderecos.length > 0 && (
                  <button type="button" className="btn" onClick={() => setMostrarForm(false)}>Cancelar</button>
                )}
              </div>
            </form>
          )}
        </section>

        <section className="checkout-resumo">
          <h3>Resumo</h3>
          {items.map(item => (
            <div key={item.id} className="resumo-item">
              <span>{item.nome} x{item.quantidade}</span>
              <span>{formatCurrency(item.preco * item.quantidade)}</span>
            </div>
          ))}
          <div className="summary-line"><span>Subtotal</span><strong>{formatCurrency(total)}</strong></div>
          <div className="summary-line"><span>Frete</span><strong>Grátis</strong></div>
          <div className="resumo-total">Total: {formatCurrency(total)}</div>
          <button className="btn primary" onClick={handleFinalizar} disabled={processando}>
            {processando ? 'Processando...' : 'Confirmar pedido'}
          </button>
        </section>
      </div>
    </div>
  )
}
