
##### production ######
.PHONY: build-production
build-production: ## Build the development docker image.
	docker-compose   -f docker/production/docker-compose.yml build

.PHONY: start-production
start-production: ## Start the development docker container.
	docker-compose   -f docker/production/docker-compose.yml up -d

.PHONY: stop-production
stop-production: ## Stop the development docker container.
	docker-compose  -f docker/production/docker-compose.yml down



##### staging ######
.PHONY: build-staging
build-staging: ## Build the development docker image.
	docker compose  -f docker/staging/docker-compose.yml build

#.PHONY: start-staging
#start-staging: ## Start the development docker container.
#	docker compose --env-file ./.env.staging  -f docker/staging/docker-compose.yml up -d

.PHONY: start-staging
start-staging: ## Copy the files to the static site deployment location.
#		rm -rif /var/www/html/tableaux/tableau-io-layers-react/staging/atlas/*;
		rm -rif /tmp/io-staging-build/*;
		docker compose -f docker/staging/docker-compose.yml up -d;
#		docker container cp atlas-env-staging:/app/dist/ /tmp/io-staging-build/;
		docker container cp atlas-env-staging:/app/io-layers/ /tmp/io-staging-build/;
#		cp -r /tmp/io-staging-build/dist/* /var/www/html/tableaux/tableau-io-layers-react/staging/atlas/;
		sudo -u github-runner rsync -av -e "ssh" /tmp/io-staging-build/io-layers synapse:/var/www/tableau-io-layers-react/staging
		docker stop atlas-env-staging; docker rm atlas-env-staging

		

.PHONY: stop-staging
stop-staging: ## Stop the development docker container.
	docker compose   -f docker/staging/docker-compose.yml down


	##### production ######
.PHONY: build-production
build-production: ## Build the development docker image.
	docker compose   -f docker/production/docker-compose.yml build

#.PHONY: start-production
#start-production: ## Start the development docker container.
#	docker compose --env-file ./.env.production  -f docker/production/docker-compose.yml up -d

.PHONY: start-production
start-production: ## Start the development docker container.
#		rm -rif /var/www/html/tableaux/tableau-io-layers-react/production/atlas/*;
		rm -rif /tmp/io-production-build/*;
		docker compose   -f docker/production/docker-compose.yml up -d;
#		docker container cp atlas-env-production:/app/dist/ /tmp/io-production-build/;
		docker container cp atlas-env-production:/app/io-layers/ /tmp/io-production-build/;
#		cp -r /tmp/io-production-build/dist/* /var/www/html/tableau-io-layers-react/production/atlas/;
		sudo -u github-runner rsync -av -e "ssh" /tmp/io-production-build/io-layers synapse:/var/www/tableau-io-layers-react/production
		docker stop atlas-env-production; docker rm atlas-env-production

.PHONY: stop-production
stop-production: ## Stop the development docker container.
	docker compose   -f docker/production/docker-compose.yml down