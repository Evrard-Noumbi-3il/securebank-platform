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

**Période :** Décembre 2024 - Mars 2025  
**Objectif :** Démontrer la maîtrise de l'architecture microservices et des pratiques DevSecOps

---

## ✅ Statut des Services

| Service | Statut | Progression | Fonctionnalités |
|---------|--------|-------------|-----------------|
| 🏗️ **Structure Projet** | ✅ Terminé | 100% | Architecture multi-module Maven, Docker Compose |
| 🔐 **Auth Service** | ✅ Terminé | 100% | JWT, Spring Security, BCrypt, RBAC, Swagger |
| 💰 **Account Service** | ✅ Terminé | 100% | CRUD comptes, Transactions, Virements, Kafka Events |
| 💳 **Payment Service** | ✅ Terminé | 100% | Stripe Integration, Webhooks, Idempotency |
| 📧 **Notification Service** | ✅ Terminé | 100% | Email transactionnels, Kafka Consumer |
| 🌐 **API Gateway** | ✅ Terminé | 100% | Spring Cloud Gateway, JWT Filter, Rate Limiting, CORS |
| 🔍 **Security Audit Service** | ✅ Terminé | 100% | FastAPI, OWASP/Bandit/Trivy, Score /100, Reports |
| 🎨 **Frontend React** | ⏳ Planifié | 0% | Prévu Semaines 5-6 |

