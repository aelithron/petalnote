FROM node:24-alpine
USER root
COPY package*.json ./
RUN npm ci
RUN npm install --global tsx
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 petalnote
COPY --chown=petalnote:nodejs . .

USER petalnote
CMD ["tsx", "index.ts", "--reload-cmds"]