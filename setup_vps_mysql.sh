#!/bin/bash
set -e

echo "=== 1. Setting up MySQL Database and User ==="
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS choice_db;
CREATE USER IF NOT EXISTS 'choice_user'@'localhost' IDENTIFIED BY 'ChoicePos2026!';
ALTER USER 'choice_user'@'localhost' IDENTIFIED BY 'ChoicePos2026!';
GRANT ALL PRIVILEGES ON choice_db.* TO 'choice_user'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "=== 2. Pulling latest code ==="
cd /home/ubuntu/choice_backend
git pull

echo "=== 3. Installing dependencies ==="
npm install

echo "=== 4. Updating .env with MySQL DATABASE_URL ==="
grep -q "DATABASE_URL" .env || echo 'DATABASE_URL="mysql://choice_user:ChoicePos2026!@localhost:3306/choice_db"' >> .env
sed -i 's|DATABASE_URL=.*|DATABASE_URL="mysql://choice_user:ChoicePos2026!@localhost:3306/choice_db"|g' .env

echo "=== 5. Running Prisma DB Push & Generate ==="
npx prisma generate
npx prisma db push

echo "=== 6. Seeding Admin User & APK Release ==="
npx ts-node seedAdmin.ts
npx ts-node seedApkRelease.ts

echo "=== 7. Restarting PM2 ==="
pm2 restart choice-backend

echo "=== ALL DONE SUCCESSFULLY! ==="
pm2 status
