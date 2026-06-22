# Entidades do Sistema

## Entidades identificadas

| Entidade | Por que ela existe? | Tela relacionada |
|---|---|---|
| usuarios | Cadastro e autenticação dos clientes | cadastro.html, login.html |
| enderecos | Armazenar endereços de entrega | perfil.html |
| produtos | Produtos vendidos pela loja | index.html |
| marcas | Organização dos produtos por marca | index.html |
| estoque | Controle de quantidade disponível | administração |
| pedidos | Registro das compras realizadas | carrinho.html, perfil.html |
| itens_pedido | Produtos pertencentes a cada pedido | carrinho.html |
| pagamentos | Controle dos pagamentos | checkout.html |

## Campos de cada entidade

### Entidade: usuarios

| Campo | Tipo sugerido | Obrigatório? | Observação |
|---|---|---|---|
| id | SERIAL | Sim | PK |
| nome | VARCHAR(100) | Sim | Nome do usuário |
| email | VARCHAR(150) | Sim | Login |
| senha | VARCHAR(255) | Sim | Salvar com bcrypt |
| telefone | VARCHAR(20) | Não | Contato |
| cpf | VARCHAR(14) | Não | Documento |
| tipo | ENUM | Sim | cliente ou admin |
| created_at | TIMESTAMP | Sim | Data de cadastro |

### Entidade: enderecos

| Campo | Tipo sugerido | Obrigatório? | Observação |
|---|---|---|---|
| id | SERIAL | Sim | PK |
| usuario_id | INT | Sim | FK para usuários |
| rua | VARCHAR(150) | Sim | Endereço |
| numero | VARCHAR(10) | Sim | Número |
| cidade | VARCHAR(100) | Sim | Cidade |
| estado | VARCHAR(50) | Sim | Estado |
| cep | VARCHAR(10) | Sim | CEP |
| complemento | VARCHAR(100) | Não | Complemento |

### Entidade: produtos

| Campo | Tipo sugerido | Obrigatório? | Observação |
|---|---|---|---|
| id | SERIAL | Sim | PK |
| nome | VARCHAR(150) | Sim | Nome do produto |
| descricao | TEXT | Não | Descrição |
| preco | DECIMAL(10,2) | Sim | Valor |
| estilo | VARCHAR(100) | Não | Ex.: Gótico, SK8 |
| marca_id | INT | Não | FK para marcas |

### Entidade: marcas

| Campo | Tipo sugerido | Obrigatório? | Observação |
|---|---|---|---|
| id | SERIAL | Sim | PK |
| nome | VARCHAR(100) | Sim | Nome da marca |

### Entidade: pedidos

| Campo | Tipo sugerido | Obrigatório? | Observação |
|---|---|---|---|
| id | SERIAL | Sim | PK |
| usuario_id | INT | Sim | FK para usuários |
| endereco_id | INT | Sim | FK para endereços |
| status | ENUM | Sim | pendente, pago, enviado, entregue |
| valor_total | DECIMAL(10,2) | Sim | Valor total |
| data_pedido | TIMESTAMP | Sim | Data do pedido |

## Relacionamentos

| Relacionamento | Tipo | Explicação |
|---|---|---|
| usuarios → enderecos | 1:N | Um usuário pode ter vários endereços |
| marcas → produtos | 1:N | Uma marca possui vários produtos |
| produtos → estoque | 1:N | Um produto pode possuir vários tamanhos |
| usuarios → pedidos | 1:N | Um usuário pode realizar vários pedidos |
| pedidos → itens_pedido | 1:N | Um pedido possui vários itens |
| produtos → itens_pedido | 1:N | Um produto pode estar em vários pedidos |
| pedidos → pagamentos | 1:1 | Cada pedido possui um pagamento |