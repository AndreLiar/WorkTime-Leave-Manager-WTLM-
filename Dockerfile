FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --ignore-scripts

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
