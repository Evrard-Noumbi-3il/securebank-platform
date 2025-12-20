# --- Stage 1: Build ---
FROM python:3.11-slim AS builder

WORKDIR /app

# Dépendances nécessaires pour compiler certains packages Python
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: Runtime ---
FROM python:3.11-slim

WORKDIR /app

# Installation des outils de base ET des dépendances pour Trivy
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# INSTALLATION MODERNE DE TRIVY (Sans apt-key)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    lsb-release \
    && wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor -o /usr/share/keyrings/trivy.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb bookworm main" | tee /etc/apt/sources.list.d/trivy.list \
    && apt-get update && apt-get install -y trivy \
    && rm -rf /var/lib/apt/lists/*

# Récupération des packages installés dans le builder
COPY --from=builder /install /usr/local

# Copie du code source
COPY src/ .

RUN ls -la /app
#RUN touch ./src/__init__.py

ENV PYTHONPATH=/app

# Sécurité : Utilisateur non-root
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser


EXPOSE 8085

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8085/health || exit 1

# Modifiez la ligne CMD finale dans services/security-audit-service/Dockerfile
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8085"]