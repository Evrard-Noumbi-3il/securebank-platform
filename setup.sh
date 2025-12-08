#!/bin/bash

# Script d'initialisation du projet SecureBank Platform
# À exécuter dans le dossier racine du projet

echo "🚀 Initialisation de SecureBank Platform..."

# Créer la structure des dossiers
echo "📁 Création de la structure..."

mkdir -p services/auth-service/src/{main/{java/com/securebank/auth/{controller,service,model,repository,security,dto,exception,config},resources},test/java/com/securebank/auth/{controller,service}}

mkdir -p services/account-service/src/{main/{java/com/securebank/account/{controller,service,model,repository,dto,exception,config},resources},test/java/com/securebank/account/service}

mkdir -p services/payment-service/src/{main/{java/com/securebank/payment/{controller,service,model,repository,config},resources},test/java/com/securebank/payment/service}

mkdir -p services/notification-service/src/{main/{java/com/securebank/notification/{consumer,service,model,config},resources},test/java/com/securebank/notification}

mkdir -p services/api-gateway/src/{main/{java/com/securebank/gateway/{config,filter,util},resources},test/java/com/securebank/gateway}

mkdir -p services/security-audit-service/src/{api/routes,services,models,utils}

mkdir -p frontend/src/{components/{Auth,Dashboard,Transactions,Transfer,Security,Layout},services,store/slices,types,utils}

mkdir -p infrastructure/{docker-compose,prometheus,grafana/dashboards}

mkdir -p config/{prometheus,grafana}

mkdir -p docs/{diagrams,api}

mkdir -p scripts

mkdir -p .github/workflows

echo "✅ Structure créée"

# Créer les fichiers de configuration racine
echo "📝 Création des fichiers de configuration..."

# .gitignore
cat > .gitignore << 'EOF'
# Java
*.class
*.jar
*.war
*.ear
target/
.mvn/
mvnw
mvnw.cmd

# IDE
.idea/
*.iml
.vscode/
*.swp
*.swo

# Node
node_modules/
dist/
build/
.env.local

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Environment
.env
!.env.example

# Docker
*.pid
EOF

# .env.example
cat > .env.example << 'EOF'
# Database
POSTGRES_AUTH_USER=postgres
POSTGRES_AUTH_PASSWORD=changeme
POSTGRES_AUTH_DB=auth_db

POSTGRES_BUSINESS_USER=postgres
POSTGRES_BUSINESS_PASSWORD=changeme
POSTGRES_BUSINESS_DB=business_db

# Redis
REDIS_PASSWORD=changeme

# JWT
JWT_SECRET=your-super-secret-key-change-in-production-min-256-bits
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# Kafka
KAFKA_BOOTSTRAP_SERVERS=kafka:9092

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Stripe
STRIPE_API_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# API URLs
AUTH_SERVICE_URL=http://auth-service:8081
ACCOUNT_SERVICE_URL=http://account-service:8082
PAYMENT_SERVICE_URL=http://payment-service:8083
EOF

# README.md principal
cat > README.md << 'EOF'
# 🏦 SecureBank Platform

> Plateforme bancaire moderne en architecture microservices avec audit de sécurité automatisé

[![Java](https://img.shields.io/badge/Java-17-red)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 En Développement Actif

Ce projet est actuellement en cours de développement (Janvier 2025 - Mars 2025).

### ✅ Statut des Services

- [x] Structure projet
- [ ] Auth Service
- [ ] Account Service
- [ ] Payment Service
- [ ] Notification Service
- [ ] API Gateway
- [ ] Security Audit Service
- [ ] Frontend React

## 🏗️ Architecture

```
Frontend (React)
      ↓
API Gateway (Spring Cloud)
      ↓
┌─────┴─────┬──────────┬───────────┐
Auth     Account   Payment   Notification
Service  Service   Service     Service
```

## 🛠️ Technologies

- **Backend:** Java 17, Spring Boot 3.2, Python FastAPI
- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Databases:** PostgreSQL, Redis
- **Messaging:** Apache Kafka
- **DevOps:** Docker, GitLab CI, Prometheus

## 🚀 Quick Start

```bash
# Cloner le repo
git clone https://github.com/Evrard-Noumbi-3il/securebank-platform.git
cd securebank-platform

# Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer (quand services seront prêts)
docker-compose up -d
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) (à venir)
- [API Documentation](docs/API.md) (à venir)
- [Security](docs/SECURITY.md) (à venir)

## 👤 Auteur

**Evrard Noumbi**
- GitHub: [@Evrard-Noumbi-3il](https://github.com/Evrard-Noumbi-3il)

## 📄 License

MIT License - voir [LICENSE](LICENSE)

---

⚠️ **Note:** Projet en développement actif. Les fonctionnalités sont ajoutées progressivement.
EOF

echo "✅ Configuration de base créée"
echo ""
echo "🎉 Initialisation terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. cd securebank-platform"
echo "2. cp .env.example .env"
echo "3. Éditer .env avec vos valeurs"
echo "4. Suivre les instructions pour créer le Auth Service"
echo ""
echo "🔗 Repository: https://github.com/Evrard-Noumbi-3il/securebank-platform"
