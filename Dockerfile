FROM node:20-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including native modules)
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

# Install runtime dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

# Install production dependencies, skip husky postinstall
RUN npm ci --only=production --ignore-scripts

# Rebuild only better-sqlite3 native module
RUN npm rebuild better-sqlite3

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
