# Configuração do Tailwind CSS

Se você estiver enfrentando o erro:

\`\`\`
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
\`\`\`

Siga estas etapas para resolver o problema:

## Opção 1: Instalar o pacote @tailwindcss/postcss

\`\`\`bash
npm install -D @tailwindcss/postcss@latest
\`\`\`

## Opção 2: Atualizar a configuração do PostCSS

Crie ou atualize o arquivo `postcss.config.js` na raiz do projeto:

\`\`\`javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
\`\`\`

## Opção 3: Reinstalar as dependências

Se as opções acima não funcionarem, tente reinstalar as dependências:

\`\`\`bash
# Remover node_modules e package-lock.json
rm -rf node_modules
rm -f package-lock.json

# Reinstalar as dependências
npm install

# Limpar o cache do Next.js
npm run dev -- --clear-cache
\`\`\`

## Opção 4: Verificar a versão do Tailwind CSS

Certifique-se de que você está usando versões compatíveis do Tailwind CSS e do PostCSS:

\`\`\`bash
npm list tailwindcss
npm list postcss
\`\`\`

Se você estiver usando o Tailwind CSS v3.x, certifique-se de que sua configuração do PostCSS está correta.

## Opção 5: Usar uma versão específica do Tailwind CSS

Se você continuar enfrentando problemas, tente usar uma versão específica do Tailwind CSS:

\`\`\`bash
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@3.3.0 postcss@8.4.31 autoprefixer@10.4.16
\`\`\`

Depois de fazer essas alterações, reinicie o servidor de desenvolvimento:

\`\`\`bash
npm run dev
