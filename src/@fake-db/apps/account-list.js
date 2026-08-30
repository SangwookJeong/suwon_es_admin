import mock from '@/@fake-db/mock'
import { useMock } from '@/@fake-db/useMock'

if (useMock)
  registerAccountListMock()

function registerAccountListMock() {
// 계정관리 화면용 더미데이터.
// 실제 백엔드(backend/src/routes/accounts.routes.js)와 같은 응답 형태를 흉내냅니다.
// ⚠️ 목업에는 비밀번호 검증이 없습니다. 흐름 확인용입니다.
  const accounts = [
    { id: 1, username: 'seungjin', email: 'admin@demo.com', role: 'admin', teacherId: 1, teacherName: '이승진', createdAt: '2026-01-05 09:12:00' },
    { id: 2, username: 'sangouk', email: 'client@demo.com', role: 'client', teacherId: 7, teacherName: '정상욱', createdAt: '2026-02-11 14:30:00' },
    { id: 3, username: 'heebong', email: null, role: 'client', teacherId: 2, teacherName: '이희봉', createdAt: '2026-03-02 10:05:00' },
  ]

  const teacherOptions = [
    { id: 1, fullName: '이승진', department: '교무팀' },
    { id: 2, fullName: '이희봉', department: '교무팀' },
    { id: 7, fullName: '정상욱', department: '상담팀' },
    { id: 9, fullName: '김보라', department: '초등1반' },
  ]

  const idFromUrl = url => Number(url.match(/\/apps\/accounts\/(\d+)/)?.[1])
  const adminCount = () => accounts.filter(a => a.role === 'admin').length

  // 👉 연결할 교사 목록 (/:id 보다 먼저 등록)
  mock.onGet('/apps/accounts/teacher-options').reply(() => [200, { teachers: teacherOptions }])

  // 👉 본인 비밀번호 변경 (/:id 보다 먼저 등록)
  mock.onPut('/apps/accounts/me/password').reply(config => {
    const { currentPassword, newPassword } = JSON.parse(config.data || '{}')

    if (!currentPassword || !newPassword)
      return [400, { errors: { currentPassword: ['현재 비밀번호와 새 비밀번호를 입력하세요'] } }]

    if (String(newPassword).length < 4)
      return [400, { errors: { newPassword: ['비밀번호는 4자 이상이어야 합니다'] } }]

    return [200]
  })

  // 👉 계정 목록
  mock.onGet('/apps/accounts').reply(() => [200, { accounts, total: accounts.length }])

  // 👉 계정 발급
  mock.onPost('/apps/accounts').reply(config => {
    const body = JSON.parse(config.data || '{}')

    if (!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(String(body.username || '')))
      return [400, { errors: { username: ['아이디는 영문 소문자/숫자 3~30자 (., _, - 사용 가능)로 입력하세요'] } }]

    if (String(body.password || '').length < 4)
      return [400, { errors: { password: ['비밀번호는 4자 이상이어야 합니다'] } }]

    if (accounts.some(a => a.username === body.username))
      return [409, { errors: { username: ['이미 사용 중인 아이디입니다'] } }]

    const account = {
      id: Math.max(0, ...accounts.map(a => a.id)) + 1,
      username: body.username,
      email: body.email || null,
      role: body.role || 'client',
      teacherId: body.teacherId || null,
      teacherName: teacherOptions.find(t => t.id === body.teacherId)?.fullName || null,
      createdAt: '2026-08-23 12:00:00',
    }

    accounts.push(account)

    return [201, { account }]
  })

  // 👉 비밀번호 재발급
  mock.onPut(/\/apps\/accounts\/\d+\/password/).reply(config => {
    const { password } = JSON.parse(config.data || '{}')

    if (String(password || '').length < 4)
      return [400, { errors: { password: ['비밀번호는 4자 이상이어야 합니다'] } }]

    return accounts.some(a => a.id === idFromUrl(config.url))
      ? [200]
      : [404, { errors: { password: ['계정을 찾을 수 없습니다'] } }]
  })

  // 👉 계정 수정 (권한 / 연결 교사)
  mock.onPut(/\/apps\/accounts\/\d+$/).reply(config => {
    const account = accounts.find(a => a.id === idFromUrl(config.url))
    if (!account) return [404, { errors: { username: ['계정을 찾을 수 없습니다'] } }]

    const body = JSON.parse(config.data || '{}')

    if (body.role && account.role === 'admin' && body.role !== 'admin' && adminCount() <= 1)
      return [400, { errors: { role: ['마지막 관리자의 권한은 변경할 수 없습니다'] } }]

    if (body.role) account.role = body.role
    if ('teacherId' in body) {
      account.teacherId = body.teacherId || null
      account.teacherName = teacherOptions.find(t => t.id === body.teacherId)?.fullName || null
    }

    return [200, { account }]
  })

  // 👉 계정 삭제
  mock.onDelete(/\/apps\/accounts\/\d+/).reply(config => {
    const id = idFromUrl(config.url)
    const index = accounts.findIndex(a => a.id === id)
    if (index < 0) return [404, { errors: { username: ['계정을 찾을 수 없습니다'] } }]

    if (accounts[index].role === 'admin' && adminCount() <= 1)
      return [400, { errors: { username: ['마지막 관리자 계정은 삭제할 수 없습니다'] } }]

    accounts.splice(index, 1)

    return [200]
  })
}
