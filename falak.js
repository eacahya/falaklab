/* Falak Lab: mode tampilan halaman materi di dalam aplikasi.
   ?sim=7.2      tampilkan hanya bagian simulasi yang dirujuk kotak SIM 7.2 di buku
   (halaman Jilid 2 di folder jilid2/ memakai <meta name="falak-jilid" content="2"> dan kode II-5.1)
   ?mode=latihan tampilkan hanya latihan interaktif bab ini
   ?mode=bab     tampilkan ringkasan materi bab (tanpa bagian administrasi kuliah) */
(function () {
  var D0 = window.FALAK_DATA, html = document.documentElement;
  var bab = +(document.querySelector('meta[name="falak-bab"]') || {}).content || 0;
  var vol = +(document.querySelector('meta[name="falak-jilid"]') || {}).content || 1;
  var D = vol === 2 && D0.vol2 ? D0.vol2 : D0;
  if (!D.hideSections) D.hideSections = D0.hideSections;
  var homeHash = (vol === 2 ? 'j2-' : '') + 'bab-';
  var volTxt = vol === 2 ? ' Jilid 2' : '';
  var ch = null, i;
  for (i = 0; i < D.chapters.length; i++) if (D.chapters[i].n === bab) ch = D.chapters[i];
  if (!ch) return;
  var q = new URLSearchParams(location.search);
  var code = q.get('sim'), mode = q.get('mode') || (code ? 'sim' : 'bab');
  var sim = null;
  if (code) for (i = 0; i < ch.sims.length; i++) if (ch.sims[i].code === code) sim = ch.sims[i];
  if (mode === 'sim' && !sim) mode = 'bab';

  var css = 'header.top,nav.sec,footer{display:none!important}' +
    '.task{display:none!important}' +
    D.hideSections.map(function (s) { return '#' + s; }).join(',') + '{display:none!important}';
  if (mode === 'sim') css += 'section:not(#' + sim.sec + '){display:none!important}.sec-head .eyebrow{display:none!important}';
  if (mode === 'latihan') css += 'section:not(#' + ch.quiz + '){display:none!important}';
  var st = document.createElement('style'); st.textContent = css;
  document.head.appendChild(st);
  html.classList.add('falak-app', 'falak-' + mode);

  /* tema mengikuti pengaturan aplikasi */
  try { var th = localStorage.getItem('falak-theme'); if (th === 'dark' || th === 'light') html.setAttribute('data-theme', th); } catch (e) {}

  /* salin ke papan klip lewat jembatan Android bila API web tidak tersedia */
  if (window.AndroidBridge && window.AndroidBridge.copyText) {
    var fallback = function (t) { window.AndroidBridge.copyText(String(t)); return Promise.resolve(); };
    try {
      if (!navigator.clipboard) Object.defineProperty(navigator, 'clipboard', { value: { writeText: fallback } });
      else navigator.clipboard.writeText = fallback;
    } catch (e) {}
  }

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function go(url) { location.href = url; }
  function simUrl(s) { return 'bab' + String(s.n).padStart(2, '0') + '.html?sim=' + s.code; }

  document.addEventListener('DOMContentLoaded', function () {
    var bar = el('div', 'fl-bar');
    var back = el('button', 'fl-back', '‹');
    back.setAttribute('aria-label', 'Kembali ke beranda');
    back.onclick = function () { go('../index.html#' + homeHash + ch.n); };
    var t = el('div', 'fl-title');
    if (mode === 'sim') {
      t.appendChild(el('span', 'fl-code', 'SIM ' + sim.code));
      t.appendChild(el('b', null, sim.title));
    } else {
      t.appendChild(el('span', 'fl-code', (vol === 2 ? 'Jilid 2 · ' : '') + 'Bab ' + ch.n));
      t.appendChild(el('b', null, mode === 'latihan' ? 'Latihan ' + ch.n : ch.title));
    }
    bar.appendChild(back); bar.appendChild(t);
    document.body.insertBefore(bar, document.body.firstChild);

    var info = el('div', 'fl-info');
    if (mode === 'sim') {
      if (sim.book) info.appendChild(el('p', 'fl-ref', 'Di buku' + volTxt + ': ' + (/^\d/.test(sim.book) ? 'subbab ' : '') + sim.book));
      if (sim.desc) info.appendChild(el('p', 'fl-desc', sim.desc));
    } else if (mode === 'latihan') {
      info.appendChild(el('p', 'fl-desc', 'Soal yang sama dengan Latihan ' + ch.n + ' di buku' + volTxt + '. Pilih jawaban untuk melihat penjelasannya.'));
    } else {
      info.appendChild(el('p', 'fl-desc', 'Ringkasan materi Bab ' + ch.n + ' dengan semua simulasinya dalam satu halaman. Uraian lengkap ada di buku' + volTxt + '.'));
    }
    var wrap = document.querySelector('.wrap') || document.body;
    var first = wrap.querySelector('section');
    wrap.insertBefore(info, first);

    /* navigasi antarsimulasi dalam bab, berikut latihan dan ringkasan */
    var nav = el('div', 'fl-nav');
    if (mode === 'sim') {
      var k = ch.sims.indexOf(sim);
      if (k > 0) { var p = el('button', 'fl-btn', '‹ SIM ' + ch.sims[k - 1].code); p.onclick = function () { go(simUrl(ch.sims[k - 1])); }; nav.appendChild(p); }
      if (k < ch.sims.length - 1) { var n = el('button', 'fl-btn', 'SIM ' + ch.sims[k + 1].code + ' ›'); n.onclick = function () { go(simUrl(ch.sims[k + 1])); }; nav.appendChild(n); }
    }
    if (mode !== 'latihan' && ch.quiz) { var l = el('button', 'fl-btn', 'Latihan ' + ch.n); l.onclick = function () { go('bab' + String(ch.n).padStart(2, '0') + '.html?mode=latihan'); }; nav.appendChild(l); }
    if (mode !== 'bab') { var b = el('button', 'fl-btn', 'Ringkasan Bab ' + ch.n); b.onclick = function () { go('bab' + String(ch.n).padStart(2, '0') + '.html?mode=bab'); }; nav.appendChild(b); }
    var home = el('button', 'fl-btn', 'Beranda'); home.onclick = function () { go('../index.html#' + homeHash + ch.n); }; nav.appendChild(home);
    wrap.appendChild(nav);
    window.scrollTo(0, 0);
  });
})();
