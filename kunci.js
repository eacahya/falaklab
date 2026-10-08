/* Falak Lab: kode akses buku (web dan aplikasi Android) dan pemasangan sebagai aplikasi web (PWA).
   Tidak aktif hanya bila dibuka sebagai berkas lokal.
   Kode akses tidak disimpan di sini, hanya sidik SHA-256-nya (ubah dengan tools/web/set_codes.py). */
(function () {
  var P = location.protocol, HOST = location.hostname, APP = HOST === 'appassets.androidplatform.net';
  if (P !== 'https:' && P !== 'http:') return;

  var HASH = { 1: '262b4948dd1fdf9de54ea3d01af7a0178c1e1fd1bafc7281b1bce172074bb194', 2: 'c7e7d8cc6d1cd4788ee6b05dba423acc9a98f5e1d19e80ff2b136031ec88788e' };
  var KEY = 'falaklab.akses', path = location.pathname;
  var vol = /\/jilid2\//.test(path) ? 2 : /\/bab\//.test(path) ? 1 : 0;
  var root = path.replace(/(jilid2|bab)\/[^\/]*$/, '').replace(/[^\/]*$/, '');
  var ANDROID = /Android/i.test(navigator.userAgent);
  var NAMA = { 1: 'Jilid 1 (Arah Kiblat dan Waktu Salat)', 2: 'Jilid 2 (Awal Bulan Hijriyah, Rukyat, dan Gerhana)' };

  function get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  var ok = get();

  /* service worker: aplikasi tetap jalan tanpa internet setelah dibuka sekali */
  if (!APP && 'serviceWorker' in navigator && (P === 'https:' || HOST === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register(root + 'sw.js', { scope: root }).catch(function () { }); });
  }

  var css = '' +
    'html.fl-kunci body>*:not(#fl-kunci){display:none!important}' +
    '#fl-kunci{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;' +
    'background:linear-gradient(160deg,#0d6b5f,#0a5249);font:16px/1.5 "Source Sans 3",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#15213a}' +
    '#fl-kunci .k-card{width:100%;max-width:420px;background:#fff;border-radius:18px;padding:24px 22px;box-shadow:0 10px 40px rgba(0,0,0,.25)}' +
    '#fl-kunci h1{margin:0 0 4px;font-size:22px;color:#0d6b5f}#fl-kunci p{margin:0 0 14px;color:#56627a;font-size:15px}' +
    '#fl-kunci input{width:100%;height:50px;border:1.5px solid #d5dbe4;border-radius:12px;padding:0 14px;font:inherit;font-size:20px;letter-spacing:.08em;text-transform:uppercase;background:#f2f4f6;color:#15213a;box-sizing:border-box}' +
    '#fl-kunci input:focus{outline:none;border-color:#0d6b5f}' +
    '#fl-kunci button{width:100%;height:48px;margin-top:10px;border:0;border-radius:12px;background:#0d6b5f;color:#fff;font:inherit;font-weight:700;cursor:pointer}' +
    '#fl-kunci button.k-alt{background:transparent;color:#0d6b5f;margin-top:4px}' +
    '#fl-kunci .k-msg{min-height:22px;margin-top:8px;font-size:14px;color:#a33a2a}' +
    '#fl-kunci .k-note{margin-top:14px;font-size:13px;color:#56627a}' +
    '#fl-kunci .k-apk{display:block;margin-top:14px;text-align:center;font-weight:700;color:#0d6b5f}' +
    '@media (prefers-color-scheme:dark){#fl-kunci .k-card{background:#172033;color:#e6eaf2}#fl-kunci h1{color:#4fc2ad}#fl-kunci p,#fl-kunci .k-note{color:#9aa6bd}' +
    '#fl-kunci input{background:#0f1522;border-color:#2b3850;color:#e6eaf2}#fl-kunci button{background:#4fc2ad;color:#0f1522}#fl-kunci button.k-alt{background:transparent;color:#4fc2ad}#fl-kunci .k-msg{color:#f08a78}}' +
    '#fl-akses{max-width:760px;margin:0 auto 32px;padding:0 16px;font-size:14px;color:var(--muted,#56627a);display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '#fl-akses .fl-apk{color:var(--accent,#0d6b5f);font-weight:600}' +
    '#fl-akses button{border:1px solid var(--line,#d5dbe4);background:var(--surface,#fff);color:var(--accent,#0d6b5f);border-radius:999px;padding:6px 14px;font:inherit;font-size:14px;cursor:pointer}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function sha256hex(s) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function check(code) {
    var n = String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!n) return Promise.resolve(0);
    if (!window.crypto || !crypto.subtle) return Promise.reject(new Error('nocrypto'));
    return sha256hex('falaklab:' + n).then(function (h) { return h === HASH[1] ? 1 : h === HASH[2] ? 2 : 0; });
  }

  function ask(want, closable) {
    var old = document.getElementById('fl-kunci'); if (old) old.remove();
    var d = document.createElement('div'); d.id = 'fl-kunci';
    var judul = want ? 'Kode akses ' + NAMA[want].split(' (')[0] : 'Kode akses buku';
    var ket = want ? 'Halaman ini bagian dari buku Astronomi Islam ' + NAMA[want] + '. Masukkan kode akses yang tercetak di halaman Petunjuk Penggunaan buku tersebut.'
      : 'Falak Lab disediakan untuk pembaca buku Astronomi Islam. Masukkan kode akses yang tercetak di halaman Petunjuk Penggunaan buku (Jilid 1 atau Jilid 2).';
    d.innerHTML = '<form class="k-card" autocomplete="off"><h1>' + judul + '</h1><p>' + ket + '</p>' +
      '<input id="fl-kode" placeholder="Contoh: FL1-XXXX-XXXX" aria-label="Kode akses" maxlength="20" autocapitalize="characters" spellcheck="false">' +
      '<button type="submit">Buka</button>' + (closable ? '<button type="button" class="k-alt" id="fl-tutup">Batal</button>' : '') +
      '<div class="k-msg" id="fl-msg" role="alert"></div>' +
      '<div class="k-note">Kode cukup dimasukkan sekali di setiap perangkat dan peramban. Satu kode membuka satu jilid.</div>' + (ANDROID && !APP ? '<a class="k-apk" href="' + root + 'falaklab.apk" download>Unduh aplikasi Android (APK)</a>' : '') + '</form>';
    document.body.appendChild(d);
    var inp = d.querySelector('input'), msg = d.querySelector('#fl-msg');
    setTimeout(function () { inp.focus(); }, 50);
    if (closable) d.querySelector('#fl-tutup').onclick = function () { d.remove(); document.documentElement.classList.remove('fl-kunci'); };
    d.querySelector('form').onsubmit = function (e) {
      e.preventDefault(); msg.textContent = '';
      check(inp.value).then(function (v) {
        if (!v) { msg.textContent = 'Kode tidak dikenal. Periksa kembali huruf dan angkanya.'; return; }
        ok = get(); ok[v] = true; save(ok);
        if (want && v !== want) { msg.textContent = 'Kode ' + NAMA[v].split(' (')[0] + ' tersimpan. Halaman ini memerlukan kode ' + NAMA[want].split(' (')[0] + '.'; inp.value = ''; return; }
        location.reload();
      }, function () { msg.textContent = 'Peramban ini tidak dapat memeriksa kode. Gunakan Chrome, Edge, Firefox, atau Safari versi terbaru.'; });
    };
  }

  /* bilah status akses dan tombol pasang di beranda */
  var installEvt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; bar(); });
  function bar() {
    if (vol !== 0 || !document.body) return;
    var b = document.getElementById('fl-akses');
    if (!b) { b = document.createElement('div'); b.id = 'fl-akses'; document.body.appendChild(b); }
    var s = 'Akses: Jilid 1 ' + (ok[1] ? '✓' : '–') + ' · Jilid 2 ' + (ok[2] ? '✓' : '–');
    b.innerHTML = '<span>' + s + '</span>' + (!(ok[1] && ok[2]) ? '<button type="button" id="fl-tambah">Masukkan kode jilid lain</button>' : '') +
      (installEvt ? '<button type="button" id="fl-pasang">Pasang Falak Lab di perangkat ini</button>' : '') +
      (!APP ? '<a class="fl-apk" href="' + root + 'falaklab.apk" download>Unduh aplikasi Android (APK)</a>' : '') +
      [1, 2].filter(function (j) { return ok[j]; }).map(function (j) {
        var f = 'unduh/Lembar_Kerja_Astronomi_Islam_Jilid_' + j + '.xlsx';
        return '<a class="fl-apk fl-xlsx" data-file="' + f + '" href="' + root + f + '" download>Unduh Lembar Kerja Excel Jilid ' + j + '</a>';
      }).join('');
    Array.prototype.forEach.call(b.querySelectorAll('.fl-xlsx'), function (a) {
      if (APP && window.AndroidBridge && AndroidBridge.saveFile) {
        a.onclick = function (e) { e.preventDefault(); AndroidBridge.saveFile(a.getAttribute('data-file')); };
      }
    });
    var t = document.getElementById('fl-tambah'); if (t) t.onclick = function () { ask(0, true); };
    var p = document.getElementById('fl-pasang'); if (p) p.onclick = function () { installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; bar(); }); };
  }

  var need = vol ? !ok[vol] : !(ok[1] || ok[2]);
  if (need) document.documentElement.classList.add('fl-kunci');
  function ready() { if (need) ask(vol, false); else bar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
  window.FalakAkses = { ask: function () { ask(0, true); }, status: function () { return get(); } };
})();
