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
            { key: 'rlogin',    label: 'RLOGIN',    icon: 'fa-server' },
            { key: 'doorparty', label: 'DOORPARTY', icon: 'fa-network-wired' },
            { key: 'bbslink',   label: 'BBSLINK',   icon: 'fa-link' },
            { key: 'web',       label: 'WEB',       icon: 'fa-globe' },
            { key: 'native',    label: 'NATIVE',    icon: 'fa-terminal' },
            { key: 'dos',       label: 'DOS',       icon: 'fa-floppy-disk' },
            { key: 'jsdos',     label: 'JS-DOS',    icon: 'fa-microchip' },
            { key: 'all',       label: 'ALL',       icon: 'fa-border-all' }
        ];

        const counts = {
            all: gameCards.length,
            doorparty: 0,
            bbslink: 0,
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
            let isDoorParty = false;
            let isBbsLink = false;

            // 1. Check card launch URL and title for DoorParty and BBSLink identification
            const launchBtn = card.querySelector('a.btn[href*="/games/"]');
            const href = launchBtn ? (launchBtn.getAttribute('href') || '') : '';
            const titleEl = card.querySelector('.card-title');
            const titleText = titleEl ? titleEl.textContent.trim() : '';

            if (href.includes('/doorparty') || href.includes('/dp-') ||
                titleText.toLowerCase().includes('doorparty') || titleText.toLowerCase().includes('door party')) {
                isDoorParty = true;
            }

            if (href.includes('bbslink') ||
                titleText.toLowerCase().includes('bbslink') || titleText.toLowerCase().includes('bbs link')) {
                isBbsLink = true;
            }

            // 2. Check badge in card title
            const badge = card.querySelector('.card-title .badge');
            if (badge) {
                const badgeText = badge.textContent.trim().toUpperCase();
                if (isDoorParty) {
                    type = 'doorparty';
                    badge.textContent = 'DOORPARTY';
                    badge.className = 'badge badge-doorparty text-white';
                } else if (isBbsLink) {
                    type = 'bbslink';
                    badge.textContent = 'BBSLINK';
                    badge.className = 'badge badge-bbslink text-white';
                } else if (badgeText.includes('RLOGIN') || badge.classList.contains('bg-danger')) {
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
            } else if (isDoorParty) {
                type = 'doorparty';
            } else if (isBbsLink) {
                type = 'bbslink';
            }

            // 3. Cross-verify non-network cards with launch button href
            if (!isDoorParty && !isBbsLink && launchBtn) {
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
                // Tag whether it is the main DoorParty hub vs direct game
                const isMainHub = (href.endsWith('/doorparty') || href.endsWith('/doorparty/'));
                col.dataset.isDoorpartyHub = isMainHub ? 'true' : 'false';
                col.dataset.doorTitle = titleText.replace(/doorparty/gi, '').trim();

                // Tag whether it is the main BBSLink hub vs direct game
                const isBbslinkHub = (href.endsWith('/bbslink') || href.endsWith('/bbslinknative') || href.endsWith('/bbslink/'));
                col.dataset.isBbslinkHub = isBbslinkHub ? 'true' : 'false';
                col.dataset.bbslinkTitle = titleText.replace(/bbslink/gi, '').trim();
            }

            if (typeof counts[type] === 'number') {
                counts[type]++;
            }
        });

        // Determine default filter:
        // Priority: 1. URL hash -> 2. 'rlogin' (if present) -> 3. 'doorparty' (if present) -> 4. 'bbslink' (if present) -> 5. 'all'
        let initialFilter = 'rlogin';
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (hash && (hash === 'all' || counts[hash] !== undefined)) {
            initialFilter = hash;
        } else if (counts['rlogin'] > 0) {
            initialFilter = 'rlogin';
        } else if (counts['doorparty'] > 0) {
            initialFilter = 'doorparty';
        } else if (counts['bbslink'] > 0) {
            initialFilter = 'bbslink';
        } else {
            initialFilter = 'all';
        }

        // Build Toolbar HTML using native Bootstrap theme classes
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

        // Sort DoorParty cards so main hub is #1, followed by direct games alphabetically
        function sortDoorPartyCards() {
            const cols = Array.from(cardsContainer.querySelectorAll('.game-card-col'));
            const dpCols = cols.filter(col => col.dataset.doorType === 'doorparty');
            
            dpCols.sort(function (a, b) {
                const aIsHub = a.dataset.isDoorpartyHub === 'true';
                const bIsHub = b.dataset.isDoorpartyHub === 'true';
                if (aIsHub && !bIsHub) return -1;
                if (!aIsHub && bIsHub) return 1;
                return (a.dataset.doorTitle || '').localeCompare(b.dataset.doorTitle || '');
            });

            // Re-order in container (append in sorted order to the front)
            for (let i = dpCols.length - 1; i >= 0; i--) {
                cardsContainer.prepend(dpCols[i]);
            }
        }

        // Sort BBSLink cards so main gateway hub is #1, followed by direct games alphabetically
        function sortBbsLinkCards() {
            const cols = Array.from(cardsContainer.querySelectorAll('.game-card-col'));
            const blCols = cols.filter(col => col.dataset.doorType === 'bbslink');
            
            blCols.sort(function (a, b) {
                const aIsHub = a.dataset.isBbslinkHub === 'true';
                const bIsHub = b.dataset.isBbslinkHub === 'true';
                if (aIsHub && !bIsHub) return -1;
                if (!aIsHub && bIsHub) return 1;
                return (a.dataset.bbslinkTitle || '').localeCompare(b.dataset.bbslinkTitle || '');
            });

            for (let i = blCols.length - 1; i >= 0; i--) {
                cardsContainer.prepend(blCols[i]);
            }
        }

        // Filter function
        function applyFilter(selectedType, updateHash) {
            let visibleCount = 0;
            const cols = cardsContainer.querySelectorAll('.game-card-col');

            if (selectedType === 'doorparty') {
                sortDoorPartyCards();
            } else if (selectedType === 'bbslink') {
                sortBbsLinkCards();
            }

            cols.forEach(function (col) {
                const itemType = col.dataset.doorType;
                if (selectedType === 'all' || itemType === selectedType) {
                    col.classList.remove('door-filtered-out');
                    visibleCount++;
                } else {
                    col.classList.add('door-filtered-out');
                }
            });

            // Update button styles cleanly without triggering transition flash
            wrapper.querySelectorAll('.door-filter-btn').forEach(function (btn) {
                const badge = btn.querySelector('.badge');
                if (btn.getAttribute('data-target') === selectedType) {
                    btn.classList.remove('btn-outline-secondary');
                    btn.classList.add('btn-primary', 'active');
                    if (badge) {
                        badge.classList.remove('bg-secondary');
                        badge.classList.add('bg-dark');
                    }
                } else {
                    btn.classList.remove('btn-primary', 'active');
                    btn.classList.add('btn-outline-secondary');
                    if (badge) {
                        badge.classList.remove('bg-dark');
                        badge.classList.add('bg-secondary');
                    }
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
                this.blur(); // Drop focus immediately to avoid browser focus ring
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

        // Apply initial filter (DoorParty if doors exist, otherwise RLOGIN or ALL)
        applyFilter(initialFilter, false);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDoorFilter);
    } else {
        initDoorFilter();
    }
})();
