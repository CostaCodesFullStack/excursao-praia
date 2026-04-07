# Deploy em VM Azure (Linux)

## PASSO 1: Conectar na VM

```bash
ssh seu_usuario@seu_ip_azure.com
# Ou com porta customizada:
ssh -p 2222 seu_usuario@seu_ip_azure.com
```

---

## PASSO 2: Instalar Node.js

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo apt install -y npm

# Verificar instalação
node --version
npm --version
```

---

## PASSO 3: Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco de dados
sudo -u postgres psql
```

**Dentro do psql (postgres=#):**

```sql
CREATE USER excursao_user WITH PASSWORD 'SenhaForte123!@#';
CREATE DATABASE excursao_prod;
ALTER DATABASE excursao_prod OWNER TO excursao_user;
GRANT CONNECT ON DATABASE excursao_prod TO excursao_user;
GRANT USAGE ON SCHEMA public TO excursao_user;
GRANT CREATE ON SCHEMA public TO excursao_user;
\q
```

---

## PASSO 4: Clonar Repositório

```bash
# Ir para diretório de apps (opcional)
cd /var/www

# Clonar projeto
git clone https://github.com/CostaCodesFullStack/excursao.git
cd excursao

# Se repo é privada, gere Personal Access Token no GitHub:
# https://github.com/settings/tokens
git clone https://SEU_TOKEN@github.com/CostaCodesFullStack/excursao.git
```

---

## PASSO 5: Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

**Cole exatamente:**

```env
DATABASE_URL="postgresql://excursao_user:SenhaForte123!@#@localhost:5432/excursao_prod"
JWT_SECRET="77b09e87d0a45c8f49cb5806f8a33aad54b739fc300dd6738470267ebd0b2d10"
FRONTEND_URL="https://seu-dominio.com"
NODE_ENV=production
PORT=3333
ADMIN_EMAIL=pikadagalaxy157@gmail.com
ADMIN_PASSWORD=Ca200306@
EXCURSION_NAME=Excursao Principal
```

**Salvar:** `Ctrl + O` → Enter → `Ctrl + X`

---

## PASSO 6: Executar Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## PASSO 7: Build do Backend

```bash
npm run build
```

---

## PASSO 8: Instalar PM2 (para manter app rodando)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar app com PM2
pm2 start dist/src/server.js --name "excursao-backend"

# Guardar configuração
pm2 save
pm2 startup
```

---

## PASSO 9: Compilar e Iniciar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Build para produção
VITE_API_URL=https://seu-dominio.com npm run build

# Instalar servidor estático
sudo npm install -g serve

# Iniciar
pm2 start "serve -s dist -l 3000" --name "excursao-frontend"
```

---

## PASSO 10: Instalar Nginx (Reverse Proxy)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/excursao
```

**Cole exatamente:**

```nginx
upstream backend {
    server localhost:3333;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name seu-dominio.com;

    # Redirecionar HTTP → HTTPS (depois)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Salvar:** `Ctrl + O` → Enter → `Ctrl + X`

---

## PASSO 11: Ativar Nginx

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/excursao /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## PASSO 12: SSL com Let's Encrypt (HTTPS)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot certonly --nginx -d seu-dominio.com

# Renovação automática já ativa
sudo systemctl enable certbot.timer
```

---

## PASSO 13: Abrir Firewall

```bash
# Se usando UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## ✅ Aplicação está rodando!

```bash
# Acessar em:
https://seu-dominio.com
```

---

## 📊 Comandos Úteis

### Verificar Status

```bash
# Ver apps PM2
pm2 list

# Ver logs
pm2 logs excursao-backend

# Ver status do Nginx
sudo systemctl status nginx
```

### Reiniciar Serviços

```bash
# Backend
pm2 restart excursao-backend

# Frontend
pm2 restart excursao-frontend

# Nginx
sudo systemctl restart nginx
```

### Atualizar Código

```bash
cd /var/www/excursao

# Puxar novo código
git pull

# Rebuild backend
cd backend
npm run build
pm2 restart excursao-backend

# Rebuild frontend
cd ../frontend
npm run build
pm2 restart excursao-frontend
```

---

## 🚨 Troubleshooting

### Conexão recusada no PM2

```bash
pm2 delete all
pm2 start dist/src/server.js --name "excursao-backend"
```

### PostgreSQL não conecta

```bash
sudo systemctl restart postgresql
psql -h localhost -U excursao_user -d excursao_prod -W
```

### Nginx não inicia

```bash
sudo nginx -t  # Ver erro
sudo nano /etc/nginx/sites-available/excursao  # Corrigir
```

### Certificado SSL expirado

```bash
sudo certbot renew
```

---

## 💰 Custos Azure VM

- **B1s (1 vCPU, 1GB RAM):** ~$10/mês
- **B2s (2 vCPU, 4GB RAM):** ~$40/mês
- **PostgreSQL:** Incluso (local)

Muito mais barato que Railway para produção! 🚀
