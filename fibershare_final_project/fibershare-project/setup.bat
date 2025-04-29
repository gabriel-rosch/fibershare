@echo off
echo Removendo node_modules e package-lock.json...
rmdir /s /q node_modules
del /f package-lock.json

echo Instalando dependências...
npm install

echo Instalando o plugin PostCSS do Tailwind...
npm install -D @tailwindcss/postcss@latest

echo Limpando o cache do Next.js...
npm run dev -- --clear-cache

echo Setup concluído! Agora execute 'npm run dev' para iniciar o servidor de desenvolvimento.
