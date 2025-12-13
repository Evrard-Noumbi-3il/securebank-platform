# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copier les fichiers pom
COPY pom.xml .
COPY contracts-common contracts-common/
COPY services/notification-service services/notification-service/
COPY services/account-service services/account-service/
COPY services/auth-service services/auth-service/
COPY services/payment-service services/payment-service/

RUN mvn install -DskipTests -f pom.xml

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copier le JAR depuis le stage de build
COPY --from=build /app/services/notification-service/target/*.jar app.jar

# Exposer le port
EXPOSE 8084

# Créer un utilisateur non-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]