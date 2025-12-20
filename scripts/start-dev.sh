#!/bin/bash

# SecureBank Platform - Development Start Script
# This script starts all infrastructure services and provides helpful information

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SecureBank Platform - Dev Setup     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file. Please review and update if needed.${NC}"
fi

# Start infrastructure services
echo -e "${BLUE}🚀 Starting infrastructure services...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check PostgreSQL
echo -e "${BLUE}🔍 Checking PostgreSQL...${NC}"
if docker exec securebank-postgres-auth-dev pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL Auth DB is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL Auth DB is not ready${NC}"
fi

if docker exec securebank-postgres-business-dev pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL Business DB is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL Business DB is not ready${NC}"
fi

# Check Redis
echo -e "${BLUE}🔍 Checking Redis...${NC}"
if docker exec securebank-redis-dev redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is ready${NC}"
else
    echo -e "${RED}❌ Redis is not ready${NC}"
fi

# Check Kafka
echo -e "${BLUE}🔍 Checking Kafka...${NC}"
sleep 5  # Kafka takes longer to start
if docker exec securebank-kafka-dev kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Kafka is ready${NC}"
else
    echo -e "${YELLOW}⚠️  Kafka might need more time to start${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Infrastructure Services Ready! 🎉   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Display access information
echo -e "${BLUE}📊 Access Information:${NC}"
echo ""
echo -e "${GREEN}Databases:${NC}"
echo -e "  • PostgreSQL Auth:     ${YELLOW}localhost:5432${NC}"
echo -e "  • PostgreSQL Business: ${YELLOW}localhost:5433${NC}"
echo -e "  • pgAdmin:             ${YELLOW}http://localhost:5050${NC} (admin@securebank.com / admin)"
echo ""
echo -e "${GREEN}Caching & Messaging:${NC}"
echo -e "  • Redis:               ${YELLOW}localhost:6379${NC}"
echo -e "  • Redis Commander:     ${YELLOW}http://localhost:8081${NC}"
echo -e "  • Kafka:               ${YELLOW}localhost:9092${NC}"
echo -e "  • Kafka UI:            ${YELLOW}http://localhost:8090${NC}"
echo ""
echo -e "${GREEN}Development Tools:${NC}"
echo -e "  • MailDev (SMTP):      ${YELLOW}http://localhost:1080${NC}"
echo ""

# Next steps
echo -e "${BLUE}🔧 Next Steps:${NC}"
echo ""
echo "1. Start Auth Service:"
echo -e "   ${YELLOW}cd services/auth-service && mvn spring-boot:run${NC}"
echo ""
echo "2. Start Account Service:"
echo -e "   ${YELLOW}cd services/account-service && mvn spring-boot:run${NC}"
echo ""
echo "3. Start Payment Service:"
echo -e "   ${YELLOW}cd services/payment-service && mvn spring-boot:run${NC}"
echo ""
echo "4. Start Notification Service:"
echo -e "   ${YELLOW}cd services/notification-service && mvn spring-boot:run${NC}"
echo ""
echo "5. Start API Gateway:"
echo -e "   ${YELLOW}cd services/api-gateway && mvn spring-boot:run${NC}"
echo ""
echo "6. Access Swagger UI:"
echo -e "   ${YELLOW}http://localhost:8081/swagger-ui.html${NC}"
echo ""

# Logs command
echo -e "${BLUE}📋 View Logs:${NC}"
echo -e "   ${YELLOW}docker-compose -f docker-compose.dev.yml logs -f${NC}"
echo ""

# Stop command
echo -e "${BLUE}🛑 Stop All Services:${NC}"
echo -e "   ${YELLOW}docker-compose -f docker-compose.dev.yml down${NC}"
echo ""

echo -e "${GREEN}Happy Coding! 🚀${NC}"