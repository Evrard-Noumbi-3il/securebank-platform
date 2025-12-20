# 🏦 SecureBank Platform - Documentation Complète

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Globale](#architecture-globale)
3. [Services Détaillés](#services-détaillés)
4. [Flux de Données](#flux-de-données)
5. [Stack Technologique](#stack-technologique)
6. [Structure du Projet](#structure-du-projet)
7. [Sécurité](#sécurité)
8. [Tests](#tests)
9. [Déploiement](#déploiement)
10. [Planning](#planning)

---

## 🎯 Vue d'Ensemble

### Informations Générales

| Attribut | Valeur |
|----------|--------|
| **Type** | Plateforme bancaire moderne avec microservices |
| **Durée** | 8 semaines (2 mois) |
| **Complexité** | Moyenne-Élevée |
| **Niveau** | Bac+4 Ingénieur |

### Technologies Principales

- **Backend**: Java Spring Boot, Python FastAPI
- **Frontend**: React + TypeScript + Tailwind CSS
- **Base de données**: PostgreSQL
- **Message Broker**: Apache Kafka
- **Infrastructure**: Docker, Redis
- **DevOps**: GitLab CI / GitHub Actions, SonarQube

### Description

Plateforme bancaire complète en architecture microservices avec :

- ✅ Gestion des comptes et transactions sécurisées
- ✅ Système de paiement intégré (Stripe)
- ✅ Détection et audit de sécurité automatisé
- ✅ Interface utilisateur moderne
- ✅ Pipeline CI/CD complet avec security gates

### Objectifs d'Apprentissage

1. **Spring Boot Ecosystem**: Security, Data JPA, Cloud Gateway
2. **Architecture Microservices**: Communication événementielle avec Kafka
3. **DevSecOps**: Intégration sécurité dans CI/CD
4. **Tests Automatisés**: Unitaires, intégration, e2e
5. **Déploiement Production**: Infrastructure complète

---

## 🏗️ Architecture Globale

### Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │   React + TypeScript + Tailwind CSS            │         │
│  │   Port: 3000                                   │         │
│  │                                                │         │
│  │   Pages:                                       │         │
│  │   - Login / Register                          │         │
│  │   - Dashboard (Accounts overview)             │         │
│  │   - Transactions History                      │         │
│  │   - Transfer Form                             │         │
│  │   - Security Reports                          │         │
│  └────────────────────────────────────────────────┘         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST + JSON
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   API GATEWAY LAYER                          │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │   Spring Cloud Gateway                         │         │
│  │   Port: 8080                                   │         │
│  │                                                │         │
│  │   Features:                                    │         │
│  │   - Routing to microservices                  │         │
│  │   - JWT validation (centralized)              │         │
│  │   - Rate limiting (Redis)                     │         │
│  │   - CORS handling                             │         │
│  │   - Request logging                           │         │
│  └────────────────────────────────────────────────┘         │
└─────┬────────────┬─────────────┬────────────┬───────────────┘
      │            │             │            │
      ▼            ▼             ▼            ▼
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐
│  Auth   │  │ Account  │  │ Payment  │  │Notification │
│ Service │  │ Service  │  │ Service  │  │  Service    │
│:8081    │  │:8082     │  │:8083     │  │:8084        │
└────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘
     │            │             │               │
     └────────────┴─────────────┴───────────────┘
                  │
                  ▼
     ┌────────────────────────┐
     │   Apache Kafka         │
     │   Port: 9092           │
     │                        │
     │   Topics:              │
     │   - transaction-events │
     │   - payment-events     │
     │   - notification-events│
     └────────┬───────────────┘
              │
              ▼
     ┌────────────────────────┐
     │  Security Audit        │
     │  Service (Python)      │
     │  Port: 8085            │
     │                        │
     │  - OWASP scans         │
     │  - Dependency checks   │
     │  - Docker image scans  │
     └────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                 │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │ PostgreSQL   │  │    Redis     │      │
│  │   (Auth)     │  │  (Business)  │  │   (Cache)    │      │
│  │ Port: 5432   │  │ Port: 5433   │  │ Port: 6379   │      │
│  │              │  │              │  │              │      │
│  │ Tables:      │  │ Tables:      │  │ Usage:       │      │
│  │ - users      │  │ - accounts   │  │ - Sessions   │      │
│  │ - roles      │  │ - transactions│  │ - Rate limit │      │
│  │ - audit_logs │  │ - payments   │  │ - Cache data │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               MONITORING & OBSERVABILITY                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Prometheus   │  │   Grafana    │  │ SonarQube    │      │
│  │ (Metrics)    │  │ (Dashboards) │  │(Code Quality)│      │
│  │ Port: 9090   │  │ Port: 3001   │  │ Port: 9000   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Vue des Services

| Service | Technologie | Port | Base de Données | Rôle |
|---------|-------------|------|-----------------|------|
| **Frontend** | React 18 | 3000 | - | Interface utilisateur |
| **API Gateway** | Spring Cloud Gateway | 8080 | Redis | Routage, sécurité centralisée |
| **Auth Service** | Spring Boot | 8081 | PostgreSQL (auth_db) | Authentification JWT |
| **Account Service** | Spring Boot | 8082 | PostgreSQL (business_db) | Gestion comptes & transactions |
| **Payment Service** | Spring Boot | 8083 | PostgreSQL (business_db) | Paiements Stripe |
| **Notification Service** | Spring Boot | 8084 | - | Emails transactionnels |
| **Security Audit** | Python FastAPI | 8085 | - | Scans de sécurité |

---

## 🔧 Services Détaillés

### 1. Auth Service (Port 8081)

**Responsabilités:**
- Inscription et connexion utilisateurs
- Génération et validation JWT (access + refresh tokens)
- Gestion des rôles (RBAC)
- Hachage des mots de passe (BCrypt)

**Endpoints principaux:**

```
POST   /auth/register       - Créer un compte
POST   /auth/login          - Se connecter
POST   /auth/refresh        - Renouveler le token
POST   /auth/logout         - Se déconnecter
GET    /users/me            - Profil utilisateur
PUT    /users/me            - Modifier profil
DELETE /users/me            - Supprimer compte
```

**Entités:**

```java
@Entity User
- id: UUID
- email: String (unique)
- password: String (BCrypt)
- firstName: String
- lastName: String
- roles: Set<Role>
- createdAt: LocalDateTime

@Entity Role
- id: Long
- name: String (USER, ADMIN)

@Entity RefreshToken
- id: UUID
- token: String
- userId: UUID
- expiryDate: LocalDateTime
```

**Technologies:**
- Spring Boot Starter Web
- Spring Boot Starter Security
- Spring Boot Starter Data JPA
- PostgreSQL Driver
- JJWT (JWT library)
- Lombok

---

### 2. Account Service (Port 8082)

**Responsabilités:**
- Gestion des comptes bancaires
- Exécution des transactions/virements
- Historique des transactions
- Publication d'événements Kafka

**Endpoints principaux:**

```
GET    /accounts                    - Lister mes comptes
POST   /accounts                    - Créer un compte
GET    /accounts/{id}               - Détails d'un compte
DELETE /accounts/{id}               - Supprimer un compte
GET    /transactions                - Historique transactions
POST   /transactions/transfer       - Effectuer un virement
GET    /accounts/{id}/transactions  - Transactions d'un compte
```

**Entités:**

```java
@Entity Account
- id: UUID
- userId: UUID (référence Auth Service)
- accountNumber: String (unique)
- accountType: Enum (CHECKING, SAVINGS)
- balance: BigDecimal
- currency: String (default: EUR)
- createdAt: LocalDateTime

@Entity Transaction
- id: UUID
- fromAccountId: UUID
- toAccountId: UUID
- amount: BigDecimal
- type: Enum (TRANSFER, DEPOSIT, WITHDRAWAL)
- status: Enum (PENDING, COMPLETED, FAILED)
- description: String
- createdAt: LocalDateTime
```

**Logique Métier Critique:**

```java
@Transactional
public TransactionDTO transfer(TransferRequest request) {
    // 1. Validation
    validateTransfer(request);
    
    // 2. Vérifier solde suffisant
    Account fromAccount = accountRepo.findById(request.getFromAccountId())
        .orElseThrow(() -> new AccountNotFoundException());
    
    if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
        throw new InsufficientBalanceException();
    }
    
    // 3. Exécuter transaction atomique
    fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
    
    Account toAccount = accountRepo.findById(request.getToAccountId())
        .orElseThrow(() -> new AccountNotFoundException());
    toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));
    
    accountRepo.saveAll(List.of(fromAccount, toAccount));
    
    // 4. Créer enregistrement transaction
    Transaction transaction = new Transaction();
    transaction.setFromAccountId(request.getFromAccountId());
    transaction.setToAccountId(request.getToAccountId());
    transaction.setAmount(request.getAmount());
    transaction.setStatus(TransactionStatus.COMPLETED);
    transactionRepo.save(transaction);
    
    // 5. Publier événement Kafka
    kafkaProducer.sendTransactionEvent(transaction);
    
    return mapper.toDTO(transaction);
}
```

**Technologies:**
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Kafka
- PostgreSQL Driver
- Redis (cache)

---

### 3. Payment Service (Port 8083)

**Responsabilités:**
- Intégration Stripe pour paiements
- Gestion des webhooks Stripe
- Remboursements
- Idempotence des paiements

**Endpoints principaux:**

```
POST   /payments              - Créer un paiement
GET    /payments/{id}         - Détails paiement
POST   /payments/{id}/refund  - Rembourser
POST   /webhooks/stripe       - Webhook Stripe
```

**Entités:**

```java
@Entity Payment
- id: UUID
- userId: UUID
- amount: BigDecimal
- currency: String
- status: Enum (PENDING, COMPLETED, FAILED, REFUNDED)
- stripePaymentId: String
- idempotencyKey: String
- createdAt: LocalDateTime

@Entity IdempotencyRecord
- idempotencyKey: String (PK)
- response: String (JSON)
- createdAt: LocalDateTime
- expiresAt: LocalDateTime
```

**Intégration Stripe:**

```java
public PaymentDTO processPayment(PaymentRequest request) {
    // 1. Vérifier idempotence
    if (idempotencyService.exists(request.getIdempotencyKey())) {
        return idempotencyService.getResponse(request.getIdempotencyKey());
    }
    
    // 2. Créer PaymentIntent Stripe
    PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
        .setAmount(request.getAmount().multiply(new BigDecimal(100)).longValue())
        .setCurrency(request.getCurrency())
        .build();
    
    PaymentIntent intent = PaymentIntent.create(params);
    
    // 3. Sauvegarder en DB
    Payment payment = new Payment();
    payment.setStripePaymentId(intent.getId());
    payment.setStatus(PaymentStatus.PENDING);
    paymentRepo.save(payment);
    
    // 4. Sauvegarder pour idempotence
    idempotencyService.save(request.getIdempotencyKey(), payment);
    
    return mapper.toDTO(payment);
}
```

**Technologies:**
- Spring Boot Starter Web
- Stripe Java SDK
- Spring Kafka

---

### 4. Notification Service (Port 8084)

**Responsabilités:**
- Consommer événements Kafka
- Envoyer emails transactionnels
- Logger les notifications

**Consommateurs Kafka:**

```java
@KafkaListener(topics = "transaction-events")
public void handleTransactionEvent(TransactionEvent event) {
    String email = getUserEmail(event.getUserId());
    
    emailService.sendTransactionEmail(
        email,
        event.getAmount(),
        event.getType(),
        event.getTimestamp()
    );
}

@KafkaListener(topics = "payment-events")
public void handlePaymentEvent(PaymentEvent event) {
    String email = getUserEmail(event.getUserId());
    
    emailService.sendPaymentConfirmation(
        email,
        event.getAmount(),
        event.getStatus()
    );
}
```

**Templates Email:**
- `transaction-email.html` - Notification de transaction
- `payment-confirmation.html` - Confirmation de paiement

**Technologies:**
- Spring Boot Starter Mail
- Spring Kafka
- Thymeleaf (templates)

---

### 5. API Gateway (Port 8080)

**Responsabilités:**
- Point d'entrée unique pour tous les clients
- Validation JWT centralisée
- Rate limiting (protection DDoS)
- Routage vers les microservices
- CORS handling
- Logging des requêtes

**Configuration des Routes:**

```yaml
spring:
  cloud:
    gateway:
      routes:
        # Auth Service
        - id: auth-service
          uri: http://auth-service:8081
          predicates:
            - Path=/api/auth/**
          filters:
            - StripPrefix=1
        
        # Account Service (protégé)
        - id: account-service
          uri: http://account-service:8082
          predicates:
            - Path=/api/accounts/**,/api/transactions/**
          filters:
            - StripPrefix=1
            - JwtAuthenticationFilter
        
        # Payment Service (protégé)
        - id: payment-service
          uri: http://payment-service:8083
          predicates:
            - Path=/api/payments/**
          filters:
            - StripPrefix=1
            - JwtAuthenticationFilter
```

**Filtres Personnalisés:**

```java
@Component
public class JwtAuthenticationFilter implements GatewayFilter {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = extractToken(exchange.getRequest());
        
        if (token == null || !jwtUtil.validateToken(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        
        // Ajouter userId dans header pour services downstream
        String userId = jwtUtil.getUserIdFromToken(token);
        ServerHttpRequest modifiedRequest = exchange.getRequest()
            .mutate()
            .header("X-User-Id", userId)
            .build();
        
        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }
}

@Component
public class RateLimitFilter implements GatewayFilter {
    
    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientIp = exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
        String key = "rate_limit:" + clientIp;
        
        Integer count = redisTemplate.opsForValue().increment(key);
        
        if (count == 1) {
            redisTemplate.expire(key, 60, TimeUnit.SECONDS);
        }
        
        if (count > 100) { // 100 req/min max
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return exchange.getResponse().setComplete();
        }
        
        return chain.filter(exchange);
    }
}
```

**Technologies:**
- Spring Cloud Gateway
- Spring Boot Starter Data Redis
- JJWT
- Bucket4j (rate limiting alternatif)

---

### 6. Security Audit Service (Port 8085)

**Responsabilités:**
- Scans de sécurité automatisés
- Détection de vulnérabilités
- Rapports de sécurité
- Calcul du score de sécurité

**Endpoints:**

```python
POST   /scan                 - Lancer un scan
GET    /scan/{id}            - Résultats d'un scan
GET    /reports              - Liste tous les rapports
GET    /reports/{id}         - Rapport détaillé
GET    /health               - Health check
```

**Services de Scan:**

```python
# dependency_scanner.py
class DependencyScanner:
    """Scan des dépendances avec OWASP Dependency Check"""
    
    def scan_maven(self, pom_path: str) -> ScanResult:
        """Scan pom.xml Maven"""
        command = [
            "dependency-check",
            "--project", "securebank",
            "--scan", pom_path,
            "--format", "JSON",
            "--out", "/tmp/dependency-check-report.json"
        ]
        subprocess.run(command, check=True)
        return self._parse_report("/tmp/dependency-check-report.json")
    
    def scan_npm(self, package_json_path: str) -> ScanResult:
        """Scan package.json npm"""
        # npm audit --json
        pass

# code_scanner.py
class CodeScanner:
    """Scan du code Python avec Bandit"""
    
    def scan_python_code(self, directory: str) -> ScanResult:
        """Scan code Python"""
        command = [
            "bandit",
            "-r", directory,
            "-f", "json",
            "-o", "/tmp/bandit-report.json"
        ]
        subprocess.run(command, check=True)
        return self._parse_report("/tmp/bandit-report.json")

# docker_scanner.py
class DockerScanner:
    """Scan images Docker avec Trivy"""
    
    def scan_image(self, image_name: str) -> ScanResult:
        """Scan image Docker"""
        command = [
            "trivy",
            "image",
            "--format", "json",
            "--output", "/tmp/trivy-report.json",
            image_name
        ]
        subprocess.run(command, check=True)
        return self._parse_report("/tmp/trivy-report.json")
```

**Calcul du Score:**

```python
class SecurityScoreCalculator:
    """Calcule le score de sécurité global"""
    
    WEIGHTS = {
        "critical": 10,
        "high": 5,
        "medium": 2,
        "low": 1
    }
    
    def calculate_score(self, scan_results: List[ScanResult]) -> int:
        """
        Score = 100 - (somme des vulnérabilités pondérées)
        Maximum: 0 (très mauvais)
        Minimum: 100 (parfait)
        """
        total_penalty = 0
        
        for result in scan_results:
            for vuln in result.vulnerabilities:
                total_penalty += self.WEIGHTS[vuln.severity.lower()]
        
        score = max(0, 100 - total_penalty)
        return score
```

**Modèles Pydantic:**

```python
from pydantic import BaseModel
from typing import List
from enum import Enum

class ScanType(str, Enum):
    DEPENDENCY = "dependency"
    CODE = "code"
    DOCKER = "docker"

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Vulnerability(BaseModel):
    id: str
    severity: Severity
    description: str
    affected_component: str
    cve_id: Optional[str] = None

class ScanResult(BaseModel):
    scan_type: ScanType
    vulnerabilities: List[Vulnerability]
    timestamp: datetime

class SecurityReport(BaseModel):
    id: str
    score: int  # 0-100
    scan_results: List[ScanResult]
    created_at: datetime
```

**Technologies:**
- FastAPI
- Uvicorn (ASGI server)
- Pydantic (validation)
- OWASP Dependency Check
- Bandit (Python linter)
- Trivy (container scanner)

---

### 7. Frontend (Port 3000)

**Structure des Composants:**

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.tsx          - Formulaire connexion
│   │   ├── Register.tsx       - Formulaire inscription
│   │   └── PrivateRoute.tsx   - Route protégée
│   │
│   ├── Dashboard/
│   │   ├── Dashboard.tsx      - Vue principale
│   │   ├── AccountCard.tsx    - Carte compte
│   │   └── AccountsList.tsx   - Liste comptes
│   │
│   ├── Transactions/
│   │   ├── TransactionHistory.tsx  - Historique
│   │   ├── TransactionItem.tsx     - Item transaction
│   │   └── TransactionFilters.tsx  - Filtres
│   │
│   ├── Transfer/
│   │   ├── TransferForm.tsx         - Formulaire virement
│   │   └── TransferConfirmation.tsx - Confirmation
│   │
│   └── Security/
│       ├── SecurityDashboard.tsx    - Dashboard sécurité
│       └── ScanReports.tsx          - Rapports scans
│
├── services/
│   ├── api.ts              - Instance Axios
│   ├── authService.ts      - API Auth
│   ├── accountService.ts   - API Accounts
│   └── securityService.ts  - API Security
│
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── accountSlice.ts
│   │   └── transactionSlice.ts
│   └── hooks.ts
│
└── types/
    ├── auth.types.ts
    ├── account.types.ts
    └── transaction.types.ts
```

**Configuration Axios:**

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

// Intercepteur pour ajouter JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/auth/refresh', { refreshToken });
        
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

**Redux Store:**

```typescript
// store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  } as AuthState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

**Technologies:**
- React 18.2
- TypeScript 5.0
- Tailwind CSS 3.4
- Redux Toolkit 2.0
- React Router 6.21
- Axios 1.6
- Recharts 2.10 (graphiques)

---

## 📊 Flux de Données

### 1. Flux d'Authentification

```
┌──────┐
│ User │
└──┬───┘
   │ 1. Login (email, password)
   ▼
┌────────────┐
│  Frontend  │
└──────┬─────┘
       │ 2. POST /api/auth/login
       ▼
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │ 3. Route to Auth Service
       ▼
┌─────────────┐
│Auth Service │
└──────┬──────┘
       │ 4. SELECT user FROM users WHERE email = ?
       ▼
┌────────────┐
│PostgreSQL  │
└──────┬─────┘
       │ 5. User data
       ▼
┌─────────────┐
│Auth Service │ 6. Validate password (BCrypt)
│             │ 7. Generate JWT (access + refresh)
└──────┬──────┘
       │ 8. Return tokens
       ▼
┌────────────┐
│  Frontend  │ 9. Store tokens in localStorage
└────────────┘
```

### 2. Flux de Transaction Bancaire

```
┌──────┐
│ User │ Click "Transfer"
└──┬───┘
   │ 1. POST /api/transactions/transfer
   │    {from: "ACC001", to: "ACC002", amount: 100}
   ▼
┌────────────┐
│  Frontend  │
└──────┬─────┘
       │ 2. POST with JWT in Authorization header
       ▼
┌─────────────┐
│ API Gateway │ 3. Validate JWT
│             │ 4. Extract userId
│             │ 5. Add X-User-Id header
└──────┬──────┘
       │ 6. Route to Account Service
       ▼
┌────────────────┐
│Account Service │
└────────┬───────┘
         │ 7. Validate business rules:
         │    - Sufficient balance?
         │    - Valid accounts?
         │    - Not same account?
         │
         │ 8. BEGIN TRANSACTION (SQL)
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
    UPDATE accounts           UPDATE accounts
    SET balance -= 100        SET balance += 100
    WHERE id = 'ACC001'       WHERE id = 'ACC002'
         │                          │
         │ 9. COMMIT TRANSACTION    │
         └──────────┬───────────────┘
                    │
                    │ 10. INSERT INTO transactions
                    │ 11. Publish event to Kafka
                    ▼
            ┌───────────────┐
            │     Kafka     │
            │Topic: trans.. │
            └───┬───────┬───┘
                │       │
      ┌─────────┘       └─────────┐
      ▼                           ▼
┌─────────────┐          ┌────────────────┐
│Notification │          │Security Audit  │
│  Service    │          │    Service     │
└──────┬──────┘          └────────┬───────┘
       │                          │
       │ 12. Send email           │ 13. Analyze transaction
       │ notification             │     for fraud patterns
       │                          │
       ▼                          ▼
   [Email sent]              [Fraud score: 15/100]
                                  │
                                  │ If score > 80:
                                  ▼
                            [Alert admin]
```

### 3. Flux de Paiement Stripe

```
┌──────┐
│ User │ Click "Pay with Card"
└──┬───┘
   │ 1. POST /api/payments
   │    {amount: 50, currency: "EUR", idempotencyKey: "uuid"}
   ▼
┌────────────┐
│  Frontend  │
└──────┬─────┘
       │ 2. POST with JWT
       ▼
┌─────────────┐
│ API Gateway │ 3. Validate JWT
└──────┬──────┘
       │ 4. Route to Payment Service
       ▼
┌────────────────┐
│Payment Service │
└────────┬───────┘
         │ 5. Check idempotency (avoid double payment)
         │ 6. If not exists, continue
         │
         │ 7. Create Stripe PaymentIntent
         ▼
    ┌──────────┐
    │  Stripe  │
    │   API    │
    └────┬─────┘
         │ 8. Return client_secret
         ▼
┌────────────────┐
│Payment Service │ 9. Save payment in DB
│                │ 10. Save idempotency record
└────────┬───────┘
         │ 11. Return payment details to frontend
         ▼
┌────────────┐
│  Frontend  │ 12. Use Stripe.js to confirm payment
│            │ 13. User enters card details
└──────┬─────┘
       │ 14. Stripe confirms payment
       ▼
┌──────────────┐
│    Stripe    │ 15. Payment successful
└──────┬───────┘
       │ 16. Webhook to /webhooks/stripe
       ▼
┌────────────────┐
│Payment Service │ 17. Update payment status to COMPLETED
│                │ 18. Publish event to Kafka
└────────┬───────┘
         │
         ▼
    ┌────────┐
    │ Kafka  │
    └────┬───┘
         │
         ▼
┌─────────────┐
│Notification │ 19. Send payment confirmation email
│  Service    │
└─────────────┘
```

---

## 💻 Stack Technologique

### Backend Services

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Java** | 17+ | Langage principal backend |
| **Spring Boot** | 3.2.x | Framework microservices |
| **Spring Security** | - | Sécurité & authentification |
| **Spring Data JPA** | - | ORM & persistence |
| **Spring Cloud Gateway** | 4.1.x | API Gateway |
| **Spring Kafka** | - | Message streaming |
| **PostgreSQL** | 15 | Base de données |
| **Redis** | 7.2 | Cache & rate limiting |
| **Apache Kafka** | 3.6 | Message broker |
| **Python** | 3.11+ | Security Audit Service |
| **FastAPI** | 0.109+ | Framework API Python |

### Dépendances Maven (pom.xml)

```xml
<properties>
    <java.version>17</java.version>
    <spring-boot.version>3.2.1</spring-boot.version>
    <jjwt.version>0.12.3</jjwt.version>
</properties>

<dependencies>
    <!-- Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- Data -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    
    <!-- Kafka -->
    <dependency>
        <groupId>org.springframework.kafka</groupId>
        <artifactId>spring-kafka</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>${jjwt.version}</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>${jjwt.version}</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>${jjwt.version}</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Mail -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>
    
    <!-- Documentation API -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>
    
    <!-- Utilities -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
    
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <scope>test</scope>
    </dependency>
    
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>kafka</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18.2.x | UI Library |
| **TypeScript** | 5.0.x | Type safety |
| **Tailwind CSS** | 3.4.x | Styling framework |
| **Redux Toolkit** | 2.0.x | State management |
| **Axios** | 1.6.x | HTTP client |
| **React Router** | 6.21.x | Routing |
| **Recharts** | 2.10.x | Charts & visualizations |

### Python (Security Audit)

```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
python-multipart==0.0.6
requests==2.31.0
```

**Outils de sécurité:**
- OWASP Dependency Check
- Bandit (Python security linter)
- Trivy (container scanner)

### DevOps & Infrastructure

| Outil | Version | Usage |
|-------|---------|-------|
| **Docker** | 24+ | Containerisation |
| **Docker Compose** | 2.23+ | Orchestration locale |
| **Prometheus** | 2.48+ | Métriques |
| **Grafana** | 10.2+ | Dashboards |
| **SonarQube** | 10.3+ | Quality gates |
| **GitLab CI / GitHub Actions** | - | CI/CD pipeline |

---

## 📁 Structure du Projet

```
securebank-platform/
│
├── 📁 services/
│   │
│   ├── 📁 auth-service/                    [Spring Boot - Port 8081]
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/securebank/auth/
│   │   │   │   │   ├── AuthServiceApplication.java
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── AuthController.java
│   │   │   │   │   │   └── UserController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── AuthService.java
│   │   │   │   │   │   ├── UserService.java
│   │   │   │   │   │   └── TokenService.java
│   │   │   │   │   ├── model/
│   │   │   │   │   │   ├── User.java
│   │   │   │   │   │   ├── Role.java
│   │   │   │   │   │   └── RefreshToken.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   │   ├── RoleRepository.java
│   │   │   │   │   │   └── RefreshTokenRepository.java
│   │   │   │   │   ├── security/
│   │   │   │   │   │   ├── JwtUtils.java
│   │   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   │   ├── AuthResponse.java
│   │   │   │   │   │   └── UserDTO.java
│   │   │   │   │   ├── exception/
│   │   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   │   ├── UserAlreadyExistsException.java
│   │   │   │   │   │   └── InvalidCredentialsException.java
│   │   │   │   │   └── config/
│   │   │   │   │       └── CorsConfig.java
│   │   │   │   └── resources/
│   │   │   │       ├── application.yml
│   │   │   │       └── application-prod.yml
│   │   │   └── test/
│   │   │       └── java/com/securebank/auth/
│   │   │           ├── controller/
│   │   │           │   └── AuthControllerTest.java
│   │   │           └── service/
│   │   │               └── AuthServiceTest.java
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   ├── 📁 account-service/                 [Spring Boot - Port 8082]
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/securebank/account/
│   │   │   │   │   ├── AccountServiceApplication.java
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── AccountController.java
│   │   │   │   │   │   └── TransactionController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── AccountService.java
│   │   │   │   │   │   ├── TransactionService.java
│   │   │   │   │   │   └── KafkaProducerService.java
│   │   │   │   │   ├── model/
│   │   │   │   │   │   ├── Account.java
│   │   │   │   │   │   └── Transaction.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── AccountRepository.java
│   │   │   │   │   │   └── TransactionRepository.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── AccountDTO.java
│   │   │   │   │   │   ├── TransactionDTO.java
│   │   │   │   │   │   └── TransferRequest.java
│   │   │   │   │   ├── exception/
│   │   │   │   │   │   ├── InsufficientBalanceException.java
│   │   │   │   │   │   ├── AccountNotFoundException.java
│   │   │   │   │   │   └── InvalidTransferException.java
│   │   │   │   │   └── config/
│   │   │   │   │       ├── KafkaProducerConfig.java
│   │   │   │   │       └── RedisConfig.java
│   │   │   │   └── resources/
│   │   │   │       └── application.yml
│   │   │   └── test/
│   │   │       └── java/com/securebank/account/
│   │   │           ├── service/
│   │   │           │   └── TransactionServiceTest.java
│   │   │           └── integration/
│   │   │               └── TransferIntegrationTest.java
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   ├── 📁 payment-service/                 [Spring Boot - Port 8083]
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/securebank/payment/
│   │   │   │   │   ├── PaymentServiceApplication.java
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── PaymentController.java
│   │   │   │   │   │   └── WebhookController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── PaymentService.java
│   │   │   │   │   │   ├── StripeService.java
│   │   │   │   │   │   ├── IdempotencyService.java
│   │   │   │   │   │   └── KafkaProducerService.java
│   │   │   │   │   ├── model/
│   │   │   │   │   │   ├── Payment.java
│   │   │   │   │   │   └── IdempotencyRecord.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── PaymentRepository.java
│   │   │   │   │   │   └── IdempotencyRepository.java
│   │   │   │   │   └── config/
│   │   │   │   │       ├── StripeConfig.java
│   │   │   │   │       └── KafkaProducerConfig.java
│   │   │   │   └── resources/
│   │   │   │       └── application.yml
│   │   │   └── test/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   ├── 📁 notification-service/            [Spring Boot - Port 8084]
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/securebank/notification/
│   │   │   │   │   ├── NotificationServiceApplication.java
│   │   │   │   │   ├── consumer/
│   │   │   │   │   │   └── KafkaConsumer.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── EmailService.java
│   │   │   │   │   │   └── TemplateService.java
│   │   │   │   │   ├── model/
│   │   │   │   │   │   └── NotificationLog.java
│   │   │   │   │   └── config/
│   │   │   │   │       ├── KafkaConsumerConfig.java
│   │   │   │   │       └── EmailConfig.java
│   │   │   │   └── resources/
│   │   │   │       ├── application.yml
│   │   │   │       └── templates/
│   │   │   │           ├── transaction-email.html
│   │   │   │           └── payment-confirmation.html
│   │   │   └── test/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   ├── 📁 api-gateway/                     [Spring Cloud Gateway - Port 8080]
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/securebank/gateway/
│   │   │   │   │   ├── GatewayApplication.java
│   │   │   │   │   ├── config/
│   │   │   │   │   │   ├── GatewayConfig.java
│   │   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   │   └── RedisConfig.java
│   │   │   │   │   ├── filter/
│   │   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   │   ├── RateLimitFilter.java
│   │   │   │   │   │   └── LoggingFilter.java
│   │   │   │   │   └── util/
│   │   │   │   │       └── JwtUtil.java
│   │   │   │   └── resources/
│   │   │   │       └── application.yml
│   │   │   └── test/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   └── 📁 security-audit-service/          [Python FastAPI - Port 8085]
│       ├── src/
│       │   ├── main.py
│       │   ├── api/
│       │   │   └── routes/
│       │   │       ├── scan.py
│       │   │       └── reports.py
│       │   ├── services/
│       │   │   ├── dependency_scanner.py
│       │   │   ├── code_scanner.py
│       │   │   ├── docker_scanner.py
│       │   │   └── report_service.py
│       │   ├── models/
│       │   │   ├── scan.py
│       │   │   └── report.py
│       │   └── utils/
│       │       ├── owasp_checker.py
│       │       └── severity_calculator.py
│       ├── requirements.txt
│       ├── Dockerfile
│       └── README.md
│
├── 📁 frontend/                            [React - Port 3000]
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── PrivateRoute.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── AccountCard.tsx
│   │   │   │   └── AccountsList.tsx
│   │   │   ├── Transactions/
│   │   │   │   ├── TransactionHistory.tsx
│   │   │   │   ├── TransactionItem.tsx
│   │   │   │   └── TransactionFilters.tsx
│   │   │   ├── Transfer/
│   │   │   │   ├── TransferForm.tsx
│   │   │   │   └── TransferConfirmation.tsx
│   │   │   ├── Security/
│   │   │   │   ├── SecurityDashboard.tsx
│   │   │   │   └── ScanReports.tsx
│   │   │   └── Layout/
│   │   │       ├── Navbar.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Footer.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── accountService.ts
│   │   │   ├── transactionService.ts
│   │   │   └── securityService.ts
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── accountSlice.ts
│   │   │   │   └── transactionSlice.ts
│   │   │   └── hooks.ts
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── account.types.ts
│   │   │   └── transaction.types.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── README.md
│
├── 📁 infrastructure/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── docker-compose.prod.yml
│
├── 📁 .github/workflows/                   (ou .gitlab-ci/)
│   └── ci-cd.yml
│
├── 📁 config/
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── dashboards/
│           └── system-overview.json
│
├── 📁 docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SECURITY.md
│   ├── DEPLOYMENT.md
│   └── diagrams/
│       ├── architecture-overview.png
│       ├── sequence-transaction.png
│       └── c4-container.png
│
├── 📁 scripts/
│   ├── init-db.sh
│   ├── start-dev.sh
│   └── run-tests.sh
│
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🔐 Sécurité

### Mesures Implémentées

#### 1. Authentification & Autorisation

✅ **JWT avec double token:**
- Access Token: 1 heure (stocké en mémoire)
- Refresh Token: 7 jours (stocké en localStorage)

✅ **BCrypt pour hashage:**
- Cost factor: 12
- Salage automatique

✅ **Spring Security:**
- SecurityFilterChain
- RBAC (Role-Based Access Control)
- Protection CSRF

✅ **Rate Limiting:**
- Login endpoint: 5 req/min
- Account lockout après 5 tentatives échouées

#### 2. Protection Applicative

✅ **Input Validation:**
- Bean Validation (`@Valid`, `@NotNull`, `@Email`, etc.)
- Validation côté frontend (React Hook Form)

✅ **SQL Injection Prevention:**
- Prepared Statements via JPA
- Parameterized queries uniquement

✅ **XSS Protection:**
- Content Security Policy headers
- Sanitization des inputs
- Escape des outputs

✅ **CORS Configuration:**
```yaml
# API Gateway
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "http://localhost:3000"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
            allowedHeaders: "*"
            allowCredentials: true
```

✅ **HTTPS Only (Production):**
- Redirection HTTP → HTTPS
- HSTS headers

#### 3. Security Audit Service (DevSecOps)

✅ **OWASP Dependency Check:**
- Scan dépendances Maven (Java)
- Scan dépendances npm (JavaScript)
- Alertes CVE critiques
- Intégration CI/CD pipeline

✅ **Bandit (Python):**
- Détection hardcoded secrets
- Détection patterns dangereux
- Vérification imports malveillants

✅ **Trivy (Docker):**
- Vulnérabilités OS
- Vulnérabilités packages
- Scan multi-layers

✅ **Dashboard Sécurité:**
- Score global (/100)
- Liste vulnérabilités par sévérité
- Tendances temporelles
- Alertes automatiques

#### 4. CI/CD Security Gates

✅ **SonarQube Quality Gate:**
```yaml
conditions:
  - type: NEW_BUGS
    metric: 0
  - type: NEW_VULNERABILITIES
    metric: 0
  - type: NEW_CODE_SMELLS
    metric: < 5
  - type: COVERAGE
    metric: > 70%
```

✅ **Dependency Check Gate:**
- Bloque si CVE critique (CVSS > 9.0)
- Warning si CVE haute (CVSS > 7.0)

✅ **Docker Scan Gate:**
- Bloque si vulnérabilités HIGH/CRITICAL

---

## 🧪 Tests

### Stratégie de Tests

#### Tests Unitaires (Target: >70% coverage)

**Auth Service:**
```java
@SpringBootTest
class AuthServiceTest {
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private AuthService authService;
    
    @Test
    void testRegisterUser_Success() {
        // Given
        RegisterRequest request = new RegisterRequest(
            "test@example.com", 
            "password123", 
            "John", 
            "Doe"
        );
        
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashedPassword");
        
        // When
        UserDTO result = authService.registerUser(request);
        
        // Then
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }
    
    @Test
    void testRegisterUser_EmailAlreadyExists() {
        // Given
        RegisterRequest request = new RegisterRequest(
            "existing@example.com", 
            "password123", 
            "John", 
            "Doe"
        );
        
        when(userRepository.existsByEmail(any())).thenReturn(true);
        
        // When & Then
        assertThrows(UserAlreadyExistsException.class, 
            () -> authService.registerUser(request));
    }
}
```

**Account Service:**
- TransactionServiceTest.java - Logique métier des transactions
- AccountServiceTest.java - CRUD des comptes
- KafkaProducerServiceTest.java - Publication événements

**Frontend:**
- Login.test.tsx - Formulaire de connexion
- Dashboard.test.tsx - Affichage du dashboard
- TransferForm.test.tsx - Formulaire de virement

#### Tests d'Intégration

**Account Service - TransferIntegrationTest:**
- Test avec PostgreSQL réel (TestContainers)
- Test avec Kafka réel (TestContainers)
- Scénario complet: Virement end-to-end
- Vérification cohérence données
- Vérification événements Kafka publiés

**Payment Service - StripeIntegrationTest:**
- Test avec Stripe API (mode test)
- Test webhooks
- Test idempotence

#### Tests End-to-End (Optionnel)

**Cypress:**
- login.cy.ts - Connexion utilisateur
- transfer.cy.ts - Virement complet
- dashboard.cy.ts - Navigation dashboard

### Commandes de Test

**Backend (Maven):**
```bash
# Tous les tests
mvn test

# Tests d'un service spécifique
cd services/auth-service
mvn test

# Tests avec coverage
mvn test jacoco:report

# Tests d'intégration uniquement
mvn verify -DskipUTs=true
```

**Frontend:**
```bash
# Tests unitaires
npm test

# Tests avec coverage
npm test -- --coverage

# Tests e2e
npm run cypress:open
```

### Outils de Coverage

- **JaCoCo**: Coverage Java (rapport HTML)
- **Jest**: Coverage JavaScript/TypeScript
- **SonarQube**: Analyse complète du code

---

## 🚀 Déploiement

### Environnements

#### Développement Local

**Prérequis:**
- Docker Desktop installé
- Java 17+ JDK
- Node.js 18+
- Maven 3.8+

**Commandes:**
```bash
# Cloner le projet
git clone https://github.com/username/securebank-platform.git
cd securebank-platform

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Accès aux services
# - Frontend: http://localhost:3000
# - API Gateway: http://localhost:8080
# - Swagger UI: http://localhost:8080/swagger-ui.html
# - Grafana: http://localhost:3001
# - Prometheus: http://localhost:9090
# - SonarQube: http://localhost:9000
```

#### Production (Options Gratuites)

**Option 1 - Render.com:**
- Frontend (Static Site) - GRATUIT
- API Gateway (Web Service) - GRATUIT
- PostgreSQL (1GB) - GRATUIT
- Total: €0/mois

**Option 2 - Railway.app:**
- Tous services Docker
- PostgreSQL inclus
- $5/mois avec crédits gratuits

**Option 3 - Fly.io:**
- Services conteneurisés
- PostgreSQL inclus
- Plan gratuit généreux

### CI/CD Pipeline

**Stages:**

1. **Build**
   - Compilation du code Java (Maven)
   - Build du frontend (npm)
   - Vérification syntaxe

2. **Test**
   - Tests unitaires
   - Tests d'intégration
   - Génération rapport coverage

3. **Security Scan**
   - OWASP Dependency Check
   - SonarQube analysis
   - Trivy Docker scan

4. **Docker Build**
   - Build images Docker
   - Tag avec version
   - Push vers registry

5. **Deploy**
   - Deploy automatique sur dev (branche develop)
   - Deploy manuel sur prod (branche main)
   - Rollback automatique si échec

**Quality Gates:**
- Tests doivent passer à 100%
- Coverage > 70%
- 0 bugs critiques (SonarQube)
- 0 vulnérabilités critiques
- 0 CVE critiques

### Configuration des Environnements

**Variables d'environnement (.env):**

**Database:**
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD

**JWT:**
- JWT_SECRET
- JWT_ACCESS_EXPIRATION
- JWT_REFRESH_EXPIRATION

**Stripe:**
- STRIPE_API_KEY
- STRIPE_WEBHOOK_SECRET

**Email:**
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD

**Kafka:**
- KAFKA_BOOTSTRAP_SERVERS

**Redis:**
- REDIS_HOST
- REDIS_PORT
- REDIS_PASSWORD

---

## 📅 Planning de Développement

### Phase 1: Backend Core (Semaines 1-4)

#### Semaine 1: Auth + Account Service (Base)

**Jours 1-3: Auth Service**
- Setup projet Maven multi-module
- Configuration Spring Security
- Entités User, Role, RefreshToken
- Endpoints register, login
- JWT generation/validation
- Tests unitaires

**Jours 4-7: Account Service (Base)**
- Entités Account, Transaction
- CRUD comptes basique
- Configuration JPA
- Tests unitaires

**Livrable S1:**
- Auth Service fonctionnel
- Account Service avec CRUD
- Tests > 70% coverage

#### Semaine 2: Account Service (Complet) + Payment Service

**Jours 1-4: Account Service (Transactions)**
- Logique métier transfer()
- Validation métier
- Configuration Kafka Producer
- Publication événements
- Tests intégration avec TestContainers

**Jours 5-7: Payment Service**
- Intégration Stripe
- Endpoints create/refund
- Webhook handler
- Idempotence
- Tests avec Stripe test mode

**Livrable S2:**
- Virements fonctionnels
- Paiements Stripe fonctionnels
- Événements Kafka publiés

#### Semaine 3: Notification Service + API Gateway

**Jours 1-3: Notification Service**
- Configuration Kafka Consumer
- Service email (SMTP)
- Templates HTML emails
- Logs notifications
- Tests

**Jours 4-7: API Gateway**
- Configuration Spring Cloud Gateway
- Routes vers microservices
- JWT validation filter
- Rate limiting (Redis)
- CORS configuration
- Tests filtres

**Livrable S3:**
- Emails envoyés automatiquement
- Gateway route correctement
- Rate limiting actif

#### Semaine 4: Security Audit Service (Python)

**Jours 1-3: Setup FastAPI + Scanners**
- Setup FastAPI
- OWASP Dependency Check integration
- Bandit integration
- Trivy integration
- Modèles Pydantic

**Jours 4-7: Reports + Dashboard**
- Service de reporting
- Calcul score sécurité
- Agrégation résultats
- Tests unitaires Python

**Livrable S4:**
- Scans automatisés fonctionnels
- Dashboard sécurité avec score

### Phase 2: Frontend (Semaines 5-6)

#### Semaine 5: Frontend Core

**Jours 1-2: Setup + Auth**
- Setup React + TypeScript + Tailwind
- Configuration Redux Toolkit
- Pages Login/Register
- Gestion tokens (interceptors Axios)

**Jours 3-5: Dashboard + Accounts**
- Dashboard principal
- Liste des comptes
- Détails compte
- Graphiques (Recharts)

**Jours 6-7: Transactions**
- Historique transactions
- Filtres transactions
- Pagination

**Livrable S5:**
- Interface auth fonctionnelle
- Dashboard avec comptes affichés

#### Semaine 6: Frontend Complet

**Jours 1-3: Transfer + Payments**
- Formulaire virement
- Confirmation virement
- Intégration Stripe frontend
- Formulaire paiement

**Jours 4-5: Security Dashboard**
- Dashboard sécurité
- Affichage rapports scans
- Graphiques score sécurité

**Jours 6-7: Polish + Tests**
- Responsive design
- Loading states
- Error handling
- Tests unitaires React

**Livrable S6:**
- Application frontend complète
- Intégration API fonctionnelle

### Phase 3: DevOps + Documentation (Semaines 7-8)

#### Semaine 7: Infrastructure + Monitoring

**Jours 1-3: Docker**
- Dockerfiles tous services
- docker-compose.yml
- docker-compose.dev.yml
- docker-compose.prod.yml
- Scripts démarrage

**Jours 4-5: Monitoring**
- Configuration Prometheus
- Configuration Grafana
- Dashboards personnalisés
- Alerting basique

**Jours 6-7: CI/CD**
- Pipeline GitLab CI ou GitHub Actions
- Stages: build, test, scan, deploy
- SonarQube integration
- Quality gates

**Livrable S7:**
- Stack Docker complète
- Monitoring opérationnel
- Pipeline CI/CD fonctionnel

#### Semaine 8: Documentation + Déploiement Production

**Jours 1-3: Documentation**
- README.md principal (professionnel)
- Architecture diagrams (C4, séquence)
- Documentation API (Swagger)
- Guide déploiement
- Guide sécurité

**Jours 4-5: Déploiement Production**
- Configuration environnement prod
- Déploiement sur Render/Railway/Fly
- Configuration DNS
- Tests end-to-end production

**Jours 6-7: Finitions**
- Video démo (3-5 minutes)
- Nettoyage code
- Vérification checklist qualité
- Préparation pitch projet

**Livrable S8:**
- Projet déployé en production
- Documentation complète
- Video démo

---

## ✅ Critères de Succès

### Projet SecureBank

#### Fonctionnel

- [ ] Tous les 6 services démarrent avec `docker-compose up`
- [ ] Authentification JWT fonctionne (login/register/refresh)
- [ ] Virement entre comptes fonctionne end-to-end
- [ ] Paiement Stripe fonctionne (mode test)
- [ ] Emails de notification envoyés automatiquement
- [ ] Security scan retourne résultats avec score

#### Tests

- [ ] Coverage > 70% sur services Java
- [ ] Tests intégration passent (TestContainers)
- [ ] Frontend tests passent (Jest)
- [ ] Pipeline CI/CD passe entièrement

#### DevOps

- [ ] Pipeline CI/CD fonctionne automatiquement
- [ ] SonarQube quality gate passe
- [ ] Docker images buildent correctement
- [ ] Déployé en production (accessible publiquement)

#### Documentation

- [ ] README avec quick start fonctionnel
- [ ] Diagrammes architecture (C4, séquence)
- [ ] Video démo 3-5 minutes
- [ ] Documentation API (Swagger/OpenAPI)
- [ ] Guide sécurité (SECURITY.md)

#### Sécurité

- [ ] JWT avec refresh tokens
- [ ] Passwords hashés (BCrypt)
- [ ] Rate limiting actif
- [ ] CORS configuré
- [ ] HTTPS en production
- [ ] Scans sécurité automatisés

---

## 🎓 Évolutions Futures

### Phase 2: Enhanced IAM (2-3 semaines)

**Fonctionnalités:**
- Keycloak integration (SSO)
- 2FA avec TOTP (Google Authenticator)
- OAuth2 providers (Google, Microsoft)
- Fine-grained permissions (ACL)

### Phase 3: ML Fraud Detection (2 semaines)

**Composants:**
- Service ML Python (scikit-learn)
- Random Forest model pour détection fraude
- Isolation Forest pour anomalies
- Feature engineering pipeline
- Real-time scoring endpoint
- Intégration avec Account Service

### Phase 4: Observability Complète (1-2 semaines)

**Stack ELK:**
- Elasticsearch: Stockage logs
- Logstash: Pipeline logs
- Kibana: Dashboards & visualisation
- Logs centralisés de tous services

**Distributed Tracing:**
- Jaeger pour traçabilité requêtes
- Correlation IDs
- Performance monitoring

### Phase 5: Advanced Infrastructure (3-4 semaines)

**Terraform:**
- Multi-module architecture
- Azure AKS (Kubernetes)
- Managed PostgreSQL
- Redis Cache
- Virtual Network
- Load Balancer

**Kubernetes:**
- Helm charts
- HPA (Horizontal Pod Autoscaling)
- Service mesh (Istio optionnel)
- Blue/Green deployment
- Canary releases

### Phase 6: Advanced Features

**Notifications:**
- SMS via Twilio
- Push notifications (Firebase)
- Multi-canal notifications

**API:**
- Webhooks API pour intégrations
- GraphQL API en complément REST
- Rate limiting avancé par endpoint

**Administration:**
- Admin dashboard avancé
- Reporting automatique (PDF)
- Audit logs complets
- User management avancé

**Business:**
- Multi-currency support
- Scheduled transactions
- Recurring payments
- Budget tracking
- Financial analytics

---

## 🔧 Commandes Rapides

### Développement

**Démarrage complet:**
```bash
docker-compose up -d
```

**Démarrage services spécifiques:**
```bash
docker-compose up -d postgres redis kafka
```

**Logs:**
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f auth-service
```

**Rebuild après changements:**
```bash
docker-compose up -d --build
```

**Arrêt et nettoyage:**
```bash
docker-compose down
docker-compose down -v  # Avec suppression volumes
```

### Tests

**Tests backend:**
```bash
# Tous les services
mvn clean test

# Service spécifique
cd services/auth-service && mvn test

# Avec coverage
mvn test jacoco:report
```

**Tests frontend:**
```bash
cd frontend
npm test
npm test -- --coverage
```

**Tests intégration:**
```bash
mvn verify
```

### Build

**Build backend:**
```bash
mvn clean package -DskipTests
```

**Build frontend:**
```bash
cd frontend
npm run build
```

**Build Docker images:**
```bash
docker-compose build
```

### Base de données

**Connexion PostgreSQL:**
```bash
docker exec -it securebank-postgres psql -U postgres -d auth_db
```

**Reset base de données:**
```bash
docker-compose down -v
docker-compose up -d postgres
```

---

## 📞 Utilisation de ce Document

### Pour une Nouvelle Conversation avec une IA

**Prompt à utiliser:**

"Je travaille sur un projet de plateforme bancaire en microservices appelé SecureBank Platform. Voici la documentation complète de mon projet : [COLLER CE DOCUMENT]

Je suis actuellement à l'étape : [DÉCRIRE L'ÉTAPE]

J'ai besoin d'aide pour : [DÉCRIRE LE BESOIN SPÉCIFIQUE]

Contexte additionnel : [AJOUTER DES DÉTAILS SI NÉCESSAIRE]"

### Pour Collaboration avec d'Autres Développeurs

**Onboarding rapide:**

1. Partager ce document
2. Indiquer la section du projet en cours
3. Pointer vers les issues GitHub/GitLab
4. Expliquer la convention de commit
5. Partager les credentials de développement

### Pour Présentation du Projet

**Éléments clés à mettre en avant:**

1. **Architecture microservices** avec 6 services
2. **DevSecOps** avec security audit automatisé
3. **Stack moderne** (Spring Boot 3, React 18, Kafka)
4. **Sécurité renforcée** (JWT, BCrypt, rate limiting, OWASP)
5. **CI/CD complet** avec quality gates
6. **Tests automatisés** (>70% coverage)
7. **Monitoring** (Prometheus, Grafana)
8. **Documentation professionnelle**

---

## 📋 Checklist de Démarrage

### Prérequis

- [ ] Java 17+ JDK installé
- [ ] Maven 3.8+ installé
- [ ] Node.js 18+ installé
- [ ] Docker Desktop installé et démarré
- [ ] Git installé
- [ ] IDE configuré (IntelliJ IDEA / VSCode)
- [ ] Compte GitHub créé
- [ ] Compte Render.com créé (déploiement)
- [ ] Compte Stripe créé (mode test)

### Jour 1 - Setup Initial

- [ ] Créer repository GitHub: `securebank-platform`
- [ ] Initialiser structure projet
- [ ] Créer `.gitignore`
- [ ] Créer `README.md` basique
- [ ] Premier commit: "Initial project structure"
- [ ] Créer branches: `develop`, `main`

### Semaine 1 - Premier Sprint

- [ ] Setup Auth Service
- [ ] Configuration Spring Security
- [ ] Entités de base créées
- [ ] Tests unitaires Auth Service
- [ ] Setup Account Service (base)
- [ ] Premier Docker Compose fonctionnel

---

## 📚 Ressources Utiles

### Documentation Officielle

- Spring Boot: https://spring.io/projects/spring-boot
- Spring Security: https://spring.io/projects/spring-security
- Spring Cloud Gateway: https://spring.io/projects/spring-cloud-gateway
- React: https://react.dev
- Kafka: https://kafka.apache.org/documentation/
- FastAPI: https://fastapi.tiangolo.com

### Tutoriels Recommandés

- JWT avec Spring Boot
- Microservices communication avec Kafka
- React + TypeScript best practices
- Docker Compose pour développement
- CI/CD avec GitHub Actions
- OWASP Top 10 vulnerabilities

### Outils de Développement

- IntelliJ IDEA (Java)
- VSCode (Frontend + Python)
- Postman (API testing)
- DBeaver (Database management)
- Docker Desktop
- GitKraken / SourceTree (Git GUI)

---

## 🎯 Points Clés à Retenir

### Architecture

- 6 microservices indépendants
- Communication asynchrone via Kafka
- API Gateway comme point d'entrée unique
- Séparation base de données (auth vs business)

### Sécurité

- JWT avec access + refresh tokens
- Rate limiting pour protection DDoS
- Scans automatisés (OWASP, Bandit, Trivy)
- HTTPS en production obligatoire

### Qualité

- Tests automatisés (>70% coverage)
- Quality gates dans CI/CD
- Code review obligatoire
- Documentation à jour

### DevOps

- Infrastructure as Code (Docker Compose)
- CI/CD automatisé
- Monitoring avec Prometheus/Grafana
- Déploiement automatisé

---

**Document Version:** 1.0  
**Dernière Mise à Jour:** [Date actuelle]  
**Auteur:** Evrard Noumbi  
**Contact:** [GitHub](https://github.com/Evrard-Noumbi-3il)  
**Niveau:** Bac+4 Ingénieur

---

## 📌 Notes Importantes

### Modifications du Code

> ⚠️ **IMPORTANT**: Ce document contient l'architecture et les principes du projet. Le code réel peut avoir subi des modifications suite à des corrections de bugs ou des améliorations. Toujours se référer au code source dans le repository pour la version à jour de l'implémentation.

### Évolution du Projet

Le projet suit une approche **MVP First** (Minimum Viable Product):
1. D'abord créer un MVP solide et fonctionnel
2. Ensuite ajouter des fonctionnalités avancées si nécessaire
3. Ne jamais ajouter de complexité avant d'avoir un MVP qui fonctionne

### Contexte Actuel

**État d'avancement:** API Gateway + Security Audit Service

**Services complétés:**
- ✅ Auth Service
- ✅ Account Service
- ✅ Payment Service
- ✅ Notification Service

**En cours:**
- 🔄 API Gateway (Spring Cloud Gateway)
- 🔄 Security Audit Service (Python FastAPI)

**À venir:**
- ⏳ Frontend (React)
- ⏳ Infrastructure complète (Docker Compose)
- ⏳ CI/CD Pipeline
- ⏳ Documentation finale

---