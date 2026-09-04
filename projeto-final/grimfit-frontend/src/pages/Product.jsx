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
  const [corSelecionada, setCorSelecionada] = useState('')
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('')
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
        setVariacoes(Array.isArray(v) ? v : [])
        setCorSelecionada('')
        setTamanhoSelecionado('')

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
    if (!variacaoEscolhida || semEstoque) {
      show('Escolha tamanho/cor disponível', 'error')
      return
    }
    setAdicionando(true)
    try {
      await addItem(Number(variacaoEscolhida.id), quantidade)
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

  const cores = [...new Set(variacoes.map(v => v.color || '-'))]
  const tamanhos = [...new Set(variacoes.map(v => v.size || '-'))]
  const variacaoEscolhida = variacoes.find(v =>
    (v.color || '-') === corSelecionada && (v.size || '-') === tamanhoSelecionado
  )
  const semEstoque = !variacaoEscolhida || variacaoEscolhida.stock <= 0

  function corDisponivel(cor) {
    return variacoes.some(v =>
      (v.color || '-') === cor &&
      (!tamanhoSelecionado || (v.size || '-') === tamanhoSelecionado) &&
      v.stock > 0
    )
  }

  function tamanhoDisponivel(tamanho) {
    return variacoes.some(v =>
      (v.size || '-') === tamanho &&
      (!corSelecionada || (v.color || '-') === corSelecionada) &&
      v.stock > 0
    )
  }

  return (
    <div className="product-page">
      <div className="gallery">
        <div className="main-image">
          <Img src={produto.imageUrl} alt={produto.name} />
        </div>
      </div>
      <div className="details">
        <div className="produto-titulo-linha">
          <h1>{produto.name}</h1>
          <button className="botao-favorito" onClick={handleFavorito} aria-pressed={favoritado}>
            {favoritado ? '★ Favoritado' : '☆ Favoritar'}
          </button>
        </div>
        <div className="product-price">R$ {produto.price}</div>
        {produto.styles && produto.styles.length > 0 && (
          <div className="tags-estilo">
            {produto.styles.map(e => (
              <span key={e.id} className="tag-estilo">{e.name}</span>
            ))}
          </div>
        )}
        <p className="product-description">{produto.description}</p>

        <div className="purchase-panel">
          {variacoes.length > 0 ? (
            <div className="selectors">
            <div className="variant-selector-group">
              <span className="variant-selector-label">Cor</span>
              <div className="variant-pills" role="group" aria-label="Seleção de cor">
                {cores.map(cor => (
                  <button
                    key={cor}
                    type="button"
                    className={`variant-pill ${corSelecionada === cor ? 'selecionado' : ''}`}
                    onClick={() => setCorSelecionada(cor)}
                    disabled={!corDisponivel(cor)}
                    aria-pressed={corSelecionada === cor}
                  >
                    {cor}
                  </button>
                ))}
              </div>
            </div>

            <div className="variant-selector-group">
              <span className="variant-selector-label">Tamanho</span>
              <div className="variant-pills" role="group" aria-label="Seleção de tamanho">
                {tamanhos.map(tamanho => (
                  <button
                    key={tamanho}
                    type="button"
                    className={`variant-pill ${tamanhoSelecionado === tamanho ? 'selecionado' : ''}`}
                    onClick={() => setTamanhoSelecionado(tamanho)}
                    disabled={!tamanhoDisponivel(tamanho)}
                    aria-pressed={tamanhoSelecionado === tamanho}
                  >
                    {tamanho}
                  </button>
                ))}
              </div>
            </div>

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
            disabled={adicionando || variacoes.length === 0 || !variacaoEscolhida || semEstoque}
          >
            {adicionando ? 'Adicionando...' : 'Adicionar ao carrinho'}
          </button>
          <span className={`purchase-status ${semEstoque ? 'purchase-status-alert' : ''}`}>
            {semEstoque ? 'Escolha uma combinação disponível' : 'Compra segura • disponibilidade atualizada'}
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
