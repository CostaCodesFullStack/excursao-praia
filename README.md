# Sistema de Controle de Excursao

Aplicacao full stack para gerenciar 50 lugares de um onibus de excursao, passageiros e pagamentos.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Banco: PostgreSQL + Prisma
- Autenticacao: JWT em cookie httpOnly

## Estrutura

```text
frontend/   Interface web responsiva
backend/    API REST + Prisma + exportacoes
```

## Como rodar

1. Instale dependencias na raiz com `npm install`
2. Copie `backend/.env.example` para `backend/.env`
3. Copie `frontend/.env.example` para `frontend/.env`
4. Gere o client do Prisma com `npm run prisma:generate`
5. Rode as migracoes com `npm run prisma:migrate`
6. Crie o usuario admin com `npm run seed`
7. Inicie tudo com `npm run dev`

