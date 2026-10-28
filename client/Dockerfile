# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Build-time only: baked into the bundle by Vite. The same-origin defaults
# work behind the Kubernetes Gateway (routes /api, /socket.io to the server)
# and behind the nginx proxy in this image. CI may override them.
ARG VITE_API_URL=/api
ARG VITE_SOCKET_URL=/
ENV VITE_API_URL=$VITE_API_URL \
    VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
