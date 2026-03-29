#!/bin/bash
# Release-Script: Setzt einen SemVer-Tag und pusht ihn.
#
# Nutzung:
#   ./scripts/release.sh patch   →  v0.1.0 → v0.1.1
#   ./scripts/release.sh minor   →  v0.1.1 → v0.2.0
#   ./scripts/release.sh major   →  v0.2.0 → v1.0.0
#
# Ohne Tags: startet bei v0.1.0

set -euo pipefail

BUMP="${1:-patch}"

# Letztes Tag finden
LAST=$(git describe --tags --match 'v*' --abbrev=0 2>/dev/null || echo "v0.0.0")
echo "Aktuell: $LAST"

# Parsen
IFS='.' read -r MAJOR MINOR PATCH <<< "${LAST#v}"

case "$BUMP" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *) echo "Nutzung: $0 [major|minor|patch]"; exit 1 ;;
esac

NEW="v${MAJOR}.${MINOR}.${PATCH}"
echo "Neu:     $NEW"

# Sicherstellen dass working tree sauber ist
if [ -n "$(git status --porcelain)" ]; then
  echo "FEHLER: Uncommitted changes. Erst committen."
  exit 1
fi

# Tag setzen und pushen
git tag -a "$NEW" -m "Release $NEW"
echo "Tag $NEW gesetzt."
echo ""
echo "Push mit:  git push origin $NEW"
echo "Oder:      git push origin main --tags"
