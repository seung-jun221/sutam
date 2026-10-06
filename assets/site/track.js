/* ==========================================================================
   수리탐구 사직직영점 홈페이지 — 측정 코드 (메타 픽셀 · GA4)

   측정 코드는 이 파일 하나에 모은다. 모든 페이지는 이 파일만 부른다.
   - 페이지를 열면 PageView 를 한 번 보낸다.
   - "설명회 예약", "입학 상담" 버튼을 누르면 아래 EVENTS 의 이름으로 보낸다.
     어느 화면(page)의 어느 자리(position) 버튼인지 값으로 함께 보낸다.
   - 운영 주소(LIVE_HOSTS)에서만 실제로 보낸다. 미리보기 주소나 내 컴퓨터에서 열면
     보내지 않고 브라우저 콘솔에 "[측정 시험]" 으로만 찍는다.
   ========================================================================== */
(function () {
  var PIXEL_ID = '941704082060046';
  var GA_ID = 'G-F5Z2TTYE4X';
  var LIVE_HOSTS = ['suritamgu.co.kr', 'www.suritamgu.co.kr'];

  var EVENTS = {
    reserve: { ga: 'seminar_reserve_click', pixel: 'Lead' },       // "설명회 예약" 클릭
    consult: { ga: 'admission_consult_click', pixel: 'Contact' }   // "입학 상담" 클릭
  };

  var live = LIVE_HOSTS.indexOf(location.hostname) !== -1;

  function note() {
    if (window.console && console.log) {
      console.log.apply(console, ['[측정 시험]'].concat([].slice.call(arguments)));
    }
  }

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      if (live) window.dataLayer.push(arguments);
      else note('GA', [].slice.call(arguments));
    };
  }

  if (live) {
    /* Meta Pixel */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    /* Google Analytics 4 */
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(g);
  } else if (!window.fbq) {
    window.fbq = function () { note('픽셀', [].slice.call(arguments)); };
  }

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
  window.gtag('js', new Date());
  /* 옛 페이지 가운데 GA 설정 값(page_title 등)이 따로 있던 곳은
     이 파일을 부르기 전에 window.SITE_TRACK_GA_CONFIG 에 적어 둔다. 설정은 여기서 한 번만 보낸다 */
  if (window.SITE_TRACK_GA_CONFIG) window.gtag('config', GA_ID, window.SITE_TRACK_GA_CONFIG);
  else window.gtag('config', GA_ID);

  window.SiteTrack = {
    live: live,
    gaId: GA_ID,
    /* kind: 'reserve' | 'consult', page: 화면 이름, position: 버튼 자리 */
    click: function (kind, page, position) {
      var e = EVENTS[kind];
      if (!e) return;
      var params = { page: page || '', position: position || '' };
      window.gtag('event', e.ga, params);
      window.fbq('track', e.pixel, params);
    }
  };
})();