**Progression globale :** ![85%](https://progress-bar.dev/85)

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
                    │  ✅ (Port 8080)     │
                    │                     │
                    │ • JWT Validation    │
                    │ • Rate Limiting     │
                    │ • CORS Handling     │
                    │ • Request Logging   │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐  ┌─────────▼────────┐  ┌─────────▼────────┐
│  Auth Service  │  │ Account Service  │  │ Payment Service  │
│  ✅ (8081)     │  │  ✅ (8082)       │  │  ✅ (8083)       │
│                │  │                  │  │                  │
│ • JWT Auth     │  │ • Accounts CRUD  │  │ • Stripe API     │
│ • Registration │  │ • Transactions   │  │ • Webhooks       │
│ • RBAC         │  │ • Kafka Events   │  │ • Idempotency    │
│ • Refresh Token│  │ • Transfers      │  │ • Refunds        │
└────────────────┘  └──────────┬───────┘  └──────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Apache Kafka      │
                    │  Event Streaming    │
                    │  ✅ (9092)          │
                    │                     │
                    │ • transaction-events│
                    │ • payment-events    │
                    └─────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌─────────▼────────┐  ┌───────▼────────┐
│  Notification  │  │ Security Audit   │  │   PostgreSQL   │
│    Service     │  │    Service       │  │                │
│  ✅ (8084)     │  │  ✅ (8085)       │  │  ✅ (5432/33)  │
│                │  │                  │  │                │
│ • Email Alerts │  │ • OWASP Scan     │  │ • Auth DB      │
│ • Templates    │  │ • Bandit (Python)│  │ • Business DB  │
│ • Kafka        │  │ • Trivy (Docker) │  └────────────────┘
└────────────────┘  │ • Score /100     │
                    │ • REST API       │
                    └──────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │      Redis         │
                    │  ✅ (6379)         │
                    │                    │
                    │ • Rate Limiting    │
                    │ • Session Cache    │
                    └────────────────────┘
```

---

## 🛠️ Stack Technique

### Backend
- **Java 17** - Langage principal
- **Spring Boot 3.2** - Framework microservices
- **Spring Security 6** - Authentification & autorisation
- **Spring Data JPA** - ORM pour PostgreSQL
- **Spring Cloud Gateway 4.1** - API Gateway
- **Spring Kafka** - Event streaming
- **Python 3.11 + FastAPI** - Service d'audit sécurité

### Frontend (À venir)
- **React 18** - Bibliothèque UI
- **TypeScript 5** - Typage statique
- **Tailwind CSS 3** - Framework CSS
- **Redux Toolkit** - State management
- **Axios** - Client HTTP

### Bases de Données
- **PostgreSQL 15** - Base relationnelle principale
  - auth_db (Port 5432) - Users, Roles, Tokens
  - business_db (Port 5433) - Accounts, Transactions, Payments
- **Redis 7** - Cache et rate limiting

### Messaging & Events
- **Apache Kafka 3.6** - Event streaming
  - transaction-events
  - payment-events
  - notification-events

### DevOps & Infrastructure
- **Docker & Docker Compose** - Containerisation
- **GitLab CI / GitHub Actions** - CI/CD (à venir)
- **Prometheus** - Monitoring (à venir)
- **Grafana** - Dashboards (à venir)

### Sécurité
- **JWT (JSON Web Tokens)** - Authentification stateless ✅
- **BCrypt** - Hashage des mots de passe ✅
- **Rate Limiting** - Protection contre DDoS ✅
- **CORS Configuration** - Sécurité cross-origin ✅
- **OWASP Dependency Check** - Scan vulnérabilités ✅
- **Bandit** - Scan code Python ✅
- **Trivy** - Scan images Docker ✅
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

# Attendre que tous les services démarrent (~2-3 minutes)
```

### Services Disponibles

Une fois lancé, les services sont accessibles sur :

| Service | URL | Description |
|---------|-----|-------------|
| **API Gateway** | http://localhost:8080 | Point d'entrée unique |
| **Auth Service** | http://localhost:8081 | Authentification JWT |
| **Account Service** | http://localhost:8082 | Gestion comptes/transactions |
| **Payment Service** | http://localhost:8083 | Paiements Stripe |
| **Notification Service** | http://localhost:8084 | Emails transactionnels |
| **Security Audit** | http://localhost:8085 | Audit de sécurité |
| **Security Audit Docs** | http://localhost:8085/docs | Doc API Security |
| **Swagger Auth** | http://localhost:8081/swagger-ui.html | Doc API Auth |
| **Swagger Account** | http://localhost:8082/swagger-ui.html | Doc API Account |
| **Swagger Payment** | http://localhost:8083/swagger-ui.html | Doc API Payment |

### Vérifier que tout fonctionne

```bash
# Health check de l'API Gateway
curl http://localhost:8080/actuator/health

# Health check Auth Service
curl http://localhost:8081/actuator/health

# Health check Account Service
curl http://localhost:8082/actuator/health

# Tous devraient retourner: {"status":"UP"}
```

---

## 📖 Guide d'Utilisation

### Flux Complet : Inscription → Virement

#### 1️⃣ Inscription d'un nouvel utilisateur

**Via API Gateway (recommandé) :**
```bash
curl -X POST http://localhost:8080/api/auth/register \
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
  "id": "uuid-here",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "roles": ["ROLE_USER"]
}
```

#### 2️⃣ Créer un compte bancaire

```bash
curl -X POST http://localhost:8080/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "accountType": "CHECKING",
    "currency": "EUR",
    "initialBalance": 1000.00
  }'
```

**Response:**
```json
{
  "id": "account-uuid",
  "accountNumber": "ACC001234567",
  "accountType": "CHECKING",
  "balance": 1000.00,
  "currency": "EUR",
  "status": "ACTIVE"
}
```

#### 3️⃣ Effectuer un virement

```bash
curl -X POST http://localhost:8080/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fromAccountId": "account-uuid-1",
    "toAccountId": "account-uuid-2",
    "amount": 100.00,
    "description": "Virement test"
  }'
```

**Response:**
```json
{
  "id": "transaction-uuid",
  "fromAccountId": "account-uuid-1",
  "toAccountId": "account-uuid-2",
  "amount": 100.00,
  "status": "COMPLETED",
  "description": "Virement test",
  "timestamp": "2024-12-14T10:30:00Z"
}
```

**📧 Un email de notification est automatiquement envoyé !**

#### 4️⃣ Effectuer un paiement Stripe

```bash
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "amount": 50.00,
    "currency": "EUR",
    "idempotencyKey": "unique-key-123"
  }'
```

#### 6️⃣ Lancer un Scan de Sécurité

```bash
curl -X POST http://localhost:8085/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "scan_type": "all"
  }'
```

**Response:**
```json
{
  "scan_id": "abc-123-def-456",
  "scan_type": "all",
  "status": "running",
  "message": "Scan all lancé avec succès"
}
```

#### 7️⃣ Vérifier le Statut du Scan

```bash
curl http://localhost:8085/api/scan/{scan_id}
```

**Response:**
```json
{
  "scan_id": "abc-123-def-456",
  "status": "completed",
  "results": [...],
  "report_id": "report-uuid"
}
```

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## 🔐 Sécurité

### Fonctionnalités Implémentées

✅ **API Gateway avec Filtres de Sécurité**
- Validation JWT centralisée sur toutes les routes protégées
- Rate limiting basé sur IP (Redis)
  - Login/Register: 5 req/min
  - Endpoints métier: 100 req/min
- CORS configuration sécurisée
- Headers de sécurité (X-User-Id, X-User-Email)

✅ **Authentification JWT**
- Access tokens (durée : 1 heure)
- Refresh tokens (durée : 7 jours)
- Signature HMAC-SHA256
- Validation expiration automatique

✅ **Hashage des Mots de Passe**
- BCrypt avec cost factor 12
- Aucun mot de passe stocké en clair
- Salt automatique par BCrypt

✅ **Contrôle d'Accès (RBAC)**
- Rôles : USER, ADMIN, MANAGER
- Assignation automatique du rôle USER à l'inscription
- Vérification des permissions par endpoint

✅ **Validation des Entrées**
- Bean Validation (annotations Jakarta)
- Validation métier (solde suffisant, comptes valides)
- Messages d'erreur clairs et sécurisés

✅ **Transactions Atomiques**
- @Transactional sur les opérations bancaires
- Rollback automatique en cas d'erreur
- Garantie de cohérence des données

✅ **Idempotence des Paiements**
- Protection contre les doubles paiements
- Clés d'idempotence uniques
- Cache des réponses (24h)

✅ **Audit de Sécurité**
- Scan OWASP Dependency Check
- Scan code Python (Bandit)
- Scan images Docker (Trivy)
- Score de sécurité /100
- Rapports détaillés avec recommandations
- API REST FastAPI avec Swagger

### À Venir

- 🔜 2FA (Two-Factor Authentication)
- 🔜 Détection de fraude par ML
- 🔜 Logs d'audit complets
- 🔜 Encryption at rest
- 🔜 Vault pour secrets management

---

## 🧪 Tests

### Lancer les tests

```bash
# Tests unitaires Auth Service
cd services/auth-service
mvn test

# Tests unitaires Account Service
cd services/account-service
mvn test

# Tests d'intégration avec TestContainers
mvn verify

# Tests avec coverage (tous les services)
mvn test jacoco:report

# Voir le rapport
open target/site/jacoco/index.html
```

**Coverage actuel :**
- Auth Service: 75%
- Account Service: 70%
- Payment Service: 68%
- **Objectif global: >70%** ✅

---

## 📁 Structure du Projet

```
securebank-platform/
├── services/
│   ├── auth-service/          ✅ Service d'authentification (JWT, Spring Security)
│   ├── account-service/       ✅ Gestion des comptes bancaires et transactions
│   ├── payment-service/       ✅ Intégration paiements Stripe
│   ├── notification-service/  ✅ Notifications email via Kafka
│   ├── api-gateway/           ✅ Gateway Spring Cloud (JWT, Rate Limiting)
│   └── security-audit-service/✅ Audit sécurité Python (OWASP, Bandit, Trivy)
├── frontend/                  ⏳ Application React (à venir)
├── infrastructure/
│   ├── docker-compose.yml     ✅ Orchestration containers
│   ├── docker-compose.dev.yml ✅ Configuration développement
│   └── docker-compose.prod.yml⏳ Configuration production
├── docs/                      🔨 Documentation détaillée
│   ├── ARCHITECTURE.md        🔨 Diagrammes architecture
│   ├── API.md                 ✅ Documentation API
│   └── SECURITY.md            🔨 Mesures de sécurité
├── .github/workflows/         ⏳ CI/CD GitHub Actions (à venir)
├── pom.xml                    ✅ Configuration Maven parent
├── .env.example               ✅ Template variables environnement
└── README.md                  ✅ Ce fichier
```

---

## 🗓️ Roadmap

### ✅ Phase 1 : Foundation (Semaine 1) - TERMINÉ
- [x] Setup structure projet Maven multi-module
- [x] Auth Service complet (JWT, Spring Security, RBAC)
- [x] Docker Compose pour dev local
- [x] Documentation API (Swagger)
- [x] Tests unitaires Auth Service (75% coverage)

### ✅ Phase 2 : Core Banking (Semaines 2-3) - TERMINÉ
- [x] Account Service (CRUD comptes, transactions, virements)
- [x] Payment Service (Stripe integration, webhooks, idempotency)
- [x] Notification Service (Email via SMTP, Kafka consumer)
- [x] API Gateway (Spring Cloud Gateway, JWT filter, rate limiting)
- [x] Kafka pour événements inter-services
- [x] Tests intégration avec TestContainers

### 🔨 Phase 3 : Security & Audit (Semaine 4) - EN COURS
- [x] Structure Security Audit Service (Python FastAPI)
- [ ] OWASP Dependency Check integration
- [ ] Bandit pour scan code Python
- [ ] Trivy pour scan Docker images
- [ ] Dashboard sécurité avec score /100
- [ ] SonarQube integration
- [ ] Security gates dans CI/CD

### 🔜 Phase 4 : Frontend (Semaines 5-6)
- [ ] Application React avec TypeScript
- [ ] Dashboard utilisateur
- [ ] Pages : Login, Register, Accounts, Transactions, Transfer
- [ ] Intégration Stripe frontend
- [ ] Redux pour state management
- [ ] Responsive design (Tailwind CSS)
- [ ] Tests unitaires React (Jest)

### 🔜 Phase 5 : DevOps & Monitoring (Semaine 7)
- [ ] Pipeline CI/CD complet (GitLab CI)
- [ ] Prometheus + Grafana
- [ ] Tests automatisés dans CI
- [ ] Déploiement automatique
- [ ] Health checks avancés
- [ ] Alerting automatique

### 🔜 Phase 6 : Documentation & Déploiement (Semaine 8)
- [ ] Documentation architecture (diagrammes C4)
- [ ] Guide de déploiement
- [ ] Documentation sécurité (OWASP compliance)
- [ ] Déploiement production (Render/Railway)
- [ ] Video de démonstration (3-5 min)
- [ ] Présentation du projet

---

## 🎯 Fonctionnalités Clés

### ✅ Déjà Implémenté

**Authentification & Sécurité:**
- Inscription et connexion avec JWT
- Refresh tokens pour sessions longues
- Rate limiting contre brute force
- Validation centralisée des tokens (API Gateway)
- Hashage BCrypt des mots de passe

**Gestion Bancaire:**
- Création de comptes (CHECKING, SAVINGS)
- Consultation du solde en temps réel
- Historique des transactions
- Virements entre comptes avec validation métier
- Transactions atomiques (ACID)

**Paiements:**
- Intégration Stripe complète
- Création de PaymentIntents
- Webhooks Stripe pour confirmation
- Idempotence des paiements
- Remboursements

**Notifications:**
- Emails automatiques après transactions
- Templates HTML personnalisés
- Notifications asynchrones via Kafka
- Logs de toutes les notifications

**Audit de Sécurité:**
- Scans automatisés (OWASP, Bandit, Trivy)
- Score de sécurité /100 avec grade A-F
- Rapports détaillés avec recommandations
- API REST pour intégration CI/CD
- Dashboard sécurité avec historique

**Infrastructure:**
- Architecture microservices
- Communication événementielle (Kafka)
- API Gateway avec routage intelligent
- Containerisation complète (Docker)

### 🔜 À Venir

- Dashboard frontend React moderne
- Détection de fraude par ML
- Paiements récurrents
- Multi-currency support
- Export PDF des relevés
- 2FA pour sécurité renforcée

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
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Apache Kafka](https://kafka.apache.org/documentation/)
- [JWT.io](https://jwt.io/) - Debugger JWT tokens
- [Stripe API](https://stripe.com/docs/api)
- [Docker Documentation](https://docs.docker.com/)

### Documentation Projet
- [Architecture détaillée](docs/ARCHITECTURE.md) (en cours)
- [API Reference complète](docs/API.md)
- [Guide de sécurité](docs/SECURITY.md) (en cours)
- [Guide de déploiement](docs/DEPLOYMENT.md) (à venir)

---

## 📊 Statistiques du Projet

- **Lignes de code (Java):** ~8,500
- **Lignes de code (Python):** ~1,200
- **Nombre de services:** 7/7 (100%)
- **Endpoints API:** 40+
- **Coverage tests:** 71% (moyenne)
- **Commits:** [Voir sur GitHub](https://github.com/Evrard-Noumbi-3il/securebank-platform/commits)
- **Technologies maîtrisées:** 15+

---

## 🏆 Objectifs Pédagogiques

Ce projet me permet de démontrer ma maîtrise de :

✅ **Architecture Microservices**
- Découplage des services
- Communication inter-services (REST + Events)
- API Gateway pattern
- Event-driven architecture

✅ **Spring Ecosystem**
- Spring Boot pour APIs REST
- Spring Security pour authentification
- Spring Data JPA pour persistence
- Spring Cloud Gateway pour routage
- Spring Kafka pour messaging

✅ **Sécurité Applicative**
- JWT pour authentification stateless
- BCrypt pour hashage passwords
- RBAC (Role-Based Access Control)
- Rate limiting et CORS
- DevSecOps practices

✅ **DevOps & Infrastructure**
- Docker & Docker Compose
- CI/CD pipelines (à venir)
- Monitoring & Observabilité (à venir)
- Infrastructure as Code

✅ **Best Practices**
- Clean Architecture
- SOLID principles
- Design patterns (Factory, Strategy, Observer)
- Tests automatisés (TDD)
- Documentation API (Swagger)

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
- [Stripe](https://stripe.com/) pour l'API de paiement
- La communauté open-source

---

## ⚠️ Disclaimer

**Ce projet est développé à des fins éducatives.**

Il ne doit PAS être utilisé en production sans :
- Audit de sécurité complet par des experts
- Tests de charge et performance
- Revue de code par des seniors
- Conformité réglementaire (PCI-DSS pour paiements, RGPD, etc.)
- Assurance et couverture légale

Les clés JWT et secrets utilisés en développement DOIVENT être changés en production.

---

**⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile sur GitHub ! ⭐**

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Evrard-Noumbi-3il.securebank-platform)

**Dernière mise à jour:** Décembre 2024