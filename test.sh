#!/bin/bash
set -e

###########################################
# Configurations to build process
###########################################
if [ -f .env ]; then
    echo ".env file found"
    echo "Loading .env file."
    export $(grep -v ^# < .env)
else 
    echo ".env file not found"
    exit 1
fi

# Configure database and ELK address with host address
export DB_HOST=$(hostname -I | awk '{print$1}')
export ELK_HOST=$(hostname -I | awk '{print$1}')


###########################################
# Requested variables check
###########################################

# Docker variables
[ -z "${DOCKER_IMAGE}" ] && echo 'Error: DOCKER_IMAGE not declared' && exit 1
[ -z "${DOCKER_IMAGE_VERSION}" ] && echo 'Error: DOCKER_IMAGE_VERSION not declared' && exit 1
[ -z "${CONTAINER_NAME}" ] && echo 'Error: CONTAINER_NAME not declared' && exit 1
[ -z "${CONTAINER_PORT}" ] && echo 'Error: CONTAINER_PORT not declared' && exit 1

# Application variables
[ -z "${PORT}" ] && echo 'Error: PORT not declared' && exit 1
[ -z "${NODE_ENV}" ] && echo 'Error: NODE_ENV not declared' && exit 1
[ -z "${LOG_LEVEL}" ] && echo 'Error: LOG_LEVEL not declared' && exit 1
[ -z "${JWT_SECRET_KEY}" ] && echo 'Error: JWT_SECRET_KEY not declared' && exit 1

# Database variables
[ -z "${DB_TYPE}" ] && echo 'Error: DB_TYPE not declared' && exit 1
[ -z "${DB_PORT}" ] && echo 'Error: DB_PORT not declared' && exit 1
[ -z "${DB_DATABASE}" ] && echo 'Error: DB_DATABASE not declared' && exit 1
[ -z "${DB_USER}" ] && echo 'Error: DB_USER not declared' && exit 1
[ -z "${DB_PASSWORD}" ] && echo 'Error: DB_PASSWORD not declared' && exit 1
[ -z "${DB_ROOT_USER}" ] && echo 'Error: DB_ROOT_USER not declared' && exit 1
[ -z "${DB_ROOT_PASS}" ] && echo 'Error: DB_ROOT_PASS not declared' && exit 1

# Github variables
[ -z "${GITHUB_TOKEN}" ] && echo 'Error: GITHUB_TOKEN not declared' && exit 1
[ -z "${GITHUB_BASE_URL}" ] && echo 'Error: GITHUB_BASE_URL not declared' && exit 1

# ElasticSearch variables
[ -z "${ELK_HOST}" ] && echo 'Error: ELK_HOST not declared' && exit 1
[ -z "${ELK_PORT}" ] && echo 'Error: ELK_PORT not declared' && exit 1
[ -z "${ELK_VERSION}" ] && echo 'Error: ELK_VERSION not declared' && exit 1
[ -z "${ELK_LOG_LEVEL}" ] && echo 'Error: ELK_LOG_LEVEL not declared' && exit 1

docker run \
    -it \
    --rm \
    --name "${CONTAINER_NAME}" \
    --env NODE_ENV="${NODE_ENV}" \
    --env HOST_ADDRESS="${HOST_ADDRESS}" \
    --env PORT=${PORT} \
    --env LOG_LEVEL="${LOG_LEVEL}" \
    --env DB_TYPE="${DB_TYPE}" \
    --env DB_HOST="${DB_HOST}" \
    --env DB_PORT=${DB_PORT}} \
    --env DB_DATABASE="${DB_DATABASE}" \
    --env DB_USER="${DB_USER}" \
    --env DB_PASSWORD="${DB_PASSWORD}" \
    --env JWT_SECRET_KEY="${JWT_SECRET_KEY}" \
    --env GITHUB_TOKEN="${GITHUB_TOKEN}" \
    --env GITHUB_BASE_URL="${GITHUB_BASE_URL}" \
    --env ELK_HOST="${ELK_HOST}" \
    --env ELK_PORT="${ELK_PORT}" \
    --env ELK_VERSION="${ELK_VERSION}" \
    --env ELK_LOG_LEVEL="${ELK_LOG_LEVEL}" \
    --entrypoint="/bin/sh" \
    --publish "${PORT}:${CONTAINER_PORT}" \
    ${DOCKER_IMAGE}:${DOCKER_IMAGE_VERSION}