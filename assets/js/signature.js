// assets/js/suritamgu-signature.js
// 수리탐구 시그니처 과정 페이지 전용 JavaScript

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function () {
  console.log('📚 수리탐구 시그니처 페이지 초기화');

  // 탭 전환 기능 초기화
  initializeTabs();

  // 스크롤 애니메이션 초기화
  initializeScrollAnimations();
});

// ========== 탭 전환 기능 ==========
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tabButtons.length === 0) return;

  tabButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const targetTab = this.getAttribute('data-tab');

      // 모든 탭 버튼과 컨텐츠 비활성화
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      // 클릭한 탭 활성화
      this.classList.add('active');
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// ========== 스크롤 애니메이션 ==========
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');

        // 순차적 애니메이션을 위한 지연
        const children = entry.target.querySelectorAll(
          '.concept-item, .step-item, .connection-item'
        );
        children.forEach((child, index) => {
          setTimeout(() => {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          }, index * 100);
        });
      }
    });
  }, observerOptions);

  // 애니메이션 적용할 요소들
  const animatedSections = document.querySelectorAll(
    '.feature-card, .structure-card, .concept-flow, .three-steps'
  );

  animatedSections.forEach((section) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });

  // 개별 아이템 초기 스타일
  const animatedItems = document.querySelectorAll(
    '.concept-item, .step-item, .connection-item'
  );

  animatedItems.forEach((item) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  });
}

// ========== 수리탐구 전용 모달 함수 ==========
// main.js의 showModal과 closeModal 함수를 사용하되,
// 수리탐구 페이지에서 호출할 때를 위한 래퍼 함수

function openInfoSessionModal() {
  if (typeof showModal === 'function') {
    showModal('infoSessionModal');
  }
}

function openDiagnosticModal() {
  if (typeof showModal === 'function') {
    showModal('diagnosticModal');
  }
}

// ========== 폼 제출 처리 ==========
// main.js에 없는 경우를 대비한 폼 처리
document.addEventListener('DOMContentLoaded', function () {
  const infoSessionForm = document.getElementById('infoSessionForm');
  if (infoSessionForm) {
    infoSessionForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (typeof showNotification === 'function') {
        showNotification('설명회 예약이 완료되었습니다. 곧 연락드리겠습니다.');
      } else {
        alert('설명회 예약이 완료되었습니다. 곧 연락드리겠습니다.');
      }

      if (typeof closeModal === 'function') {
        closeModal('infoSessionModal');
      }
      this.reset();
    });
  }

  const diagnosticForm = document.getElementById('diagnosticForm');
  if (diagnosticForm) {
    diagnosticForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (typeof showNotification === 'function') {
        showNotification(
          '진단검사 신청이 완료되었습니다. 검사 링크를 문자로 발송해드리겠습니다.'
        );
      } else {
        alert(
          '진단검사 신청이 완료되었습니다. 검사 링크를 문자로 발송해드리겠습니다.'
        );
      }

      if (typeof closeModal === 'function') {
        closeModal('diagnosticModal');
      }
      this.reset();
    });
  }
});

// ========== 교재 미리보기 인터랙션 ==========
function enhancePreviewTabs() {
  const tabs = document.querySelectorAll('.tab-button');

  tabs.forEach((tab) => {
    tab.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px)';
    });

    tab.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)';
    });
  });
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', enhancePreviewTabs);

// ========== 디버깅용 ==========
console.log('✅ 수리탐구 시그니처 JavaScript 로드 완료');
