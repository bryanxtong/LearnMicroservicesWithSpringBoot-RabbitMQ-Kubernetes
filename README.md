# Learn Microservices with Spring Boot (including Grafana LGTM)

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

## Running the Application

### Prerequisites
- Kubernetes (kind) for K8s deployment
- Helm and Helmfile for Kubernetes package management
- Node.js (for frontend build)
- Maven (for Java builds)

### Building Docker Images

First, build the application images with Dockerfiles (includes OpenTelemetry Java agent):

```bash
cd multiplication
mvn clean package -DskipTests
docker build -t multiplication:0.0.1-SNAPSHOT .
cd ..

cd gamification
mvn clean package -DskipTests
docker build -t gamification:0.0.1-SNAPSHOT .
cd ..

cd gateway
mvn clean package -DskipTests
docker build -t gateway:0.0.1-SNAPSHOT .
cd ..

cd logs
mvn clean package -DskipTests
docker build -t logs:0.0.1-SNAPSHOT .
cd ..
```

Build the frontend UI (requires Node.js):

```bash
cd challenges-frontend
npm install
npm run build
docker build -t challenges-frontend:1.0 .
```

See the figure below for a diagram showing the container view.

![Container View](resources/microservice_patterns-View-Containers.png)

Once the backend and frontend are started, navigate to `http://localhost` in your browser to start resolving multiplication challenges.


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
http://localhost/consul in browser
```

### Tracing and Logging

Check Grafana LGTM for distributed traces and logs:

```bash
http://localhost/grafana in browser
```

## Project Structure

```
├── multiplication/          # Multiplication service (Spring Boot)
├── gamification/           # Gamification service (Spring Boot)
├── gateway/                # API Gateway (Spring Cloud Gateway)
├── logs/                   # Logging service (Spring Boot)
├── challenges-frontend/    # React frontend
├── k8s/                    # Kubernetes manifests and Helm charts
│   ├── charts/            # Helm charts
│   ├── values/            # Helm values for each service
│   ├── helmfile.yaml      # Helmfile for deployment
│   └── kind-config.yaml   # kind cluster configuration
└── resources/             # Documentation images
```

## License

This project is based on the book "Learn Microservices with Spring Boot 3" and includes enhancements for modern observability and Kubernetes deployment.