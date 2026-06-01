.PHONY: local-up local-deploy local-down local-status local-logs local-rebuild

local-up:
	@docker compose -f docker/docker-compose.yml up -d
	@echo "Waiting for LocalStack..."
	@for i in $$(seq 1 30); do \
		curl -sf http://localhost:4566/_localstack/health > /dev/null 2>&1 && break; \
		sleep 2;\
	done
	@echo "✅ LocalStack ready"

local-deploy:
	@./scripts/deploy-all.sh
	@tflocal -chdir=infra/environments/dev init
	@tflocal -chdir=infra/environments/dev apply -auto-approve \
		-var="project_name=order-platform" \
		-var="env=local" \
		-var="region=us-east-1" \
		-var="tags={}"
	@./scripts/bootstrap.sh

local-down:
	@docker compose -f docker/docker-compose.yml down -v

local-status:
	@curl -s http://localhost:4566/_localstack/health | jq .
	@echo "---"
	@echo "MailHog: http://localhost:8025"

local-logs:
	@docker compose -f docker/docker-compose.yml logs -f

local-rebuild: local-down local-up local-deploy
