import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export function setAuthToken(token) {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete API.defaults.headers.common['Authorization']
}

// ===== Auth =====
export async function registerUser(payload) {
  const res = await API.post('/api/auth/register', payload)
  return res.data
}

export async function loginUser(payload) {
  const res = await API.post('/api/auth/login', payload)
  return res.data
}

// ===== Perfil =====
export async function getMe() {
  const res = await API.get('/api/users/profile')
  return res.data
}

export async function updateProfile(payload) {
  const res = await API.put('/api/users/profile', payload)
  return res.data
}

export async function changePassword(payload) {
  const res = await API.put('/api/users/password', payload)
  return res.data
}

// ===== Produtos =====
// params aceitos pelo backend: busca, categoria_id, marca_id, preco_min, preco_max, ordenar, page, limit
export async function getProducts(params = {}) {
  const res = await API.get('/api/products', { params })
  return res.data // { produtos, pagina, por_pagina }
}

export async function getProduct(id) {
  const res = await API.get(`/api/products/${id}`)
  return res.data
}

export async function adminCreateProduct(formData) {
  const res = await API.post('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function adminUpdateProduct(id, formData) {
  const res = await API.put(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function adminDeleteProduct(id, confirmacaoSenha) {
  const res = await API.delete(`/api/products/${id}`, { data: { confirmacao_senha: confirmacaoSenha } })
  return res.data
}

// ===== Variações de produto (tamanho/cor/estoque) =====
export async function getVariants(produtoId) {
  const res = await API.get(`/api/variants/produto/${produtoId}`)
  return res.data
}

export async function adminCreateVariant(produtoId, payload) {
  const res = await API.post(`/api/variants/produto/${produtoId}`, payload)
  return res.data
}

export async function adminUpdateVariant(id, payload) {
  const res = await API.put(`/api/variants/${id}`, payload)
  return res.data
}

export async function adminDeleteVariant(id) {
  const res = await API.delete(`/api/variants/${id}`)
  return res.data
}

// ===== Estilos =====
export async function getStyles() {
  const res = await API.get('/api/styles')
  return res.data
}

export async function adminCreateStyle(payload) {
  const res = await API.post('/api/styles', payload)
  return res.data
}

export async function adminUpdateStyle(id, payload) {
  const res = await API.put(`/api/styles/${id}`, payload)
  return res.data
}

export async function adminDeleteStyle(id, confirmPassword) {
  const res = await API.delete(`/api/styles/${id}`, { data: { confirmacao_senha: confirmPassword } })
  return res.data
}

// ===== Preferences =====
export async function getPreferences() {
  const res = await API.get('/api/users/preferences')
  return res.data
}

export async function setPreferences(styleIds) {
  const res = await API.put('/api/users/preferences', { style_ids: styleIds })
  return res.data
}

// ===== Password Confirmation =====
export async function confirmPassword(password) {
  const res = await API.post('/api/users/confirm-password', { senha: password })
  return res.data
}

// ===== Categorias =====
export async function getCategories() {
  const res = await API.get('/api/categories')
  return res.data
}

export async function adminCreateCategory(formData) {
  const res = await API.post('/api/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function adminUpdateCategory(id, formData) {
  const res = await API.put(`/api/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function adminDeleteCategory(id, confirmacaoSenha) {
  const res = await API.delete(`/api/categories/${id}`, { data: { confirmacao_senha: confirmacaoSenha } })
  return res.data
}

// ===== Marcas =====
export async function getBrands() {
  const res = await API.get('/api/brands')
  return res.data
}

export async function adminCreateBrand(formData) {
  const res = await API.post('/api/brands', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function adminUpdateBrand(id, formData) {
  const res = await API.put(`/api/brands/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function adminDeleteBrand(id, confirmacaoSenha) {
  const res = await API.delete(`/api/brands/${id}`, { data: { confirmacao_senha: confirmacaoSenha } })
  return res.data
}

// ===== Carrinho (sempre vinculado ao usuário logado, no backend) =====
export async function getCart() {
  const res = await API.get('/api/cart')
  return res.data
}

export async function addCartItem(variacao_id, quantidade = 1) {
  const res = await API.post('/api/cart', { variacao_id, quantidade })
  return res.data
}

export async function updateCartItem(itemId, quantidade) {
  const res = await API.put(`/api/cart/${itemId}`, { quantidade })
  return res.data
}

export async function removeCartItem(itemId) {
  const res = await API.delete(`/api/cart/${itemId}`)
  return res.data
}

// ===== Endereços =====
export async function getAddresses() {
  const res = await API.get('/api/addresses')
  return res.data
}

export async function createAddress(payload) {
  const res = await API.post('/api/addresses', payload)
  return res.data
}

export async function updateAddress(id, payload) {
  const res = await API.put(`/api/addresses/${id}`, payload)
  return res.data
}

export async function deleteAddress(id) {
  const res = await API.delete(`/api/addresses/${id}`)
  return res.data
}

// ===== Pedidos =====
export async function createOrder(endereco_id) {
  const res = await API.post('/api/orders', { endereco_id })
  return res.data
}

export async function getMyOrders() {
  const res = await API.get('/api/orders')
  return res.data
}

export async function getOrder(id) {
  const res = await API.get(`/api/orders/${id}`)
  return res.data
}

export async function cancelOrder(id) {
  const res = await API.put(`/api/orders/${id}/cancel`)
  return res.data
}

// ===== Cupons =====
export async function validateCoupon(codigo) {
  const res = await API.post('/api/coupons/validate', { codigo })
  return res.data
}

export async function adminGetCoupons() {
  const res = await API.get('/api/coupons')
  return res.data
}

export async function adminCreateCoupon(payload) {
  const res = await API.post('/api/coupons', payload)
  return res.data
}

export async function adminUpdateCoupon(id, payload) {
  const res = await API.put(`/api/coupons/${id}`, payload)
  return res.data
}

export async function adminDeleteCoupon(id) {
  const res = await API.delete(`/api/coupons/${id}`)
  return res.data
}

// ===== Favoritos =====
export async function getFavorites() {
  const res = await API.get('/api/favorites')
  return res.data
}

export async function addFavorite(produto_id) {
  const res = await API.post('/api/favorites', { produto_id })
  return res.data
}

export async function removeFavorite(produtoId) {
  const res = await API.delete(`/api/favorites/${produtoId}`)
  return res.data
}

// ===== Avaliações =====
export async function getReviews(produtoId) {
  const res = await API.get(`/api/reviews/${produtoId}`)
  return res.data
}

export async function createReview(payload) {
  const res = await API.post('/api/reviews', payload)
  return res.data
}

// ===== Tickets de suporte =====
export async function getMyTickets() {
  const res = await API.get('/api/tickets')
  return res.data
}

export async function createTicket(assunto) {
  const res = await API.post('/api/tickets', { assunto })
  return res.data
}

export async function getTicketMessages(ticketId) {
  const res = await API.get(`/api/tickets/${ticketId}/messages`)
  return res.data
}

export async function sendTicketMessage(ticketId, mensagem) {
  const res = await API.post(`/api/tickets/${ticketId}/messages`, { mensagem })
  return res.data
}

// ===== Notificações =====
export async function getNotifications() {
  const res = await API.get('/api/notifications')
  return res.data
}

export async function markNotificationRead(id) {
  const res = await API.put(`/api/notifications/${id}/read`)
  return res.data
}

export async function deleteNotification(id) {
  const res = await API.delete(`/api/notifications/${id}`)
  return res.data
}

// ===== Admin: usuários, pedidos, tickets =====
export async function adminGetUsers() {
  const res = await API.get('/api/admin/users')
  return res.data
}

export async function adminUpdateUserType(id, tipo, confirmacaoSenha) {
  const res = await API.put(`/api/admin/users/${id}`, { tipo, confirmacao_senha: confirmacaoSenha })
  return res.data
}

export async function adminDeleteUser(id, confirmacaoSenha) {
  const res = await API.delete(`/api/admin/users/${id}`, { data: { confirmacao_senha: confirmacaoSenha } })
  return res.data
}

export async function adminGetOrders() {
  const res = await API.get('/api/admin/orders')
  return res.data
}

export async function adminUpdateOrderStatus(id, status) {
  const res = await API.put(`/api/admin/orders/${id}`, { status })
  return res.data
}

export async function adminGetTickets() {
  const res = await API.get('/api/admin/tickets')
  return res.data
}

export async function adminUpdateTicketStatus(id, status) {
  const res = await API.put(`/api/admin/tickets/${id}/status`, { status })
  return res.data
}

export default API
