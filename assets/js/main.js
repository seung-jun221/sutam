// assets/js/main.js
// 수학의 아침 메인 JavaScript

// 전역 변수
let api = null;
let isSystemReady = false;

// ========== 시스템 초기화 ==========
document.addEventListener('DOMContentLoaded', async function () {
  console.log('🚀 수학의 아침 시스템 시작...');

  // 로딩 화면 표시
  showLoadingScreen();

  try {
    // Supabase 연결 초기화
    await initializeSystem();

    // UI 이벤트 리스너 설정
    setupEventListeners();

    // 시스템 준비 완료
    isSystemReady = true;
    hideLoadingScreen();

    console.log('✅ 시스템 초기화 완료');
    showNotification('시스템이 준비되었습니다!');
  } catch (error) {
    console.error('❌ 시스템 초기화 실패:', error);
    hideLoadingScreen();
    showNotification(
      '시스템 초기화에 실패했습니다. 페이지를 새로고침해주세요.',
      'error'
    );
  }
});

// ========== 시스템 초기화 함수 ==========
async function initializeSystem() {
  // config/supabase.js에서 함수 import (모듈 방식으로 나중에 변경)
  if (typeof initializeAPI === 'function') {
    const success = initializeAPI();
    if (success && typeof api !== 'undefined') {
      window.mathMorningAPI = api;
    }
  }
}

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
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 스크롤 복원
  }
}

function closeAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => {
    modal.style.display = 'none';
  });
  document.body.style.overflow = 'auto';
}

// ========== 학습 여정 단계별 함수 ==========

// 1단계: 설명회 신청
function openInfoSessionModal() {
  if (!isSystemReady) {
    showNotification(
      '시스템이 아직 준비 중입니다. 잠시 후 다시 시도해주세요.',
      'error'
    );
    return;
  }

  showModal('infoSessionModal');
  loadInfoSessions();
}

// 2단계: 진단검사
function openDiagnosticModal() {
  if (!isSystemReady) {
    showNotification(
      '시스템이 아직 준비 중입니다. 잠시 후 다시 시도해주세요.',
      'error'
    );
    return;
  }

  showModal('diagnosticModal');
  loadDiagnosticTests();
}

// 3단계: 성적 조회
function openScoreCheckModal() {
  showModal('scoreCheckModal');
}

// 4단계: 컨설팅 신청
function openConsultingModal() {
  if (!isSystemReady) {
    showNotification(
      '시스템이 아직 준비 중입니다. 잠시 후 다시 시도해주세요.',
      'error'
    );
    return;
  }

  showModal('consultingModal');
}

// 5단계: 수강신청
function openEnrollmentModal() {
  showNotification('컨설팅을 완료하신 후 수강신청이 가능합니다.', 'error');
}

// ========== 데이터 로딩 함수 ==========

// 설명회 목록 로드
async function loadInfoSessions() {
  const container = document.getElementById('infoSessionList');
  if (!container) return;

  container.innerHTML =
    '<div class="loading">설명회 일정을 불러오는 중...</div>';

  try {
    // 임시 데이터 (실제로는 API에서 가져옴)
    const dummyData = [
      {
        id: '1',
        title: '수학의 아침 교육 설명회',
        session_date: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        location: '수학의 아침 본원 (강남구)',
        capacity: 30,
        current_count: 12,
        description:
          '개인 맞춤형 수학 교육 시스템과 진단검사 프로세스를 소개합니다.',
      },
    ];

    displayInfoSessions(dummyData);
  } catch (error) {
    console.error('설명회 로드 오류:', error);
    container.innerHTML =
      '<p style="color: #f44336; text-align: center;">설명회 정보를 불러올 수 없습니다.</p>';
  }
}

