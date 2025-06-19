# GHL Multi-Tenant Agent Deployment Script for Windows
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "prod", "logs", "stop", "restart")]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod")]
    [string]$Environment = "dev"
)

Write-Host "🚀 Starting GHL Multi-Tenant Agent Deployment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
try {
    docker-compose version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available. Please install it and try again." -ForegroundColor Red
    exit 1
}

function Deploy-Dev {
    Write-Host "📦 Building and starting development environment..." -ForegroundColor Yellow
    
    # Stop any existing containers
    docker-compose down
    
    # Build and start services
    docker-compose up --build -d
    
    Write-Host "✅ Development environment is running!" -ForegroundColor Green
    Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🔌 Backend: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "📊 Health check: http://localhost:3001/health" -ForegroundColor Cyan
}

function Deploy-Prod {
    Write-Host "🏭 Building and starting production environment..." -ForegroundColor Yellow
    
    # Stop any existing containers
    docker-compose -f deploy/docker-compose.prod.yml down
    
    # Build and start services
    docker-compose -f deploy/docker-compose.prod.yml up --build -d
    
    Write-Host "✅ Production environment is running!" -ForegroundColor Green
    Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
    Write-Host "🔌 Backend: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "📊 Health check: http://localhost:3001/health" -ForegroundColor Cyan
}

function Show-Logs {
    param([string]$Env)
    
    if ($Env -eq "prod") {
        docker-compose -f deploy/docker-compose.prod.yml logs -f
    } else {
        docker-compose logs -f
    }
}

function Stop-Services {
    param([string]$Env)
    
    if ($Env -eq "prod") {
        docker-compose -f deploy/docker-compose.prod.yml down
    } else {
        docker-compose down
    }
    Write-Host "✅ Services stopped" -ForegroundColor Green
}

# Execute based on command
switch ($Command) {
    "dev" {
        Deploy-Dev
    }
    "prod" {
        Deploy-Prod
    }
    "logs" {
        Show-Logs -Env $Environment
    }
    "stop" {
        Stop-Services -Env $Environment
    }
    "restart" {
        Stop-Services -Env $Environment
        if ($Environment -eq "prod") {
            Deploy-Prod
        } else {
            Deploy-Dev
        }
    }
    default {
        Write-Host "Usage: deploy.ps1 -Command {dev|prod|logs|stop|restart} [-Environment {dev|prod}]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor White
        Write-Host "  dev      - Deploy development environment" -ForegroundColor Gray
        Write-Host "  prod     - Deploy production environment" -ForegroundColor Gray
        Write-Host "  logs     - Show logs" -ForegroundColor Gray
        Write-Host "  stop     - Stop services" -ForegroundColor Gray
        Write-Host "  restart  - Restart services" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor White
        Write-Host "  .\deploy.ps1 -Command dev" -ForegroundColor Gray
        Write-Host "  .\deploy.ps1 -Command prod" -ForegroundColor Gray
        Write-Host "  .\deploy.ps1 -Command logs -Environment dev" -ForegroundColor Gray
        Write-Host "  .\deploy.ps1 -Command logs -Environment prod" -ForegroundColor Gray
        Write-Host "  .\deploy.ps1 -Command stop -Environment prod" -ForegroundColor Gray
    }
} 