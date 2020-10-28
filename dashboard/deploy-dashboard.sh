# ElasticSearch variables
[ -z "${ELK_HOST}" ] && echo 'Error: ELK_HOST not declared' && exit 1
[ -z "${ELK_PORT}" ] && echo 'Error: ELK_PORT not declared' && exit 1
[ -z "${ELK_VERSION}" ] && echo 'Error: ELK_VERSION not declared' && exit 1
[ -z "${ELK_LOG_LEVEL}" ] && echo 'Error: ELK_LOG_LEVEL not declared' && exit 1

echo "Deploying ELK stack"
echo "Due to high memory usage from ELK stack is necessary increase memory limit usage"
sudo sysctl -w vm.max_map_count=262144
docker-compose -f dashboard/docker-compose-dashboard.yml up -d

sleep 20

echo "ELK stack deployed successfully."
