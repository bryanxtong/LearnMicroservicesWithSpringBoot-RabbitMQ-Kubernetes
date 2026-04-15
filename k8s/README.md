# Kubernetes Deployment (kind + Helm + Helmfile)

## Architecture

```
Browser
  │
  │ http://localhost (Ingress port 80)
  ▼
ingress-nginx
  ├── /           → frontend (React/nginx, port 80)
  ├── /api/*      → gateway (Spring Cloud Gateway, port 8000)
  │                   ├── /challenges/**, /attempts/**, /users/** → multiplication:8080
  │                   └── /leaders                                 → gamification:8081
  ├── /grafana/*  → otel-lgtm (Grafana, port 3000)
  ├── /consul/*   → consul-server (Consul UI, port 8500)
  └── /rabbitmq/* → rabbitmq-server (RabbitMQ Management, port 15672)

Supporting Services:
├── RabbitMQ               ← multiplication, gamification, logs (pub/sub)
├── Consul (hashicorp)     ← service discovery + configuration management
└── otel-lgtm (grafana)    ← OpenTelemetry tracing/logs/metrics + Grafana dashboards
```

## Access Points

| Service              | URL                                    |
| :------------------- | :------------------------------------- |
| Frontend             | http://localhost                       |
| API Gateway          | http://localhost/api                   |
| Grafana (otel-lgtm)  | http://localhost/grafana               |
| Consul UI            | http://localhost/consul                |
| RabbitMQ Management  | http://localhost/rabbitmq              |

**Credentials:**
- RabbitMQ: Username and password from `rabbitmq-default-user` Kubernetes Secret
- Grafana: Default admin credentials (admin/admin)

## Prerequisites

```bash
# Install tools
brew install kind helm helmfile kubectl

# Or on Windows:
# choco install kind kubernetes-helm helmfile kubectl
```

## Deployment Steps

### 1. Create kind cluster

```bash
kind create cluster --name microservices --config k8s/kind-config.yaml
```

### 2. Build Docker images

```bash
# Build services (requires mvn package -DskipTests first)
docker build -t multiplication:0.0.1-SNAPSHOT multiplication/
docker build -t gamification:0.0.1-SNAPSHOT   gamification/
docker build -t gateway:0.0.1-SNAPSHOT        gateway/
docker build -t logs:0.0.1-SNAPSHOT           logs/

# Build frontend (uses /api as API prefix, Ingress will rewrite it)
cd challenges-frontend
npm install
npm run build
docker build -t challenges-frontend:1.0 .
cd ..
```

> **For local frontend development** (without Ingress):
> ```bash
> REACT_APP_API_URL=http://localhost:8000 npm start
> ```

### 3. Load images into kind

```bash
kind load docker-image multiplication:0.0.1-SNAPSHOT    --name microservices
kind load docker-image gamification:0.0.1-SNAPSHOT     --name microservices
kind load docker-image gateway:0.0.1-SNAPSHOT          --name microservices
kind load docker-image logs:0.0.1-SNAPSHOT             --name microservices
kind load docker-image challenges-frontend:1.0          --name microservices
```

### 4. Deploy with Helmfile

```bash
cd k8s
helmfile repos          # Add Helm repositories
helmfile sync           # Deploy all releases in dependency order
```

### 5. Verify deployment

```bash
kubectl get pods -n microservices
kubectl get ingress -n microservices
```

## Common Commands

```bash
# View all release status
helmfile status

# Deploy only a specific service
helmfile -l name=gateway sync

# Update a service (after reloading image)
helmfile -l name=multiplication apply

# View service logs
kubectl logs -n microservices deploy/multiplication -f

# Clean up everything
helmfile destroy
kind delete cluster --name microservices
```

## Important Notes

1. **H2 Database**: Multiplication and Gamification services use H2 in-memory database. Data is lost when pods restart. This is suitable for learning purposes.

2. **RabbitMQ Credentials**: RabbitMQ is deployed using the official RabbitMQ Operator. Default credentials are stored in the `rabbitmq-default-user` Secret. Spring services read credentials via `secretKeyRef` in Kubernetes deployment.

3. **Consul Configuration**: The `consul-importer` Job automatically imports configuration into Consul after it's ready (RabbitMQ host, Consul discovery instance-id).

4. **Startup Time**: Spring Boot with OpenTelemetry agent takes time to start. Readiness probes have a 30-second initial delay.

5. **Ingress Configuration**: All Ingress rules are centralized in `k8s/values/ingress.yaml`. Each service (frontend, gateway, otel-lgtm, consul, rabbitmq) has equal architectural status through a single Ingress resource with multiple paths.
