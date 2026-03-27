#!/bin/bash
# === Agent & Skill Collector ===
# Einmal auf dem Mac Mini laufen lassen.
# Sammelt alle Agents und Skills aus allen Repos.

set -e

BASE_DIR="$HOME/Projects"
OUTPUT_DIR="$HOME/claude-agents-collected"
SKILLS_DIR="$HOME/claude-skills-collected"

mkdir -p "$OUTPUT_DIR/team-dev"
mkdir -p "$OUTPUT_DIR/team-sales"
mkdir -p "$OUTPUT_DIR/raw"
mkdir -p "$SKILLS_DIR/raw"

REPOS=(
    "CrygoneJin/sally-sales"
    "CrygoneJin/justine-form"
    "CrygoneJin/shakerchallenge"
    "CrygoneJin/tina-teilechecker"
    "CrygoneJin/claude-agent-template"
    "CrygoneJin/plant-care-game"
)

TEMP_DIR=$(mktemp -d)

echo "=== Agent & Skill Collector ==="
echo ""

for REPO in "${REPOS[@]}"; do
    REPO_NAME=$(basename "$REPO")
    echo "--- $REPO_NAME ---"

    # Klonen (shallow, schnell)
    if git clone --depth 1 "https://github.com/$REPO.git" "$TEMP_DIR/$REPO_NAME" 2>/dev/null; then
        echo "  Geklont."
    else
        echo "  SKIP: Konnte $REPO nicht klonen."
        continue
    fi

    # .claude/commands/ durchsuchen
    CMD_DIR="$TEMP_DIR/$REPO_NAME/.claude/commands"
    if [ -d "$CMD_DIR" ]; then
        COUNT=$(ls "$CMD_DIR"/*.md 2>/dev/null | wc -l)
        echo "  $COUNT Dateien in .claude/commands/"
        for f in "$CMD_DIR"/*.md; do
            [ -f "$f" ] || continue
            NAME=$(basename "$f")
            cp "$f" "$OUTPUT_DIR/raw/${REPO_NAME}__${NAME}"
            cp "$f" "$SKILLS_DIR/raw/${REPO_NAME}__${NAME}"
            echo "    ✓ $NAME"
        done
    else
        echo "  Keine .claude/commands/ gefunden."
    fi

    # CLAUDE.md
    if [ -f "$TEMP_DIR/$REPO_NAME/CLAUDE.md" ]; then
        cp "$TEMP_DIR/$REPO_NAME/CLAUDE.md" "$OUTPUT_DIR/raw/${REPO_NAME}__CLAUDE.md"
        echo "  ✓ CLAUDE.md"
    fi

    # AGENTS.md
    if [ -f "$TEMP_DIR/$REPO_NAME/AGENTS.md" ]; then
        cp "$TEMP_DIR/$REPO_NAME/AGENTS.md" "$OUTPUT_DIR/raw/${REPO_NAME}__AGENTS.md"
        echo "  ✓ AGENTS.md"
    fi

    # docs/padawans/
    PAD_DIR="$TEMP_DIR/$REPO_NAME/docs/padawans"
    if [ -d "$PAD_DIR" ]; then
        for f in "$PAD_DIR"/*.md; do
            [ -f "$f" ] || continue
            NAME=$(basename "$f")
            cp "$f" "$OUTPUT_DIR/raw/${REPO_NAME}__padawan__${NAME}"
            echo "  ✓ padawan: $NAME"
        done
    fi

    echo ""
done

# Aufräumen
rm -rf "$TEMP_DIR"

# Bericht
echo "=== FERTIG ==="
echo ""
echo "Agents gesammelt in: $OUTPUT_DIR/raw/"
echo "Skills gesammelt in: $SKILLS_DIR/raw/"
echo ""
echo "Dateien:"
ls -1 "$OUTPUT_DIR/raw/" 2>/dev/null
echo ""
echo "--- Nächster Schritt ---"
echo "Starte Claude Code im plant-care-game Repo und sag:"
echo ""
echo '  "Lies ~/claude-agents-collected/raw/ und sortiere'
echo '   die Agents in team-dev und team-sales."'
echo ""
