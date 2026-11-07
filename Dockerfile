# ---- Production image ------------------------------------------------------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies. `postinstall` runs `prisma generate`,
# so the schema must be copied before `npm ci`.
COPY package*.json prisma.config.js ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force

COPY . .
RUN mkdir -p uploads && chown -R node:node uploads

# Never run as root inside the container.
USER node
EXPOSE 4000
# Apply pending migrations, then start the API.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
