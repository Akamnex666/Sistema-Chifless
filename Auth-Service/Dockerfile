FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Puerto del servicio
EXPOSE 3001

# Comando de inicio
CMD ["npm", "run", "start:prod"]
