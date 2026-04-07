# Sistema de Controle de Excursao

Aplicacao full stack para gerenciar uma excursao com mapa de assentos, cadastro de passageiros, controle de pagamentos e exportacao de relatorios.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Banco de dados: PostgreSQL + Prisma
- Autenticacao: JWT em cookie `httpOnly`

## Funcionalidades

- Login protegido para administracao
- Dashboard com resumo financeiro
- Mapa do onibus com 50 assentos
- Cadastro e edicao de passageiros
- Controle de pagamentos por passageiro
- Exportacao de passageiros em CSV e PDF

## Estrutura

```text
frontend/   interface web
backend/    API REST, Prisma e regras de negocio
```

## Como rodar localmente

### 1. Instale as dependencias

```bash
npm install
```

### 2. Configure os arquivos `.env`

Backend:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/excursao"
JWT_SECRET="troque-esta-chave-por-uma-string-segura"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
PORT=3333
ADMIN_EMAIL="admin@excursao.com"
ADMIN_PASSWORD="12345678"
EXCURSION_NAME="Excursao Principal"
```

Frontend:

```env
VITE_API_URL="http://localhost:3333/api"
```

### 3. Suba o PostgreSQL

Com Docker:

```bash
docker-compose up -d
```

Ou configure um PostgreSQL local no Windows seguindo o guia dedicado.

### 4. Prepare o banco

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### 5. Inicie o projeto

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:3333`

Healthcheck da API:

```text
GET /health
```

## Guias auxiliares

- Desenvolvimento local com Docker: `DESENVOLVIMENTO_LOCAL.md`
- PostgreSQL local no Windows: `POSTGRESQL_WINDOWS.md`
- Deploy em producao: `DEPLOY_PRODUCAO.md`
- Deploy no Railway: `RAILWAY_SETUP.md`
- PostgreSQL para producao: `POSTGRES_SETUP.md`

## Scripts principais

```bash
npm run dev
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run seed
```
