export default [
  { heading: '설정' },
  {
    title: '계정관리',
    icon: { icon: 'mdi-account-key-outline' },
    to: 'apps-account-list',

    // 관리자만 메뉴에 보입니다. (라우터 가드도 같은 조건으로 막습니다)
    action: 'manage',
    subject: 'all',
  },
]
