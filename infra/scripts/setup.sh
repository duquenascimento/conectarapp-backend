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

# Instala Docker Compose
apt install -y docker-compose

# Instala Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Instala Nginx
apt install -y nginx
systemctl enable nginx

# Configura Nginx como proxy
cat > /etc/nginx/sites-available/default << 'EOF'
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

# Remove link simbólico padrão e ativa nossa config
rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Reinicia Nginx
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

echo "✅ Setup do Ubuntu concluído!"