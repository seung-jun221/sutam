// assets/js/main.js
// i.study 수리탐구 메인 JavaScript

// 전역 변수
let isSystemReady = false;

// ========== 시스템 초기화 ==========
document.addEventListener('DOMContentLoaded', async function () {
  console.log('🚀 i.study 수리탐구 시스템 시작...');

  // 로딩 화면 표시
  showLoadingScreen();

  try {
    // UI 이벤트 리스너 설정
    setupEventListeners();

    // 폼 이벤트 설정
    setupFormHandlers();

    // 시스템 준비 완료
    isSystemReady = true;
    hideLoadingScreen();

    console.log('✅ 시스템 초기화 완료');
  } catch (error) {
    console.error('❌ 시스템 초기화 실패:', error);
    hideLoadingScreen();
    showNotification('페이지 로드 중 오류가 발생했습니다.', 'error');
  }
});

// ========== UI 이벤트 리스너 설정 ==========
function setupEventListeners() {
  console.log('🎯 이벤트 리스너 설정 중...');

  // 모달 외부 클릭시 닫기
  window.addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target.id);
    }
  });

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  });

  console.log('✅ 이벤트 리스너 설정 완료');
}

// ========== 폼 이벤트 핸들러 설정 ==========
function setupFormHandlers() {
  // 설명회 예약 폼
  const infoSessionForm = document.getElementById('infoSessionForm');
  if (infoSessionForm) {
    infoSessionForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleInfoSessionSubmit(this);
    });
  }

  // 진단검사 신청 폼
  const diagnosticForm = document.getElementById('diagnosticForm');
  if (diagnosticForm) {
    diagnosticForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleDiagnosticSubmit(this);
    });
  }

  // 수강신청 상담 폼
  const enrollmentForm = document.getElementById('enrollmentForm');
  if (enrollmentForm) {
    enrollmentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleEnrollmentSubmit(this);
    });
  }
}

// ========== 폼 제출 핸들러 ==========
function handleInfoSessionSubmit(form) {
  showNotification('설명회 예약이 완료되었습니다. 곧 연락드리겠습니다.');
  closeModal('infoSessionModal');
  form.reset();
}

function handleDiagnosticSubmit(form) {
  showNotification(
    '진단검사 신청이 완료되었습니다. 검사 링크를 문자로 발송해드리겠습니다.'
  );
  closeModal('diagnosticModal');
  form.reset();
}

function handleEnrollmentSubmit(form) {
  showNotification(
    '상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.'
  );
  closeModal('enrollmentModal');
  form.reset();
}

// ========== 로딩 화면 관리 ==========
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const mainContainer = document.getElementById('mainContainer');

  if (loadingScreen) loadingScreen.style.display = 'flex';
  if (mainContainer) mainContainer.style.display = 'none';
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const mainContainer = document.getElementById('mainContainer');

  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 300);
  }

  if (mainContainer) {
    mainContainer.style.display = 'block';
    setTimeout(() => {
      mainContainer.style.opacity = '1';
    }, 100);
  }
}

// ========== 모달 관리 ==========
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    console.log(`모달 열림: ${modalId}`);
  } else {
    console.error(`모달을 찾을 수 없습니다: ${modalId}`);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    console.log(`모달 닫힘: ${modalId}`);
  }
}

function closeAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => {
    modal.style.display = 'none';
  });
  document.body.style.overflow = 'auto';
}

// ========== 알림 표시 ==========
function showNotification(message, type = 'success') {
  console.log(`[${type.toUpperCase()}] ${message}`);

  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.style.display = 'block';

    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
}

// ========== 페이지 스크롤 애니메이션 ==========
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

// ========== 개발용 디버그 함수 ==========
function debugSystem() {
  console.log('=== 시스템 상태 ===');
  console.log('시스템 준비:', isSystemReady);
  console.log('현재 페이지:', window.location.pathname);
  console.log('모달 개수:', document.querySelectorAll('.modal').length);
  console.log('폼 개수:', document.querySelectorAll('form').length);
}

// 전역 함수로 노출 (다른 페이지에서 사용 가능)
window.openModal = openModal;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.scrollToSection = scrollToSection;
