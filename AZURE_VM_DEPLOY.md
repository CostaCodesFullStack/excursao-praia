# Deploy em VM Azure (Ubuntu + Nginx + PM2 + PostgreSQL local)

Este guia foi ajustado para a stack real deste projeto:

- frontend React/Vite compilado em arquivos estaticos
- backend Node/Express com Prisma
- PostgreSQL rodando na propria VM
- Nginx servindo o frontend e encaminhando `/api` para o backend
- PM2 mantendo somente o backend no ar

## Antes de começar

Confirme estes itens na Azure:

1. A VM tem IP publico.
2. O DNS do dominio aponta para esse IP.
3. A Network Security Group da VM permite entrada em `22`, `80` e `443`.
4. Voce esta usando uma distro Ubuntu recente, de preferencia `22.04` ou `24.04`.

## Visao geral da arquitetura

```text
Internet
  -> Nginx :80 / :443
    -> /            => frontend/dist
    -> /api/*       => backend Node em 127.0.0.1:3333
    -> /health      => backend Node em 127.0.0.1:3333

PostgreSQL local
  -> localhost:5432
```

## 1. Conectar na VM

```bash
ssh azureuser@SEU_IP_PUBLICO
```

Se usar chave SSH:

```bash
ssh -i ~/.ssh/sua-chave azureuser@SEU_IP_PUBLICO
```

## 2. Atualizar o sistema e instalar pacotes base

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl nginx postgresql postgresql-contrib build-essential
```

## 3. Instalar Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

node --version
npm --version
```

## 4. Preparar pasta do projeto

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

cd /var/www
git clone https://github.com/CostaCodesFullStack/excursao.git
cd excursao
```

Se o repositorio for privado:

```bash
git clone https://SEU_TOKEN@github.com/CostaCodesFullStack/excursao.git
```

## 5. Configurar PostgreSQL

```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo -u postgres psql
```

Dentro do `psql`:

```sql
CREATE USER excursao_user WITH PASSWORD 'SUA_SENHA_FORTE';
CREATE DATABASE excursao_prod OWNER excursao_user;
\q
```

Teste rapido:

```bash
psql -h localhost -U excursao_user -d excursao_prod -W
```

## 6. Criar os arquivos de ambiente

O repositorio agora tem exemplos especificos para producao.

### Backend

```bash
cp backend/.env.production.example backend/.env
nano backend/.env
```

Preencha com os seus valores:

```env
DATABASE_URL="postgresql://excursao_user:SUA_SENHA_FORTE@localhost:5432/excursao_prod"
JWT_SECRET="fd1c50e2896291f965e3abd6ee4e67c2648d5a97a5674482c0bb8fb8a1dde654"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="https://seu-dominio.com"
NODE_ENV="production"
PORT=3333
ADMIN_EMAIL="admin@seu-dominio.com"
ADMIN_PASSWORD="TROQUE_ESSA_SENHA"
EXCURSION_NAME="Excursao Principal"
```

Gerar uma chave forte para `JWT_SECRET`:

```bash
openssl rand -hex 32
```

### Frontend

```bash
cp frontend/.env.production.example frontend/.env.production
nano frontend/.env.production
```

Conteudo recomendado:

```env
VITE_API_URL="/api"
```

Importante:

- nao use apenas `https://seu-dominio.com` em `VITE_API_URL`
- se o valor nao terminar em `/api`, o frontend vai chamar rotas erradas
- com `VITE_API_URL="/api"`, frontend e backend funcionam no mesmo dominio sem CORS estranho

## 7. Instalar dependencias e preparar banco

Na raiz do projeto:

```bash
cd /var/www/excursao
npm ci
```

Executar migrations de producao:

```bash
npm run prisma:deploy
```

Criar o usuario admin inicial:

```bash
npm run seed
```

Observacao:

- em producao use `npm run prisma:deploy`
- nao use `npm run prisma:migrate` na VM, porque esse script roda `prisma migrate dev`