// 설명회 목록 표시
function displayInfoSessions(sessions) {
  const container = document.getElementById('infoSessionList');
  if (!container) return;

  if (!sessions || sessions.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #78909c;">예정된 설명회가 없습니다.</p>';
    return;
  }

  let html = '';
  sessions.forEach((session) => {
    const sessionDate = new Date(session.session_date);
    const isAvailable = session.current_count < session.capacity;

    html += `
            <div class="info-card" style="${
              !isAvailable ? 'opacity: 0.6;' : ''
            }">
                <h3>${session.title}</h3>
                <p><strong>일시:</strong> ${sessionDate.toLocaleDateString(
                  'ko-KR'
                )} ${sessionDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })}</p>
                <p><strong>장소:</strong> ${session.location}</p>
                <p><strong>정원:</strong> ${session.current_count}/${
      session.capacity
    }명</p>
                ${session.description ? `<p>${session.description}</p>` : ''}
                <button class="btn" ${
                  !isAvailable ? 'disabled' : ''
                } onclick="bookInfoSession('${
      session.id
    }')" style="margin-top: 15px;">
                    ${isAvailable ? '신청하기' : '마감'}
                </button>
            </div>
        `;
  });

  container.innerHTML = html;
}

// 진단검사 목록 로드
async function loadDiagnosticTests() {
  const container = document.getElementById('diagnosticTestList');
  if (!container) return;

  container.innerHTML =
    '<div class="loading">진단검사 목록을 불러오는 중...</div>';

  try {
    // 임시 데이터
    const dummyData = [
      {
        id: '1',
        test_name: 'MONO',
        question_count: 25,
        time_limit: 90,
        test_type: 'diagnostic',
      },
      {
        id: '2',
        test_name: 'TRI',
        question_count: 25,
        time_limit: 90,
        test_type: 'diagnostic',
      },
    ];

    displayDiagnosticTests(dummyData);
  } catch (error) {
    console.error('진단검사 로드 오류:', error);
    container.innerHTML =
      '<p style="color: #f44336; text-align: center;">진단검사 정보를 불러올 수 없습니다.</p>';
  }
}

// 진단검사 목록 표시
function displayDiagnosticTests(tests) {
  const container = document.getElementById('diagnosticTestList');
  if (!container) return;

  let html = '';
  tests.forEach((test) => {
    html += `
            <div class="info-card">
                <h3>${test.test_name} 진단검사</h3>
                <p><strong>문항 수:</strong> ${test.question_count}문항</p>
                <p><strong>제한 시간:</strong> ${test.time_limit}분</p>
                <p><strong>유형:</strong> ${
                  test.test_type === 'diagnostic'
                    ? '입학 진단검사'
                    : '레벨테스트'
                }</p>
                <button class="btn" onclick="startDiagnosticTest('${
                  test.id
                }')" style="margin-top: 15px;">
                    시험 시작
                </button>
            </div>
        `;
  });

  container.innerHTML = html;
}

// ========== 액션 함수 (임시) ==========
function bookInfoSession(sessionId) {
  showNotification('설명회 예약 기능을 준비 중입니다.', 'error');
}

function startDiagnosticTest(testId) {
  showNotification('진단검사 기능을 준비 중입니다.', 'error');
}

// 성적 조회
async function searchScore() {
  const name = document.getElementById('scoreName')?.value.trim();
  const phone = document.getElementById('scorePhone')?.value.trim();

  if (!name || !phone) {
    showNotification('이름과 연락처를 모두 입력해주세요.', 'error');
    return;
  }

  showNotification('성적 조회 기능을 준비 중입니다.', 'error');
}

// ========== 유틸리티 함수 ==========

// 알림 표시
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

// 페이지 스크롤 애니메이션
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

// 개발용 디버그 함수
function debugSystem() {
  console.log('=== 시스템 상태 ===');
  console.log('시스템 준비:', isSystemReady);
  console.log('API 객체:', api);
  console.log(
    'Supabase:',
    typeof supabase !== 'undefined' ? 'loaded' : 'not loaded'
  );
}
