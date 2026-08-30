const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const pool = require('../db')
const { abilitiesForRole } = require('../utils/abilities')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

// 로그인 브루트포스 차단.
// 인터넷에 노출되는 순간 비밀번호를 무제한으로 시도할 수 있게 되므로 반드시 필요합니다.
// IP 당 15분에 10회. 성공한 로그인은 카운트에서 빼서 정상 사용자가 막히지 않게 합니다.
//
// ⚠️ req.ip 가 실제 클라이언트 IP 가 되려면 server.js 의 'trust proxy' 설정이 필요합니다.
//    (브라우저 → DSM 역방향 프록시 → nginx → backend 로 두 단계를 거칩니다)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { errors: { email: ['로그인 시도가 너무 많습니다. 15분 후 다시 시도해 주세요'] } },
})

// asyncHandler 로 감싸는 이유: DB 장애 시 응답 없이 연결을 붙잡고 있으면
// (인증이 필요 없는 경로라) 외부에서 연결을 고갈시킬 수 있습니다. 500 으로 즉시 끊습니다.
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  // 화면에서는 "아이디"로 입력받습니다. 이메일로도 로그인할 수 있게 둘 다 허용합니다.
  const loginId = (req.body || {}).email
  const { password } = req.body || {}

  if (!loginId || !password)
    return res.status(400).json({ errors: { email: ['아이디 또는 비밀번호가 올바르지 않습니다'] } })

  const [rows] = await pool.query(
    'SELECT * FROM accounts WHERE username = ? OR email = ?',
    [loginId, loginId],
  )
  const account = rows[0]

  if (!account || !(await bcrypt.compare(password, account.password_hash)))
    return res.status(400).json({ errors: { email: ['아이디 또는 비밀번호가 올바르지 않습니다'] } })

  const accessToken = jwt.sign(
    { id: account.id, role: account.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  )

  let fullName = account.username

  if (account.teacher_id) {
    const [teacherRows] = await pool.query('SELECT full_name FROM teachers WHERE id = ?', [account.teacher_id])
    if (teacherRows[0]) fullName = teacherRows[0].full_name
  }

  res.json({
    accessToken,
    userAbilities: abilitiesForRole(account.role),
    userData: {
      id: account.id,
      username: account.username,
      email: account.email,
      role: account.role,
      teacherId: account.teacher_id,
      fullName,
    },
  })
}))

module.exports = router
