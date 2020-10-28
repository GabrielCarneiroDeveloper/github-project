######################## 	Help	####################################

help:
	@echo "Commands:"
	@echo "	check				Check required principal dependencies"
	@echo "	run-tests			Run unit tests"
	@echo "	runserver			Run the application in Development mode"
	@echo "	check-code			Run code checkers"
	@echo "	build				Build the project Docker image"
	@echo "	clean				Remove not in use Docker objects"

check:
	node --version
	npm --version
	yarn --version
	docker --version
	docker-compose --version
	@echo "Your environment is checked and its ok"

clean:
	@echo "\n !!!!! CAUTION !!!!!!"
	@echo "*** This command will remove all the images, volumes, containers, networks which are not in use currently"
	docker system prune --volumes


######################## 	Production commands	############################################

build:
	@echo "Running build process..."
	@make project-build
	docker-compose build

project-build:
	@echo "Building project locally first"
	@make check-code
	@make run-tests
	yarn
	yarn build

build-deploy:
	@echo "Running build and deploy process..."
	@make build
	@make dashboard
	docker stack rm libquality
	sleep 20
	docker stack deploy -c docker-compose-prod.yml libquality

deploy:
	@echo "Running deploy process..."
	@echo "Add exec permition to 'deploy.sh' script"
	# sudo chmod +x deploy.sh
	# # docker stack rm libquality
	# # sleep 20
	# # docker stack deploy -c docker-compose-prod.yml libquality
	# docker stack deploy -c docker-compose-db.yml mongo
	# sleep 20

dashboard:
	@echo "Deploying ELK stack"
	@echo "Due to high memory usage from ELK stack is necessary increase memory limit usage"
	sudo sysctl -w vm.max_map_count=262144
	docker-compose -f dashboard/docker-compose-dashboard.yml up -d
	# docker stack deploy -c docker-compose-dashboard.yml dashboard

turnon:
	./deploy.sh

turnoff:
	docker-compose -f dashboard/docker-compose-dashboard.yml down
	docker stack rm libquality
	@echo "Libquality is turned off"


######################## 	Tests 	########################################################

run-tests:
	@echo "Running tests..."
	yarn test


######################## 	Development commands 	#######################################

runserver:
	@echo "Running application in development mode..."
	yarn dev

check-code:
	@echo "Running code checkers..."
	yarn code-checker

check-code-fix:
	@echo "Running code checkers and perform fixes..."
	yarn code-checker:fix

check-containers-health:
	@echo ""