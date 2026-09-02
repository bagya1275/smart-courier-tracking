# Build the Spring Boot application with Java 17.
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml backend/pom.xml
RUN mvn -q -f backend/pom.xml dependency:go-offline
COPY backend/src backend/src
RUN mvn -q -f backend/pom.xml clean package -DskipTests

# Small production runtime image.
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/backend/target/smart-courier-api-1.0.0.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
