# LIME FRONTEND DOCKERFILE

FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

# INSTALL DEPENDENCIES
RUN npm ci

# COPY SOURCE CODE
COPY . .

# BUILD
RUN npm run build:widget
RUN npm run build

# PRODUCTION • USE NGINX TO SERVE STATIC FILES
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

