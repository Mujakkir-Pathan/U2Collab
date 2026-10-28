help:
	@echo ""
	@echo "U2Collab commands:"
	@echo "  make setup   create your .env file (first time only)"
	@echo "  make up      build and start everything"
	@echo "  make down    stop everything"
	@echo "  make logs    watch the logs"
	@echo "  make ps      show what is running"
	@echo "  make reset   wipe and start fresh"
	@echo "  make smoke   quick check that everything works"
	@echo "  make lint    run the client linter + server syntax check"
	@echo ""

setup:
	@test -f .env || cp .env.example .env
	@echo ".env is ready"

up: setup
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

reset:
	docker compose down -v
	docker compose up --build

smoke:
	@echo "server health:"
	@curl -s http://localhost:5000/api/health
	@echo ""
	@echo "client page:"
	@curl -s -o /dev/null -w "  HTTP %{http_code}\n" http://localhost:5173/
	@echo "API through the client's nginx proxy:"
	@curl -s -o /dev/null -w "  HTTP %{http_code}\n" http://localhost:5173/api/health

lint:
	cd client && npm run lint
	cd server && find . -name '*.js' -not -path './node_modules/*' -print0 | xargs -0 -n1 node --check

.PHONY: help setup up down logs ps reset smoke lint
