FROM node:14.14 as builder

# **************************
# Configuring environment
# **************************
# ENV NODE_ENV="production"
# ENV HOST_ADDRESS="0.0.0.0"
# ENV PORT=3333
# ENV LOG_LEVEL="info"
# ENV DB_TYPE="mongodb"
# ENV DB_HOST=""
# ENV DB_PORT=5558
# ENV DB_DATABASE="libquality"
# ENV DB_USER="admin"
# ENV DB_PASSWORD="senha123"
# ENV JWT_SECRET_KEY="kl1hj2kl34h1&HJH"
# ENV GITHUB_TOKEN="109cb866b42fa4e463a2d55797146f6c6fcef4e6"
# ENV GITHUB_BASE_URL="https://api.github.com"

RUN mkdir /usr/src/app


# **************************
# Installing global dependencies
# **************************
# RUN npm install -g yarn
# RUN npm install -g typescript


# **************************
# Project building
# **************************
WORKDIR /usr/src/app
# COPY .env /usr/src/app
# COPY ormconfig.json /usr/src/app
# COPY package.json /usr/src/app
# COPY tsconfig.json /usr/src/app
# COPY .version /usr/src/app
# COPY src /usr/src/app/src
COPY dist /usr/src/app/dist
COPY .version /usr/src/app


# **************************
# Installing project dependencies
# **************************
# WORKDIR /usr/src/app
# RUN mkdir /usr/src/app/logs
RUN mkdir /usr/src/app/logs
# RUN yarn && yarn build


# **************************
# Running the application
# **************************
WORKDIR /usr/src/app/dist
EXPOSE 3333
# ENTRYPOINT [ "/bin/bash" ]
ENTRYPOINT node server.js