# 🏦 SecureBank Platform

> Plateforme bancaire moderne en architecture microservices avec audit de sécurité automatisé

[![Java](https://img.shields.io/badge/Java-17-red)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 En Développement Actif

Ce projet est actuellement en cours de développement dans le cadre de ma formation en école d'ingénieur.

**Période :** Janvier 2025 - Mars 2025  
**Objectif :** Démontrer la maîtrise de l'architecture microservices et des pratiques DevSecOps

---

## ✅ Statut des Services

| Service | Statut | Progression | Fonctionnalités |
|---------|--------|-------------|-----------------|
| 🏗️ **Structure Projet** | ✅ Terminé | 100% | Architecture multi-module Maven, Docker Compose |
| 🔐 **Auth Service** | ✅ Terminé | 100% | JWT, Spring Security, BCrypt, RBAC, Swagger |
| 💰 **Account Service** | 🔨 En cours | 0% | À venir Semaine 2 |
| 💳 **Payment Service** | ⏳ Planifié | 0% | Prévu Semaine 3 |
| 📧 **Notification Service** | ⏳ Planifié | 0% | Prévu Semaine 3 |
| 🌐 **API Gateway** | ⏳ Planifié | 0% | Prévu Semaine 3 |
| 🔍 **Security Audit Service** | ⏳ Planifié | 0% | Prévu Semaine 4 |
| 🎨 **Frontend React** | ⏳ Planifié | 0% | Prévu Semaines 5-6 |

**Progression globale :** ![15%](https://progress-bar.dev/15)

---

## 🏗️ Architecture

```
                    ┌─────────────────────┐
                    │   Frontend React    │
                    │  (Port 3000)        │
                    └──────────┬──────────┘
                               │ HTTPS/REST
                    ┌──────────▼──────────┐
                    │   API Gateway       │
                    │  Spring Cloud       │
                    │  (Port 8080)        │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐  ┌─────────▼────────┐  ┌─────────▼────────┐
│  Auth Service  │  │ Account Service  │  │ Payment Service  │
│  ✅ (8081)     │  │  🔨 (8082)       │  │  ⏳ (8083)       │
│                │  │                  │  │                  │
│ • JWT Auth     │  │ • Accounts CRUD  │  │ • Stripe API     │
│ • Registration │  │ • Transactions   │  │ • Webhooks       │
│ • RBAC         │  │ • Kafka Events   │  │ • Idempotency    │
└────────────────┘  └──────────────────┘  └──────────────────┘
        │                      │                      │
        └──────────────────────┴──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Apache Kafka      │
                    │  Event Streaming    │
                    └─────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐  ┌─────────▼────────┐  ┌─────────▼────────┐
│  PostgreSQL    │  │     Redis        │  │  Notification    │
│  (Auth DB)     │  │   (Cache)        │  │    Service       │
│  ✅ (5432)     │  │  ⏳ (6379)       │  │  ⏳ (8084)       │
└────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🛠️ Stack Technique

### Backend
- **Java 17** - Langage principal
- **Spring Boot 3.2** - Framework microservices
- **Spring Security 6** - Authentification & autorisation
- **Spring Data JPA** - ORM pour PostgreSQL
- **Python 3.11 + FastAPI** - Service d'audit sécurité (à venir)

### Frontend (À venir)
- **React 18** - Bibliothèque UI
- **TypeScript 5** - Typage statique
- **Tailwind CSS 3** - Framework CSS
- **Redux Toolkit** - State management
- **Axios** - Client HTTP

### Bases de Données
- **PostgreSQL 15** - Base relationnelle principale
- **Redis 7** - Cache et sessions (à venir)
- **MongoDB** - Logs d'audit (à venir)

### Messaging & Events
- **Apache Kafka 3.6** - Event streaming (à venir)

### DevOps & Infrastructure
- **Docker & Docker Compose** - Containerisation
- **GitLab CI / GitHub Actions** - CI/CD (à venir)
- **Prometheus** - Monitoring (à venir)
- **Grafana** - Dashboards (à venir)

### Sécurité
- **JWT (JSON Web Tokens)** - Authentification stateless ✅
- **BCrypt** - Hashage des mots de passe ✅
- **OWASP Dependency Check** - Scan vulnérabilités (à venir)
- **Trivy** - Scan images Docker (à venir)
- **SonarQube** - Analyse qualité code (à venir)

---

## 🚀 Quick Start

### Prérequis

- **Java 17+** ([Télécharger](https://adoptium.net/))
- **Maven 3.8+** ([Télécharger](https://maven.apache.org/download.cgi))
- **Docker & Docker Compose** ([Télécharger](https://www.docker.com/get-started))
- **Git** ([Télécharger](https://git-scm.com/downloads))

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/Evrard-Noumbi-3il/securebank-platform.git
cd securebank-platform

# 2. Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (ou garder les valeurs par défaut pour le dev)

# 3. Lancer avec Docker Compose (recommandé)
docker-compose up --build

# OU lancer sans Docker (nécessite PostgreSQL local)
# Démarrer PostgreSQL
docker run --name postgres-auth -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=auth_db -p 5432:5432 -d postgres:15

# Lancer le Auth Service
cd services/auth-service
mvn spring-boot:run
```

### Vérifier que tout fonctionne

```bash
# Health check
curl http://localhost:8081/actuator/health

# Devrait retourner: {"status":"UP"}
```

### Accéder à la documentation API

Ouvrir dans le navigateur : **http://localhost:8081/swagger-ui.html**

---

## 📖 Guide d'Utilisation

### 1️⃣ Inscription d'un nouvel utilisateur

**Request:**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "roles": ["ROLE_USER"]
}
```

### 2️⃣ Connexion

**Request:**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:** Identique à l'inscription

### 3️⃣ Rafraîchir le token

**Request:**
```bash
curl -X POST http://localhost:8081/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## 🔐 Sécurité

### Fonctionnalités Implémentées (Auth Service)

✅ **Authentification JWT**
- Access tokens (durée : 1 heure)
- Refresh tokens (durée : 7 jours)
- Signature HMAC-SHA256

✅ **Hashage des Mots de Passe**
- BCrypt avec cost factor 12
- Aucun mot de passe stocké en clair

✅ **Contrôle d'Accès (RBAC)**
- Rôles : USER, ADMIN, MANAGER
- Assignation automatique du rôle USER à l'inscription

✅ **Validation des Entrées**
- Bean Validation (annotations Jakarta)
- Messages d'erreur clairs

✅ **Protection des Endpoints**
- Endpoints publics : `/api/auth/**`, `/swagger-ui/**`
- Autres endpoints : authentification requise

### À Venir (Semaines suivantes)

- 🔜 Rate limiting (protection contre brute force)
- 🔜 Account lockout (verrouillage après X tentatives)
- 🔜 2FA (Two-Factor Authentication)
- 🔜 Audit trail (logs de sécurité)
- 🔜 OWASP compliance scanning

---

## 🧪 Tests

### Lancer les tests

```bash
# Tests unitaires
cd services/auth-service
mvn test

# Tests avec coverage
mvn test jacoco:report

# Voir le rapport
open target/site/jacoco/index.html
```

**Coverage actuel :** 🎯 *Tests à implémenter Semaine 1*

---

## 📁 Structure du Projet

```
securebank-platform/
├── services/
│   ├── auth-service/          ✅ Service d'authentification (JWT, Spring Security)
│   ├── account-service/       🔨 Gestion des comptes bancaires (en cours)
│   ├── payment-service/       ⏳ Intégration paiements Stripe
│   ├── notification-service/  ⏳ Notifications email/SMS
│   ├── api-gateway/           ⏳ Gateway Spring Cloud
│   └── security-audit-service/⏳ Audit sécurité Python
├── frontend/                  ⏳ Application React (à venir)
├── infrastructure/
│   └── docker-compose.yml     ✅ Orchestration containers
├── docs/                      ⏳ Documentation détaillée (à venir)
├── .github/workflows/         ⏳ CI/CD GitHub Actions (à venir)
├── pom.xml                    ✅ Configuration Maven parent
├── .env.example               ✅ Template variables environnement
└── README.md                  ✅ Ce fichier
```

---

## 🗓️ Roadmap

### ✅ Phase 1 : Foundation (Semaine 1) - EN COURS
- [x] Setup structure projet Maven multi-module
- [x] Auth Service complet (JWT, Spring Security, RBAC)
- [x] Docker Compose pour dev local
- [x] Documentation API (Swagger)
- [ ] Tests unitaires Auth Service (70%+ coverage)

### 🔨 Phase 2 : Core Banking (Semaines 2-3)
- [x] Account Service (CRUD comptes, transactions)
- [x] Payment Service (Stripe integration)
- [x] Notification Service (Email via JavaMailSender)
- [ ] API Gateway (Spring Cloud Gateway)
- [x] Kafka pour événements inter-services

### 🔜 Phase 3 : Security & Audit (Semaine 4)
- [ ] Security Audit Service (Python FastAPI)
- [ ] OWASP Dependency Check
- [ ] Trivy pour scan Docker images
- [ ] SonarQube integration
- [ ] Security gates dans CI/CD

### 🔜 Phase 4 : Frontend (Semaines 5-6)
- [ ] Application React avec TypeScript
- [ ] Dashboard utilisateur
- [ ] Pages : Login, Register, Accounts, Transactions, Transfer
- [ ] Redux pour state management
- [ ] Responsive design (Tailwind CSS)

### 🔜 Phase 5 : DevOps & Monitoring (Semaine 7)
- [ ] Pipeline CI/CD complet (GitLab CI)
- [ ] Prometheus + Grafana
- [ ] Tests automatisés dans CI
- [ ] Déploiement automatique

### 🔜 Phase 6 : Documentation & Déploiement (Semaine 8)
- [ ] Documentation architecture (diagrammes C4)
- [ ] Guide de déploiement
- [ ] Documentation sécurité (OWASP compliance)
- [ ] Déploiement production (Render/Railway)
- [ ] Video de démonstration

---

## 🤝 Contribution

Ce projet est actuellement un projet personnel de formation. Les suggestions et retours sont les bienvenus !

### Rapporter un Bug

Ouvrir une issue sur GitHub avec :
- Description du problème
- Steps to reproduce
- Comportement attendu vs obtenu
- Logs si disponibles

---

## 📚 Ressources & Documentation

### Documentation Externe
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/index.html)
- [JWT.io](https://jwt.io/) - Debugger JWT tokens
- [Docker Documentation](https://docs.docker.com/)

### Documentation Projet (à venir)
- Architecture détaillée
- API Reference complète
- Guide de sécurité
- Guide de déploiement

---

## 📊 Statistiques du Projet

- **Lignes de code (Java):** ~1,500 (Auth Service)
- **Nombre de services:** 1/6 (17%)
- **Coverage tests:** À venir
- **Commits:** [Voir sur GitHub](https://github.com/Evrard-Noumbi-3il/securebank-platform/commits)

---

## 🏆 Objectifs Pédagogiques

Ce projet me permet de démontrer ma maîtrise de :

✅ **Architecture Microservices**
- Découplage des services
- Communication inter-services (REST + Events)
- API Gateway pattern

✅ **Spring Ecosystem**
- Spring Boot pour APIs REST
- Spring Security pour authentification
- Spring Data JPA pour persistence
- Spring Cloud pour microservices

✅ **Sécurité Applicative**
- JWT pour authentification stateless
- BCrypt pour hashage passwords
- RBAC (Role-Based Access Control)
- DevSecOps practices

✅ **DevOps & Infrastructure**
- Docker & Docker Compose
- CI/CD pipelines
- Monitoring & Observabilité
- Infrastructure as Code (à venir)

---

## 👤 Auteur

**Evrard Noumbi**  
Étudiant en école d'ingénieur (Bac+4)  
Spécialisation : Développement Logiciel & DevSecOps

- 🐙 GitHub: [@Evrard-Noumbi-3il](https://github.com/Evrard-Noumbi-3il)
- 💼 LinkedIn: *[À venir]*
- 📧 Email: *[Disponible sur demande]*

---

## 📄 License

MIT License - voir [LICENSE](LICENSE)

---

## 🙏 Remerciements

- [Spring Team](https://spring.io/) pour l'excellent framework
- [Baeldung](https://www.baeldung.com/) pour les tutoriels Spring
- [OWASP](https://owasp.org/) pour les bonnes pratiques de sécurité
- La communauté open-source

---

## ⚠️ Disclaimer

**Ce projet est développé à des fins éducatives.**

Il ne doit PAS être utilisé en production sans :
- Audit de sécurité complet
- Tests de charge
- Revue de code par des experts
- Conformité réglementaire (PCI-DSS pour paiements, RGPD, etc.)

Les clés JWT et secrets utilisés en développement doivent être changés en production.

---


**⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile sur GitHub ! ⭐**

[Afficher l'image](https://visitor-badge.laobi.icu/badge?page_id=Evrard-Noumbi-3il.securebank-platform)

**Dernière mise à jour:** Decembre 2025
