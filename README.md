# Binkterm Door Button Filter Mod

A lightweight, zero-touch door filtering plugin for [BinktermPHP](https://github.com/awehttam/binkterm-php). 

This mod dynamically injects a sleek category filter bar on the Binkterm Doors page (`/games`), allowing users to instantly filter door games by type (**RLOGIN**, **WEB**, **NATIVE**, **DOS**, **JS-DOS**, or **ALL**) with live badge counts and smooth transitions.

**RLOGIN is selected by default.**

---

## Features

- **Zero-Touch & Upgrade-Proof**: Never touches or modifies core BinktermPHP files. When you update Binkterm via `git pull upstream`, you will never get merge conflicts.
- **RLOGIN by Default**: Immediately highlights your BBS's online RLogin doors (TradeWars 2002, DoorMUD, Usurper, etc.) as soon as the page loads.
- **Dynamic Door Counts**: Counts the number of active doors for each type and displays them as badges directly on the buttons.
- **Intelligent Category Discovery**: Automatically scans door cards and launch URLs (`/rlogindoors/`, `/dosdoors/`, `/nativedoors/`, `/webdoors/`, `/jsdos/`). Only categories with active doors are displayed.
- **Instant Filtering**: Pure client-side filtering with zero page reloads.
- **Browser History & Deep Linking**: Supports URL hash navigation (e.g. `/games#rlogin`, `/games#web`, `/games#all`) with full Back/Forward browser button support.
- **Theme-Integrated**: Uses Bootstrap 5 styling with accent badges matching Binkterm's native door color badges.

---

## Quick Install (1-Line Command)

Clone this repository and run the installer pointing to your Binkterm installation:

```bash
git clone https://github.com/thewebexpert/binkterm-php-doorButtonMod.git
cd binkterm-php-doorButtonMod
./install.sh /path/to/binkterm
```

*(If you are running the command from a directory adjacent to `binkterm`, running `./install.sh` will auto-detect the `binkterm` folder).*

---

## Manual Installation

If you prefer to install manually without the script:

1. **Copy the JavaScript and CSS assets:**
   ```bash
   cp public_html/js/door-filter.js /path/to/binkterm/public_html/js/
   cp public_html/css/door-filter.css /path/to/binkterm/public_html/css/
   ```

2. **Add the assets to `templates/custom/header.insert.twig`:**
   If `templates/custom/header.insert.twig` does not exist in your Binkterm installation, copy it:
   ```bash
   mkdir -p /path/to/binkterm/templates/custom
   cp templates/custom/header.insert.twig /path/to/binkterm/templates/custom/
   ```
   If you already have a `templates/custom/header.insert.twig`, simply append:
   ```twig
   {# Binkterm Door Button Filter Mod #}
   <link rel="stylesheet" href="/css/door-filter.css">
   <script src="/js/door-filter.js" defer></script>
   ```

---

## Docker Compose Setup

If you run BinktermPHP in Docker, you can mount the plugin files into your container:

```yaml
services:
  binkterm-app:
    volumes:
      - ./plugins/binkterm-php-doorButtonMod/public_html/js/door-filter.js:/var/www/html/public_html/js/door-filter.js:ro
      - ./plugins/binkterm-php-doorButtonMod/public_html/css/door-filter.css:/var/www/html/public_html/css/door-filter.css:ro
      - ./plugins/binkterm-php-doorButtonMod/templates/custom/header.insert.twig:/var/www/html/templates/custom/header.insert.twig:ro
```

---

## Uninstallation

To remove the plugin:

```bash
cd binkterm-php-doorButtonMod
./uninstall.sh /path/to/binkterm
```

---

## How It Works

BinktermPHP natively provides an extension hook in all page templates (`templates/base.twig`, `templates/shells/web/base.twig`, and `templates/shells/bbs-menu/base.twig`):

```twig
{% include 'custom/header.insert.twig' ignore missing %}
```

`templates/custom/*` is already ignored by git in BinktermPHP. The script automatically executes on `/games`, parses the door cards, injects the filter bar, and hides non-matching doors without modifying any backend code or database tables.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
