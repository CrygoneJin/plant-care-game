# MMX Zehnt — Der Farmer gibt ein Zehntel
#
# 10% der täglichen Ernte → Schwarzes Loch (Burn)
# 90% bleibt → davon geht ein Teil ans API-Budget (manuell oder nonkyc.io)
#
# "Alle Zehnten des Landes, vom Ertrag des Landes, gehören dem Herrn."
# — Levitikus 27:30 (nur dass der Herr hier ein 8-Jähriger ist)
#
# Einrichtung: Claude Code auf W11 macht das.

$MMX_CLI = "mmx"
$BURN_ADDR = "mmx1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5tuzzn"
$ZEHNT = 0.10
$MIN_BALANCE = 0.5  # Unter 0.5 MMX: nichts brennen

$LOG = "C:\mmx-zehnt.log"

function Log($msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg"
    Write-Host $line
    Add-Content -Path $LOG -Value $line
}

# Balance abfragen
try {
    $info = & $MMX_CLI wallet show --json 2>&1 | ConvertFrom-Json
    $balance = $info.balance / 10000
} catch {
    Log "FEHLER: MMX Wallet nicht erreichbar"
    exit 1
}

Log "Balance: $balance MMX"

if ($balance -lt $MIN_BALANCE) {
    Log "Unter Minimum ($MIN_BALANCE MMX). Kein Zehnt heute."
    exit 0
}

# Zehnt berechnen — proportional zur Ernte, nicht fest
$tithe = [math]::Floor($balance * $ZEHNT * 10000) / 10000

Log "Zehnt: $tithe MMX (10% von $balance)"

$tag = (Get-Date).DayOfYear
$memo = "Zehnt Tag $tag/365"

& $MMX_CLI wallet send -a $tithe -t $BURN_ADDR -m $memo

if ($LASTEXITCODE -eq 0) {
    Log "Gebrannt: $tithe MMX — $memo"
} else {
    Log "FEHLER beim Senden"
}
