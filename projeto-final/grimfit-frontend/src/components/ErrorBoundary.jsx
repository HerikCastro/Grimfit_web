import React from 'react'
import logo from '../assets/grimfit-logo.png'

/**
 * Rede de segurança: sem isso, qualquer erro de JavaScript em qualquer
 * componente derruba a árvore inteira do React e deixa só o <body>
 * (fundo quase preto do tema) visível — exatamente a "tela preta" que
 * o site apresentava. Com o ErrorBoundary, o usuário vê uma tela de
 * erro de verdade, com opção de recarregar, em vez de uma tela vazia.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { erro: null }
  }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('Erro não tratado na aplicação:', erro, info)
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="tela-erro-fatal">
          <img src={logo} alt="GRIMFIT" className="tela-erro-fatal-logo" />
          <h1>Algo deu errado</h1>
          <p>
            Não conseguimos carregar essa página. Tente recarregar — se o
            problema continuar, volte pra home.
          </p>
          <div className="tela-erro-fatal-acoes">
            <button className="btn primary" onClick={() => window.location.reload()}>
              Recarregar
            </button>
            <a className="btn" href="/">Ir para a home</a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
