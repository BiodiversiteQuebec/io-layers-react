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
#FROM node:16-alpine as build

#ARG ssh_prv_key
#ARG ssh_pub_key
#ARG ssh_config

#RUN apt-get update && \
#    apt-get install -y \
#        git \
#        openssh-server \
#        openssh-client

#COPY docker/configuration/config.txt /root/.ssh/config
#COPY docker/configuration/id_rsa.bq-react-lib /root/.ssh/id_rsa.bq-react-lib
#COPY docker/configuration/id_rsa.bq-react-lib.pub /root/.ssh/id_rsa.bq-react-lib.pub

# Authorize SSH Host
#RUN mkdir -p /root/.ssh && \
#    chmod 0700 /root/.ssh && \
#    ssh-keyscan github.com > /root/.ssh/known_hosts



#RUN chmod 600 /root/.ssh/id_rsa.bq-react-lib && \
#    chmod 700 /root/.ssh/config && \
#    chmod 600 /root/.ssh/id_rsa.bq-react-lib.pub

RUN mkdir  -p /var/www/app

WORKDIR /var/www/app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
#COPY .env.staging .env
#RUN npm install

RUN chmod 777 /var/www/app/*

RUN npm run build:staging

FROM nginx:1.12-alpine as prod

COPY --from=build /var/www/app/build /usr/share/nginx/html/atlas

RUN mkdir /usr/share/nginx/html/atlas/fr
RUN mkdir /usr/share/nginx/html/atlas/en
RUN cd /usr/share/nginx/html/atlas && \
    ln -s ../ fr/atlas && \
    ln -s ../ en/atlas
RUN chmod 777 /usr/share/nginx/html/*

COPY docker/configuration/nginx.conf /etc/nginx/nginx.conf
COPY docker/configuration/atlas.conf /etc/nginx/sites-enabled/atlas.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]