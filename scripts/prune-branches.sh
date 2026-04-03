#!/bin/bash
# DNA-Schere: 117 tote Branches löschen
# Erstellt: 2026-04-02 (Pereira-Audit)
#
# BEHALTEN:
#   - main
#   - feat/sprint-41 (Spitze der DNA, 1935 LOC neue Features)
#   - claude/review-product-strategy-chdsP (aktive Session)
#
# ARCHIVIERT:
#   - Alle SHAs in BRANCH-ARCHIVE.md — Code restaurierbar via git checkout <sha>
#
# AUSFÜHREN:
#   chmod +x scripts/prune-branches.sh
#   ./scripts/prune-branches.sh

set -e

KEEP="main|feat/sprint-41|claude/review-product-strategy-chdsP"

echo "🧬 DNA-Schere — Branch-Audit"
echo ""

# Fetch current state
git fetch origin --prune 2>/dev/null

# Build kill list
BRANCHES=$(git branch -r | grep -v HEAD | sed 's|origin/||' | xargs | tr ' ' '\n' | grep -vE "^($KEEP)$")
COUNT=$(echo "$BRANCHES" | wc -l)

echo "Lösche $COUNT Branches (behalte: main, feat/sprint-41, review-session)"
echo ""
read -p "Fortfahren? (j/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Jj]$ ]]; then
  echo "Abgebrochen."
  exit 0
fi

DELETED=0
FAILED=0

for branch in $BRANCHES; do
  if git push origin --delete "$branch" 2>/dev/null; then
    echo "  ✂️  $branch"
    DELETED=$((DELETED + 1))
  else
    echo "  ❌ $branch (Fehler)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "Fertig: $DELETED gelöscht, $FAILED fehlgeschlagen."
echo "Lokale Referenzen aufräumen..."
git remote prune origin 2>/dev/null
echo "✅ Done."
