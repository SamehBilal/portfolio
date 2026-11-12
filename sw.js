/* Service worker: the site works offline and can be installed as an app.
   - Pages: network first (3 s), then the saved copy, then offline.html. Pages like
     project.html?slug=… are one page filled in from the data, so they're matched without the query.
   - Code, styles, fonts and data: served from the cache at once and refreshed in the background.
   - Images: from the cache once seen.
   VERSION and PRECACHE are rewritten by tools/build-sw.js — run it after changing files. */
'use strict';

var VERSION = 'sb-3ebdaf2e7a';
var PRECACHE = [
	'./',
	'404.html',
	'index.html',
	'offline.html',
	'project.html',
	'stories.html',
	'stories/checklist.html',
	'stories/deed-balance.html',
	'stories/diskussion-toggle-puzzle.html',
	'stories/game.html',
	'stories/hijra.html',
	'stories/islamic-birth-map.html',
	'stories/islamic-checklist.html',
	'stories/life-stats.html',
	'stories/map.html',
	'support.html',
	'works.html',
	'assets/js/appear.min.js',
	'assets/js/bootstrap.min.js',
	'assets/js/gravity.js',
	'assets/js/gsap.min.js',
	'assets/js/imagesloaded.pkgd.min.js',
	'assets/js/isotope.pkgd.min.js',
	'assets/js/jquery-3.7.1.min.js',
	'assets/js/jquery.magnific-popup.min.js',
	'assets/js/jquery.nice-select.min.js',
	'assets/js/lights.js',
	'assets/js/lodash.min.js',
	'assets/js/main.js',
	'assets/js/menu.js',
	'assets/js/MorphSVGPlugin3.min.js',
	'assets/js/owl.js',
	'assets/js/pwa.js',
	'assets/js/script.js',
	'assets/js/slick.min.js',
	'assets/js/smooth-scroll.js',
	'assets/js/splitting.js',
	'assets/js/support.js',
	'assets/js/swiper-bundle.min.js',
	'assets/js/theme.js',
	'assets/js/vanilla-tilt.min.js',
	'assets/js/wow.min.js',
	'assets/css/animate.min.css',
	'assets/css/bootstrap.min.css',
	'assets/css/inter.css',
	'assets/css/magnific-popup.css',
	'assets/css/nice-select.min.css',
	'assets/css/responsive.css',
	'assets/css/slick.min.css',
	'assets/css/spacing.css',
	'assets/css/stories.css',
	'assets/css/style.css',
	'assets/css/swiper-bundle.css',
	'assets/fonts/remixicon.css',
	'assets/fonts/remixicon.ttf',
	'assets/fonts/remixicon.woff',
	'assets/fonts/remixicon.woff2',
	'assets/images/favicon.png',
	'assets/images/icons/apple-touch-icon.png',
	'assets/images/icons/favicon-32.png',
	'assets/images/icons/favicon-48.png',
	'assets/images/icons/icon-192.png',
	'assets/images/icons/icon-512.png',
	'assets/images/icons/maskable-192.png',
	'assets/images/icons/maskable-512.png',
	'data/projects.json',
	'data/stories.json',
	'manifest.webmanifest'
];

var SHELL = 'sb-shell-' + VERSION;
var RUNTIME = 'sb-runtime';
var IMAGES = 'sb-images';
var REMOTE = 'sb-remote';
var REMOTE_MAX = 200;

self.addEventListener('install', function (ev) {
	ev.waitUntil(caches.open(SHELL).then(function (c) {
		/* one missing file shouldn't stop the whole install */
		return Promise.all(PRECACHE.map(function (u) {
			return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
		}));
	}));
});

self.addEventListener('activate', function (ev) {
	ev.waitUntil(caches.keys().then(function (keys) {
		return Promise.all(keys.filter(function (k) {
			return k.indexOf('sb-shell-') === 0 && k !== SHELL;
		}).map(function (k) { return caches.delete(k); }));
	}).then(function () { return self.clients.claim(); }));
});

self.addEventListener('message', function (ev) {
	if (ev.data === 'skipWaiting') self.skipWaiting();
});

function timeout(ms, p) {
	return new Promise(function (resolve, reject) {
		var t = setTimeout(function () { reject(new Error('timeout')); }, ms);
		p.then(function (r) { clearTimeout(t); resolve(r); }, function (e) { clearTimeout(t); reject(e); });
	});
}

function fromCache(req, opts) {
	return caches.match(req, opts);
}

function page(req) {
	var net = fetch(req).then(function (res) {
		if (res && res.ok) {
			var copy = res.clone();
			/* keep one copy per page, without the query */
			var url = new URL(req.url); url.search = ''; url.hash = '';
			caches.open(RUNTIME).then(function (c) { c.put(url.href, copy); });
		}
		return res;
	});
	return timeout(3000, net).catch(function () {
		return fromCache(req, { ignoreSearch: true }).then(function (hit) {
			return hit || net.catch(function () { return fromCache('offline.html'); });
		});
	});
}

function staleWhileRevalidate(req, cacheName) {
	return caches.open(cacheName).then(function (c) {
		return c.match(req, { ignoreSearch: req.url.indexOf(self.location.origin) === 0 }).then(function (hit) {
			var net = fetch(req).then(function (res) {
				if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
				return res;
			}).catch(function () { return hit; });
			return hit || net;
		});
	});
}

function cacheFirst(req, cacheName, max) {
	return caches.open(cacheName).then(function (c) {
		return c.match(req).then(function (hit) {
			if (hit) return hit;
			return fetch(req).then(function (res) {
				if (res && (res.ok || res.type === 'opaque')) {
					c.put(req, res.clone());
					if (max) c.keys().then(function (keys) { if (keys.length > max) c.delete(keys[0]); });
				}
				return res;
			}).catch(function () { return new Response('', { status: 504 }); });
		});
	});
}

self.addEventListener('fetch', function (ev) {
	var req = ev.request;
	if (req.method !== 'GET') return;
	var url = new URL(req.url);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
	var same = url.origin === self.location.origin;

	if (req.mode === 'navigate') { ev.respondWith(page(req)); return; }
	if (same && /\.(png|jpe?g|webp|gif|svg|jfif|ico|avif)$/i.test(url.pathname)) { ev.respondWith(cacheFirst(req, IMAGES)); return; }
	if (same && /\.(mp3|m4a|mp4|webm|pdf)$/i.test(url.pathname)) return; /* media and CV download: straight from the network */
	if (same) {
		/* the latest copy fetched (runtime), else the install-time copy, refreshed quietly each time */
		ev.respondWith(caches.open(RUNTIME).then(function (c) { return c.match(req, { ignoreSearch: true }); }).then(function (hit) {
			return hit || fromCache(req, { ignoreSearch: true });
		}).then(function (hit) {
			var fresh = staleWhileRevalidate(req, RUNTIME);
			return hit || fresh;
		}));
		return;
	}
	if (req.destination === 'image') { ev.respondWith(cacheFirst(req, REMOTE, REMOTE_MAX)); return; }
	if (req.destination === 'script' || req.destination === 'style' || req.destination === 'font') { ev.respondWith(staleWhileRevalidate(req, RUNTIME)); return; }
});
