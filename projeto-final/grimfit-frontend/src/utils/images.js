export const IMG_PATH = '/img/'

export function resolveImage(src) {
  if (!src) return '/src/assets/shoe1.svg'
  if (typeof src !== 'string') return '/src/assets/shoe1.svg'

  // URL completa (Cloudinary, ou qualquer CDN) — usa direto.
  if (src.startsWith('http://') || src.startsWith('https://')) return src

  if (src.startsWith('/')) {
    if (src.startsWith('/uploads')) {
      const base = import.meta.env.VITE_API_URL || ''
      return `${base}${src}`
    }
    return src
  }

  if (!src.includes('/')) return `${IMG_PATH}${src}`

  return src
}
