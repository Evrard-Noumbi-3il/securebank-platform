# Security Audit Service

Service d'audit de sécurité automatisé pour la plateforme SecureBank.

## 🎯 Fonctionnalités

### Scans Automatisés

✅ **Dependency Scanning (OWASP)**
- Scan des dépendances Maven (Java)
- Scan des dépendances npm (JavaScript)
- Détection des CVE connus
- Score CVSS pour chaque vulnérabilité

✅ **Code Scanning (Bandit)**
- Analyse statique du code Python
- Détection de patterns dangereux
- Hardcoded secrets
- Injections SQL potentielles

✅ **Docker Image Scanning (Trivy)**
- Scan des vulnérabilités OS
- Scan des packages système
- Scan multi-layers
- Support de tous les formats d'images

### Reporting

✅ **Score de Sécurité /100**
- Calcul automatique basé sur les vulnérabilités
- Grade de A à F
- Pondération par sévérité

✅ **Recommandations Automatiques**
- Basées sur le score et les vulnérabilités
- Actions prioritaires
- Corrections suggérées

## 🚀 Installation

### Prérequis

- Python 3.11+
- Docker (pour Trivy)
- Trivy installé

### Installation Locale

```bash
cd services/security-audit-service

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Installer Trivy (Linux)
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Lancer le service
uvicorn src.main:app --reload --port 8085
```

### Avec Docker

```bash
# Build
docker build -t securebank/security-audit:latest .

# Run
docker run -p 8085:8085 \
  -v $(pwd)/../../services:/app/services:ro \
  securebank/security-audit:latest
```

## 📖 Utilisation

### 1. Lancer un Scan

```bash
# Scan complet (tous les types)
curl -X POST http://localhost:8085/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "scan_type": "all"
  }'

# Scan de dépendances uniquement
curl -X POST http://localhost:8085/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "scan_type": "dependency"
  }'

# Scan d'une image Docker spécifique
curl -X POST http://localhost:8085/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "scan_type": "docker",
    "target": "auth-service:latest"
  }'
```

**Réponse:**
```json
{
  "scan_id": "123e4567-e89b-12d3-a456-426614174000",
  "scan_type": "all",
  "status": "running",
  "started_at": "2024-12-14T10:30:00Z",
  "message": "Scan all lancé avec succès"
}
```

### 2. Vérifier le Statut du Scan

```bash
curl http://localhost:8085/api/scan/{scan_id}
```

**Réponse (en cours):**
```json
{
  "scan_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "running",
  "scan_type": "all"
}
```

**Réponse (terminé):**
```json
{
  "scan_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "scan_type": "all",
  "results": [...],
  "report_id": "abc-123-def-456"
}
```

### 3. Consulter les Rapports

```bash
# Lister tous les rapports
curl http://localhost:8085/api/reports

# Obtenir un rapport détaillé
curl http://localhost:8085/api/reports/{report_id}
```

**Réponse:**
```json
{
  "id": "abc-123-def-456",
  "score": {
    "score": 75,
    "grade": "C",
    "critical_issues": 0,
    "high_issues": 2,
    "medium_issues": 5,
    "low_issues": 10
  },
  "scan_results": [...],
  "summary": "Scan de sécurité effectué sur 3 composant(s)...",
  "recommendations": [
    "⚠️ 2 vulnérabilité(s) HAUTE(s) détectée(s)...",
    "📋 5 vulnérabilités moyennes détectées..."
  ],
  "total_vulnerabilities": 17,
  "created_at": "2024-12-14T10:35:00Z"
}
```

## 📊 API Documentation

### Swagger UI

Accéder à la documentation interactive:

```
http://localhost:8085/docs
```

### ReDoc

Documentation alternative:

```
http://localhost:8085/redoc
```

## 🔧 Configuration

### Variables d'Environnement

```bash
# Port du service
PORT=8085

# Niveau de log
LOG_LEVEL=info

# Python
PYTHONUNBUFFERED=1
```

## 🧪 Tests

```bash
# Tests unitaires
pytest tests/

# Tests avec coverage
pytest --cov=src tests/

# Voir le rapport
coverage html
open htmlcov/index.html
```

## 📈 Calcul du Score de Sécurité

### Pondération

- **CRITICAL**: -10 points par vulnérabilité
- **HIGH**: -5 points
- **MEDIUM**: -2 points
- **LOW**: -1 point
- **INFO**: 0 point

### Grades

- **A**: 90-100 (Excellent)
- **B**: 80-89 (Bon)
- **C**: 70-79 (Moyen)
- **D**: 60-69 (Faible)
- **F**: 0-59 (Très faible)

## 🔍 Types de Scans

### 1. Dependency Scan

Vérifie les vulnérabilités dans:
- Dépendances Maven (pom.xml)
- Dépendances npm (package.json)
- CVE connus
- Packages obsolètes

### 2. Code Scan

Analyse le code pour:
- Hardcoded secrets
- Injections SQL
- Commandes OS dangereuses
- Désérialisation non sûre

### 3. Docker Scan

Scanne les images pour:
- Vulnérabilités OS
- Packages système obsolètes
- Configuration non sécurisée
- Secrets dans les layers

## 🛠️ Troubleshooting

### Erreur: Trivy non trouvé

```bash
# Installer Trivy
wget https://github.com/aquasecurity/trivy/releases/download/v0.48.0/trivy_0.48.0_Linux-64bit.tar.gz
tar zxvf trivy_0.48.0_Linux-64bit.tar.gz
sudo mv trivy /usr/local/bin/
```

### Erreur: Scan timeout

Augmenter le timeout dans le code:
```python
timeout=300  # 5 minutes
```

## 👨‍💻 Auteur

Evrard Noumbi - SecureBank Platform