const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const { abilitiesForRole } = require('../utils/abilities')

const router = express.Router()

router.post('/login', async (req, res) => {
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
})

module.exports = router
