#!/usr/bin/env bash
# ==============================================================================
# Binkterm Door Button Filter Mod - Installer
# https://github.com/thewebexpert/binkterm-php-doorButtonMod
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-$(cd "$SCRIPT_DIR/.." && pwd)}"

# If current directory is the binkterm root, use current directory
if [ -d "$SCRIPT_DIR/public_html" ] && [ -d "$TARGET_DIR/binkterm" ]; then
    TARGET_DIR="$TARGET_DIR/binkterm"
fi

echo "======================================================"
echo " Installing Binkterm Door Button Filter Mod"
echo " Target Binkterm Directory: $TARGET_DIR"
echo "======================================================"

if [ ! -d "$TARGET_DIR/public_html" ] || [ ! -d "$TARGET_DIR/templates" ]; then
    echo "Error: Target directory does not look like a valid BinktermPHP installation."
    echo "Usage: ./install.sh /path/to/binkterm"
    exit 1
fi

# 1. Copy JavaScript asset
mkdir -p "$TARGET_DIR/public_html/js"
cp "$SCRIPT_DIR/public_html/js/door-filter.js" "$TARGET_DIR/public_html/js/door-filter.js"
echo "[✓] Installed public_html/js/door-filter.js"

# 2. Copy CSS asset
mkdir -p "$TARGET_DIR/public_html/css"
cp "$SCRIPT_DIR/public_html/css/door-filter.css" "$TARGET_DIR/public_html/css/door-filter.css"
echo "[✓] Installed public_html/css/door-filter.css"

# 3. Configure templates/custom/header.insert.twig
mkdir -p "$TARGET_DIR/templates/custom"
HEADER_INSERT="$TARGET_DIR/templates/custom/header.insert.twig"

if [ ! -f "$HEADER_INSERT" ]; then
    cp "$SCRIPT_DIR/templates/custom/header.insert.twig" "$HEADER_INSERT"
    echo "[✓] Created templates/custom/header.insert.twig"
else
    if grep -q "door-filter.js" "$HEADER_INSERT"; then
        echo "[✓] templates/custom/header.insert.twig already includes door-filter.js"
    else
        echo "" >> "$HEADER_INSERT"
        echo "{# Binkterm Door Button Filter Mod #}" >> "$HEADER_INSERT"
        echo '<link rel="stylesheet" href="/css/door-filter.css">' >> "$HEADER_INSERT"
        echo '<script src="/js/door-filter.js" defer></script>' >> "$HEADER_INSERT"
        echo "[✓] Appended door-filter assets to existing templates/custom/header.insert.twig"
    fi
fi

echo ""
echo "Installation complete! Door filtering is now active on /games."
echo "RLOGIN doors will be selected by default."
echo "======================================================"
