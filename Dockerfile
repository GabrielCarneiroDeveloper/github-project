FROM node:14.14 as builder

# **************************
# Configuring environment
# **************************
ENV NODE_ENV=development
ENV HOST_ADDRESS=localhost
ENV PORT=3333
ENV LOG_LEVEL=debug
ENV JWT_SECRET_KEY=kl1hj2kl34h1&HJH

RUN mkdir /usr/src/app


# **************************
# Installing global dependencies
# **************************
# RUN npm install -g yarn
RUN npm install -g typescript


# **************************
# Project building
# **************************
WORKDIR /usr/src/app
COPY .env /usr/src/app
COPY ormconfig.json /usr/src/app
COPY package.json /usr/src/app
COPY tsconfig.json /usr/src/app
COPY .version /usr/src/app
COPY src /usr/src/app/src


# **************************
# Installing project dependencies
# **************************
WORKDIR /usr/src/app
RUN mkdir /usr/src/app/logs
RUN yarn --no-lockfile && yarn build


# **************************
# Running the application
# **************************
WORKDIR /usr/src/app/dist
EXPOSE 3333
ENTRYPOINT node server.js