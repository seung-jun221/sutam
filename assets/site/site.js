/* ==========================================================================
   수리탐구 사직직영점 홈페이지 — 화면 동작

   config.js(설정)와 news.js(소식)를 읽어 화면에 반영한다.
   <head> 에서 바로 실행해 <html> 에 상태 표시를 먼저 붙인다(화면이 깜빡이지 않게).
     js         : 이 스크립트가 돌고 있다 (목록을 다시 그릴 때까지 잠깐 가려 둔다)
     sem-on     : 지금이 설명회 기간이다 (메인·수리탐구·특장점(네 화면)·입학 안내·대표 이력의 버튼, 메인의 설명회 묶음)
     sem-ended  : 이 랜딩의 설명회가 끝났다 (<html data-seminar="소식 id">)
   스크립트가 막힌 환경에서는 HTML 에 적힌 기본 상태와 기본 주소가 그대로 쓰인다.
   ========================================================================== */
(function () {
  var C = window.SITE_CONFIG || {};
  var NEWS = window.SITE_NEWS || [];
  var root = document.documentElement;

  /* '2026-11-09 10:30' (한국 시간) → 시각. 기기 시간대와 상관없이 같은 순간을 가리킨다 */
  function kst(text) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/.exec(String(text || '').trim());
    if (!m) return NaN;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], (+m[4] || 0) - 9, +m[5] || 0);
  }

  var now = Date.now();
  var active = null;   // 지금 기간 중인 설명회
  var byId = {};

  /* 회차 목록(sessions)이 있는 설명회: 공개(show: true) 회차로 날짜(date)·묶음 줄(periodLabel)·종료 시각(end)을 만든다.
     show: false 인 회차는 어디에도 쓰지 않는다. sessions 가 없는 항목은 적힌 값을 그대로 쓴다 */
  function ymd(text) { return String(text || '').trim().slice(0, 10).split('-'); }
  function useSessions(it) {
    if (!it.sessions || !it.sessions.length) return;
    var shown = [], first = null, last = null, days = [], month = '';
    for (var k = 0; k < it.sessions.length; k++) {
      var s = it.sessions[k];
      if (!s || s.show !== true) continue;
      var at = kst(s.start), no = parseInt(s.no, 10);
      shown.push({
        no: s.no, date: s.date, time: s.time,
        soldOut: s.soldOut === true,
        past: !isNaN(at) && now >= at,                              // 시작 시각이 지난 회차: "종료"
        extra: (isNaN(no) ? k + 1 : no) >= it.extraFrom             // 추가 회차 묶음
      });
      if (!isNaN(at)) {
        if (!first || at < first.at) first = { at: at, start: s.start };
        if (!last || at > last.at) last = { at: at, start: s.start };
      }
      /* 앞 회차와 달이 같으면 달을 뺀다: 11월 8일(일), 9일(월) */
      var m = /^(\d+월)\s*/.exec(s.date || '');
      days.push(m && m[1] === month ? s.date.slice(m[0].length) : s.date);
      month = m ? m[1] : '';
    }
    it.shown = shown;
    if (!first) return;
    var a = ymd(first.start), b = ymd(last.start);
    it.date = a.join('.') + (b.join('.') === a.join('.') ? '' :
      '~' + (b[0] !== a[0] ? b.join('.') : b[1] !== a[1] ? b[1] + '.' + b[2] : b[2]));
    it.periodLabel = it.title + ' · ' + days.join(', ');
    it.end = last.start;
  }

  for (var i = 0; i < NEWS.length; i++) {
    var it = NEWS[i];
    useSessions(it);
    var start = kst(it.start), end = kst(it.end);
    it.waiting = it.seminar === true && !isNaN(start) && now < start;   // 시작 전의 설명회: 소식 어디에도 내지 않는다
    it.upcoming = !it.waiting && !isNaN(end) && now < end;              // "예정"에 둘 것
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

  /* utm_ 값은 예약 사이트로 가는 두 버튼("설명회 예약", 마감 회차의 "예약 마감 · 대기 접수")에만 이어 붙인다 */
  function linkFor(kind) {
    var href = (C.links || {})[kind];
    if (!href) return '';
    if ((kind === 'reserve' || kind === 'waitlist') && C.utmPassThrough && utm.length) {
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
           <... data-news="past">      지난 안내 (그 밖의 것)
     start 가 아직 오지 않은 설명회 항목(waiting)은 어느 목록에도 넣지 않는다.              */
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
        if (NEWS[k].waiting) continue;
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

  /* ---------- 랜딩의 일정(회차) 그리기 ----------
     <div data-sessions> 안의 회차 칸을 news.js 의 sessions 가운데 show: true 인 회차로(적힌 순서대로) 다시 그린다.
     HTML 에 적힌 1·2차 두 칸은 스크립트가 꺼진 화면의 기본 글자다.
       추가 회차(extraFrom 번호부터)가 하나라도 있으면 그 묶음 위에 머리글 한 줄(extraNotices 의 extraNoticeKey 값)
       시작 시각이 지난 회차: "종료" 표시
       soldOut 회차: "예약 마감 · 대기 접수" 버튼(config.js links.waitlist, 비면 버튼이 빠진다)
       대기 안내 한 줄(config.js waitlistNote): 버튼이 하나라도 있을 때 첫 버튼 옆(폰은 아래)에 한 번만 */
  function renderSessions(it) {
    var box = document.querySelector('[data-sessions]');
    if (!box) return;
    var list = it.shown || [];
    var wait = linkFor('waitlist');
    var noteText = typeof C.waitlistNote === 'string' ? C.waitlistNote : '';
    var note = document.querySelector('[data-text="waitlistNote"]');   // HTML 에 숨겨 둔 안내 줄
    var frag = document.createDocumentFragment();
    var inExtra = false, col = 0, noted = false;
    for (var k = 0; k < list.length; k++) {
      var s = list[k];
      if (s.extra && !inExtra) {
        inExtra = true;
        col = 0;
        var head = (it.extraNotices || {})[it.extraNoticeKey];
        if (head) frag.appendChild(el('p', 'lp-sessions__extra', head));
      }
      /* 줄의 첫 칸(묶음마다 두 칸씩): 왼쪽 선 없이 새 줄에서 시작한다 */
      var cell = el('div', 'lp-session' + (k > 0 && col % 2 === 0 ? ' lp-session--row' : ''));
      col++;
      cell.appendChild(el('p', 'lp-session__no', s.no));
      cell.appendChild(el('p', 'lp-session__date', s.date));
      cell.appendChild(el('p', 'lp-session__time', s.time));
      var tag = null;
      if (s.past) {
        tag = el('span', 'lp-session__tag', '종료');
      } else if (s.soldOut && wait) {
        tag = el('a', 'lp-session__tag', '예약 마감 · 대기 접수');
        tag.setAttribute('data-go', 'waitlist');
        tag.href = wait;
        tag.target = '_blank';
        tag.rel = 'noopener noreferrer';
      }
      if (tag) {
        var mark = el('div', 'lp-session__mark');
        mark.appendChild(tag);
        if (tag.tagName === 'A' && !noted && noteText) {
          noted = true;
          var p = note || el('p', 'lp-session__note');
          p.textContent = noteText;
          p.hidden = false;
          mark.appendChild(p);
        }
        cell.appendChild(mark);
      }
      frag.appendChild(cell);
    }
    box.textContent = '';
    box.appendChild(frag);
    box.hidden = list.length === 0;
  }

  function setup() {
    /* 소식 목록: 그리다 문제가 생겨도 가려 둔 목록은 반드시 다시 보이게 한다 */
    try {
      if (NEWS.length) renderNews();
    } finally {
      each('[data-news-root]', function (box) { box.setAttribute('data-ready', ''); });
    }

    /* 랜딩의 일정(회차): 그리다 문제가 생기면 HTML 의 기본 글자(1·2차)가 남고, 아래 버튼 처리는 그대로 이어진다 */
    if (pageSeminar && pageSeminar.shown) {
      try { renderSessions(pageSeminar); } catch (e) { /* 기본 글자 그대로 */ }
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
      /* 사이트 밖 주소만 새 탭으로 연다. 사이트 안 주소(설명회 랜딩)는 같은 탭 */
      if (/^https?:\/\//i.test(href)) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      } else {
        a.removeAttribute('target');
        a.removeAttribute('rel');
      }
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

    /* 영상 재생 화면(대표 이력): 화면에 들어올 때 불러온다(첫 로드를 가볍게).
       <div data-video="유튜브 영상 ID"> 안에는 유튜브로 가는 링크가 기본으로 들어 있고, 불러올 때 재생 화면으로 바꾼다.
       data-video-config="설정 이름" 이 있으면 영상 ID 와 영상 아래 문구는 config.js 의 그 값(id·label)을 쓴다.
       스크립트가 꺼진 화면에서는 HTML 에 적힌 링크와 문구가 그대로 남는다 */
    each('[data-video]', function (box) {
      var link = box.querySelector('a[aria-labelledby]');
      var label = link ? document.getElementById(link.getAttribute('aria-labelledby')) : null;
      var conf = C[box.getAttribute('data-video-config')];
      if (conf && conf.id) {
        box.setAttribute('data-video', conf.id);
        if (link) link.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(conf.id);
        if (label && typeof conf.label === 'string' && conf.label) label.textContent = conf.label;
      }
      function load() {
        var frame = document.createElement('iframe');
        frame.src = 'https://www.youtube.com/embed/' + encodeURIComponent(box.getAttribute('data-video'));
        frame.title = label ? label.textContent : '';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.allowFullscreen = true;
        box.textContent = '';
        box.appendChild(frame);
      }
      if (!('IntersectionObserver' in window)) { load(); return; }
      var seen = new IntersectionObserver(function (entries) {
        for (var k = 0; k < entries.length; k++) {
          if (entries[k].isIntersecting) { seen.disconnect(); load(); return; }
        }
      }, { rootMargin: '200px 0px' });
      seen.observe(box);
    });

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

  /* 버튼 클릭 측정: "설명회 예약"(랜딩), "입학 상담". 홈페이지 화면의 "11월 설명회 안내"(data-go="seminar")와
     랜딩 일정의 "예약 마감 · 대기 접수"(data-go="waitlist")는 보내지 않는다.
     (대기 접수를 "설명회 예약"과 같이 세려면 아래 return 줄 앞에 if (kind === 'waitlist') kind = 'reserve'; 한 줄을 넣는다) */
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
