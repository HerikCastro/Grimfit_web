export const IMG_PATH = '/img/'
export const BACKEND = 'http://localhost:3000'

export function resolveImage(src){
  if (!src) return '/src/assets/shoe1.svg'
  if (typeof src !== 'string') return '/src/assets/shoe1.svg'
  // absolute URL
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  // already an absolute public path
  if (src.startsWith('/')){
    // /uploads should be proxied to backend
    if (src.startsWith('/uploads')) return `${BACKEND}${src}`
    // already e.g. /img/xxx
    return src
  }
  // filename only -> serve from public img
  if (!src.includes('/')) return `${IMG_PATH}${src}`
  // otherwise return as-is
  return src
}

export function guessFromName(product){
  const name = (product.nome || product.name || product.title || '') + ''
  if (!name) return null
  const slug = name.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z0-9]+/g,'_').toLowerCase()
  const exts = ['.jpg','.png','.svg','.webp']
  for (const e of exts) {
    const candidate = `${slug}${e}`
    // do not verify existence here (client-side). Return candidate for resolveImage to map.
    // The server or developer should ensure the file exists in `front-end/img/`.
    return candidate
  }
  return null
}
