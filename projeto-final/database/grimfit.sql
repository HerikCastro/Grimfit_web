CREATE DATABASE IF NOT EXISTS grimfit;
USE grimfit;

-- =====================================================
-- USUÁRIOS
-- =====================================================

CREATE TABLE usuarios (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
email VARCHAR(150) NOT NULL UNIQUE,
senha VARCHAR(255) NOT NULL,
telefone VARCHAR(20),
tipo ENUM(
    'cliente',
    'admin',
    'suporte'
) DEFAULT 'cliente',
reset_token VARCHAR(255),
reset_token_expire DATETIME,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- ENDEREÇOS
-- =====================================================

CREATE TABLE enderecos (
id INT AUTO_INCREMENT PRIMARY KEY,
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
FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
ON DELETE CASCADE
);

-- =====================================================
-- CATEGORIAS
-- =====================================================

CREATE TABLE categorias (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(100) UNIQUE NOT NULL
);

-- =====================================================
-- MARCAS
-- =====================================================

CREATE TABLE marcas (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(100) UNIQUE NOT NULL
);

-- =====================================================
-- PRODUTOS
-- =====================================================

CREATE TABLE produtos (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(150) NOT NULL,
descricao TEXT,
preco DECIMAL(10,2) NOT NULL,
imagem_url TEXT,
categoria_id INT,
marca_id INT,
ativo BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (categoria_id)
REFERENCES categorias(id),
FOREIGN KEY (marca_id)
REFERENCES marcas(id)
);

-- =====================================================
-- VARIAÇÕES
-- =====================================================

CREATE TABLE variacoes_produto (
id INT AUTO_INCREMENT PRIMARY KEY,
produto_id INT NOT NULL,
tamanho VARCHAR(10),
cor VARCHAR(50),
estoque INT DEFAULT 0,
FOREIGN KEY (produto_id)
REFERENCES produtos(id)
ON DELETE CASCADE
);

-- =====================================================
-- FAVORITOS
-- =====================================================

CREATE TABLE favoritos (
usuario_id INT,
produto_id INT,
PRIMARY KEY (
    usuario_id,
    produto_id
),
FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
ON DELETE CASCADE,
FOREIGN KEY (produto_id)
REFERENCES produtos(id)
ON DELETE CASCADE
);

-- =====================================================
-- CARRINHO
-- =====================================================

CREATE TABLE carrinhos (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL UNIQUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
ON DELETE CASCADE
);

CREATE TABLE itens_carrinho (
id INT AUTO_INCREMENT PRIMARY KEY,
carrinho_id INT NOT NULL,
variacao_id INT NOT NULL,
quantidade INT NOT NULL DEFAULT 1,
FOREIGN KEY (carrinho_id)
REFERENCES carrinhos(id)
ON DELETE CASCADE,
FOREIGN KEY (variacao_id)
REFERENCES variacoes_produto(id)
);

-- =====================================================
-- PEDIDOS
-- =====================================================

CREATE TABLE pedidos (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
endereco_id INT,
valor_total DECIMAL(10,2) DEFAULT 0,
status ENUM(
    'pendente',
    'pago',
    'separacao',
    'enviado',
    'saiu_entrega',
    'entregue',
    'cancelado'
) DEFAULT 'pendente',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id)
REFERENCES usuarios(id),
FOREIGN KEY (endereco_id)
REFERENCES enderecos(id)
);

CREATE TABLE itens_pedido (
id INT AUTO_INCREMENT PRIMARY KEY,
pedido_id INT NOT NULL,
produto_id INT NOT NULL,
quantidade INT NOT NULL,
preco_unitario DECIMAL(10,2) NOT NULL,
FOREIGN KEY (pedido_id)
REFERENCES pedidos(id)
ON DELETE CASCADE,
FOREIGN KEY (produto_id)
REFERENCES produtos(id)
);

-- =====================================================
-- RASTREAMENTO
-- =====================================================

