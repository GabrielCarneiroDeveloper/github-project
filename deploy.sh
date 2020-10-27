#!/bin/bash
set -e

make build

if [ -f deploy.prop ]; then
    echo "deploy.prop file found"
    echo "Loading deploy.prop file."
    export $(grep -v ^# < deploy.prop)
else 
    echo "deploy.prop file not found"
    exit 1
fi

docker stack rm mongo
sleep 20
docker stack deploy -c docker-compose-db.yml mongo

docker stop "${CONTAINER_NAME}" || true && docker rm "${CONTAINER_NAME}" || true

export DB_HOST=$(hostname -I | awk '{print$1}')
export ELK_HOST=$(hostname -I | awk '{print$1}')

[ -z "${DOCKER_IMAGE}" ] && echo 'Error: DOCKER_IMAGE not declared' && exit 1
[ -z "${DOCKER_IMAGE_VERSION}" ] && echo 'Error: DOCKER_IMAGE_VERSION not declared' && exit 1
[ -z "${CONTAINER_NAME}" ] && echo 'Error: CONTAINER_NAME not declared' && exit 1
[ -z "${CONTAINER_PORT}" ] && echo 'Error: CONTAINER_PORT not declared' && exit 1

[ -z "${PORT}" ] && echo 'Error: PORT not declared' && exit 1
[ -z "${NODE_ENV}" ] && echo 'Error: NODE_ENV not declared' && exit 1
[ -z "${LOG_LEVEL}" ] && echo 'Error: LOG_LEVEL not declared' && exit 1
# [ -z "${HOST_ADDRESS}" ] && echo 'Error: HOST_ADDRESS not declared' && exit 1

# [ -z "${DB_HOST}" ] && echo 'Error: DB_HOST not declared' && exit 1
[ -z "${DB_TYPE}" ] && echo 'Error: DB_TYPE not declared' && exit 1
[ -z "${DB_PORT}" ] && echo 'Error: DB_PORT not declared' && exit 1
[ -z "${DB_DATABASE}" ] && echo 'Error: DB_DATABASE not declared' && exit 1
[ -z "${DB_USER}" ] && echo 'Error: DB_USER not declared' && exit 1
[ -z "${DB_PASSWORD}" ] && echo 'Error: DB_PASSWORD not declared' && exit 1

[ -z "${JWT_SECRET_KEY}" ] && echo 'Error: JWT_SECRET_KEY not declared' && exit 1

[ -z "${GITHUB_TOKEN}" ] && echo 'Error: GITHUB_TOKEN not declared' && exit 1
[ -z "${GITHUB_BASE_URL}" ] && echo 'Error: GITHUB_BASE_URL not declared' && exit 1

echo "Create [${CONTAINER_NAME}] "
docker run \
    --detach \
    --name "${CONTAINER_NAME}" \
    --env DOCKER_IMAGE="${DOCKER_IMAGE}" \
    --env DOCKER_IMAGE_VERSION="${DOCKER_IMAGE_VERSION}" \
    --env CONTAINER_NAME="${CONTAINER_NAME}" \
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
    --publish "${CONTAINER_PORT}:${CONTAINER_PORT}" \
    ${DOCKER_IMAGE}:${DOCKER_IMAGE_VERSION}

rm -rf dist

make dashboard

echo "${CONTAINER_NAME} is running on http://localhost:${CONTAINER_PORT}"
docker logs "${CONTAINER_NAME}" --follow
