FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --omit=dev && cd client && npm ci --omit=dev
COPY client ./client
RUN cd client && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/client/.next ./.next
COPY --from=builder /app/client/package*.json ./
RUN npm ci --omit=dev
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["npm","run","start","--prefix","client"] 