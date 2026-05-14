# Fase de compilación usando Maven y OpenJDK 26 (o la más cercana disponible)
FROM maven:3.9.6-eclipse-temurin-21 AS build 
COPY . .
RUN mvn clean package -DskipTests

# Fase de ejecución
FROM eclipse-temurin:21-jdk-slim
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]