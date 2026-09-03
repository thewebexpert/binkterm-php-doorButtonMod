/**
 * ============================================================================
 * Binkterm Door Button Filter Mod
 * Dynamic Client-Side Door Filtering by Type
 * Uses native Bootstrap and active theme styles
 * https://github.com/thewebexpert/binkterm-php-doorButtonMod
 * ============================================================================
 */

(function () {
    'use strict';

    function initDoorFilter() {
        const gameCards = document.querySelectorAll('.game-card');
        if (!gameCards || gameCards.length === 0) {
            return; // Not on the doors/games page or no games available
        }

        // Avoid re-initializing if toolbar already exists
        if (document.getElementById('door-filter-toolbar')) {
            return;
        }

        const cardsContainer = gameCards[0].closest('.row');
        if (!cardsContainer) {
            return;
        }

        // Available door types configuration
        const typeConfig = [
            { key: 'rlogin', label: 'RLOGIN', icon: 'fa-network-wired' },
            { key: 'web',    label: 'WEB',    icon: 'fa-globe' },
            { key: 'native', label: 'NATIVE', icon: 'fa-terminal' },
            { key: 'dos',    label: 'DOS',    icon: 'fa-floppy-disk' },
            { key: 'jsdos',  label: 'JS-DOS', icon: 'fa-microchip' },
            { key: 'all',    label: 'ALL',    icon: 'fa-border-all' }
        ];

        const counts = {
            all: gameCards.length,
            rlogin: 0,
            web: 0,
            native: 0,
            dos: 0,
            jsdos: 0
        };

        // Categorize each card
        gameCards.forEach(function (card) {
            const col = card.closest('.col');
            if (col) {
                col.classList.add('game-card-col');
            }

            let type = 'web'; // fallback

            // 1. Check badge in card title
            const badge = card.querySelector('.card-title .badge');
            if (badge) {
                const badgeText = badge.textContent.trim().toUpperCase();
                if (badgeText.includes('RLOGIN') || badge.classList.contains('bg-danger')) {
                    type = 'rlogin';
                } else if (badgeText.includes('NATIVE') || badge.classList.contains('bg-warning')) {
                    type = 'native';
                } else if (badgeText.includes('JS-DOS') || badge.classList.contains('bg-primary')) {
                    type = 'jsdos';
                } else if (badgeText.includes('DOS') || badge.classList.contains('bg-info')) {
                    type = 'dos';
                } else if (badgeText.includes('WEB') || badge.classList.contains('bg-success')) {
                    type = 'web';
                }
            }

            // 2. Cross-verify with launch button href
            const launchBtn = card.querySelector('a.btn[href*="/games/"]');
            if (launchBtn) {
                const href = launchBtn.getAttribute('href') || '';
                if (href.includes('/rlogindoors/')) {
                    type = 'rlogin';
                } else if (href.includes('/nativedoors/')) {
                    type = 'native';
                } else if (href.includes('/dosdoors/')) {
                    type = 'dos';
                } else if (href.includes('/jsdos/')) {
                    type = 'jsdos';
                }
            }

            if (col) {
                col.dataset.doorType = type;
            }

            if (typeof counts[type] === 'number') {
                counts[type]++;
            }
        });

        // Determine default filter:
        // Priority: 1. URL hash -> 2. 'rlogin' (if present) -> 3. 'all'
        let initialFilter = 'rlogin';
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (hash && (hash === 'all' || counts[hash] !== undefined)) {
            initialFilter = hash;
        } else if (counts['rlogin'] === 0 && counts['all'] > 0) {
            initialFilter = 'all'; // Graceful fallback if BBS has no RLogin doors
        }

        // Build Toolbar HTML using native Bootstrap theme classes (btn-primary for active, btn-outline-secondary for inactive)
        const wrapper = document.createElement('div');
        wrapper.id = 'door-filter-toolbar';
        wrapper.className = 'door-filter-wrapper';

        let buttonsHtml = '<div class="door-filter-toolbar"><div class="btn-group" role="group" aria-label="Door Types Filter">';

        typeConfig.forEach(function (t) {
            const count = counts[t.key] || 0;
            // Only show buttons for categories that have games, plus 'ALL'
            if (count > 0 || t.key === 'all') {
                const isActive = (t.key === initialFilter);
                const btnClass = isActive ? 'btn btn-primary active' : 'btn btn-outline-secondary';
                const badgeClass = isActive ? 'badge bg-dark ms-1' : 'badge bg-secondary ms-1';
                buttonsHtml += `
                    <button type="button"
                            class="${btnClass} door-filter-btn"
                            data-target="${t.key}"
                            title="Filter by ${t.label}">
                        <i class="fas ${t.icon} me-1"></i>
                        <span>${t.label}</span>
                        <span class="${badgeClass}">${count}</span>
                    </button>
                `;
            }
        });

        buttonsHtml += '</div></div>';

        // Empty state alert container
        buttonsHtml += `
            <div id="door-filter-empty" class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                <span id="door-filter-empty-text">No doors found for this category.</span>
            </div>
        `;

        wrapper.innerHTML = buttonsHtml;

        // Insert toolbar right before the cards container
        cardsContainer.parentNode.insertBefore(wrapper, cardsContainer);

        // Filter function
        function applyFilter(selectedType, updateHash) {
            let visibleCount = 0;
            const cols = cardsContainer.querySelectorAll('.game-card-col');

            cols.forEach(function (col) {
                const itemType = col.dataset.doorType;
                if (selectedType === 'all' || itemType === selectedType) {
                    col.classList.remove('door-filtered-out');
                    visibleCount++;
                } else {
                    col.classList.add('door-filtered-out');
                }
            });

            // Update button styles: theme's btn-primary for active, btn-outline-secondary for inactive
            wrapper.querySelectorAll('.door-filter-btn').forEach(function (btn) {
                const badge = btn.querySelector('.badge');
                if (btn.getAttribute('data-target') === selectedType) {
                    btn.className = 'btn btn-primary active door-filter-btn';
                    if (badge) badge.className = 'badge bg-dark ms-1';
                } else {
                    btn.className = 'btn btn-outline-secondary door-filter-btn';
                    if (badge) badge.className = 'badge bg-secondary ms-1';
                }
            });

            // Handle empty state
            const emptyEl = document.getElementById('door-filter-empty');
            const emptyTextEl = document.getElementById('door-filter-empty-text');
            if (emptyEl) {
                if (visibleCount === 0) {
                    const label = selectedType.toUpperCase();
                    if (emptyTextEl) {
                        emptyTextEl.textContent = `No ${label} doors currently available.`;
                    }
                    emptyEl.style.display = 'block';
                } else {
                    emptyEl.style.display = 'none';
                }
            }

            if (updateHash) {
                if (window.history && window.history.replaceState) {
                    const newUrl = window.location.pathname + window.location.search + '#' + selectedType;
                    window.history.replaceState(null, '', newUrl);
                } else {
                    window.location.hash = selectedType;
                }
            }
        }

        // Attach click listeners to buttons
        wrapper.querySelectorAll('.door-filter-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const target = this.getAttribute('data-target');
                applyFilter(target, true);
            });
        });

        // Listen for browser Back / Forward hash navigation
        window.addEventListener('hashchange', function () {
            const currentHash = window.location.hash.replace('#', '').toLowerCase();
            if (currentHash && (currentHash === 'all' || counts[currentHash] !== undefined)) {
                applyFilter(currentHash, false);
            }
        });

        // Apply initial filter (RLOGIN by default)
        applyFilter(initialFilter, false);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDoorFilter);
    } else {
        initDoorFilter();
    }
})();
