/* ==========================================================================
   수리탐구 사직직영점 홈페이지 — 설정 파일

   이 파일의 값을 고치면 모든 화면에 한꺼번에 반영됩니다.
   고칠 때는 따옴표(' ')와 줄 끝의 쉼표(,)를 지우지 않도록 합니다.
   ========================================================================== */

window.SITE_CONFIG = {

  /* 1. 버튼과 링크의 도착지 — 주소는 화면마다 적지 않고 여기 한 곳에만 둔다
        값을 '' 로 비워 두면 그 링크는 화면에 나오지 않는다. 주소를 넣으면 다시 나온다. */
  links: {
    reserve: 'https://edu.suritamgu.co.kr/',                      // "설명회 예약" 버튼
    parents: 'https://edu.suritamgu.co.kr/',                      // 머리의 "학부모 서비스" 버튼
    consult: 'https://edu.suritamgu.co.kr/course-enrollment',     // "입학 상담" 버튼
    privacy: 'https://edu.suritamgu.co.kr/privacy?branch=sajik',  // 바닥의 "개인정보 처리방침"
    kakao:   'https://pf.kakao.com/_bxovxon/chat',                // 오시는 길의 "카카오톡 상담"
    geomdan: ''                                                   // 바닥의 "수리탐구 검단직영점" (지금은 비워 둠 = 링크 없음)
  },

  /* 2. 광고 주소에 붙어 들어온 utm_ 값을 "설명회 예약" 도착 주소에 이어 붙인다.
        끄려면 true 를 false 로 바꾼다. (utm_ 로 시작하는 값만 넘기고 그 밖의 값은 넘기지 않는다) */
  utmPassThrough: true,

  /* 3. 11월 설명회 랜딩의 그림 "경시 → 누테"
        그림 파일(가로 16 : 세로 10, 1600×1000px 이상)을 아래 src 경로에 올린 뒤
        show 를 true 로 바꾸면 "이 설명회에서 다루는 것" 아래에 나타난다.
        false 인 동안에는 그림 자리가 통째로 빠진다. */
  landingFigure: {
    show: false,
    src: '/assets/images/site/seminar-2026-11-figure.png',
    alt: ''
  },

  /* 4. 설명회가 끝난 뒤 랜딩에 보이는 안내 문구 (종료 시각은 news.js 의 end 값) */
  seminarEndedText: '이 설명회는 종료되었습니다.'

};
