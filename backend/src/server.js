require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { requireAuth } = require('./middleware/auth')

const authRoutes = require('./routes/auth.routes')
const usersRoutes = require('./routes/users.routes')
const studentsRoutes = require('./routes/students.routes')
const attendanceRoutes = require('./routes/attendance.routes')
const accountsRoutes = require('./routes/accounts.routes')
const studentAttendanceRoutes = require('./routes/student-attendance.routes')

const app = express()

// 프록시 2단계를 거쳐 들어옵니다: DSM 역방향 프록시 → 프론트 nginx → backend.
// 이 설정이 없으면 req.ip 가 nginx 컨테이너 IP 로 잡혀서 로그인 속도 제한이
// 모든 사용자에게 하나의 카운터로 적용됩니다(= 한 명이 막히면 전원이 막힘).
// backend 는 포트를 발행하지 않아 nginx 를 통해서만 도달하므로 이 신뢰는 안전합니다.
app.set('trust proxy', 2)

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))

app.use('/auth', authRoutes)
app.use('/apps/users', requireAuth, usersRoutes)

// ⚠️ '/apps/students/attendance' 를 '/apps/students' 보다 먼저 마운트해야 합니다.
//    순서가 바뀌면 students.routes 가 먼저 잡아 404 가 납니다.
app.use('/apps/students/attendance', requireAuth, studentAttendanceRoutes)
app.use('/apps/students', requireAuth, studentsRoutes)
app.use('/apps/attendance', requireAuth, attendanceRoutes)

// 계정관리. 본인 비밀번호 변경만 일반 사용자에게 열려 있고
// 나머지는 라우터 내부에서 requireAdmin 으로 막습니다.
app.use('/apps/accounts', requireAuth, accountsRoutes)

// ⚠️ 안전망: users/attendance 라우트는 아직 asyncHandler 로 감싸지 않았습니다.
//    (auth/login 과 students 는 감쌌습니다. 각각 미인증 노출 경로 / 신규 코드입니다)
//    그쪽에서 DB 오류가 나면 응답은 못 하지만(요청 타임아웃), 최소한
//    프로세스가 죽어 다른 요청까지 끊기는 일은 막습니다.
process.on('unhandledRejection', err => {
  console.error('[unhandledRejection]', err)
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal Server Error' })
})

const port = process.env.PORT || 4000

app.listen(port, () => console.log(`suwon-es-admin backend listening on :${port}`))
