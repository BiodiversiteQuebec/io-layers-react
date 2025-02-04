# 1. Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json  package-lock.json*  ./

RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi


FROM node:16-alpine as build


RUN mkdir  -p /var/www/app

WORKDIR /var/www/app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
#COPY .env.production .env
#RUN npm install

RUN chmod 777 /var/www/app/*

RUN npm run build

FROM nginx:1.12-alpine as prod



COPY --from=build /var/www/app/build /usr/share/nginx/html/io-app


RUN mkdir /usr/share/nginx/html/io-app/apps
RUN cd /usr/share/nginx/html/io-app && ln -s ../ apps/io-layers 
RUN chmod 777 /usr/share/nginx/html/*



COPY docker/configuration/nginx.conf /etc/nginx/nginx.conf
COPY docker/configuration/io.conf /etc/nginx/sites-enabled/io.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]