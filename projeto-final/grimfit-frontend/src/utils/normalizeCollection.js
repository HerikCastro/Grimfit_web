export function ensureArray(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []

  const candidates = [
    value.items,
    value.data,
    value.results,
    value.produtos,
    value.categorias,
    value.marcas,
    value.estilos,
    value.data?.items,
    value.data?.results,
    value.data?.produtos,
    value.data?.categorias,
    value.data?.marcas,
    value.data?.estilos
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }

  const objectList = Object.values(value).find(Array.isArray)
  return Array.isArray(objectList) ? objectList : []
}
