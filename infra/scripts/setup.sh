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

# Configura Nginx (HTTP apenas — SEM SSL por enquanto)
cat > /etc/nginx/sites-available/default << EOF
# --- PRODUÇÃO (HTTP) ---
server {
    listen 80;
    server_name api-appconectar.conectarhortifruti.com.br;

    location / {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass \$http_upgrade;
    }
}

# --- DESENVOLVIMENTO (HTTP) ---
server {
    listen 80;
    server_name dev-api-appconectar.conectarhortifruti.com.br;

    location / {
        proxy_pass http://127.0.0.1:3334;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Reinicia Nginx
nginx -t && systemctl reload nginx && echo "✅ Nginx configurado (HTTP)"

# Cria diretório .ssh
mkdir -p /home/ubuntu/.ssh
chmod 700 /home/ubuntu/.ssh

# Adiciona chaves SSH
echo "Adicionando chave do GitHub Actions..."
echo "${PUBLIC_SSH_KEY}" >> /home/ubuntu/.ssh/authorized_keys

echo "Adicionando chave pessoal..."
echo "${PERSONAL_SSH_KEY}" >> /home/ubuntu/.ssh/authorized_keys

chmod 600 /home/ubuntu/.ssh/authorized_keys
chown -R ubuntu:ubuntu /home/ubuntu/.ssh && echo "✅ Chaves SSH configuradas"

# Instala Certbot (mas NÃO executa ainda)
apt install -y certbot python3-certbot-nginx && echo "✅ Certbot instalado"

# Cria diretório para app
mkdir -p /home/ubuntu/app
chown -R ubuntu:ubuntu /home/ubuntu/app

echo "✅ Setup inicial concluído! Aguarde o DNS apontar para este IP antes de rodar o Certbot."
