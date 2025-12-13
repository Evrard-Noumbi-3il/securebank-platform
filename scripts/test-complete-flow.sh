#!/bin/bash

# Script de test complet du flow SecureBank Platform
# Ce script teste le flux complet : Auth → Account → Transaction → Notification

set -e # Arrêter en cas d'erreur

echo "🚀 SecureBank Platform - Test Complet"
echo "======================================"
echo ""

# Variables
BASE_URL_AUTH="http://localhost:8081/api"
BASE_URL_ACCOUNT="http://localhost:8082/api"
BASE_URL_PAYMENT="http://localhost:8083/api"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# ==================== ÉTAPE 1 : AUTH ====================
echo "📝 ÉTAPE 1 : Création d'un utilisateur"
echo "--------------------------------------"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL_AUTH/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.test@example.com",
    "password": "SecurePassword123!",
    "firstName": "Alice",
    "lastName": "Test"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id')
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')

if [ "$USER_ID" != "null" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    print_success "Utilisateur créé : ID=$USER_ID"
else
    print_error "Échec de création d'utilisateur"
    exit 1
fi

echo ""

# ==================== ÉTAPE 2 : ACCOUNTS ====================
echo "🏦 ÉTAPE 2 : Création de comptes bancaires"
echo "-------------------------------------------"

# Créer compte 1 (Checking)
print_info "Création compte CHECKING..."
ACCOUNT1_RESPONSE=$(curl -s -X POST "$BASE_URL_ACCOUNT/accounts" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  -d '{
    "accountType": "CHECKING",
    "currency": "EUR"
  }')

echo "$ACCOUNT1_RESPONSE" | jq '.'

ACCOUNT1_ID=$(echo "$ACCOUNT1_RESPONSE" | jq -r '.id')
ACCOUNT1_NUMBER=$(echo "$ACCOUNT1_RESPONSE" | jq -r '.accountNumber')

if [ "$ACCOUNT1_ID" != "null" ]; then
    print_success "Compte 1 créé : $ACCOUNT1_NUMBER"
else
    print_error "Échec de création du compte 1"
    exit 1
fi

echo ""

# Créer compte 2 (Savings)
print_info "Création compte SAVINGS..."
ACCOUNT2_RESPONSE=$(curl -s -X POST "$BASE_URL_ACCOUNT/accounts" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  -d '{
    "accountType": "SAVINGS",
    "currency": "EUR"
  }')

echo "$ACCOUNT2_RESPONSE" | jq '.'

ACCOUNT2_ID=$(echo "$ACCOUNT2_RESPONSE" | jq -r '.id')
ACCOUNT2_NUMBER=$(echo "$ACCOUNT2_RESPONSE" | jq -r '.accountNumber')

if [ "$ACCOUNT2_ID" != "null" ]; then
    print_success "Compte 2 créé : $ACCOUNT2_NUMBER"
else
    print_error "Échec de création du compte 2"
    exit 1
fi

echo ""

# Consulter les comptes
print_info "Consultation des comptes..."
ACCOUNTS_RESPONSE=$(curl -s -X GET "$BASE_URL_ACCOUNT/accounts" \
  -H "X-User-Id: $USER_ID")

echo "$ACCOUNTS_RESPONSE" | jq '.'

ACCOUNTS_COUNT=$(echo "$ACCOUNTS_RESPONSE" | jq 'length')
print_success "$ACCOUNTS_COUNT comptes trouvés"

echo ""

# ==================== ÉTAPE 3 : AJOUT DE SOLDE ====================
echo "💰 ÉTAPE 3 : Ajout de solde (manuel - via DB)"
echo "-----------------------------------------------"
print_info "Pour tester le virement, il faut ajouter du solde au compte 1"
print_info "Commande SQL à exécuter :"
echo ""
echo "docker exec -it postgres-business psql -U postgres -d business_db -c \"UPDATE accounts SET balance = 1000.00 WHERE id = $ACCOUNT1_ID;\""
echo ""
read -p "Appuyez sur Entrée après avoir ajouté le solde..."

echo ""

# ==================== ÉTAPE 4 : VIREMENT ====================
echo "💸 ÉTAPE 4 : Virement entre comptes"
echo "------------------------------------"

print_info "Virement de 100 EUR du compte $ACCOUNT1_ID vers $ACCOUNT2_ID..."

# 1. Définir le nom du fichier temporaire (sûr)
TEMP_JSON_FILE=$(mktemp)

# 2. Remplir le fichier temporaire avec le JSON propre (printf + redirection)
# On utilise printf pour insérer les variables et on écrit le résultat dans le fichier temporaire.
printf '{
  "fromAccountId": %s,
  "toAccountId": %s,
  "amount": 100.00,
  "description": "Test de virement automatisé"
}' "$ACCOUNT1_ID" "$ACCOUNT2_ID" > "$TEMP_JSON_FILE"

