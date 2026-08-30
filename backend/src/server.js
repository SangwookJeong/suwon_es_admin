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

// ⚠️ 안전망: users/attendance/auth 라우트는 아직 asyncHandler 로 감싸지 않았습니다.
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
