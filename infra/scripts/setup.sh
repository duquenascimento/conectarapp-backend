#!/bin/bash
exec > >(tee /tmp/setup.log | logger -t setup-script) 2>&1
set -x

echo "🔧 Iniciando setup no Ubuntu 22.04..."

# Atualiza sistema
apt update -y && echo "✅ apt update concluído"

# Instala Docker
apt install -y docker.io && echo "✅ Docker instalado"
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# Instala Docker Compose
apt install -y docker-compose && echo "✅ Docker Compose instalado"

# Instala Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs && echo "✅ Node.js 22 instalado"

# Instala PM2
npm install -g pm2 && echo "✅ PM2 instalado"

# Instala Nginx
apt install -y nginx && echo "✅ Nginx instalado"
systemctl enable nginx

# Configura Nginx
cat > /etc/nginx/sites-available/default << 'EOF'
# --- PRODUÇÃO ---
# Redireciona HTTP → HTTPS para PROD
server {
    listen 80;
    server_name api-appconectar.conectarhortifruti.com.br;
    return 301 https://$host$request_uri;
}

# Servidor PROD (HTTPS)
server {
    listen 443 ssl;
    server_name api-appconectar.conectarhortifruti.com.br;

    ssl_certificate /etc/letsencrypt/live/api-appconectar.conectarhortifruti.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api-appconectar.conectarhortifruti.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}

# --- DESENVOLVIMENTO ---
# Redireciona HTTP → HTTPS para DEV
server {
    listen 80;
    server_name dev-api-appconectar.conectarhortifruti.com.br;
    return 301 https://$host$request_uri;
}

# Servidor DEV (HTTPS)
server {
    listen 443 ssl;
    server_name dev-api-appconectar.conectarhortifruti.com.br;

    ssl_certificate /etc/letsencrypt/live/dev-api-appconectar.conectarhortifruti.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev-api-appconectar.conectarhortifruti.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3334;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
systemctl restart nginx && echo "✅ Nginx configurado"
sudo nginx -t && sudo systemctl reload nginx

# Cria diretório .ssh
mkdir -p /home/ubuntu/.ssh
chmod 700 /home/ubuntu/.ssh

# Adiciona chaves SSH
echo "Adicionando chave do GitHub Actions..."
echo "${PUBLIC_SSH_KEY}" >> /home/ubuntu/.ssh/authorized_keys && echo "✅ Chave do CI/CD adicionada"

echo "Adicionando chave pessoal..."
echo "${PERSONAL_SSH_KEY}" >> /home/ubuntu/.ssh/authorized_keys && echo "✅ Chave pessoal adicionada"

chmod 600 /home/ubuntu/.ssh/authorized_keys
chown -R ubuntu:ubuntu /home/ubuntu/.ssh && echo "✅ Permissões do .ssh corrigidas"

# Instala Certbot
echo "📦 Instalando Certbot..."
apt install -y certbot python3-certbot-nginx && echo "✅ Certbot instalado com sucesso: $(certbot --version)"

# Cria diretório para app
mkdir -p /home/ubuntu/app
chown -R ubuntu:ubuntu /home/ubuntu/app

echo "✅ Setup concluído com sucesso!"