# 3. Exécuter la requête curl en lisant le contenu du fichier (-d @file)
TRANSFER_RESPONSE=$(curl -s -X POST "$BASE_URL_ACCOUNT/transactions/transfer" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  --data-binary "@$TEMP_JSON_FILE") # Utilisation de --data-binary pour lire le fichier

# 4. Supprimer le fichier temporaire immédiatement après usage
rm "$TEMP_JSON_FILE"

echo "$TRANSFER_RESPONSE" | jq '.'

TRANSACTION_ID=$(echo "$TRANSFER_RESPONSE" | jq -r '.id')
TRANSACTION_STATUS=$(echo "$TRANSFER_RESPONSE" | jq -r '.status')

if [ "$TRANSACTION_STATUS" == "COMPLETED" ]; then
    print_success "Virement réussi : Transaction #$TRANSACTION_ID"
else
    print_error "Échec du virement : Status=$TRANSACTION_STATUS"
    exit 1
fi

echo ""

# ==================== ÉTAPE 5 : VÉRIFICATION ====================
echo "🔍 ÉTAPE 5 : Vérification des soldes"
echo "-------------------------------------"

# Vérifier compte 1
print_info "Solde compte 1..."
BALANCE1=$(curl -s -X GET "$BASE_URL_ACCOUNT/accounts/$ACCOUNT1_ID/balance" \
  -H "X-User-Id: $USER_ID")
print_success "Compte 1 : $BALANCE1 EUR (attendu : 900.00)"

# Vérifier compte 2
print_info "Solde compte 2..."
BALANCE2=$(curl -s -X GET "$BASE_URL_ACCOUNT/accounts/$ACCOUNT2_ID/balance" \
  -H "X-User-Id: $USER_ID")
print_success "Compte 2 : $BALANCE2 EUR (attendu : 100.00)"

echo ""

# ==================== ÉTAPE 6 : HISTORIQUE ====================
echo "📜 ÉTAPE 6 : Consultation historique transactions"
echo "--------------------------------------------------"

HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL_ACCOUNT/transactions/account/$ACCOUNT1_ID" \
  -H "X-User-Id: $USER_ID")

echo "$HISTORY_RESPONSE" | jq '.'

HISTORY_COUNT=$(echo "$HISTORY_RESPONSE" | jq 'length')
print_success "$HISTORY_COUNT transactions dans l'historique"

echo ""

# ==================== ÉTAPE 7 : NOTIFICATION ====================
echo "📧 ÉTAPE 7 : Vérification des notifications"
echo "--------------------------------------------"

print_info "Vérifier les logs du Notification Service :"
echo "docker-compose logs notification-service | grep -A 10 \"transaction event\""

echo ""

# ==================== RÉSUMÉ ====================
echo "✅ TEST COMPLET TERMINÉ"
echo "======================="
echo ""
echo "📊 Résumé :"
echo "  - Utilisateur créé : $USER_ID"
echo "  - Compte 1 : $ACCOUNT1_NUMBER (ID: $ACCOUNT1_ID)"
echo "  - Compte 2 : $ACCOUNT2_NUMBER (ID: $ACCOUNT2_ID)"
echo "  - Transaction : #$TRANSACTION_ID ($TRANSACTION_STATUS)"
echo "  - Solde compte 1 : $BALANCE1 EUR"
echo "  - Solde compte 2 : $BALANCE2 EUR"
echo ""
print_success "Tous les tests sont passés ! 🎉"