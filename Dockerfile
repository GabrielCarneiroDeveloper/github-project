FROM node:14.14 as builder

RUN mkdir /usr/src/app

COPY src /usr/src/app/src
# COPY .env /usr/src/app/.env
COPY .version /usr/src/app/.version
COPY ormconfig.json /usr/src/app/ormconfig.json
COPY package.json /usr/src/app/package.json
COPY tsconfig.json /usr/src/app/tsconfig.json

RUN mkdir /usr/src/app/logs

WORKDIR /usr/src/app

RUN yarn

EXPOSE 3333

ENTRYPOINT yarn dev