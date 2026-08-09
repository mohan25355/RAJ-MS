FROM node:20-alpine

WORKDIR /app

# Copy manifests first for layer caching
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci

# Copy source and build the React client into client/dist
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "start"]
