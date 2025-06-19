#!/bin/bash

# GHL Multi-Tenant Agent Deployment Script
set -e

echo "🚀 Starting GHL Multi-Tenant Agent Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Function to deploy development environment
deploy_dev() {
    echo "📦 Building and starting development environment..."
    
    # Stop any existing containers
    docker-compose down
    
    # Build and start services
    docker-compose up --build -d
    
    echo "✅ Development environment is running!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔌 Backend: http://localhost:3001"
    echo "📊 Health check: http://localhost:3001/health"
}

# Function to deploy production environment
deploy_prod() {
    echo "🏭 Building and starting production environment..."
    
    # Stop any existing containers
    docker-compose -f deploy/docker-compose.prod.yml down
    
    # Build and start services
    docker-compose -f deploy/docker-compose.prod.yml up --build -d
    
    echo "✅ Production environment is running!"
    echo "🌐 Frontend: http://localhost"
    echo "🔌 Backend: http://localhost:3001"
    echo "📊 Health check: http://localhost:3001/health"
}

# Function to show logs
show_logs() {
    if [ "$1" = "prod" ]; then
        docker-compose -f deploy/docker-compose.prod.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Function to stop services
stop_services() {
    if [ "$1" = "prod" ]; then
        docker-compose -f deploy/docker-compose.prod.yml down
    else
        docker-compose down
    fi
    echo "✅ Services stopped"
}

# Parse command line arguments
case "$1" in
    "dev")
        deploy_dev
        ;;
    "prod")
        deploy_prod
        ;;
    "logs")
        show_logs $2
        ;;
    "stop")
        stop_services $2
        ;;
    "restart")
        stop_services $2
        if [ "$2" = "prod" ]; then
            deploy_prod
        else
            deploy_dev
        fi
        ;;
    *)
        echo "Usage: $0 {dev|prod|logs [dev|prod]|stop [dev|prod]|restart [dev|prod]}"
        echo ""
        echo "Commands:"
        echo "  dev      - Deploy development environment"
        echo "  prod     - Deploy production environment"
        echo "  logs     - Show logs (specify 'prod' for production logs)"
        echo "  stop     - Stop services (specify 'prod' for production)"
        echo "  restart  - Restart services (specify 'prod' for production)"
        echo ""
        echo "Examples:"
        echo "  $0 dev           # Start development environment"
        echo "  $0 prod          # Start production environment"
        echo "  $0 logs          # Show development logs"
        echo "  $0 logs prod     # Show production logs"
        echo "  $0 stop          # Stop development environment"
        echo "  $0 stop prod     # Stop production environment"
        exit 1
        ;;
esac 