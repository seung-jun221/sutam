/* ==========================================================================
   수리탐구 사직직영점 홈페이지 — 화면 동작

   config.js(설정)와 news.js(소식)를 읽어 화면에 반영한다.
   <head> 에서 바로 실행해 <html> 에 상태 표시를 먼저 붙인다(화면이 깜빡이지 않게).
     sem-on     : 지금이 설명회 기간이다 (메인·수리탐구의 버튼과 설명회 묶음)
     sem-ended  : 이 랜딩의 설명회가 끝났다 (<html data-seminar="소식 id">)
   스크립트가 막힌 환경에서는 HTML 에 적힌 기본 상태가 그대로 보인다.
   ========================================================================== */
(function () {
  var C = window.SITE_CONFIG || {};
  var NEWS = window.SITE_NEWS || [];
  var root = document.documentElement;

  /* '2026-11-02 10:30' (한국 시간) → 시각. 기기 시간대와 상관없이 같은 순간을 가리킨다 */
  function kst(text) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/.exec(String(text || '').trim());
    if (!m) return NaN;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], (+m[4] || 0) - 9, +m[5] || 0);
  }

  var now = Date.now();
  var active = null;   // 지금 기간 중인 설명회
  var byId = {};

  for (var i = 0; i < NEWS.length; i++) {
    var it = NEWS[i];
    var start = kst(it.start), end = kst(it.end);
    it.upcoming = !isNaN(end) && now < end;              // "예정"에 둘 것
    it.ended = !isNaN(end) && now >= end;
    it.on = it.seminar === true && !isNaN(end) && now < end && (isNaN(start) || now >= start);
    if (it.on && !active) active = it;
    if (it.id) byId[it.id] = it;
  }

  if (active) root.classList.add('sem-on');
  var pageSeminar = byId[root.getAttribute('data-seminar')];
  if (pageSeminar && pageSeminar.ended) root.classList.add('sem-ended');

  /* 들어올 때 주소에 붙어 온 utm_ 값만 기억한다(이 탭을 닫으면 지워진다) */
  var UTM_KEY = 'site_utm';
  var UTM_NAME = /^utm_[a-z0-9_]{1,40}$/i;
  function readUtm() {
    var found = [];
    try {
      new URLSearchParams(location.search).forEach(function (value, key) {
        if (UTM_NAME.test(key)) found.push([key, String(value).slice(0, 150)]);
      });
      if (found.length) {
        sessionStorage.setItem(UTM_KEY, JSON.stringify(found));
        return found;
      }
      var saved = JSON.parse(sessionStorage.getItem(UTM_KEY) || '[]');
      for (var k = 0; k < saved.length; k++) {
        if (saved[k] && UTM_NAME.test(saved[k][0])) found.push([saved[k][0], String(saved[k][1]).slice(0, 150)]);
      }
    } catch (e) { /* 저장소가 막힌 환경: 이번 주소에 붙은 값만 쓴다 */ }
    return found;
  }
  var utm = readUtm();

  function linkFor(kind) {
    var href = (C.links || {})[kind];
    if (!href) return '';
    if (kind === 'reserve' && C.utmPassThrough && utm.length) {
      try {
        var u = new URL(href);
        for (var k = 0; k < utm.length; k++) u.searchParams.set(utm[k][0], utm[k][1]);
        href = u.toString();
      } catch (e) { /* 주소가 이상하면 그대로 둔다 */ }
    }
    return href;
  }

  function each(selector, fn) {
    var list = document.querySelectorAll(selector);
    for (var k = 0; k < list.length; k++) fn(list[k]);
  }

  function setup() {
    /* 버튼·링크의 도착지: <a data-go="reserve"> 처럼 종류만 적혀 있고 주소는 설정 파일에서 온다 */
    each('a[data-go]', function (a) {
      var href = linkFor(a.getAttribute('data-go'));
      if (!href) return;
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

    /* 설정 파일의 문구가 들어갈 자리 */
    each('[data-text]', function (el) {
      var text = C[el.getAttribute('data-text')];
      if (typeof text === 'string') el.textContent = text;
    });

    /* 설명회 기간의 묶음 글자(메인 첫 화면) */
    if (active) {
      each('[data-seminar-text]', function (el) {
        var text = active[el.getAttribute('data-seminar-text')];
        if (typeof text === 'string') el.textContent = text;
      });
      each('a[data-seminar-link]', function (a) { if (active.link) a.href = active.link; });
    }

    /* 랜딩의 그림: 설정에서 켠 때에만 넣는다 */
    var figure = C.landingFigure || {};
    if (figure.show && figure.src) {
      each('[data-figure="landing"]', function (box) {
        var img = document.createElement('img');
        img.src = figure.src;
        img.alt = figure.alt || '';
        img.width = 1600; img.height = 1000;
        img.decoding = 'async';
        box.appendChild(img);
        box.hidden = false;
      });
    }
  }

  /* 버튼 클릭 측정: "설명회 예약", "입학 상담" */
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[data-go]') : null;
    if (!a || !window.SiteTrack) return;
    var kind = a.getAttribute('data-go');
    if (kind !== 'reserve' && kind !== 'consult') return;
    window.SiteTrack.click(kind, root.getAttribute('data-page') || '', a.getAttribute('data-pos') || '');
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();

  window.Site = { news: NEWS, activeSeminar: active, linkFor: linkFor, kst: kst };
})();
