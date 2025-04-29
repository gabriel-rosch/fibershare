#!/bin/bash

# Remover node_modules e package-lock.json para uma instalação limpa
rm -rf node_modules
rm -f package-lock.json

# Instalar dependências
npm install

# Instalar o plugin PostCSS do Tailwind se necessário
npm install -D @tailwindcss/postcss@latest

# Limpar o cache do Next.js
npm run dev -- --clear-cache

echo "Setup concluído! Agora execute 'npm run dev' para iniciar o servidor de desenvolvimento."
