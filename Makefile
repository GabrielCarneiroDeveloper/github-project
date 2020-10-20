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
	@make check-code
	@make run-tests
	docker-compose build

build-deploy:
	@echo "Running build and deploy process..."
	@make build
	docker stack rm github_project
	sleep 20
	docker stack deploy -c docker-compose-prod.yml github_project

deploy:
	@echo "Running deploy process..."
	docker stack rm github_project
	sleep 20
	docker stack deploy -c docker-compose-prod.yml github_project



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
