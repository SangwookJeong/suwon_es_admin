export default [
  {
    title: '설정',
    icon: { icon: 'mdi-cog-outline' },
    action: 'manage',
    subject: 'all',
    children: [
      { title: '계정관리', to: 'apps-account-list', action: 'manage', subject: 'all' },
    ],
  },
]
