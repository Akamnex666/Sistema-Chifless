# Script de inicio rápido para el frontend

Write-Host "🚀 Iniciando Sistema de Gestión de Chifles - Frontend" -ForegroundColor Cyan
Write-Host ""

# Verificar si existe .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  No se encontró .env.local. Creando desde plantilla..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local" -ErrorAction SilentlyContinue
    
    if (-not $?) {
        Write-Host "📝 Creando .env.local..." -ForegroundColor Yellow
        @"
# API REST (NestJS)
NEXT_PUBLIC_API_REST_URL=http://localhost:3000/chifles

# GraphQL API (FastAPI)
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8001/graphql

# WebSocket Server (Go)
NEXT_PUBLIC_WS_URL=http://localhost:8081
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    }
    
    Write-Host "✅ Archivo .env.local creado" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Verificando dependencias..." -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Instalando dependencias..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Verificando servicios backend..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Asegúrate de que los siguientes servicios estén corriendo:" -ForegroundColor Yellow
Write-Host "  1. REST API (NestJS):  http://localhost:3000" -ForegroundColor White
Write-Host "  2. GraphQL (FastAPI):  http://localhost:8001" -ForegroundColor White
Write-Host "  3. WebSocket (Go):     http://localhost:8081" -ForegroundColor White
Write-Host ""

$continue = Read-Host "¿Los servicios backend están corriendo? (s/n)"

if ($continue -eq "s" -or $continue -eq "S") {
    Write-Host ""
    Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Cyan
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "⚠️  Por favor, inicia los servicios backend primero:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "REST API (NestJS):" -ForegroundColor Cyan
    Write-Host "  cd ..\Api-Rest" -ForegroundColor White
    Write-Host "  npm run start:dev" -ForegroundColor White
    Write-Host ""
    Write-Host "GraphQL (FastAPI):" -ForegroundColor Cyan
    Write-Host "  cd ..\GraphQL\service" -ForegroundColor White
    Write-Host "  uvicorn app.main:app --reload --port 8001" -ForegroundColor White
    Write-Host ""
    Write-Host "WebSocket (Go):" -ForegroundColor Cyan
    Write-Host "  cd ..\Websocket" -ForegroundColor White
    Write-Host "  go run main.go" -ForegroundColor White
    Write-Host ""
}