CREATE TABLE rastreamentos (
id INT AUTO_INCREMENT PRIMARY KEY,
pedido_id INT NOT NULL,
codigo_rastreio VARCHAR(100),
transportadora VARCHAR(100),
ultimo_status VARCHAR(255),
ultima_atualizacao DATETIME,
FOREIGN KEY (pedido_id)
REFERENCES pedidos(id)
ON DELETE CASCADE
);

CREATE TABLE historico_rastreamento (
id INT AUTO_INCREMENT PRIMARY KEY,
rastreamento_id INT NOT NULL,
status VARCHAR(255),
descricao TEXT,
data_evento DATETIME,
FOREIGN KEY (rastreamento_id)
REFERENCES rastreamentos(id)
ON DELETE CASCADE
);

-- =====================================================
-- CUPONS
-- =====================================================

CREATE TABLE cupons (
id INT AUTO_INCREMENT PRIMARY KEY,
codigo VARCHAR(50) UNIQUE NOT NULL,
desconto DECIMAL(10,2) NOT NULL,
ativo BOOLEAN DEFAULT TRUE,
validade DATETIME,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PAGAMENTOS
-- =====================================================

CREATE TABLE pagamentos (
id INT AUTO_INCREMENT PRIMARY KEY,
pedido_id INT NOT NULL,
metodo ENUM(
    'pix',
    'cartao',
    'boleto'
) NOT NULL,
status ENUM(
    'pendente',
    'aprovado',
    'recusado'
) DEFAULT 'pendente',
valor DECIMAL(10,2) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (pedido_id)
REFERENCES pedidos(id)
ON DELETE CASCADE
);

-- =====================================================
-- AVALIAÇÕES
-- =====================================================

CREATE TABLE avaliacoes (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
produto_id INT NOT NULL,
nota INT NOT NULL,
comentario TEXT,
foto_url TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
ON DELETE CASCADE,
FOREIGN KEY (produto_id)
REFERENCES produtos(id)
ON DELETE CASCADE
);

-- =====================================================
-- TICKETS DE SUPORTE
-- =====================================================

CREATE TABLE tickets (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
assunto VARCHAR(255),
status ENUM(
    'aberto',
    'em_atendimento',
    'fechado'
) DEFAULT 'aberto',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
);

CREATE TABLE mensagens_ticket (
id INT AUTO_INCREMENT PRIMARY KEY,
ticket_id INT NOT NULL,
usuario_id INT NOT NULL,
mensagem TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (ticket_id)
REFERENCES tickets(id)
ON DELETE CASCADE,
FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
);

-- =====================================================
-- NOTIFICAÇÕES
-- =====================================================

CREATE TABLE notificacoes (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
titulo VARCHAR(255),
mensagem TEXT,
lida BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
ON DELETE CASCADE
);

-- =====================================================
-- LOGS
-- =====================================================

CREATE TABLE logs_sistema (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT,
acao VARCHAR(255),
tabela_afetada VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

INSERT INTO categorias (nome) VALUES
('Camisetas'),
('Calças'),
('Moletons'),
('Bermudas'),
('Acessórios');

INSERT INTO marcas (nome) VALUES
('Grimfit');

INSERT INTO cupons
(codigo, desconto, ativo)
VALUES
('BEMVINDO10',10,TRUE),
('GRIMFIT15',15,TRUE);
CREATE DATABASE IF NOT EXISTS grimfit;
USE grimfit;

-- =====================================================
-- USUÁRIOS
-- =====================================================

CREATE TABLE usuarios (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
email VARCHAR(150) NOT NULL UNIQUE,
senha VARCHAR(255) NOT NULL,
telefone VARCHAR(20),

```
tipo ENUM(
    'cliente',
    'admin',
    'suporte'
) DEFAULT 'cliente',

reset_token VARCHAR(255),
reset_token_expire DATETIME,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP
```

);

-- =====================================================
-- ENDEREÇOS
-- =====================================================

CREATE TABLE enderecos (
id INT AUTO_INCREMENT PRIMARY KEY,

```
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

FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
ON DELETE CASCADE
```

);

-- =====================================================
-- CATEGORIAS
-- =====================================================

CREATE TABLE categorias (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(100) UNIQUE NOT NULL
);

-- =====================================================
-- MARCAS
-- =====================================================

CREATE TABLE marcas (
id INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(100) UNIQUE NOT NULL
);

-- =====================================================
-- PRODUTOS
-- =====================================================

CREATE TABLE produtos (
id INT AUTO_INCREMENT PRIMARY KEY,

```
nome VARCHAR(150) NOT NULL,

descricao TEXT,

preco DECIMAL(10,2) NOT NULL,

imagem_url TEXT,

categoria_id INT,

marca_id INT,

ativo BOOLEAN DEFAULT TRUE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP,

FOREIGN KEY (categoria_id)
REFERENCES categorias(id),

FOREIGN KEY (marca_id)
REFERENCES marcas(id)
```

);

-- =====================================================
-- VARIAÇÕES
-- =====================================================

CREATE TABLE variacoes_produto (
id INT AUTO_INCREMENT PRIMARY KEY,

```
produto_id INT NOT NULL,

tamanho VARCHAR(10),

cor VARCHAR(50),

estoque INT DEFAULT 0,

FOREIGN KEY (produto_id)
REFERENCES produtos(id)
ON DELETE CASCADE
```

);

-- =====================================================
-- FAVORITOS
-- =====================================================

CREATE TABLE favoritos (
usuario_id INT,
produto_id INT,

```
PRIMARY KEY (
    usuario_id,
    produto_id
),

FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
ON DELETE CASCADE,

FOREIGN KEY (produto_id)
REFERENCES produtos(id)
ON DELETE CASCADE
```

);

-- =====================================================
-- CARRINHO
-- =====================================================

CREATE TABLE carrinhos (
id INT AUTO_INCREMENT PRIMARY KEY,

```
usuario_id INT NOT NULL UNIQUE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
ON DELETE CASCADE
```

);

CREATE TABLE itens_carrinho (
id INT AUTO_INCREMENT PRIMARY KEY,

```
carrinho_id INT NOT NULL,

variacao_id INT NOT NULL,

quantidade INT NOT NULL DEFAULT 1,

FOREIGN KEY (carrinho_id)
REFERENCES carrinhos(id)
ON DELETE CASCADE,

FOREIGN KEY (variacao_id)
REFERENCES variacoes_produto(id)
```

);

-- =====================================================
-- PEDIDOS
-- =====================================================

CREATE TABLE pedidos (
id INT AUTO_INCREMENT PRIMARY KEY,

```
usuario_id INT NOT NULL,

endereco_id INT,

valor_total DECIMAL(10,2) DEFAULT 0,

status ENUM(
    'pendente',
    'pago',
    'separacao',
    'enviado',
    'saiu_entrega',
    'entregue',
    'cancelado'
) DEFAULT 'pendente',

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (usuario_id)
REFERENCES usuarios(id),

FOREIGN KEY (endereco_id)
REFERENCES enderecos(id)
```

);

CREATE TABLE itens_pedido (
id INT AUTO_INCREMENT PRIMARY KEY,

```
pedido_id INT NOT NULL,

produto_id INT NOT NULL,

quantidade INT NOT NULL,

preco_unitario DECIMAL(10,2) NOT NULL,

FOREIGN KEY (pedido_id)
REFERENCES pedidos(id)
ON DELETE CASCADE,

FOREIGN KEY (produto_id)
REFERENCES produtos(id)
```

);

-- =====================================================
-- RASTREAMENTO
-- =====================================================

CREATE TABLE rastreamentos (
id INT AUTO_INCREMENT PRIMARY KEY,

```
pedido_id INT NOT NULL,

codigo_rastreio VARCHAR(100),

transportadora VARCHAR(100),

ultimo_status VARCHAR(255),

ultima_atualizacao DATETIME,

FOREIGN KEY (pedido_id)
REFERENCES pedidos(id)
ON DELETE CASCADE
```

);

CREATE TABLE historico_rastreamento (
id INT AUTO_INCREMENT PRIMARY KEY,

```
rastreamento_id INT NOT NULL,

status VARCHAR(255),

descricao TEXT,

data_evento DATETIME,

FOREIGN KEY (rastreamento_id)
REFERENCES rastreamentos(id)
ON DELETE CASCADE
```

);

-- =====================================================
-- CUPONS
-- =====================================================

CREATE TABLE cupons (
id INT AUTO_INCREMENT PRIMARY KEY,

```
codigo VARCHAR(50) UNIQUE NOT NULL,

desconto DECIMAL(10,2) NOT NULL,

ativo BOOLEAN DEFAULT TRUE,

validade DATETIME,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

);

-- =====================================================
-- PAGAMENTOS
-- =====================================================

CREATE TABLE pagamentos (
id INT AUTO_INCREMENT PRIMARY KEY,

```
pedido_id INT NOT NULL,

metodo ENUM(
    'pix',
    'cartao',
    'boleto'
) NOT NULL,

status ENUM(
    'pendente',
    'aprovado',
    'recusado'
) DEFAULT 'pendente',

valor DECIMAL(10,2) NOT NULL,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (pedido_id)
REFERENCES pedidos(id)
ON DELETE CASCADE
```

);

-- =====================================================
-- AVALIAÇÕES
-- =====================================================

CREATE TABLE avaliacoes (
id INT AUTO_INCREMENT PRIMARY KEY,

```
usuario_id INT NOT NULL,

produto_id INT NOT NULL,

nota INT NOT NULL,

comentario TEXT,

foto_url TEXT,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
ON DELETE CASCADE,

FOREIGN KEY (produto_id)
REFERENCES produtos(id)
ON DELETE CASCADE
```

);

-- =====================================================
-- TICKETS DE SUPORTE
-- =====================================================

CREATE TABLE tickets (
id INT AUTO_INCREMENT PRIMARY KEY,

```
usuario_id INT NOT NULL,

assunto VARCHAR(255),

status ENUM(
    'aberto',
    'em_atendimento',
    'fechado'
) DEFAULT 'aberto',

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
```

);

CREATE TABLE mensagens_ticket (
id INT AUTO_INCREMENT PRIMARY KEY,

```
ticket_id INT NOT NULL,

usuario_id INT NOT NULL,

mensagem TEXT NOT NULL,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (ticket_id)
REFERENCES tickets(id)
ON DELETE CASCADE,

FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
```

);

-- =====================================================
-- NOTIFICAÇÕES
-- =====================================================

CREATE TABLE notificacoes (
id INT AUTO_INCREMENT PRIMARY KEY,

```
usuario_id INT NOT NULL,

titulo VARCHAR(255),

mensagem TEXT,

lida BOOLEAN DEFAULT FALSE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (usuario_id)
REFERENCES usuarios(id)
ON DELETE CASCADE
```

);

-- =====================================================
-- LOGS
-- =====================================================

CREATE TABLE logs_sistema (
id INT AUTO_INCREMENT PRIMARY KEY,

```
usuario_id INT,

acao VARCHAR(255),

tabela_afetada VARCHAR(100),

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

INSERT INTO categorias (nome) VALUES
('Camisetas'),
('Calças'),
('Moletons'),
('Bermudas'),
('Acessórios');

INSERT INTO marcas (nome) VALUES
('Grimfit');

INSERT INTO cupons
(codigo, desconto, ativo)
VALUES
('BEMVINDO10',10,TRUE),
('GRIMFIT15',15,TRUE);