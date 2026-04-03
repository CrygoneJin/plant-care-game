# MMX 80/20 Split — Farmer Cronjob
# 80% bleibt (Burn-Budget), 20% geht an API-Budget-Wallet
#
# Einrichtung:
#   1. API-Budget-Adresse unten eintragen
#   2. Task Scheduler:
#      schtasks /create /tn "MMX-Split" /tr "powershell -File C:\scripts\mmx-split.ps1" /sc DAILY /st 12:00
#   3. Oder alle 6h:
#      schtasks /create /tn "MMX-Split" /tr "powershell -File C:\scripts\mmx-split.ps1" /sc MINUTE /mo 360

$MMX_CLI = "mmx"  # oder voller Pfad: "C:\Program Files\MMX\mmx.exe"
$API_WALLET = "mmx1_DEINE_API_BUDGET_ADRESSE_HIER"  # zweite Wallet auf nonkyc.io oder lokal
$SPLIT = 0.20  # 20% ans API-Budget
$MIN_BALANCE = 1.0  # Unter 1 MMX: nichts senden

# Balance abfragen
try {
    $info = & $MMX_CLI wallet show --json 2>&1 | ConvertFrom-Json
    $balance = $info.balance / 10000  # MMX hat 4 Dezimalstellen
} catch {
    Write-Host "$(Get-Date) FEHLER: MMX Wallet nicht erreichbar"
    exit 1
}

Write-Host "$(Get-Date) Balance: $balance MMX"

if ($balance -lt $MIN_BALANCE) {
    Write-Host "$(Get-Date) Unter Minimum ($MIN_BALANCE MMX). Nichts zu tun."
    exit 0
}

$amount = [math]::Floor($balance * $SPLIT * 10000) / 10000  # 20%, auf 4 Dezimalen gerundet

Write-Host "$(Get-Date) Sende $amount MMX (20%) an API-Budget"

& $MMX_CLI wallet send -a $amount -t $API_WALLET -m "api-budget-20pct-$(Get-Date -Format yyyy-MM-dd)"

if ($LASTEXITCODE -eq 0) {
    Write-Host "$(Get-Date) OK: $amount MMX gesendet"
} else {
    Write-Host "$(Get-Date) FEHLER beim Senden"
}
