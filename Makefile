######################## 	Help	####################################

help:
	@echo "Commands:"
	@echo "	check				Check required principal dependencies"
	@echo "	run-tests			Run unit tests"
	@echo "	runserver			Run the application in Development mode"
	@echo "	check-code			Run code checkers"
	@echo "	check-code-fix			Run code checkers and fix the code"
	@echo "	build				Build the project Docker image"
	@echo "	build-deploy			Build and deploy project"
	@echo "	deploy				Deploy project"
	@echo "	dashboard			Deploy ELK containers"
	@echo "	database-dev			Deploy dev environment database"
	@echo "	turnoff				Shutdown all services"
	@echo "	deploy-dev			Deploy services in dev mode (only start database and dashboard)"
	@echo "	turnoff-dev			Shutdown services in dev mode"
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
	docker-compose build

build-deploy:
	@echo "Running build and deploy process..."
	@make build
	@deploy

deploy:
	@echo "Running deploy process..."
	./deploy.sh

dashboard-dev:
	@echo "Deploying ELK stack"
	@echo "Due to high memory usage from ELK stack is necessary increase memory limit usage"
	sudo sysctl -w vm.max_map_count=262144
	docker-compose -f dashboard/docker-compose-dashboard.yml up -d

database-dev:
	@echo "Deploying database to dev environment"
	docker stack rm libquality_db_dev
	sleep 20
	docker stack deploy -c ./database/docker-compose-db-dev.yml libquality_db_dev

turnoff:
	docker-compose -f dashboard/docker-compose-dashboard.yml down
	docker stack rm libquality
	@echo "Libquality is turned off"

deploy-dev:
	@make database-dev
	@make dashboard-dev

turnoff-dev:
	docker-compose -f dashboard/docker-compose-dashboard.yml down
	docker stack rm libquality_db_dev
	sleep 20
	@echo "Libquality dev is turned off"



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