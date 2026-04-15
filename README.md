# Learn Microservices with Spring Boot 3 (including Grafana LGTM)

This repository contains the source code of the practical use case described in the book [Learn Microservices with Spring Boot 3 (3rd Edition)](https://link.springer.com/book/10.1007/978-1-4842-9757-5).

I have made enhancements and integrated Grafana LGTM for comprehensive observability (metrics, traces, logs, and profiles).

## Features

The figure below shows a high-level overview of the final version of our system.

![Logical View - Chapter 8 (Final)](resources/microservice_patterns-Config-Server-1.png)

The main concepts included in this project are:

* Centralized Logging and Distributed Tracing
* Docker containerization for microservices
* Building a logger application with Spring Boot and RabbitMQ
* Distributed tracing with Grafana LGTM (OpenTelemetry Collector, Grafana, Loki, Prometheus, Tempo, Pyroscope)
* Building Docker images for Spring Boot applications with Dockerfiles
* Container orchestration with Kubernetes (kind)
* Service mesh and configuration management with Consul
* Infrastructure as Code with Helm and Helmfile

## Architecture

### System Overview

```
Browser
  │
  │ http://localhost (Ingress port 80)
  ▼
ingress-nginx
  ├── /              → frontend (React/nginx, port 3000)
  └── /api/*         → gateway (Spring Cloud Gateway, port 8000)
                         ├── /challenges/**, /attempts/**, /users/** → multiplication (port 8080)
                         └── /leaders                                 → gamification (port 8081)

Supporting Services:
├── RabbitMQ (bitnami)     ← multiplication, gamification, logs (pub/sub)
├── Consul (hashicorp)     ← service discovery + configuration management
└── Grafana LGTM (grafana) ← OpenTelemetry tracing + Grafana dashboards
```

## Running the Application

### Prerequisites

- Docker and Docker Compose
- Kubernetes (kind) for K8s deployment
- Helm and Helmfile for Kubernetes package management
- Node.js (for frontend build)
- Maven (for Java builds)

### Access Points

| Service              | URL                                    |
| :------------------- | :------------------------------------- |
| Frontend             | http://localhost:3000                  |
| Gateway API          | http://localhost:8000                  |
| Consul UI            | http://localhost:8500                  |
| RabbitMQ Management  | http://localhost:15672 (guest/guest)   |
| Grafana (otel-lgtm)  | http://localhost:3001                  |

### Building Docker Images

First, build the application images with Dockerfiles (includes OpenTelemetry Java agent):

```bash
cd multiplication && docker build -t multiplication:0.0.1-SNAPSHOT .
cd gamification && docker build -t gamification:0.0.1-SNAPSHOT .
cd gateway && docker build -t gateway:0.0.1-SNAPSHOT .
cd logs && docker build -t logs:0.0.1-SNAPSHOT .
```

Build the Consul importer from the `docker/consul` folder:

```bash
consul agent -node=learnmicro -dev
cd docker/consul
consul kv export config/ > consul-kv-docker.json
docker build -t consul-importer:1.0 .
```

Build the frontend UI (requires Node.js):

```bash
cd challenges-frontend
npm install
npm run build
docker build -t challenges-frontend:1.0 .
```

### Docker Compose Deployment

Once all images are built, run:

```bash
cd docker
docker-compose up
```

See the figure below for a diagram showing the container view.

![Container View](resources/microservice_patterns-View-Containers.png)

Once the backend and frontend are started, navigate to `http://localhost:3000` in your browser to start resolving multiplication challenges.

### Scaling with Docker Compose

After the system is running, you can quickly scale up and down instances of Multiplication and Gamification services:

```bash
docker-compose up --scale multiplication=2 --scale gamification=2
```

This will create two instances of each service with automatic load balancing and service discovery.

### Kubernetes Deployment (kind + Helm + Helmfile)

#### Prerequisites

- kind (Kubernetes in Docker)
- Helm 3+
- Helmfile

#### Setup

1. Create a kind cluster:

```bash
kind create cluster --config k8s/kind-config.yaml
```

2. Load Docker images into kind:

```bash
kind load docker-image multiplication:0.0.1-SNAPSHOT --name kind
kind load docker-image gamification:0.0.1-SNAPSHOT --name kind
kind load docker-image gateway:0.0.1-SNAPSHOT --name kind
kind load docker-image logs:0.0.1-SNAPSHOT --name kind
kind load docker-image challenges-frontend:1.0 --name kind
```

3. Deploy using Helmfile:

```bash
cd k8s
helmfile sync
```

#### Accessing the Application

| Service              | URL                                    |
| :------------------- | :------------------------------------- |
| Frontend             | http://localhost:3000                  |
| Gateway API          | http://localhost:8000                  |
| Consul UI            | http://localhost:8500                  |
| Grafana (otel-lgtm)  | http://localhost:3001                  |

#### Monitoring and Debugging

View logs from a specific service:

```bash
kubectl logs -f deployment/multiplication -n microservices
kubectl logs -f deployment/gamification -n microservices
kubectl logs -f deployment/gateway -n microservices
```

Check service status:

```bash
kubectl get pods -n microservices
kubectl get svc -n microservices
```

Access Grafana dashboards for traces, metrics, and logs.

## Configuration

### Environment Variables

Key environment variables for Kubernetes deployment:

- `SPRING_RABBITMQ_HOST`: RabbitMQ service hostname
- `SPRING_RABBITMQ_USERNAME`: RabbitMQ authentication username
- `SPRING_RABBITMQ_PASSWORD`: RabbitMQ authentication password
- `SPRING_CLOUD_CONSUL_HOST`: Consul service hostname
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OpenTelemetry collector endpoint

### Consul Configuration

Configuration is managed through Consul's key-value store. Services automatically load configuration from Consul on startup and watch for changes.

## Troubleshooting

### RabbitMQ Connection Issues

Ensure RabbitMQ credentials are correctly set in environment variables or Kubernetes Secrets.

### Service Discovery Issues

Verify Consul is running and services are registered:

```bash
kubectl port-forward svc/consul-server 8500:8500 -n microservices
# Visit http://localhost:8500 in browser
```

### Tracing and Logging

Check Grafana LGTM for distributed traces and logs:

```bash
kubectl port-forward svc/grafana 3000:80 -n microservices
# Visit http://localhost:3000 in browser
```

## Project Structure

```
├── multiplication/          # Multiplication service (Spring Boot)
├── gamification/           # Gamification service (Spring Boot)
├── gateway/                # API Gateway (Spring Cloud Gateway)
├── logs/                   # Logging service (Spring Boot)
├── challenges-frontend/    # React frontend
├── docker/                 # Docker Compose configuration
├── k8s/                    # Kubernetes manifests and Helm charts
│   ├── charts/            # Helm charts
│   ├── values/            # Helm values for each service
│   ├── helmfile.yaml      # Helmfile for deployment
│   └── kind-config.yaml   # kind cluster configuration
└── resources/             # Documentation images
```

## License

This project is based on the book "Learn Microservices with Spring Boot 3" and includes enhancements for modern observability and Kubernetes deployment.