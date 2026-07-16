# Build stage
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Write .env.production so Vite picks it up at build time.
# These are non-secret Firebase Web SDK values (public identifiers, not service account keys).
RUN echo "VITE_FIREBASE_API_KEY=AIzaSyCf4w_MdoE4IFJhykHjcGpC2rHVIOa2t2Q" > .env.production && \
    echo "VITE_FIREBASE_AUTH_DOMAIN=agentflow-prod-assistant.firebaseapp.com" >> .env.production && \
    echo "VITE_FIREBASE_PROJECT_ID=agentflow-prod-assistant" >> .env.production && \
    echo "VITE_FIREBASE_STORAGE_BUCKET=agentflow-prod-assistant.firebasestorage.app" >> .env.production && \
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=1025941268003" >> .env.production && \
    echo "VITE_FIREBASE_APP_ID=1:1025941268003:web:1158f9e889aa17b4b1f396" >> .env.production && \
    echo "VITE_FIRESTORE_DATABASE_ID=(default)" >> .env.production

RUN npm run build

# Run stage
FROM node:20-slim
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "run", "start"]
