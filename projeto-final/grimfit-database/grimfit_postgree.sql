-- ============================================================
-- GRIMFIT - Correções no schema Postgres
-- Rode isso no banco que já existe (não recria nada, só ajusta)
-- ============================================================

-- 1) Imagem em categorias e marcas (pré-requisito pro Cloudinary)
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS imagem_url TEXT;
ALTER TABLE marcas ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- 2) Índices nas colunas de FK que não tinham nenhum
-- (Postgres indexa o lado "pai" da FK automaticamente, mas nunca
-- o lado "filho" — cada linha abaixo cobre uma FK do schema original)

CREATE INDEX IF NOT EXISTS idx_enderecos_usuario ON enderecos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_marca ON produtos(marca_id);

CREATE INDEX IF NOT EXISTS idx_variacoes_produto ON variacoes_produto(produto_id);

CREATE INDEX IF NOT EXISTS idx_favoritos_produto ON favoritos(produto_id);

CREATE INDEX IF NOT EXISTS idx_itens_carrinho_carrinho ON itens_carrinho(carrinho_id);
CREATE INDEX IF NOT EXISTS idx_itens_carrinho_variacao ON itens_carrinho(variacao_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_endereco ON pedidos(endereco_id);

CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido ON itens_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_produto ON itens_pedido(produto_id);

CREATE INDEX IF NOT EXISTS idx_rastreamentos_pedido ON rastreamentos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_historico_rastreamento ON historico_rastreamento(rastreamento_id);

CREATE INDEX IF NOT EXISTS idx_pagamentos_pedido ON pagamentos(pedido_id);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON avaliacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_produto ON avaliacoes(produto_id);

CREATE INDEX IF NOT EXISTS idx_tickets_usuario ON tickets(usuario_id);

CREATE INDEX IF NOT EXISTS idx_mensagens_ticket_ticket ON mensagens_ticket(ticket_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_ticket_usuario ON mensagens_ticket(usuario_id);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);

-- 3) Busca por texto (nome/descrição do produto) rápida com ILIKE
-- pg_trgm permite indexar "contém o texto em qualquer parte da string",
-- que é o tipo de busca "%termo%" que um site de loja precisa.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_produtos_nome_trgm
  ON produtos USING gin (nome gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_produtos_descricao_trgm
  ON produtos USING gin (descricao gin_trgm_ops);
