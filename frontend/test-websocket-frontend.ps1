# Script de prueba para notificaciones WebSocket
# Ejecutar desde: C:\Users\walth\OneDrive\Documentos\ELI\Sistema-Chifles

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRUEBA DE NOTIFICACIONES WEBSOCKET" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el WebSocket server este corriendo
Write-Host "1. Verificando servidor WebSocket..." -ForegroundColor Yellow
$wsTest = Test-NetConnection -ComputerName localhost -Port 8081 -WarningAction SilentlyContinue

if ($wsTest.TcpTestSucceeded) {
    Write-Host "   OK Servidor WebSocket activo en puerto 8081" -ForegroundColor Green
} else {
    Write-Host "   ERROR Servidor WebSocket NO esta corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta primero: cd Websocket; go run ." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Enviando notificaciones de prueba..." -ForegroundColor Yellow
Write-Host ""

# Array de notificaciones de prueba
$notificaciones = @(
    @{
        nombre = "Nuevo Producto"
        data = @{
            type = "product.created"
            payload = @{
                id = 999
                nombre = "Chifles BBQ Premium"
                precio = 15.50
            }
            secret = "super_secret_key_123"
        }
    },
    @{
        nombre = "Stock Bajo (Critico)"
        data = @{
            type = "supply.low"
            payload = @{
                id = 5
                nombre = "Papas"
                stock = 3
                minimo = 10
            }
            secret = "super_secret_key_123"
        }
    },
    @{
        nombre = "Nuevo Pedido"
        data = @{
            type = "order.created"
            payload = @{
                pedido_id = 555
                cliente = "Maria Gonzalez"
                total = 125.00
            }
            secret = "super_secret_key_123"
        }
    },
    @{
        nombre = "Produccion Iniciada"
        data = @{
            type = "production.started"
            payload = @{
                orden_id = 888
                producto = "Chifles Picantes"
                cantidad = 100
            }
            secret = "super_secret_key_123"
        }
    },
    @{
        nombre = "Pedido Completado"
        data = @{
            type = "order.completed"
            payload = @{
                pedido_id = 555
                cliente = "Maria Gonzalez"
            }
            secret = "super_secret_key_123"
        }
    }
)

# Enviar cada notificacion
foreach ($notif in $notificaciones) {
    $json = $notif.data | ConvertTo-Json -Depth 5
    
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8081/notify" -Method POST -Body $json -ContentType "application/json" -ErrorAction Stop
        
        Write-Host "   OK $($notif.nombre)" -ForegroundColor Green
    }
    catch {
        Write-Host "   ERROR $($notif.nombre) - Error: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         PRUEBA COMPLETADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Instrucciones:" -ForegroundColor Yellow
Write-Host "   1. Abre el frontend en: http://localhost:7171" -ForegroundColor White
Write-Host "   2. Verifica el indicador de conexion (debe estar verde)" -ForegroundColor White
Write-Host "   3. Haz clic en el icono de campana en el header" -ForegroundColor White
Write-Host "   4. Deberias ver 5 notificaciones en el panel" -ForegroundColor White
Write-Host ""
