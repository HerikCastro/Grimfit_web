import React, { useState } from 'react'
import fallbackSrc from '../assets/shoe1.svg'

/**
 * Wrapper de <img> com fallback automático e fade-in seguro.
 *
 * Antes a opacidade começava em 0 (via CSS) e só ia pra 1 via onLoad
 * manipulando o DOM direto — se o navegador já tivesse a imagem em
 * cache, o evento "load" podia disparar antes do React terminar de
 * montar o listener, e a imagem ficava invisível pra sempre (o que,
 * no fundo escuro do site, parecia uma "tela preta"). O fallback
 * também apontava pra um caminho ("/src/assets/...") que só existe em
 * desenvolvimento e quebra depois do build de produção.
 *
 * Agora a imagem já nasce visível por padrão e o fade é só um efeito
 * visual por cima (classe .img-fade-in), nunca bloqueia a exibição.
 * O fallback usa import do Vite, então funciona em dev e em produção.
 */
export default function Img({ src, alt = '', className = '', onLoad, ...props }) {
  const [erro, setErro] = useState(false)
  const [carregada, setCarregada] = useState(false)
  const resolvedSrc = erro || !src ? fallbackSrc : src

  function handleLoad(e) {
    setCarregada(true)
    onLoad?.(e)
  }

  function handleError() {
    if (!erro) setErro(true)
    setCarregada(true)
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={`${className} img-fade${carregada ? ' img-fade-in' : ''}`}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  )
}
