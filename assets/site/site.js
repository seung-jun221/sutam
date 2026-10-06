/* ==========================================================================
   수리탐구 사직직영점 홈페이지 — 화면 동작

   config.js(설정)와 news.js(소식)를 읽어 화면에 반영한다.
   <head> 에서 바로 실행해 <html> 에 상태 표시를 먼저 붙인다(화면이 깜빡이지 않게).
     js         : 이 스크립트가 돌고 있다 (목록을 다시 그릴 때까지 잠깐 가려 둔다)
     sem-on     : 지금이 설명회 기간이다 (메인·수리탐구의 버튼과 설명회 묶음)
     sem-ended  : 이 랜딩의 설명회가 끝났다 (<html data-seminar="소식 id">)
   스크립트가 막힌 환경에서는 HTML 에 적힌 기본 상태와 기본 주소가 그대로 쓰인다.
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

  root.classList.add('js');
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

  /* ---------- 소식 목록 그리기 ----------
     HTML 의 기본 목록과 같은 모양으로 news.js 의 항목을 다시 그린다.
       <... data-news-root>            목록 전체를 감싼 곳
         <section data-news-section>   항목이 하나도 없으면 구획째 숨긴다
           <... data-news="upcoming">  예정 (end 가 아직 지나지 않은 것)
           <... data-news="past">      지난 안내 (그 밖의 것)                              */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function arrow() {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 's-arrow');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M5 12h14M13 6l6 6-6 6');
    svg.appendChild(path);
    return svg;
  }
  function upcomingCard(it) {
    var card = el('article', 'nw-card');
    card.appendChild(el('p', 'nw-card__date', it.date));
    card.appendChild(el('h3', 'nw-card__title', it.title));
    if (it.desc) card.appendChild(el('p', 'nw-card__desc', it.desc));
    if (it.link) {
      var more = el('a', 'nw-card__more', '자세히 보기');
      more.href = it.link;
      more.appendChild(arrow());
      card.appendChild(more);
    }
    return card;
  }
  function pastItem(it) {
    var li = el('li', 'nw-item' + (it.photo ? ' nw-item--photo' : ''));
    li.appendChild(el('p', 'nw-item__date', it.date));
    var body = el('div', 'nw-item__body');
    var title = el('p', 'nw-item__title');
    if (it.link) {
      var a = el('a', '', it.title);
      a.href = it.link;
      title.appendChild(a);
    } else {
      title.textContent = it.title;
    }
    body.appendChild(title);
    if (it.desc) body.appendChild(el('p', 'nw-item__desc', it.desc));
    li.appendChild(body);
    if (it.photo) {
      var img = el('img', 'nw-item__photo');
      img.src = it.photo;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      li.appendChild(img);
    }
    return li;
  }
  /* 메인의 "최근 소식" 한 줄: 예정은 제목만, 지난 안내는 제목과 설명을 이어 쓴다(시안) */
  function recentItem(it) {
    var li = el('li', 'mn-news__item');
    var meta = el('p', 'mn-news__meta');
    if (it.upcoming) {
      meta.appendChild(el('b', '', '예정'));
      meta.appendChild(document.createTextNode(' · ' + it.date));
    } else {
      meta.textContent = '지난 안내 · ' + it.date;
    }
    li.appendChild(meta);
    var text = it.upcoming || !it.desc ? it.title : it.title + ' ' + it.desc;
    var title = el('p', 'mn-news__title');
    if (it.link) {
      var a = el('a', '', text);
      a.href = it.link;
      title.appendChild(a);
    } else {
      title.textContent = text;
    }
    li.appendChild(title);
    return li;
  }
  function renderNews() {
    each('[data-news]', function (box) {
      var kind = box.getAttribute('data-news');   // upcoming | past | recent(위에서 3건)
      var list = [];
      for (var k = 0; k < NEWS.length; k++) {
        if (kind === 'recent') { if (list.length < 3) list.push(NEWS[k]); }
        else if ((kind === 'upcoming') === (NEWS[k].upcoming === true)) list.push(NEWS[k]);
      }
      box.textContent = '';
      for (var n = 0; n < list.length; n++) {
        box.appendChild(kind === 'upcoming' ? upcomingCard(list[n]) : kind === 'recent' ? recentItem(list[n]) : pastItem(list[n]));
      }
      var section = box.closest ? box.closest('[data-news-section]') : null;
      if (section) section.hidden = list.length === 0;
    });
  }

  function setup() {
    /* 소식 목록: 그리다 문제가 생겨도 가려 둔 목록은 반드시 다시 보이게 한다 */
    try {
      if (NEWS.length) renderNews();
    } finally {
      each('[data-news-root]', function (box) { box.setAttribute('data-ready', ''); });
    }

    /* 버튼·링크의 도착지: HTML 에 적힌 기본 주소를 설정 파일의 값으로 덮는다.
       설정에서 값을 비워 둔 링크는 내지 않는다(주소를 넣으면 다시 나온다) */
    each('a[data-go]', function (a) {
      var kind = a.getAttribute('data-go');
      var href = linkFor(kind);
      if (!href) {
        if (C.links && kind in C.links) { a.hidden = true; a.removeAttribute('href'); }
        return;
      }
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.hidden = false;
    });

    /* 설정 파일의 문구가 들어갈 자리 */
    each('[data-text]', function (el) {
      var text = C[el.getAttribute('data-text')];
      if (typeof text === 'string') el.textContent = text;
    });

    /* 바닥의 측정 안내 한 줄: 글자는 설정 파일에, 자리는 여기 한 곳에 둔다("개인정보 처리방침" 줄 아래, 사업자 정보 위) */
    if (typeof C.footerNotice === 'string' && C.footerNotice) {
      each('.s-footer__top', function (top) {
        top.parentNode.insertBefore(el('p', 's-footer__notice', C.footerNotice), top.nextSibling);
      });
    }

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
