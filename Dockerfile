# Build stage
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Write .env.production so Vite picks it up at build time.
# These are non-secret Firebase Web SDK values (public identifiers, not service account keys).
RUN echo "VITE_FIREBASE_API_KEY=AIzaSyDL9P1r37CQxqVjGb7DHTbWKZ2UzrZ-mQ0" > .env.production && \
    echo "VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0639363380.firebaseapp.com" >> .env.production && \
    echo "VITE_FIREBASE_PROJECT_ID=gen-lang-client-0639363380" >> .env.production && \
    echo "VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0639363380.firebasestorage.app" >> .env.production && \
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=139690074983" >> .env.production && \
    echo "VITE_FIREBASE_APP_ID=1:139690074983:web:48da630f90897f104905c2" >> .env.production && \
    echo "VITE_FIRESTORE_DATABASE_ID=ai-studio-605ea102-90d9-41ca-940e-737ad40bc9d4" >> .env.production

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
