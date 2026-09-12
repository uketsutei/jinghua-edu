# 通用容器部署（Railway / Fly.io / 任意云服务器都可用）
FROM node:22-alpine

WORKDIR /app
COPY . .

ENV PORT=3000
EXPOSE 3000

# 零依赖，不需要 npm install
CMD ["node", "--experimental-sqlite", "server/server.js"]
