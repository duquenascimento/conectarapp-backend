# infra/scripts/setup.sh
#!/bin/bash
set -e

echo "🔧 Iniciando setup no Ubuntu..."

# Atualiza sistema
apt update && apt upgrade -y

# Instala Docker
apt install -y docker.io
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# Instala Docker Compose
apt install -y docker-compose

# Instala Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Instala Nginx
apt install -y nginx

# Configura Nginx para os dois subdomínios
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name dev-api-appconectar.conectarhortifruti.com.br;

    location / {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api-appconectar.conectarhortifruti.com.br;

    location / {
        proxy_pass http://127.0.0.1:3334;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Ativa configuração
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
systemctl restart nginx

# Cria diretório .ssh
mkdir -p /home/ubuntu/.ssh
echo "${PUBLIC_SSH_KEY}" >> /home/ubuntu/.ssh/authorized_keys
echo "${PERSONAL_SSH_KEY}" >> /home/ubuntu/.ssh/authorized_keys
chmod 700 /home/ubuntu/.ssh
chmod 600 /home/ubuntu/.ssh/authorized_keys
chown -R ubuntu:ubuntu /home/ubuntu/.ssh

# Instala Certbot
apt install -y certbot python3-certbot-nginx

# Cria diretórios para apps
mkdir -p /home/ubuntu/app-dev
mkdir -p /home/ubuntu/app-prod
chown -R ubuntu:ubuntu /home/ubuntu/app-dev
chown -R ubuntu:ubuntu /home/ubuntu/app-prod

# (Opcional) Política de criptografia (se usar Amazon Linux 2023)
# update-crypto-policies --set FUTURE

echo "✅ Setup concluído!"