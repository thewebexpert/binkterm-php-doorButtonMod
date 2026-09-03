#!/usr/bin/env bash
# ==============================================================================
# Binkterm Door Button Filter Mod - Uninstaller
# https://github.com/thewebexpert/binkterm-php-doorButtonMod
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-$(cd "$SCRIPT_DIR/.." && pwd)}"

if [ -d "$SCRIPT_DIR/public_html" ] && [ -d "$TARGET_DIR/binkterm" ]; then
    TARGET_DIR="$TARGET_DIR/binkterm"
fi

echo "======================================================"
echo " Uninstalling Binkterm Door Button Filter Mod"
echo " Target Binkterm Directory: $TARGET_DIR"
echo "======================================================"

# Remove assets
if [ -f "$TARGET_DIR/public_html/js/door-filter.js" ]; then
    rm -f "$TARGET_DIR/public_html/js/door-filter.js"
    echo "[✓] Removed public_html/js/door-filter.js"
fi

if [ -f "$TARGET_DIR/public_html/css/door-filter.css" ]; then
    rm -f "$TARGET_DIR/public_html/css/door-filter.css"
    echo "[✓] Removed public_html/css/door-filter.css"
fi

HEADER_INSERT="$TARGET_DIR/templates/custom/header.insert.twig"
if [ -f "$HEADER_INSERT" ]; then
    # If the file only contains our mod, remove it
    CLEANED=$(grep -v "door-filter" "$HEADER_INSERT" | grep -v "Door Button Filter Mod" | sed '/^[[:space:]]*$/d')
    if [ -z "$CLEANED" ]; then
        rm -f "$HEADER_INSERT"
        echo "[✓] Removed templates/custom/header.insert.twig"
    else
        grep -v "door-filter" "$HEADER_INSERT" | grep -v "Door Button Filter Mod" > "${HEADER_INSERT}.tmp"
        mv "${HEADER_INSERT}.tmp" "$HEADER_INSERT"
        echo "[✓] Removed door-filter references from templates/custom/header.insert.twig"
    fi
fi

echo ""
echo "Uninstallation complete!"
echo "======================================================"
