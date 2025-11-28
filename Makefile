all: build down up

install_deps: install_front_deps install_back_deps

install_front_deps:
	cd frontend && npm i
install_back_deps:
	cd backend && npm i

generate_ssl:
	cd nginx && ./generate_ssl.sh

generate_secrets:
	cd backend && ./generate_secrets.sh

run_front_dev:
	cd frontend && npm run dev

run_back_dev:
	cd backend && npm run dev

run_db_dev:
	docker compose -f docker-compose-dev.yml up -d

down_db_dev:
	docker compose -f docker-compose-dev.yml down --remove-orphans

build:
	docker compose build

down:
	docker compose down --remove-orphans

up:
	docker compose up -d

logs:
	docker compose logs -f
