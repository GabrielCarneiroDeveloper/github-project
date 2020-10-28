FROM node:14.14 as builder

LABEL maintainer="Gabriel M. Carneiro <carneiro.development@gmail.com>"

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


#####################################
# Install dev dependencies, run tests and linter
#####################################
RUN yarn --no-lockfile && yarn test && yarn code-checker

#####################################
# Build project
#####################################
RUN yarn tsc
RUN cp -r ./src/doc ./dist/
RUN cp package.json ./dist/
RUN cp ormconfig.json ./dist/

WORKDIR /usr/src/app/dist

RUN yarn --production

#####################################
# Production setup stage
#####################################
FROM node:14.14-alpine

COPY --from=builder /usr/src/app/dist /usr/src/app
COPY --from=builder /usr/src/app/.version /usr/src

RUN mkdir /usr/src/logs

WORKDIR /usr/src/app

RUN yarn --production

#####################################
# Final configurations
#####################################
EXPOSE 3333
ENTRYPOINT node server.js