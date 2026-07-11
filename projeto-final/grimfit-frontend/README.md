# Grimfit

<p align="center">
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/version-1.0-blue?style=for-the-badge">
</p>

<p align="center">
  <b>Moda alternativa em um só lugar.</b>
</p>

---

## 🧠 Sobre o projeto

O **GrimFit** é uma plataforma de e-commerce voltada ao público alternativo, reunindo estilos como streetwear, punk e underground em um único ambiente digital.

O sistema foi desenvolvido com foco em experiência do usuário, performance e organização, simulando um projeto real de mercado.

---

## 🎯 Objetivo

Desenvolver uma aplicação web completa que permita navegação, busca e compra de produtos, aplicando boas práticas de desenvolvimento.

Também tem como foco consolidar conhecimentos em:
- Desenvolvimento Full Stack  
- Integração com banco de dados  
- Estruturação de APIs  
- Trabalho em equipe  

---

## ⚙️ Funcionalidades

- Sistema de login e cadastro  
- Listagem de produtos  
- Filtro por categorias e estilos  
- Carrinho de compras  
- Sistema de pedidos  

---

## 🚀 Tecnologias utilizadas

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" height="50"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" height="50"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="50"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="50"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" height="50"/>
</p>

---

## 📚 Aprendizados

Durante o desenvolvimento, foram aplicados:

- APIs REST  
- Integração com banco de dados  
- Organização de código  
- Versionamento com Git  
- Trabalho em equipe  

---

## 🔮 Futuras melhorias

- Integração com pagamentos  
- Sistema de avaliações  
- Favoritos  
- Melhorias de interface (UI/UX)  

---

## 👥 Equipe

<p align="center">
  <b>Herik da Cruz</b><br>
  Backend • Banco de Dados • Documentação<br>
  <a href="https://www.instagram.com/mr.h.castro/" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white"/>
  </a>
</p>

<br>

<p align="center">
  <b>Julie Macedo</b><br>
  Frontend • Design • Estilização<br>
  <a href="https://www.instagram.com/juliec.macedo/" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white"/>
  </a>
</p>

<br>

<p align="center">
  <b>Eduarda Farias</b><br>
  Frontend • Design • Estilização<br>
  <a href="https://www.instagram.com/aquareggia/" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white"/>
  </a>
</p>

---

## 💀 GrimFit

<p align="center">
  <b>Para quem é diferente, Grimfit.</b>
</p>

---

## Como rodar (rápido)

1. Instalar dependências do backend e rodar a API:

```powershell
cd back-end
npm install
node server.js
```

2. Abrir o frontend (desenvolvimento):

```powershell
cd frontend
npm install
npm run dev
```

O frontend roda por padrão no `http://localhost:5173` e o backend em `http://localhost:3000`.

OBS: Removi a integração Electron — o projeto agora é feito para web.

---

**README (completo)**

**Overview:**
- **Projeto:** `Grimfit` — e‑commerce (tema preto + roxo) com frontend React + backend Node/Express.

**Pré-requisitos:**
- **Node.js:** versão 16+ recomendada.
- **PostgreSQL:** (opcional para persistência). Se não houver banco, o backend usa fallback em memória para `carts` e `orders`.

**Estrutura principal:**
- **`back-end/`**: API (Express), banco (`knex`), serviços, repositórios, uploads `back-end/uploads`.
- **`frontend/`**: SPA React (Vite) — `src/` contém páginas, componentes e contexts.

**Variáveis de ambiente (back-end):**
- **`JWT_SECRET`**: segredo para assinar tokens JWT (dev: fallback `grimfit_dev_secret_change_me`).
- **`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`**: conexão Postgres (opcional).

**Instalação & execução (PowerShell)**
```powershell
# Backend
cd back-end
npm install
# (opcional) exporte variáveis de ambiente ou crie um .env com DB_*/JWT_SECRET
node server.js

# Em outra janela: Frontend
cd ..\frontend
npm install
npm run dev
```

**Migrações / Schema**
- O arquivo `back-end/database/banco de dados.sql` contém as tabelas usadas (`usuarios`, `produtos`, `marcas`, `pedidos`, `itens_pedido`, `pagamentos`, `carts`).
- Para aplicar no Postgres (exemplo):
```powershell
# usando psql (substitua host/user/db)
# psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -f "back-end/database/banco de dados.sql"
```
- Nota: adicionei `ALTER TABLE produtos ADD COLUMN IF NOT EXISTS imagem VARCHAR(255);` ao SQL para persistir URLs locais/externos de imagens.

**Uploads**
- O backend usa `multer` e salva em `back-end/uploads`. Arquivos são servidos em `/uploads/<filename>` (ex.: `http://localhost:3000/uploads/abc.jpg`).
- O Admin envia imagens via campo `image` em `multipart/form-data`.

**Endpoints principais (resumo)**
- `POST /usuarios` — cadastro
- `POST /login` — login (retorna `token`)
- `GET /me` — dados do usuário (protegido)
- `GET /produtos` — listar produtos (suporta query params: `q`, `marca_id`, `estilo`, `minPrice`, `maxPrice`, `sort`)
- `GET /produtos/:id` — buscar produto por id
- `GET /me/cart` — obter carrinho do usuário (protegido)
- `POST /me/cart` — salvar carrinho do usuário (protegido)
- `POST /checkout` — criar pedido (grava em `pedidos`, `itens_pedido`, `pagamentos`; fallback in-memory se DB indisponível)
- `GET /orders/:id` — obter pedido
- `POST /orders/:id/confirm` — marcar pedido como pago (simulação/webhook)
- Admin (protegido + role admin): `GET/POST/PUT/DELETE /admin/produtos` — CRUD de produtos (suporta upload `image`)

**Frontend notes**
- LocalStorage keys: `grimfit_cart_v1` (cart), `grimfit_auth_v1` (auth token + user).
- Contexts: `CartContext`, `AuthContext`, `ToastContext`.

**Como criar um admin (rápido)**
- Use o endpoint de cadastro normalmente (`POST /usuarios`), depois atualize a coluna `tipo='admin'` no banco para o email criado:
```sql
UPDATE usuarios SET tipo = 'admin' WHERE email = 'seu@exemplo.com';
```
Se preferir, eu posso adicionar uma rota protegida para promover/demover usuários via API.

**Notas de desenvolvimento**
- O backend define `process.env.JWT_SECRET` com um valor padrão em desenvolvimento; em produção, defina `JWT_SECRET` no ambiente.
- Se a tabela `carts` ou outras não existirem, o backend cai para fallback em memória — recomendado aplicar o SQL.

**Próximos passos que eu posso fazer automaticamente**
- Gerar migração automática (Knex) para aplicar alterações no DB.
- Polir a UI do Admin com tema escuro e validações.
- Implementar busca/filtros com debounce e paginação no frontend.

Se quiser que eu gere arquivos de migração ou aplique algo no seu banco, diga `Aplique migração` e eu explico os próximos passos.

---
_Se quiser, eu adapto este README para uma versão reduzida destinada a deploy (Heroku/Vercel)._ 
