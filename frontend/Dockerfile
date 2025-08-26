# ---------- Base ----------
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ---------- Development ----------
FROM base AS dev
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# ---------- Production ----------
FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS prod
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
