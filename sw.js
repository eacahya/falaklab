/* dibuat otomatis oleh tools/web/build_web.py */
var CACHE = 'falaklab-1926d7e68645';
var FILES = [
"./",
"./bab/bab01.html",
"./bab/bab02.html",
"./bab/bab03.html",
"./bab/bab04.html",
"./bab/bab05.html",
"./bab/bab06.html",
"./bab/bab07.html",
"./bab/bab08.html",
"./bab/bab09.html",
"./bab/bab10.html",
"./bab/bab11.html",
"./bab/bab12.html",
"./bab/bab13.html",
"./bab/bab14.html",
"./bab/bab15.html",
"./data.js",
"./falak.css",
"./falak.js",
"./icon-192.png",
"./icon-512.png",
"./index.html",
"./jilid2/bab01.html",
"./jilid2/bab02.html",
"./jilid2/bab03.html",
"./jilid2/bab04.html",
"./jilid2/bab05.html",
"./jilid2/bab06.html",
"./jilid2/bab07.html",
"./jilid2/bab08.html",
"./jilid2/bab09.html",
"./jilid2/bab10.html",
"./jilid2/bab11.html",
"./jilid2/bab12.html",
"./jilid2/bab13.html",
"./jilid2/bab14.html",
"./jilid2/bab15.html",
"./kunci.js",
"./lib/jsQR.js",
"./manifest.webmanifest",
"./unduh/Lembar_Kerja_Astronomi_Islam_Jilid_1.xlsx",
"./unduh/Lembar_Kerja_Astronomi_Islam_Jilid_2.xlsx"
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('falaklab-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || /\.apk$/.test(new URL(e.request.url).pathname)) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(e.request).then(function (r) {
        if (r && r.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, r.clone());
        return r;
      });
    });
  }));
});
