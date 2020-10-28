#!/bin/bash

REMOTE_ADDR=$(hostname -I | awk '{print $1}')

sed -ri -e "s/ELK_HOST=.*$/ELK_HOST=$REMOTE_ADDR/" docker-compose-prod.yml