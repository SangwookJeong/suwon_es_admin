// 목업(더미) 데이터 등록.
// ℹ️ 교사/성도 관리, 로그인 목업은 VITE_USE_MOCK 값에 따라 각 파일 내부에서 켜고 끕니다.
//    (false면 mock.onAny().passThrough() 를 통해 실제 백엔드로 요청이 전달됩니다)
import './apps/account-list'
import './apps/student-attendance'
import './apps/student-list'
import './apps/user-list'
import './jwt'
import mock from './mock'

// 매칭되지 않은 요청은 실제 네트워크로 통과시킵니다.
mock.onAny().passThrough()
