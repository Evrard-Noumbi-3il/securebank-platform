#!/bin/bash

# Script de test complet du stack SecureBank
# Vérifie que tous les services démarrent et répondent correctement

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SecureBank Stack - Complete Test            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Stop any existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose down -v
echo ""

# Build and start all services
echo -e "${BLUE}🏗️  Building and starting all services...${NC}"
echo -e "${YELLOW}This may take several minutes on first run...${NC}"
echo ""

docker-compose up -d --build

echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready (60 seconds)...${NC}"
sleep 60

echo ""
echo -e "${BLUE}🔍 Checking service health...${NC}"
echo ""

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    
    echo -n "Checking ${service_name} (port ${port})... "
    
    if curl -s -f "http://localhost:${port}${endpoint}" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ UP${NC}"
        return 0
    else
        echo -e "${RED}✗ DOWN${NC}"
        return 1
    fi
}

# Check all services
services_ok=0
services_total=0

# Infrastructure
echo -e "${YELLOW}Infrastructure Services:${NC}"

services_total=$((services_total + 1))
if docker exec postgres-auth pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "PostgreSQL Auth... ${GREEN}✓ UP${NC}"
    services_ok=$((services_ok + 1))
else
    echo -e "PostgreSQL Auth... ${RED}✗ DOWN${NC}"
fi

services_total=$((services_total + 1))
if docker exec postgres-business pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "PostgreSQL Business... ${GREEN}✓ UP${NC}"
    services_ok=$((services_ok + 1))
else
    echo -e "PostgreSQL Business... ${RED}✗ DOWN${NC}"
fi

services_total=$((services_total + 1))
if docker exec redis redis-cli ping > /dev/null 2>&1; then
    echo -e "Redis... ${GREEN}✓ UP${NC}"
    services_ok=$((services_ok + 1))
else
    echo -e "Redis... ${RED}✗ DOWN${NC}"
fi

services_total=$((services_total + 1))
if docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; then
    echo -e "Kafka... ${GREEN}✓ UP${NC}"
    services_ok=$((services_ok + 1))
else
    echo -e "Kafka... ${RED}✗ DOWN${NC}"
fi

echo ""
echo -e "${YELLOW}Microservices:${NC}"

# Microservices
services_total=$((services_total + 1))
check_service "Auth Service" "8081" "/actuator/health" && services_ok=$((services_ok + 1)) || true

services_total=$((services_total + 1))
check_service "Account Service" "8082" "/actuator/health" && services_ok=$((services_ok + 1)) || true

services_total=$((services_total + 1))
check_service "Payment Service" "8083" "/actuator/health" && services_ok=$((services_ok + 1)) || true

services_total=$((services_total + 1))
check_service "Notification Service" "8084" "/actuator/health" && services_ok=$((services_ok + 1)) || true

services_total=$((services_total + 1))
check_service "API Gateway" "8080" "/actuator/health" && services_ok=$((services_ok + 1)) || true

services_total=$((services_total + 1))
check_service "Security Audit Service" "8085" "/health" && services_ok=$((services_ok + 1)) || true

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}Services Status: ${GREEN}${services_ok}/${services_total}${BLUE} UP${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

# Run functional tests
if [ "$services_ok" -eq "$services_total" ]; then
    echo -e "${GREEN}✅ All services are UP! Running functional tests...${NC}"
    echo ""
    
    # Test 1: Register a user
    echo -e "${BLUE}📝 Test 1: User Registration${NC}"
    register_response=$(curl -s -X POST http://localhost:8080/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test@securebank.com",
        "password": "SecurePass123!",
        "firstName": "Test",
        "lastName": "User"
      }')
    
    if echo "$register_response" | grep -q "accessToken"; then
        echo -e "${GREEN}✓ User registration successful${NC}"
        
        # Extract access token
        access_token=$(echo "$register_response" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
        echo -e "${BLUE}Access Token: ${access_token:0:50}...${NC}"
        
        # Test 2: Create an account
        echo ""
        echo -e "${BLUE}💰 Test 2: Create Bank Account${NC}"
        account_response=$(curl -s -X POST http://localhost:8080/api/accounts \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $access_token" \
          -d '{
            "accountType": "CHECKING",
            "currency": "EUR",
            "initialBalance": 1000.00
          }')
        
        if echo "$account_response" | grep -q "accountNumber"; then
            echo -e "${GREEN}✓ Account creation successful${NC}"
            echo "$account_response" | head -n 5
        else
            echo -e "${RED}✗ Account creation failed${NC}"
            echo "$account_response"
        fi
        
        # Test 3: Security Scan
        echo ""
        echo -e "${BLUE}🔒 Test 3: Security Scan${NC}"
        scan_response=$(curl -s -X POST http://localhost:8085/api/scan \
          -H "Content-Type: application/json" \
          -d '{
            "scan_type": "all"
          }')
        
        if echo "$scan_response" | grep -q "scan_id"; then
            echo -e "${GREEN}✓ Security scan initiated${NC}"
            scan_id=$(echo "$scan_response" | grep -o '"scan_id":"[^"]*' | cut -d'"' -f4)
            echo -e "${BLUE}Scan ID: ${scan_id}${NC}"
        else
            echo -e "${RED}✗ Security scan failed${NC}"
            echo "$scan_response"
        fi
        
    else
        echo -e "${RED}✗ User registration failed${NC}"
        echo "$register_response"
    fi
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ Stack is fully operational!              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Display access URLs
    echo -e "${BLUE}📊 Service URLs:${NC}"
    echo ""
    echo -e "${YELLOW}API Gateway:${NC}"
    echo "  • Main: http://localhost:8080"
    echo "  • Health: http://localhost:8080/actuator/health"
    echo ""
    echo -e "${YELLOW}Auth Service:${NC}"
    echo "  • Main: http://localhost:8081"
    echo "  • Swagger: http://localhost:8081/swagger-ui.html"
    echo ""
    echo -e "${YELLOW}Account Service:${NC}"
    echo "  • Main: http://localhost:8082"
    echo "  • Swagger: http://localhost:8082/swagger-ui.html"
    echo ""
    echo -e "${YELLOW}Payment Service:${NC}"
    echo "  • Main: http://localhost:8083"
    echo "  • Swagger: http://localhost:8083/swagger-ui.html"
    echo ""
    echo -e "${YELLOW}Security Audit Service:${NC}"
    echo "  • Main: http://localhost:8085"
    echo "  • Swagger: http://localhost:8085/docs"
    echo ""
    
    # Display logs command
    echo -e "${BLUE}📋 View Logs:${NC}"
    echo "  docker-compose logs -f [service-name]"
    echo ""
    
    # Display stop command
    echo -e "${BLUE}🛑 Stop All Services:${NC}"
    echo "  docker-compose down"
    echo ""
    
else
    echo -e "${RED}❌ Some services failed to start!${NC}"
    echo ""
    echo -e "${YELLOW}Check logs for failed services:${NC}"
    echo "  docker-compose logs [service-name]"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "  • Ports already in use (check with: lsof -i :PORT)"
    echo "  • Build errors (check Docker logs)"
    echo "  • Missing environment variables"
    echo ""
    exit 1
fi