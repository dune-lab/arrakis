FROM node:24-alpine AS builder

WORKDIR /app

COPY arrakis/package.json arrakis/package-lock.json ./
RUN npm install

COPY arrakis/src ./src
COPY arrakis/public ./public
COPY arrakis/index.html ./
COPY arrakis/tsconfig.json arrakis/tsconfig.app.json arrakis/tsconfig.node.json arrakis/vite.config.ts ./

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY arrakis/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
