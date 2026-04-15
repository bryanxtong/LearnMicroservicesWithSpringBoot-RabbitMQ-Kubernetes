FROM openjdk:17
COPY ./target/logs-0.0.1-SNAPSHOT.jar /usr/src/app/
COPY ./opentelemetry-javaagent.jar /usr/src/app/

WORKDIR /usr/src/app
ENV JAVA_TOOL_OPTIONS=-javaagent:/usr/src/app/opentelemetry-javaagent.jar

EXPOSE 8580
CMD ["java", "-jar", "logs-0.0.1-SNAPSHOT.jar"]