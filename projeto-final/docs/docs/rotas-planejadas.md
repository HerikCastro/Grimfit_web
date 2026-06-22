# Rotas Planejadas da API

| Método | Rota | Objetivo | Tela que usa | Body necessário |
|---|---|---|---|---|
| POST | /api/usuarios/cadastro | Cadastrar usuário | cadastro.html | nome, email, senha, telefone, cpf |
| POST | /api/usuarios/login | Autenticar usuário | login.html | email, senha |
| GET | /api/usuarios/perfil | Buscar dados do usuário logado | perfil.html | Token JWT |
| PUT | /api/usuarios | Atualizar dados do usuário | meus-dados.html | nome, email, telefone, cpf |
| GET | /api/produtos | Listar produtos | index.html | — |
| GET | /api/produtos/:id | Buscar produto específico | produto.html | — |
| GET | /api/marcas | Listar marcas | index.html | — |
| POST | /api/carrinho | Adicionar produto ao carrinho | index.html | produto_id, quantidade |
| GET | /api/carrinho | Exibir carrinho | carrinho.html | Token JWT |
| DELETE | /api/carrinho/:id | Remover item do carrinho | carrinho.html | — |
| POST | /api/pedidos | Criar pedido | checkout.html | endereco_id |
| GET | /api/pedidos | Histórico de compras | perfil.html | Token JWT |
| POST | /api/pagamentos | Registrar pagamento | checkout.html | pedido_id, método |