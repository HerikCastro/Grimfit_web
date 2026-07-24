# 💀 Grimfit — Web

Sistema de e-commerce desenvolvido para fins acadêmicos utilizando **React**, **Vite**, **Node.js**, **Express** e **PostgreSQL**, composto por um frontend em React e um backend em Node.js.

> 📚 **Projeto desenvolvido para fins acadêmicos.**
>
>👨‍💻 Desenvolvedores
>
>- **Julie Costa Macedo Pereira** — Desenvolvimento Frontend
>- **Herik da Cruz Castro** — Desenvolvimento Backend
>
> ⚠️ O código deste projeto é compartilhado com a versão **Desktop (Electron)**.
> Alterações realizadas no `frontend/` ou no `backend/` devem ser sincronizadas entre os dois repositórios para manter ambos compatíveis.

---

## 🎯 Objetivo

A Grimfit é uma loja virtual focada na venda de roupas e acessórios fitness, oferecendo funcionalidades como cadastro de usuários, autenticação, gerenciamento de produtos, pedidos, avaliações, suporte ao cliente e painel administrativo.

---

## 🛠️ Tecnologias utilizadas

### Frontend

- React
- Vite
- React Router
- Axios

### Backend

- Node.js
- Express
- PostgreSQL
- JWT (JSON Web Token)
- BcryptJS
- Multer
- Dotenv

### Controle de versão

- Git
- GitHub

---

## 📁 Estrutura

```text
Grimfit_web/
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── migrate.js
│   ├── uploads/
│   └── src/
│
├── database/
│   └── grimfit_postgres.sql
│
└── docs/
```

---

## 🚀 Como rodar

### 1. Clonar o repositório

```bash
git clone https://github.com/HerikCastro/Grimfit_web.git
```

---

### 2. Instalar as dependências

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

---

### 3. Configurar o `.env` do backend

Copie o arquivo:

```text
backend/.env.example
```

para:

```text
backend/.env
```

Depois configure as variáveis:

```env
DATABASE_URL=postgres://usuario:senha@host:5432/grimfit
JWT_SECRET=uma_string_bem_aleatoria
PORT=3000
```

---

### 4. Rodar a migração

Com o backend em execução, abra:

```
http://127.0.0.1:3000/rodar-migracao-9x7k2?chave=migracao_grimfit_dev
```

ou execute diretamente:

```bash
node -e "require('./backend/migrate')().then(()=>process.exit(0))"
```

---

### 5. Executar o backend

```bash
cd backend
npm run dev
```

Servidor disponível em:

```
http://127.0.0.1:3000
```

---

### 6. Executar o frontend

```bash
cd frontend
npm run dev
```

O Vite normalmente inicia em:

```
http://127.0.0.1:5173
```

---

## ✨ Funcionalidades

### Clientes

- Cadastro de usuários
- Login com autenticação JWT
- Perfil do usuário
- Visualização de produtos
- Carrinho de compras
- Histórico de pedidos
- Avaliações de produtos

### Administração

- Cadastro de produtos
- Gerenciamento de categorias
- Gerenciamento de pedidos
- Controle de usuários
- Painel administrativo

### Sistema

- Upload de imagens com Multer
- Autenticação utilizando JWT
- Criptografia de senhas com BcryptJS
- Middleware de autenticação
- Integração com PostgreSQL

---

## 🔌 Principais endpoints

### Autenticação

| Método | Endpoint |
|---------|----------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |

### Produtos

| Método | Endpoint |
|---------|----------|
| GET | `/api/products` |
| GET | `/api/products/:id` |

### Usuários

| Método | Endpoint |
|---------|----------|
| GET | `/api/users/profile` |

---

## 🧪 Notas técnicas

- O frontend utiliza React Router para gerenciamento das rotas.
- A autenticação é realizada utilizando JWT.
- As senhas são armazenadas utilizando BcryptJS.
- O backend utiliza Express e PostgreSQL.
- O upload de imagens é realizado utilizando Multer.
- As rotas protegidas utilizam middleware de autenticação.
- O frontend consome a API REST disponibilizada pelo backend.

---

## 🔄 Atualizações recentes

As principais alterações realizadas neste projeto incluem:

- Atualização das rotas de autenticação.
- Integração completa entre frontend e backend.
- Home consumindo produtos diretamente da API.
- Página de perfil integrada ao sistema de autenticação JWT.
- Estrutura reorganizada para facilitar manutenção e desenvolvimento.

---

## 📜 Licença

MIT © Grimfit
