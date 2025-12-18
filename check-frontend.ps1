Write-Host "`nVerificando configuración..." -ForegroundColor Cyan

# 1. Verificar que el backend está corriendo
Write-Host "`n[1] Verificando backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 3
    Write-Host "   [OK] Backend corriendo: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Backend NO está corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# 2. Obtener IP local
Write-Host "`n[2] Detectando IP local..." -ForegroundColor Yellow
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.Name -notlike "*Loopback*" -and $_.Name -notlike "*VMware*" -and $_.Name -notlike "*VirtualBox*" }
$ip = $null
foreach ($adapter in $adapters) {
    $currentIp = (Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "169.254.*" }).IPAddress
    if ($currentIp) {
        $ip = $currentIp
        Write-Host "   [OK] IP detectada: $ip ($($adapter.Name))" -ForegroundColor Green
        break
    }
}

if (-not $ip) {
    Write-Host "   [ERROR] No se pudo detectar IP local" -ForegroundColor Red
    exit 1
}

# 3. Verificar que el archivo api.js tiene la IP correcta
Write-Host "`n[3] Verificando api.js..." -ForegroundColor Yellow
$apiFile = "client\src\services\api.js"
if (Test-Path $apiFile) {
    $content = Get-Content $apiFile -Raw
    if ($content -match "http://$ip:3000") {
        Write-Host "   [OK] IP configurada correctamente en api.js" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] La IP en api.js no coincide con tu IP actual" -ForegroundColor Yellow
        Write-Host "   Tu IP: $ip" -ForegroundColor Cyan
        Write-Host "   Actualiza la línea 6 en client\src\services\api.js" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [ERROR] No se encuentra api.js" -ForegroundColor Red
}

# 4. Verificar dependencias
Write-Host "`n[4] Verificando dependencias..." -ForegroundColor Yellow
if (Test-Path "client\node_modules") {
    Write-Host "   [OK] Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Dependencias NO instaladas" -ForegroundColor Red
    Write-Host "   Ejecuta: cd client; npm install" -ForegroundColor Yellow
}
