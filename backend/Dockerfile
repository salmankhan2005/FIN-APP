FROM node:22-slim

# Install OpenSSL for Prisma compatibility
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NODE_ENV=production

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy prisma schema BEFORE npm install so postinstall (prisma generate) can find it
COPY prisma ./prisma/

# Install dependencies (postinstall runs prisma generate here - schema is now available)
RUN npm install --omit=dev

# Copy the rest of the source code
COPY . .

EXPOSE 5000

CMD npx prisma db push --accept-data-loss && npm start
