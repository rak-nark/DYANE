# setup.ps1 - Configura el entorno de trabajo de Dynatrace
# Uso:  .\scripts\setup.ps1 [-InstallDtctl]
param(
  [switch]$InstallDtctl,
  [switch]$SkipNpmInstall
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "==> Entorno de trabajo Dynatrace" -ForegroundColor Cyan

if (-not $SkipNpmInstall) {
  Write-Host "==> Instalando dependencias (npm install)" -ForegroundColor Cyan
  Push-Location $Root
  try {
    npm install
  } finally {
    Pop-Location
  }
}

if (-not (Test-Path -LiteralPath (Join-Path $Root ".env"))) {
  Copy-Item -LiteralPath (Join-Path $Root ".env.example") -Destination (Join-Path $Root ".env")
  Write-Host "==> Creado .env a partir de .env.example - completa tus credenciales" -ForegroundColor Yellow
} else {
  Write-Host "==> .env ya existe, no se modifica" -ForegroundColor Green
}

Write-Host "==> Compilando CLI (npm run build)" -ForegroundColor Cyan
Push-Location $Root
try {
  npm run build
} finally {
  Pop-Location
}

if ($InstallDtctl) {
  Write-Host "==> Instalando dtctl (CLI de Dynatrace)" -ForegroundColor Cyan
  $install = Get-Command "irm" -ErrorAction SilentlyContinue
  if ($install) {
    Invoke-RestMethod "https://raw.githubusercontent.com/dynatrace-oss/dtctl/main/install.ps1" | Invoke-Expression
  } else {
    Write-Host "No se encontró Invoke-RestMethod; instala dtctl manualmente:" -ForegroundColor Yellow
    Write-Host "  irm https://raw.githubusercontent.com/dynatrace-oss/dtctl/main/install.ps1 | iex"
  }
} else {
  Write-Host "==> Para instalar dtctl ejecuta: .\scripts\setup.ps1 -InstallDtctl" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Listo. Prueba con:  node .\dist\index.js config" -ForegroundColor Green