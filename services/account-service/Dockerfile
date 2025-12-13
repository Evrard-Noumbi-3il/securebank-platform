# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copier les fichiers pom
COPY pom.xml .
COPY services/ services/

# AJOUT CRITIQUE : Copier le module contracts-common dans le WORKDIR (/app)
COPY contracts-common contracts-common/

RUN mvn install -DskipTests -f pom.xml

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copier le JAR depuis le stage de build
COPY --from=build /app/services/account-service/target/*.jar app.jar

# Exposer le port
EXPOSE 8082

# Créer un utilisateur non-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]