import React, { useState } from 'react'
import AdminProducts from '../components/admin/AdminProducts'
import AdminCategories from '../components/admin/AdminCategories'
import AdminBrands from '../components/admin/AdminBrands'
import AdminCoupons from '../components/admin/AdminCoupons'
import AdminOrders from '../components/admin/AdminOrders'
import AdminUsers from '../components/admin/AdminUsers'

const ABAS = [
  { chave: 'produtos', rotulo: 'Produtos', Componente: AdminProducts },
  { chave: 'categorias', rotulo: 'Categorias', Componente: AdminCategories },
  { chave: 'marcas', rotulo: 'Marcas', Componente: AdminBrands },
  { chave: 'cupons', rotulo: 'Cupons', Componente: AdminCoupons },
  { chave: 'pedidos', rotulo: 'Pedidos', Componente: AdminOrders },
  { chave: 'usuarios', rotulo: 'Usuários', Componente: AdminUsers }
]

export default function Admin() {
  const [abaAtiva, setAbaAtiva] = useState('produtos')

  const AbaAtual = ABAS.find(a => a.chave === abaAtiva)?.Componente

  return (
    <div className="admin-page">
      <h1>Painel Admin</h1>

      <div className="admin-abas" role="tablist">
        {ABAS.map(aba => (
          <button
            key={aba.chave}
            role="tab"
            aria-selected={abaAtiva === aba.chave}
            className={`admin-aba ${abaAtiva === aba.chave ? 'admin-aba-ativa' : ''}`}
            onClick={() => setAbaAtiva(aba.chave)}
          >
            {aba.rotulo}
          </button>
        ))}
      </div>

      <div className="admin-conteudo">
        {AbaAtual && <AbaAtual />}
      </div>
    </div>
  )
}
