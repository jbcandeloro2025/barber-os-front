# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar arquivos de pacotes
COPY package.json pnpm-lock.yaml* yarn.lock* package-lock.json* ./

# Instalar dependências baseado no package manager
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copiar código fonte e fazer build
COPY . .
RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm run build; \
  elif [ -f yarn.lock ]; then yarn build; \
  else npm run build; \
  fi

# Production stage - Nginx
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remover arquivos padrão do nginx
RUN rm -rf ./*

# Copiar build do Vite
COPY --from=builder /app/dist .

# Configuração customizada do Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
