#!/usr/bin/env bash
# Smoke-Test für Cloud-Save-Endpunkte.
# Usage: ops/tests/supabase-smoke.sh [worker_url]
# Default worker_url = https://schatzinsel.hoffmeyer-zlotnik.workers.dev

set -euo pipefail

WORKER_URL="${1:-https://schatzinsel.hoffmeyer-zlotnik.workers.dev}"
DEVICE_ID="smoke-$(date +%s)-$$"
SLOT="autosave"

echo "── Smoke-Test gegen: $WORKER_URL"
echo "── Device-ID: $DEVICE_ID"
echo ""

# Step 1: POST /save
echo "[1/4] POST /save …"
PAYLOAD=$(cat <<JSON
{
  "device_id": "$DEVICE_ID",
  "name": "Smoke",
  "slot": "$SLOT",
  "payload": { "grid": [], "blocks_count": 0, "client_ts": $(date +%s), "hello": "welt" }
}
JSON
)
RESP=$(curl -sf -X POST -H 'Content-Type: application/json' --data "$PAYLOAD" "$WORKER_URL/save")
echo "    → $RESP"
echo "$RESP" | grep -q '"ok":true' || { echo "FAIL: POST /save"; exit 1; }

# Step 2: GET /save
echo "[2/4] GET /save …"
RESP=$(curl -sf "$WORKER_URL/save?device_id=$DEVICE_ID&slot=$SLOT")
echo "    → $RESP"
echo "$RESP" | grep -q '"found":true' || { echo "FAIL: GET /save not found"; exit 1; }
echo "$RESP" | grep -q '"hello":"welt"' || { echo "FAIL: payload mismatch"; exit 1; }

# Step 3: GET /save/list
echo "[3/4] GET /save/list …"
RESP=$(curl -sf "$WORKER_URL/save/list?device_id=$DEVICE_ID")
echo "    → $RESP"
echo "$RESP" | grep -q "\"slot\":\"$SLOT\"" || { echo "FAIL: list has no slot"; exit 1; }

# Step 4: Upsert (zweiter POST mit anderem payload)
echo "[4/4] POST /save (upsert) …"
PAYLOAD2=$(cat <<JSON
{
  "device_id": "$DEVICE_ID",
  "slot": "$SLOT",
  "payload": { "grid": [], "blocks_count": 3, "updated": true }
}
JSON
)
RESP=$(curl -sf -X POST -H 'Content-Type: application/json' --data "$PAYLOAD2" "$WORKER_URL/save")
echo "    → $RESP"
echo "$RESP" | grep -q '"ok":true' || { echo "FAIL: POST /save upsert"; exit 1; }

RESP=$(curl -sf "$WORKER_URL/save?device_id=$DEVICE_ID&slot=$SLOT")
echo "$RESP" | grep -q '"updated":true' || { echo "FAIL: upsert payload nicht aktualisiert"; exit 1; }

echo ""
echo "── ALL GREEN"
