FROM node:14.14 as builder

RUN mkdir /usr/src/app

COPY src /usr/src/app/src
COPY test /usr/src/app/test

COPY .version /usr/src/app/.version
COPY ormconfig.json /usr/src/app/ormconfig.json
COPY package.json /usr/src/app/package.json
COPY tsconfig.json /usr/src/app/tsconfig.json
COPY jest.config.js /usr/src/app/jest.config.js
COPY .eslintrc.json /usr/src/app/.eslintrc.json
COPY .prettierrc /usr/src/app/.prettierrc

RUN mkdir /usr/src/app/logs

WORKDIR /usr/src/app

RUN yarn

#####################################
# Run tests
#####################################
RUN yarn test
RUN yarn code-checker

#####################################
# Build project
#####################################

RUN yarn tsc
RUN cp -r ./src/doc ./dist/

#####################################
# Final configurations
#####################################
EXPOSE 3333
WORKDIR /usr/src/app/dist
# ENTRYPOINT yarn dev
ENTRYPOINT node server.js