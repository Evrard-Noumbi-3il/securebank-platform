# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copier les fichiers pom
COPY pom.xml .
COPY services/ services/

# Télécharger les dépendances
RUN mvn dependency:go-offline -B

# Copier le code source
COPY services/notification-service/src services/notification-service/src

# Build l'application
RUN mvn clean package -DskipTests -f services/notification-service/pom.xml

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