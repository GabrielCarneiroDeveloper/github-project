#!/bin/bash
set -e

###########################################
# Configurations to build process
###########################################
if [ -f deploy.prop ]; then
    echo "deploy.prop file found"
    echo "Loading deploy.prop file."
    export $(grep -v ^# < deploy.prop)
else 
    echo "deploy.prop file not found"
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


###########################################
# Deploy database
###########################################
docker stack rm db_${DB_DATABASE}
sleep 20
docker stack deploy -c database/docker-compose-db.yml db_${DB_DATABASE}

