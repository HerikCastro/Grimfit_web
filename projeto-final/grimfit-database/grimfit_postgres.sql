-- ============================================================
-- GRIMFIT - Schema convertido de MySQL para PostgreSQL
-- ============================================================
-- Não precisa de DROP DATABASE / CREATE DATABASE / USE aqui.
-- No Render, o banco Postgres já vem criado pra você.
-- Basta rodar este script direto dentro dele (psql, DBeaver, etc).
-- ============================================================

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),

  tipo VARCHAR(20) DEFAULT 'cliente'
    CHECK (tipo IN ('cliente', 'admin', 'suporte')),

  reset_token VARCHAR(255),
  reset_token_expire TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enderecos (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  apelido VARCHAR(100),
  cep VARCHAR(20) NOT NULL,
  rua VARCHAR(255) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(255),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL,
  imagem_url TEXT
);

CREATE TABLE marcas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL,
  imagem_url TEXT
);

CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  imagem_url TEXT,
  categoria_id INT,
  marca_id INT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (marca_id) REFERENCES marcas(id)
);

CREATE TABLE variacoes_produto (
  id SERIAL PRIMARY KEY,
  produto_id INT NOT NULL,
  tamanho VARCHAR(10),
  cor VARCHAR(50),
  estoque INT DEFAULT 0,

  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE favoritos (
  usuario_id INT,
  produto_id INT,

  PRIMARY KEY (usuario_id, produto_id),

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE carrinhos (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE itens_carrinho (
  id SERIAL PRIMARY KEY,
  carrinho_id INT NOT NULL,
  variacao_id INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,

  FOREIGN KEY (carrinho_id) REFERENCES carrinhos(id) ON DELETE CASCADE,
  FOREIGN KEY (variacao_id) REFERENCES variacoes_produto(id)
);

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  endereco_id INT,
  valor_total DECIMAL(10,2) DEFAULT 0,

  status VARCHAR(20) DEFAULT 'pendente'
    CHECK (status IN (
      'pendente', 'pago', 'separacao', 'enviado',
      'saiu_entrega', 'entregue', 'cancelado'
    )),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (endereco_id) REFERENCES enderecos(id)
);

CREATE TABLE itens_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,

  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE rastreamentos (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL,
  codigo_rastreio VARCHAR(100),
  transportadora VARCHAR(100),
  ultimo_status VARCHAR(255),
  ultima_atualizacao TIMESTAMP,

  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

CREATE TABLE historico_rastreamento (
  id SERIAL PRIMARY KEY,
  rastreamento_id INT NOT NULL,
  status VARCHAR(255),
  descricao TEXT,
  data_evento TIMESTAMP,

  FOREIGN KEY (rastreamento_id) REFERENCES rastreamentos(id) ON DELETE CASCADE
);

CREATE TABLE cupons (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  desconto DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  validade TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pagamentos (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL,

  metodo VARCHAR(10) NOT NULL
    CHECK (metodo IN ('pix', 'cartao', 'boleto')),

  status VARCHAR(20) DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'aprovado', 'recusado')),

  valor DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

CREATE TABLE avaliacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  produto_id INT NOT NULL,
  nota INT NOT NULL,
  comentario TEXT,
  foto_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  assunto VARCHAR(255),

  status VARCHAR(20) DEFAULT 'aberto'
    CHECK (status IN ('aberto', 'em_atendimento', 'fechado')),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE mensagens_ticket (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL,
  usuario_id INT NOT NULL,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE notificacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(255),
  mensagem TEXT,
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE logs_sistema (
  id SERIAL PRIMARY KEY,
  usuario_id INT,
  acao VARCHAR(255),
  tabela_afetada VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- updated_at automático (substitui o "ON UPDATE CURRENT_TIMESTAMP"
-- que existia no MySQL e não existe no Postgres).
-- Precisa de uma function + trigger por tabela que tem updated_at.
-- ============================================================

CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_produtos_updated_at
BEFORE UPDATE ON produtos
FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

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
