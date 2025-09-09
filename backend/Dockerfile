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
FROM base AS prod
RUN npm install --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
