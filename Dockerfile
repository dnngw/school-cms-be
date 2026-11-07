# ---- Production image ------------------------------------------------------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies (layer is cached until package*.json changes).
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .
RUN mkdir -p uploads && chown -R node:node uploads

# Never run as root inside the container.
USER node
EXPOSE 4000
CMD ["sh", "-c", "npx knex migrate:latest && node src/server.js"]
