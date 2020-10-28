#!/bin/bash
set -e

# Database variables
[ -z "${DB_TYPE}" ] && echo 'Error: DB_TYPE not declared' && exit 1
[ -z "${DB_PORT}" ] && echo 'Error: DB_PORT not declared' && exit 1
[ -z "${DB_DATABASE}" ] && echo 'Error: DB_DATABASE not declared' && exit 1
[ -z "${DB_USER}" ] && echo 'Error: DB_USER not declared' && exit 1
[ -z "${DB_PASSWORD}" ] && echo 'Error: DB_PASSWORD not declared' && exit 1
[ -z "${DB_ROOT_USER}" ] && echo 'Error: DB_ROOT_USER not declared' && exit 1
[ -z "${DB_ROOT_PASS}" ] && echo 'Error: DB_ROOT_PASS not declared' && exit 1

docker stack rm db_${DB_DATABASE}
sleep 20
docker stack deploy -c database/docker-compose-db.yml db_${DB_DATABASE}