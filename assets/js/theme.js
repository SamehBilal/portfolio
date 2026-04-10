/**
 * theme.js — unified theme manager
 * Load this as the FIRST script on every page (before any CSS or other JS)
 * <script src="assets/js/theme.js"></script>
 */

(function () {
    const KEY = 'theme';
    const THEMES = ['system', 'light', 'dark'];
    const h = document.documentElement;

    /* ── Apply saved theme immediately (no flash) ── */
    const saved = localStorage.getItem(KEY);
    if (saved) h.dataset.theme = saved;

    if (sessionStorage.getItem('visited')) {
        const s = document.createElement('style');
        s.textContent = '#preloader-areasss, .preloader { display: none !important; }';
        document.head.appendChild(s);
    }


    /* ── Re-apply after DOM ready in case any script overwrites it ── */
    document.addEventListener('DOMContentLoaded', function () {
        const s = localStorage.getItem(KEY);
        if (s) h.dataset.theme = s;
    });

    /* ── Re-apply after all scripts have loaded ── */
    window.addEventListener('load', function () {
        const s = localStorage.getItem(KEY);
        if (s) h.dataset.theme = s;
    });

    /* ── Helpers exposed globally ── */
    window.cycleTheme = function () {
        const current = h.dataset.theme || 'system';
        const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
        if (!document.startViewTransition) {
            h.dataset.theme = next;
        } else {
            document.startViewTransition(() => { h.dataset.theme = next; });
        }
        localStorage.setItem(KEY, next);
    };

    window.toggleTheme = function () {
        const next = h.dataset.theme === 'dark' ? 'light' : 'dark';
        h.dataset.theme = next;
        localStorage.setItem(KEY, next);
    };
})();