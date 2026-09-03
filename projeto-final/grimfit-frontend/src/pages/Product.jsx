import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct, getVariants, getFavorites, addFavorite, removeFavorite, getReviews, createReview } from '../api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ToastContext'
import Img from '../components/Img'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()
  const { show } = useToast()

  const [produto, setProduto] = useState(null)
  const [variacoes, setVariacoes] = useState([])
  const [variacaoId, setVariacaoId] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [adicionando, setAdicionando] = useState(false)
  const [favoritado, setFavoritado] = useState(false)
  const [reviews, setReviews] = useState([])
  const [novaAvaliacao, setNovaAvaliacao] = useState({ nota: 5, comentario: '' })

  useEffect(() => {
    async function carregar() {
      try {
        const p = await getProduct(id)
        setProduto(p)

        const v = await getVariants(id)
        setVariacoes(v || [])
        if (v && v.length > 0) setVariacaoId(String(v[0].id))

        const r = await getReviews(id)
        setReviews(r || [])

        if (user) {
          const favs = await getFavorites()
          setFavoritado((favs || []).some(f => f.id === Number(id)))
        }
      } catch (e) {
        console.error(e)
      }
    }
    carregar()
  }, [id, user])

  async function handleAdd() {
    if (!user) {
      show('Faça login pra adicionar ao carrinho', 'error')
      navigate('/login')
      return
    }
    if (!variacaoId) {
      show('Escolha tamanho/cor disponível', 'error')
      return
    }
    setAdicionando(true)
    try {
      await addItem(Number(variacaoId), quantidade)
      show('Adicionado ao carrinho', 'success')
    } catch (e) {
      console.error(e)
      show('Erro ao adicionar ao carrinho', 'error')
    } finally {
      setAdicionando(false)
    }
  }

  async function handleFavorito() {
    if (!user) {
      show('Faça login pra favoritar', 'error')
      navigate('/login')
      return
    }
    try {
      if (favoritado) {
        await removeFavorite(id)
        setFavoritado(false)
      } else {
        await addFavorite(Number(id))
        setFavoritado(true)
      }
    } catch (e) {
      show('Erro ao atualizar favorito', 'error')
    }
  }

  async function handleEnviarAvaliacao(e) {
    e.preventDefault()
    if (!user) {
      show('Faça login pra avaliar', 'error')
      return
    }
    try {
      await createReview({ produto_id: Number(id), ...novaAvaliacao })
      show('Avaliação enviada', 'success')
      setNovaAvaliacao({ nota: 5, comentario: '' })
      const r = await getReviews(id)
      setReviews(r || [])
    } catch (err) {
      show(err?.response?.data?.message || 'Erro ao enviar avaliação', 'error')
    }
  }

  if (!produto) return <div className="rota-carregando" aria-hidden="true" />

  const variacaoEscolhida = variacoes.find(v => String(v.id) === variacaoId)
  const semEstoque = variacaoEscolhida && variacaoEscolhida.estoque <= 0

  return (
    <div className="product-page">
      <div className="gallery">
        <div className="main-image">
          <Img src={produto.imagem_url} alt={produto.nome} />
        </div>
      </div>
      <div className="details">
        <div className="produto-titulo-linha">
          <h1>{produto.nome}</h1>
          <button className="botao-favorito" onClick={handleFavorito} aria-pressed={favoritado}>
            {favoritado ? '★ Favoritado' : '☆ Favoritar'}
          </button>
        </div>
        <div className="product-price">R$ {produto.preco}</div>
        {produto.estilos && produto.estilos.length > 0 && (
          <div className="tags-estilo">
            {produto.estilos.map(e => (
              <span key={e.id} className="tag-estilo">{e.nome}</span>
            ))}
          </div>
        )}
        <p className="product-description">{produto.descricao}</p>

        <div className="purchase-panel">
          {variacoes.length > 0 ? (
            <div className="selectors">
            <label htmlFor="variacao">Tamanho / Cor</label>
            <select id="variacao" value={variacaoId} onChange={e => setVariacaoId(e.target.value)}>
              {variacoes.map(v => (
                <option key={v.id} value={v.id} disabled={v.estoque <= 0}>
                  {v.tamanho || '-'} / {v.cor || '-'} {v.estoque <= 0 ? '(sem estoque)' : ''}
                </option>
              ))}
            </select>

            <label htmlFor="quantidade">Quantidade</label>
            <input
              id="quantidade"
              type="number"
              min="1"
              value={quantidade}
              onChange={e => setQuantidade(Math.max(1, Number(e.target.value)))}
            />
            </div>
          ) : (
            <p className="muted">Nenhuma variação (tamanho/cor) cadastrada pra esse produto ainda.</p>
          )}

          <button
            className="btn primary full"
            onClick={handleAdd}
            disabled={adicionando || variacoes.length === 0 || semEstoque}
          >
            {adicionando ? 'Adicionando...' : 'Adicionar ao carrinho'}
          </button>
          <span className={`purchase-status ${semEstoque ? 'purchase-status-alert' : ''}`}>
            {semEstoque ? 'Variação sem estoque' : 'Compra segura • disponibilidade atualizada'}
          </span>
        </div>

        <section className="secao-avaliacoes">
          <div className="avaliacoes-cabecalho">
            <div>
              <span className="section-kicker">Experiência real</span>
              <h3>Avaliações</h3>
            </div>
            {reviews.length > 0 && <span className="avaliacoes-total">{reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</span>}
          </div>
          {reviews.length === 0 ? (
            <p className="muted">Nenhuma avaliação ainda.</p>
          ) : (
            <div className="lista-avaliacoes">
              {reviews.map((r, i) => (
                <div key={i} className="avaliacao-item">
                  <strong>{r.nome}</strong> — {'★'.repeat(r.nota)}{'☆'.repeat(5 - r.nota)}
                  <p>{r.comentario}</p>
                </div>
              ))}
            </div>
          )}

          {user && (
            <form onSubmit={handleEnviarAvaliacao} className="form-avaliacao">
              <div className="avaliacao-form-topo">
                <label htmlFor="nota">Sua nota</label>
                <select id="nota" value={novaAvaliacao.nota} onChange={e => setNovaAvaliacao({ ...novaAvaliacao, nota: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} {n === 1 ? 'estrela' : 'estrelas'}</option>)}
                </select>
              </div>
              <textarea
                className="ui-textarea"
                placeholder="Comentário (opcional)"
                value={novaAvaliacao.comentario}
                onChange={e => setNovaAvaliacao({ ...novaAvaliacao, comentario: e.target.value })}
              />
              <p className="avaliacao-nota">Disponível após a entrega do pedido.</p>
              <button type="submit" className="btn primary">Enviar avaliação</button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
