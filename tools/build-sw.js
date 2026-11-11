/* Rewrites VERSION and PRECACHE in sw.js.
   PRECACHE = the site's pages below + every local script, stylesheet and font they load, + the PWA icons.
   VERSION  = a hash of all those files, so any change makes browsers pick up the new worker
   (and the site shows "Update available").
   Run after changing pages, CSS or JS:   node tools/build-sw.js */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PAGES = [
	'index.html', 'works.html', 'stories.html', 'project.html', 'support.html', '404.html', 'offline.html',
	...fs.readdirSync(path.join(ROOT, 'stories')).filter(f => f.endsWith('.html')).map(f => 'stories/' + f)
];
const EXTRA = [
	'manifest.webmanifest',
	'data/projects.json',
	'data/stories.json',
	'assets/images/favicon.png',
	...fs.readdirSync(path.join(ROOT, 'assets/images/icons')).map(f => 'assets/images/icons/' + f)
];

const files = new Set(PAGES);
const ref = /(?:src|href)\s*=\s*["']([^"'#?]+)/gi;
for (const page of PAGES) {
	const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
	let m;
	while ((m = ref.exec(html))) {
		const u = m[1].trim();
		if (/^(?:[a-z]+:|\/\/|\$\{)/i.test(u)) continue; /* remote, mailto, template literals */
		if (!/\.(?:js|css|woff2?|ttf)$/i.test(u)) continue;
		const rel = path.posix.normalize(path.posix.join(path.posix.dirname(page), u));
		if (!rel.startsWith('..') && fs.existsSync(path.join(ROOT, rel))) files.add(rel);
	}
}
/* fonts that the stylesheets pull in */
for (const f of [...files]) {
	if (!f.endsWith('.css')) continue;
	const css = fs.readFileSync(path.join(ROOT, f), 'utf8');
	const re = /url\(\s*["']?([^"')?#]+\.(?:woff2?|ttf))/gi;
	let m;
	while ((m = re.exec(css))) {
		if (/^(?:[a-z]+:|\/\/)/i.test(m[1])) continue;
		const rel = path.posix.normalize(path.posix.join(path.posix.dirname(f), m[1]));
		if (fs.existsSync(path.join(ROOT, rel))) files.add(rel);
	}
}
EXTRA.forEach(f => { if (fs.existsSync(path.join(ROOT, f))) files.add(f); });

const list = ['./', ...[...files].sort((a, b) => {
	const rank = s => /\.html$/.test(s) ? 0 : /\.js$/.test(s) ? 1 : /\.css$/.test(s) ? 2 : 3;
	return rank(a) - rank(b) || a.localeCompare(b);
})];

const hash = crypto.createHash('sha1');
for (const f of list.slice(1)) hash.update(f).update(fs.readFileSync(path.join(ROOT, f)));
const version = 'sb-' + hash.digest('hex').slice(0, 10);

const swPath = path.join(ROOT, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/var VERSION = '[^']*';/, `var VERSION = '${version}';`);
sw = sw.replace(/var PRECACHE = \[[\s\S]*?\n\];/, 'var PRECACHE = [\n' + list.map(f => `\t'${f}'`).join(',\n') + '\n];');
fs.writeFileSync(swPath, sw);
console.log(`sw.js: ${version}, ${list.length} files precached`);
