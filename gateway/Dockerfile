FROM openjdk:17
COPY ./target/gateway-0.0.1-SNAPSHOT.jar /usr/src/app/
COPY ./opentelemetry-javaagent.jar /usr/src/app/

WORKDIR /usr/src/app
# we ignore the version (which is from upstream) and use the latest version of the grafana distribution
#ADD --chmod=644 https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar /usr/src/app/opentelemetry-javaagent.jar
ENV JAVA_TOOL_OPTIONS=-javaagent:/usr/src/app/opentelemetry-javaagent.jar

EXPOSE 8000
CMD ["java", "-jar", "gateway-0.0.1-SNAPSHOT.jar"]