## 8. Gerar build do projeto

```bash
npm run build
```

O comando acima gera:

- backend em `backend/dist`
- frontend em `frontend/dist`

## 9. Subir o backend com PM2

Instale o PM2:

```bash
sudo npm install -g pm2
```

Inicie usando o arquivo versionado do repositorio:

```bash
cd /var/www/excursao
pm2 start ecosystem.config.cjs
pm2 save
```

Para habilitar o PM2 no boot:

```bash
pm2 startup systemd -u $USER --hp $HOME
```

Se o PM2 imprimir um comando com `sudo env PATH=...`, execute exatamente o comando exibido.

Verifique:

```bash
pm2 list
pm2 logs excursao-backend
curl http://127.0.0.1:3333/health
```

## 10. Configurar Nginx

Copie o arquivo de exemplo do repositorio:

```bash
sudo cp deploy/nginx.excursao.conf.example /etc/nginx/sites-available/excursao
sudo nano /etc/nginx/sites-available/excursao
```

Troque `seu-dominio.com` pelo seu dominio real.

Ative o site:

```bash
sudo ln -sf /etc/nginx/sites-available/excursao /etc/nginx/sites-enabled/excursao
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

Nesse ponto:

- `http://seu-dominio.com` deve abrir o frontend
- `http://seu-dominio.com/health` deve responder com `{ "ok": true }`

## 11. Habilitar HTTPS com Let's Encrypt

Instale o Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Gerar certificado e deixar o Nginx ser ajustado automaticamente:

```bash
sudo certbot --nginx -d seu-dominio.com
```

Se tambem usar `www`:

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Verifique a renovacao automatica:

```bash
sudo systemctl status certbot.timer
```

## 12. Firewall da VM

Se estiver usando UFW dentro do Ubuntu:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Lembrete importante:

- abrir UFW nao substitui a regra da Azure
- a porta precisa estar liberada tanto no Ubuntu quanto na Network Security Group

## 13. Validacao final

Rode estes testes:

```bash
curl http://127.0.0.1:3333/health
curl -I http://seu-dominio.com
curl -I https://seu-dominio.com
pm2 list
sudo nginx -t
sudo systemctl status nginx --no-pager
```

Depois acesse no navegador:

```text
https://seu-dominio.com
```

## Atualizar o projeto depois

```bash
cd /var/www/excursao
git pull
npm ci
npm run prisma:deploy
npm run build
pm2 restart excursao-backend
sudo systemctl reload nginx
```

Se mudou a senha do admin no `.env`, rode de novo:

```bash
npm run seed
```

## Troubleshooting rapido

### Backend nao sobe no PM2

```bash
pm2 logs excursao-backend
cat backend/.env
ls backend/dist/src
```

### Nginx responde 502

Isso quase sempre significa que o backend nao esta ouvindo em `127.0.0.1:3333`.

Verifique:

```bash
pm2 list
curl http://127.0.0.1:3333/health
```

### Login nao funciona em producao

Confira estes tres pontos:

1. `FRONTEND_URL` esta com `https://seu-dominio.com`.
2. O site ja esta em HTTPS valido.
3. `frontend/.env.production` esta com `VITE_API_URL="/api"`.

Observacao importante:

- com `NODE_ENV="production"`, o cookie de login fica `secure`
- isso significa que o login nao vai funcionar corretamente em HTTP puro

### Prisma falha na VM

Confirme:

```bash
cat backend/.env
psql -h localhost -U excursao_user -d excursao_prod -W
```

Depois tente:

```bash
npm run prisma:deploy
```

## Arquivos uteis adicionados no repositorio

- `backend/.env.production.example`
- `frontend/.env.production.example`
- `deploy/nginx.excursao.conf.example`
- `ecosystem.config.cjs`
- `backend/prisma/migrations/20260407000100_init/migration.sql`

Esses arquivos deixam o deploy na Azure bem mais previsivel do que depender de comandos manuais espalhados.
