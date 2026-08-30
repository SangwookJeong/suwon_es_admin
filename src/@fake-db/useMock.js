// true면 교사/출결/로그인 목업(fake-db)을 사용하고, false면 실제 백엔드 API를 사용합니다.
// 기본값: dev 모드(.env.development)는 true, build/production 모드(.env.production)는 false
export const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
