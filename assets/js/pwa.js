/* The site as an app: registers sw.js, adds an install button above the coffee button, and
   shows small notices when a new version is ready, when the connection drops or comes back,
   and once the app has been installed. It never pops up an install prompt on its own.
   Loaded on every page, from the page's own folder (data-root says where the site root is). */
(function () {
	'use strict';
	var html = document.documentElement;
	var me = document.currentScript;
	var root = (me && me.getAttribute('data-root')) || './';
	var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
	if (standalone) html.classList.add('is-app');

	/* ---------- the browser bar follows the theme ---------- */
	function isDark() {
		var t = html.getAttribute('data-theme');
		if (t === 'dark') return true;
		if (t === 'light') return false;
		return matchMedia('(prefers-color-scheme: dark)').matches;
	}
	function syncThemeColor() {
		var m = document.querySelector('meta[name="theme-color"]');
		if (m) m.setAttribute('content', isDark() ? '#18181B' : '#FAFAFA');
	}
	new MutationObserver(syncThemeColor).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
	matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncThemeColor);
	syncThemeColor();

	/* ---------- notices ---------- */
	var box;
	function css() {
		if (document.getElementById('pwa-notice-css')) return;
		var s = document.createElement('style');
		s.id = 'pwa-notice-css';
		s.textContent =
			'.pwa-notices{position:fixed;left:16px;bottom:96px;z-index:2147483000;display:flex;flex-direction:column;gap:10px;max-width:min(360px,calc(100vw - 32px));pointer-events:none;font-family:Poppins,system-ui,sans-serif}' +
			'.pwa-notice{pointer-events:auto;display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:14px;background:#1D1D1D;color:#FAFAFA;border:1px solid rgba(255,255,255,.08);box-shadow:0 10px 30px rgba(0,0,0,.25);font-size:14px;line-height:1.45;opacity:0;transform:translateY(12px);transition:opacity .25s,transform .25s}' +
			'.pwa-notice.show{opacity:1;transform:none}' +
			'.pwa-notice .pn-dot{flex:none;width:8px;height:8px;border-radius:50%;margin-top:7px;background:#F9812E}' +
			'.pwa-notice.success .pn-dot{background:#3fb37f}.pwa-notice.warning .pn-dot{background:#e5a50a}' +
			'.pwa-notice .pn-body{flex:1}.pwa-notice b{display:block;font-weight:600;margin-bottom:2px}' +
			'.pwa-notice .pn-action{margin-top:8px;border:0;border-radius:999px;padding:6px 14px;background:#F9812E;color:#18181B;font:600 13px/1 inherit;font-family:inherit;cursor:pointer}' +
			'.pwa-notice .pn-close{flex:none;border:0;background:none;color:inherit;opacity:.6;font-size:18px;line-height:1;cursor:pointer;padding:0 2px}' +
			'.pwa-notice .pn-close:hover{opacity:1}' +
			'html[data-theme="light"] .pwa-notice{background:#fff;color:#18181B;border-color:rgba(0,0,0,.08)}' +
			'@media (prefers-color-scheme:light){html:not([data-theme="dark"]) .pwa-notice{background:#fff;color:#18181B;border-color:rgba(0,0,0,.08)}}' +
			'@media (prefers-reduced-motion:reduce){.pwa-notice{transition:none}}';
		document.head.appendChild(s);
	}
	/* notify(text, {title, type: 'info'|'success'|'warning', ttl ms (0 = stays), action: {label, onClick}}) */
	function notify(text, o) {
		o = o || {};
		if (!document.body) { document.addEventListener('DOMContentLoaded', function () { notify(text, o); }); return { dismiss: function () {} }; }
		css();
		if (!box || !box.isConnected) {
			box = document.createElement('div');
			box.className = 'pwa-notices';
			box.setAttribute('role', 'status');
			box.setAttribute('aria-live', 'polite');
			document.body.appendChild(box);
		}
		var el = document.createElement('div');
		el.className = 'pwa-notice ' + (o.type || 'info');
		var body = document.createElement('div');
		body.className = 'pn-body';
		if (o.title) { var b = document.createElement('b'); b.textContent = o.title; body.appendChild(b); }
		body.appendChild(document.createTextNode(text));
		var dot = document.createElement('span'); dot.className = 'pn-dot';
		var close = document.createElement('button');
		close.type = 'button'; close.className = 'pn-close'; close.setAttribute('aria-label', 'Dismiss'); close.textContent = '×';
		var timer = 0;
		function dismiss() {
			clearTimeout(timer);
			el.classList.remove('show');
			setTimeout(function () { el.remove(); }, 300);
		}
		close.addEventListener('click', dismiss);
		if (o.action) {
			var a = document.createElement('button');
			a.type = 'button'; a.className = 'pn-action'; a.textContent = o.action.label;
			a.addEventListener('click', function () { dismiss(); o.action.onClick(); });
			body.appendChild(document.createElement('br'));
			body.appendChild(a);
		}
		el.appendChild(dot); el.appendChild(body); el.appendChild(close);
		box.appendChild(el);
		requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('show'); }); });
		var ttl = o.ttl === undefined ? 4500 : o.ttl;
		if (ttl) timer = setTimeout(dismiss, ttl);
		return { dismiss: dismiss, el: el };
	}
	window.PWANotify = notify;

	/* ---------- install button: a round button above the coffee button ----------
	   Shown only where the site can be installed (Chrome/Edge/Android, or Safari on iPhone/iPad,
	   which gets the Add to Home Screen steps). It never pops up a prompt by itself. */
	var deferred = null;
	var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
	var installBtn = null;
	function installCss() {
		if (document.getElementById('pwa-install-css')) return;
		var s = document.createElement('style');
		s.id = 'pwa-install-css';
		s.textContent =
			'.pwa-install{position:fixed;right:18px;bottom:18px;z-index:9998;width:64px;height:64px;border-radius:50%;border:2px solid #F9812E;background:#18181B;color:#F9812E;display:grid;place-items:center;cursor:pointer;padding:0;box-shadow:0 4px 8px rgba(0,0,0,.15);transition:transform .2s,background-color .2s,color .2s;opacity:0;animation:pwa-in .3s .2s forwards}' +
			'.pwa-install.above-bmc{bottom:94px}' +
			'.pwa-install:hover,.pwa-install:focus-visible{transform:scale(1.08);background:#F9812E;color:#18181B}' +
			'.pwa-install:focus-visible{outline:2px solid #F9812E;outline-offset:3px}' +
			'.pwa-install svg{width:28px;height:28px}' +
			'.pwa-install::after{content:attr(data-tip);position:absolute;right:calc(100% + 10px);top:50%;transform:translateY(-50%);white-space:nowrap;background:#1D1D1D;color:#FAFAFA;font:500 13px/1 Poppins,system-ui,sans-serif;padding:8px 12px;border-radius:8px;opacity:0;pointer-events:none;transition:opacity .2s}' +
			'.pwa-install:hover::after,.pwa-install:focus-visible::after{opacity:1}' +
			'html[data-theme="light"] .pwa-install{background:#fff}' +
			'@media (prefers-color-scheme:light){html:not([data-theme="dark"]) .pwa-install{background:#fff}}' +
			'html[data-theme="light"] .pwa-install:hover,html[data-theme="light"] .pwa-install:focus-visible{background:#F9812E}' +
			'@media (prefers-color-scheme:light){html:not([data-theme="dark"]) .pwa-install:hover,html:not([data-theme="dark"]) .pwa-install:focus-visible{background:#F9812E}}' +
			'@media (max-width:575px){.pwa-install{width:45px;height:45px}.pwa-install.above-bmc{bottom:73px}.pwa-install svg{width:22px;height:22px}}' +
			'@keyframes pwa-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
			'@media (prefers-reduced-motion:reduce){.pwa-install{animation:none;opacity:1;transition:none}}' +
			'@media print{.pwa-install{display:none}}';
		document.head.appendChild(s);
	}
	function canInstall() { return !standalone && (deferred || ios); }
	function placeInstall() {
		if (!document.body) { document.addEventListener('DOMContentLoaded', placeInstall); return; }
		if (!canInstall()) { if (installBtn) { installBtn.remove(); installBtn = null; } return; }
		if (installBtn) return;
		installCss();
		installBtn = document.createElement('button');
		installBtn.type = 'button';
		installBtn.className = 'pwa-install';
		/* sit above the Buy Me a Coffee button on the pages that have it */
		if (document.querySelector('script[data-name="BMC-Widget"]')) installBtn.classList.add('above-bmc');
		installBtn.setAttribute('aria-label', 'Install the app');
		installBtn.setAttribute('data-tip', 'Install the app');
		installBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
		installBtn.addEventListener('click', install);
		document.body.appendChild(installBtn);
	}
	function install() {
		if (deferred) {
			deferred.prompt();
			deferred.userChoice.then(function () { deferred = null; placeInstall(); });
			return;
		}
		if (ios) notify('In Safari, tap Share, then "Add to Home Screen".', { title: 'Install the app', ttl: 9000 });
	}
	window.addEventListener('beforeinstallprompt', function (ev) { ev.preventDefault(); deferred = ev; placeInstall(); });
	placeInstall();

	/* ---------- installed ---------- */
	window.addEventListener('appinstalled', function () {
		standalone = true; deferred = null; placeInstall();
		notify('Sameh Bilal is on your device now. Open it like any other app.', { title: 'App installed', type: 'success', ttl: 6000 });
	});

	/* ---------- connection ---------- */
	window.addEventListener('offline', function () {
		notify('Pages you have opened before still work.', { title: 'You are offline', type: 'warning', ttl: 6000 });
	});
	window.addEventListener('online', function () {
		notify('The connection is back.', { title: 'Back online', type: 'success', ttl: 2500 });
	});

	/* ---------- service worker and updates ---------- */
	if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
	var reloading = false;
	navigator.serviceWorker.addEventListener('controllerchange', function () { if (reloading) location.reload(); });
	function offerUpdate(worker) {
		notify('A newer version of the site is ready.', {
			title: 'Update available', ttl: 0,
			action: { label: 'Update now', onClick: function () { reloading = true; worker.postMessage('skipWaiting'); } }
		});
	}
	var firstInstall = !navigator.serviceWorker.controller;
	window.addEventListener('load', function () {
		navigator.serviceWorker.register(root + 'sw.js', { scope: root }).then(function (reg) {
			if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
			reg.addEventListener('updatefound', function () {
				var w = reg.installing;
				if (!w) return;
				w.addEventListener('statechange', function () {
					if (w.state !== 'installed') return;
					if (navigator.serviceWorker.controller) offerUpdate(w); /* an update */
					else if (firstInstall) notify('The site is saved on this device and will open even without a connection.', { title: 'Ready offline', type: 'success', ttl: 5000 });
				});
			});
			/* look for a new version when the page comes back to the front */
			document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') reg.update().catch(function () {}); });
		}).catch(function () {});
	});
})();
