FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# npm ci: reproducible install from package-lock.json — what CI and Trivy scan.
RUN npm ci --omit=dev

COPY . .

# node:alpine ships a non-root `node` user; the app needs no privileges.
RUN chown -R node:node /app
USER 1000

EXPOSE 5000

CMD ["node", "app.js"]
