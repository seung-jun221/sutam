/* ==========================================================================
   수리탐구 홈페이지 — 공통 여섯 화면의 지점 표시
   (수리탐구 · 특장점 · 누적테스트 · 독해력 트레이닝 · 메타인지 트레이닝 · 대표 이력)

   주소 끝에 ?branch=geomdan 이 있으면 검단으로, 없으면 지금 그대로 사직으로 보인다.
   브라우저 저장소와 쿠키는 쓰지 않는다(검단을 보던 사람이 사직 화면으로 넘어간 뒤에도 검단으로 남지 않게).

   이 파일은 config.js·news.js 자리에서 부르고, 그 둘을 대신 불러 준다.
     사직: /assets/site/config.js → /assets/site/news.js
     검단: /assets/site/geomdan/config.js → /assets/site/geomdan/news.js
   두 파일은 site.js 보다 먼저, 차례대로 읽혀야 하므로 document.write 로 넣는다
   (<head> 안에서 파싱 중에 쓰는 같은 사이트의 스크립트라 그 자리에서 차례대로 실행된다).

   검단이면 그 밖에
     html 에 br-geomdan 클래스(사직이면 br-sajik) — 짝 요소 .br-s(사직)·.br-g(검단) 가운데 하나만 보인다(site.css)
     html data-page 를 "geomdan-" + 원래 값으로 바꾼다(측정의 page 값만 바뀐다)
     탭 제목 끝의 "| 수리탐구 사직직영점" 을 "| 수리탐구 검단직영점" 으로
     화면 안의 공통 여섯 화면 링크에 ?branch=geomdan 을 붙인다(공통 화면끼리 옮겨 다녀도 검단으로 남게)
   canonical·og 태그는 바꾸지 않는다. 스크립트가 꺼진 화면은 사직으로 보인다.
   ========================================================================== */
(function () {
  var root = document.documentElement;
  var geomdan = /[?&]branch=geomdan(?:&|$)/.test(location.search);
  var COMMON = /^\/(curriculum|features|cumulative-test|reading-training|metacognition-training|ceo-profile)(\.html)?$/;

  root.classList.add(geomdan ? 'br-geomdan' : 'br-sajik');
  var dir = geomdan ? '/assets/site/geomdan/' : '/assets/site/';
  document.write('<script src="' + dir + 'config.js"><\/script><script src="' + dir + 'news.js"><\/script>');
  if (!geomdan) return;

  var page = root.getAttribute('data-page');
  if (page) root.setAttribute('data-page', 'geomdan-' + page);

  function retitle() { document.title = document.title.replace('| 수리탐구 사직직영점', '| 수리탐구 검단직영점'); }
  retitle();

  function relink() {
    retitle();
    var list = document.querySelectorAll('a[href]');
    for (var k = 0; k < list.length; k++) {
      var a = list[k];
      if (a.host !== location.host || !COMMON.test(a.pathname) || /[?&]branch=/.test(a.search)) continue;
      /* 적힌 주소 꼴(/curriculum 같은 상대 주소)은 그대로 두고 ?branch=geomdan 만 # 앞에 붙인다 */
      var href = a.getAttribute('href'), cut = href.indexOf('#');
      var base = cut < 0 ? href : href.slice(0, cut), hash = cut < 0 ? '' : href.slice(cut);
      a.setAttribute('href', base + (base.indexOf('?') < 0 ? '?' : '&') + 'branch=geomdan' + hash);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', relink);
  else relink();
})();
