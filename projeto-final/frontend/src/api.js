import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:3000' })

export function setAuthToken(token) {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete API.defaults.headers.common['Authorization']
}

export async function createCheckout(payload) {
  const res = await API.post('/checkout', payload)
  return res.data
}

export async function getOrder(id) {
  const res = await API.get(`/orders/${id}`)
  return res.data
}

export async function confirmOrder(id) {
  const res = await API.post(`/orders/${id}/confirm`)
  return res.data
}

export async function registerUser(payload) {
  const res = await API.post('/api/auth/register', payload)
  return res.data
}

export async function loginUser(payload) {
  const res = await API.post('/api/auth/login', payload)
  return res.data
}

export async function getUserCart() {
  const res = await API.get('/me/cart')
  return res.data
}

export async function saveUserCart(cart) {
  const res = await API.post('/me/cart', { cart })
  return res.data
}

export async function getMe() {
  const res = await API.get('/api/users/profile')
  return res.data
}

export async function updateUser(id, payload) {
  const res = await API.put(`/usuarios/${id}`, payload)
  return res.data
}

export async function deleteUser(id) {
  const res = await API.delete(`/usuarios/${id}`)
  return res.data
}

// Admin product endpoints
export async function adminListProducts() {
  const res = await API.get('/admin/produtos')
  return res.data
}

export async function adminCreateProduct(payload) {
  // payload can be FormData (with file) or plain object
  const res = await API.post('/admin/produtos', payload)
  return res.data
}

export async function adminUpdateProduct(id, payload) {
  const res = await API.put(`/admin/produtos/${id}`, payload)
  return res.data
}

export async function adminDeleteProduct(id) {
  const res = await API.delete(`/admin/produtos/${id}`)
  return res.data
}

export async function getProducts(params = {}) {
  const res = await API.get('/api/products', { params })
  return res.data
}

export async function getProduct(id) {
  const res = await API.get(`/api/products/${id}`)
  return res.data
}

export default API
