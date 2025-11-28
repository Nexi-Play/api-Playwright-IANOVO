# Usa imagem Playwright oficial com todos os navegadores já instalados
FROM mcr.microsoft.com/playwright:v1.53.1-jammy

WORKDIR /app

# Copia package.json e package-lock.json
COPY package.json package-lock.json ./

# Instala dependências da API (express, playwright, puppeteer)
RUN npm install

# Copia todo o resto do código
COPY . .

# Expõe a porta do servidor (3000 por padrão)
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
