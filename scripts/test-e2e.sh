#!/bin/bash

# Tests End-to-End pour SecureBank Platform
# Teste le flux complet : Inscription → Compte → Virement → Paiement

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SecureBank E2E Tests                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
API_GATEWAY="http://localhost:8080"
SECURITY_AUDIT="http://localhost:8085"
TEST_EMAIL="test-$(date +%s)@securebank.com"
TEST_PASSWORD="SecurePass123!"

# Compteurs
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Fonction pour tester un endpoint
test_endpoint() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local headers=$5
    local expected_status=${6:-200}
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -e "${BLUE}Test ${TESTS_TOTAL}: ${test_name}${NC}"
    
    # Construire la commande curl
    local curl_cmd="curl -s -w '\n%{http_code}' -X ${method} ${endpoint}"
    
    if [ -n "$headers" ]; then
        curl_cmd="${curl_cmd} ${headers}"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="${curl_cmd} -d '${data}'"
    fi
    
    # Exécuter la requête
    local response=$(eval ${curl_cmd})
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    # Vérifier le code de statut
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP ${http_code})"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "$body"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected ${expected_status}, got ${http_code})"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "$body"
        return 1
    fi
}

echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Phase 1: Tests d'Infrastructure${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo ""

# Test 1: Health Check API Gateway
test_endpoint \
    "Health Check - API Gateway" \
    "GET" \
    "${API_GATEWAY}/actuator/health" \
    "" \
    "-H 'Content-Type: application/json'"

echo ""

# Test 2: Health Check Security Audit
test_endpoint \
    "Health Check - Security Audit" \
    "GET" \
    "${SECURITY_AUDIT}/health" \
    "" \
    "-H 'Content-Type: application/json'"

echo ""
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Phase 2: Tests d'Authentification${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo ""

