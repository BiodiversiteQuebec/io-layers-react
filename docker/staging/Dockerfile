FROM node:16-alpine AS build
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json  package-lock.json*  ./

RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

COPY . .
#COPY .env.staging .env

RUN chmod 777 /app/*



RUN npm run build