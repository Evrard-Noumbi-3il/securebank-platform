# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copier le pom parent + tous les modules
COPY pom.xml .
COPY services/ services/

# Télécharger toutes les dépendances
RUN mvn dependency:go-offline -B

# Construire uniquement le module auth-service
RUN mvn -f services/auth-service/pom.xml clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copier le JAR
COPY --from=build /app/services/auth-service/target/*.jar app.jar

EXPOSE 8081

# Créer un utilisateur non-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

ENTRYPOINT ["java", "-jar", "app.jar"]
