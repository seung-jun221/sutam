// config/supabase.js
// Supabase 설정 및 API 연결

// ⚠️ 실제 사용시 이 값들을 변경해야 합니다
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // https://your-project.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 공개 익명 키

// Supabase 클라이언트 초기화
let supabase = null;

// Supabase 초기화 함수
export function initializeSupabase() {
  try {
    if (typeof window.supabase === 'undefined') {
      console.error('Supabase 라이브러리가 로드되지 않았습니다.');
      return false;
    }

    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    console.log('✅ Supabase 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ Supabase 연결 실패:', error);
    return false;
  }
}

// Supabase 클라이언트 반환
export function getSupabase() {
  if (!supabase) {
    console.warn(
      'Supabase가 초기화되지 않았습니다. initializeSupabase()를 먼저 호출하세요.'
    );
    return null;
  }
  return supabase;
}

// API 헬퍼 클래스
export class MathMorningAPI {
  constructor() {
    this.supabase = getSupabase();
  }

  // ========== 설명회 관련 ==========

  // 설명회 목록 조회
  async getInfoSessions() {
    try {
      const { data, error } = await this.supabase
        .from('info_sessions')
        .select('*')
        .eq('status', 'active')
        .gte('session_date', new Date().toISOString())
        .order('session_date', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('설명회 조회 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 설명회 예약
  async bookInfoSession(bookingData) {
    try {
      // 정원 확인
      const { data: session } = await this.supabase
        .from('info_sessions')
        .select('capacity, current_count')
        .eq('id', bookingData.session_id)
        .single();

      if (session && session.current_count >= session.capacity) {
        return { success: false, error: '정원이 마감되었습니다.' };
      }

      // 예약 생성
      const { data, error } = await this.supabase
        .from('info_session_bookings')
        .insert([bookingData])
        .select();

      if (error) throw error;

      // 현재 인원 수 업데이트
      if (session) {
        await this.supabase
          .from('info_sessions')
          .update({ current_count: session.current_count + 1 })
          .eq('id', bookingData.session_id);
      }

      return { success: true, data };
    } catch (error) {
      console.error('설명회 예약 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== 진단검사 관련 ==========

  // 진단검사 목록 조회
  async getDiagnosticTests() {
    try {
      const { data, error } = await this.supabase
        .from('diagnostic_tests')
        .select('*')
        .eq('is_active', true)
        .order('test_name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('진단검사 조회 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 진단검사 결과 제출
  async submitDiagnosticResult(resultData) {
    try {
      const { data, error } = await this.supabase
        .from('diagnostic_results')
        .insert([
          {
            ...resultData,
            submitted_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('진단검사 제출 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 성적 조회
  async getTestResults(name, phone) {
    try {
      const { data, error } = await this.supabase
        .from('diagnostic_results')
        .select(
          `
                    *,
                    diagnostic_tests(test_name, test_type)
                `
        )
        .eq('student_name', name)
        .eq('phone', phone)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('성적 조회 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== 컨설팅 관련 ==========

  // 컨설팅 신청
  async requestConsultation(consultationData) {
    try {
      const { data, error } = await this.supabase
        .from('consultations')
        .insert([consultationData])
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('컨설팅 신청 오류:', error);
      return { success: false, error: error.message };
    }
  }
}

// 전역 API 인스턴스 (나중에 사용)
export let api = null;

// API 초기화 함수
export function initializeAPI() {
  if (initializeSupabase()) {
    api = new MathMorningAPI();
    console.log('✅ API 초기화 완료');
    return true;
  }
  return false;
}

// 알림 표시 함수
export function showNotification(message, type = 'success') {
  console.log(`[${type.toUpperCase()}] ${message}`);

  // 나중에 실제 알림 UI와 연결
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