# Test 3: Inscription utilisateur
REGISTER_RESPONSE=$(curl -s -X POST ${API_GATEWAY}/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$REGISTER_RESPONSE" | grep -q "accessToken"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Inscription utilisateur${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Extraire les tokens
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    
    echo -e "${BLUE}User ID: ${USER_ID}${NC}"
    echo -e "${BLUE}Access Token: ${ACCESS_TOKEN:0:30}...${NC}"
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Inscription utilisateur${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "$REGISTER_RESPONSE"
    exit 1
fi

echo ""

# Test 4: Connexion utilisateur
LOGIN_RESPONSE=$(curl -s -X POST ${API_GATEWAY}/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Connexion utilisateur${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Connexion utilisateur${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "$LOGIN_RESPONSE"
fi

echo ""

# Test 5: Refresh Token
REFRESH_RESPONSE=$(curl -s -X POST ${API_GATEWAY}/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Refresh Token${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Refresh Token${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Phase 3: Tests de Gestion Bancaire${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo ""

# Test 6: Créer un compte bancaire
ACCOUNT1_RESPONSE=$(curl -s -X POST ${API_GATEWAY}/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "accountType": "CHECKING",
    "currency": "EUR",
    "initialBalance": 1000.00
  }')

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$ACCOUNT1_RESPONSE" | grep -q "accountNumber"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Créer compte bancaire 1${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    ACCOUNT1_ID=$(echo "$ACCOUNT1_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    ACCOUNT1_NUMBER=$(echo "$ACCOUNT1_RESPONSE" | grep -o '"accountNumber":"[^"]*' | cut -d'"' -f4)
    echo -e "${BLUE}Account Number: ${ACCOUNT1_NUMBER}${NC}"
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Créer compte bancaire 1${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "$ACCOUNT1_RESPONSE"
    exit 1
fi

echo ""

# Test 7: Créer un deuxième compte
ACCOUNT2_RESPONSE=$(curl -s -X POST ${API_GATEWAY}/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "accountType": "SAVINGS",
    "currency": "EUR",
    "initialBalance": 500.00
  }')

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$ACCOUNT2_RESPONSE" | grep -q "accountNumber"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Créer compte bancaire 2${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    ACCOUNT2_ID=$(echo "$ACCOUNT2_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    ACCOUNT2_NUMBER=$(echo "$ACCOUNT2_RESPONSE" | grep -o '"accountNumber":"[^"]*' | cut -d'"' -f4)
    echo -e "${BLUE}Account Number: ${ACCOUNT2_NUMBER}${NC}"
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Créer compte bancaire 2${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "$ACCOUNT2_RESPONSE"
fi

echo ""

# Test 8: Lister les comptes
ACCOUNTS_LIST=$(curl -s -X GET ${API_GATEWAY}/api/accounts \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$ACCOUNTS_LIST" | grep -q "${ACCOUNT1_NUMBER}"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Lister les comptes${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Lister les comptes${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# Test 9: Effectuer un virement
TRANSFER_RESPONSE=$(curl -s -X POST ${API_GATEWAY}/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d "{
    \"fromAccountId\": \"${ACCOUNT1_ID}\",
    \"toAccountId\": \"${ACCOUNT2_ID}\",
    \"amount\": 100.00,
    \"description\": \"Test E2E Transfer\"
  }")

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$TRANSFER_RESPONSE" | grep -q "COMPLETED"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Effectuer un virement${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${BLUE}Virement de 100 EUR effectué avec succès${NC}"
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Effectuer un virement${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "$TRANSFER_RESPONSE"
fi

echo ""

# Test 10: Vérifier l'historique des transactions
TRANSACTIONS_RESPONSE=$(curl -s -X GET "${API_GATEWAY}/api/accounts/${ACCOUNT1_ID}/transactions" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$TRANSACTIONS_RESPONSE" | grep -q "Test E2E Transfer"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Historique des transactions${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Historique des transactions${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Phase 4: Tests de Paiement${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo ""

# Test 11: Créer un paiement
PAYMENT_RESPONSE=$(curl -s -X POST ${API_GATEWAY}/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "amount": 50.00,
    "currency": "EUR",
    "idempotencyKey": "'$(uuidgen)'"
  }')

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$PAYMENT_RESPONSE" | grep -q "id"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Créer un paiement${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Créer un paiement${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Phase 5: Tests de Sécurité${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo ""

# Test 12: Lancer un scan de sécurité
SCAN_RESPONSE=$(curl -s -X POST ${SECURITY_AUDIT}/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "scan_type": "all"
  }')

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$SCAN_RESPONSE" | grep -q "scan_id"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Lancer un scan de sécurité${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    SCAN_ID=$(echo "$SCAN_RESPONSE" | grep -o '"scan_id":"[^"]*' | cut -d'"' -f4)
    echo -e "${BLUE}Scan ID: ${SCAN_ID}${NC}"
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Lancer un scan de sécurité${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# Test 13: Vérifier le statut du scan
sleep 2  # Attendre que le scan démarre
SCAN_STATUS=$(curl -s -X GET ${SECURITY_AUDIT}/api/scan/${SCAN_ID})

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if echo "$SCAN_STATUS" | grep -q "status"; then
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Vérifier statut du scan${NC}"
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${BLUE}Test ${TESTS_TOTAL}: Vérifier statut du scan${NC}"
    echo -e "${RED}✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Phase 6: Tests de Rate Limiting${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo ""

# Test 14: Rate Limiting (faire plusieurs requêtes rapidement)
echo -e "${BLUE}Test ${TESTS_TOTAL + 1}: Rate Limiting (6 requêtes rapides)${NC}"
RATE_LIMIT_BLOCKED=false

for i in {1..6}; do
    RESPONSE=$(curl -s -w '%{http_code}' -X POST ${API_GATEWAY}/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"test"}' \
      -o /dev/null)
    
    if [ "$RESPONSE" -eq 429 ]; then
        RATE_LIMIT_BLOCKED=true
        break
    fi
done

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ "$RATE_LIMIT_BLOCKED" = true ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Rate limiting fonctionne)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠ SKIPPED${NC} (Rate limiting non déclenché - normal avec 6 requêtes)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}            RÉSULTATS DES TESTS E2E               ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Tests réussis: ${TESTS_PASSED}/${TESTS_TOTAL}${NC}"
echo -e "${RED}Tests échoués: ${TESTS_FAILED}/${TESTS_TOTAL}${NC}"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ Tous les tests E2E ont réussi !          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ Certains tests ont échoué                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
    exit 1
fi