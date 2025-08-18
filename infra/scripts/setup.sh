#!/bin/bash
set -e

# Atualiza sistema
apt update
apt upgrade -y

# Instala Docker
apt install -y docker.io
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# Instala Docker Compose (via apt)
apt install -y docker-compose

# Instala Node.js 22 e npm
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Instala PM2
npm install -g pm2

# Instala Nginx
apt install -y nginx
systemctl enable nginx

# Configura Nginx como proxy
cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${API_PORT_DEV};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Reinicia Nginx
systemctl restart nginx

# Cria diretório .ssh (se não existir)
mkdir -p /home/ubuntu/.ssh
chmod 700 /home/ubuntu/.ssh

# Adiciona chaves SSH
echo "${PUBLIC_SSH_KEY}" >> /home/ubuntu/.ssh/authorized_keys
echo "${PERSONAL_SSH_KEY}" >> /home/ubuntu/.ssh/authorized_keys

chmod 600 /home/ubuntu/.ssh/authorized_keys
chown -R ubuntu:ubuntu /home/ubuntu/.ssh

# Instala Certbot
apt install -y certbot python3-certbot-nginx

# Cria diretório para app
mkdir -p /home/ubuntu/app
chown -R ubuntu:ubuntu /home/ubuntu/app

echo "✅ Setup do Ubuntu concluído!"
















