/* DOMiNANCE Breakdowns — offline reading (service worker).
 * Built by build.py from sw-template.js, which fills in the version and the app-shell file list.
 * - The app shell is saved on install, so the site opens without a connection.
 * - Every chapter a student opens is kept; "Save all chapters" stores the rest.
 * - Versioned files (content/*, *.js?v=, *.css?v=) never change, so they are served from the cache first.
 * - Pages always try the network first, so new content appears as soon as it is published. */
'use strict';
const VERSION = 'dedf748141';
const SHELL = ["/", "styles.css?v=7bd9f4deac", "content/index.js?v=59474f864b", "app.js?v=bdb3ee9522", "mobile-ui.js?v=1fd429a8ca", "offline.js?v=f9704cc261", "reader.js?v=fdcf6fb050", "feedback.js?v=e74d8f5cf3", "figures.js?v=ff998896a1", "teaching-widgets.js?v=6e62495c19", "glossary.js?v=93eb8d9479", "media.js?v=8262a3cb32", "image-viewer.js?v=5a41a9f63b"];
const SHELL_CACHE = 'dom-shell-' + VERSION;
const CONTENT_CACHE = 'dom-content';       // chapters, widgets, images: kept across versions (file names are versioned)
const IMAGE_HOSTS = ['commons.wikimedia.org', 'upload.wikimedia.org'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('dom-shell-') && key !== SHELL_CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

const versioned = url => url.origin === self.location.origin && (url.pathname.startsWith('/content/') || url.searchParams.has('v'));
const localAsset = url => url.origin === self.location.origin && url.pathname.startsWith('/assets/');

async function cacheFirst(request, cacheName) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
  return response;
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    const path = new URL(request.url).pathname;
    if (response.ok && (path === '/' || path === '/index.html')) (await caches.open(SHELL_CACHE)).put('/', response.clone());   // only the app page itself
    return response;
  } catch {
    return (await caches.match('/')) || (await caches.match('/index.html')) || Response.error();
  }
}

// Wikimedia images: fetched with CORS so they can be stored compactly; if that fails, the browser loads them normally.
async function image(request) {
  const hit = await caches.match(request.url);
  if (hit) return hit;
  try {
    const response = await fetch(request.url, {mode: 'cors', credentials: 'omit'});
    if (response.ok && response.type !== 'opaque') (await caches.open(CONTENT_CACHE)).put(request.url, response.clone());
    return response;
  } catch {
    return fetch(request);
  }
}

self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate') { event.respondWith(networkFirstPage(request)); return; }
  if (versioned(url)) { event.respondWith(cacheFirst(request, CONTENT_CACHE)); return; }
  if (localAsset(url) && !request.headers.has('range')) { event.respondWith(cacheFirst(request, CONTENT_CACHE)); return; }
  if (IMAGE_HOSTS.includes(url.hostname) && request.destination === 'image') { event.respondWith(image(request)); return; }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, CONTENT_CACHE));
  }
});
