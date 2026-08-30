const express = require('express')
const bcrypt = require('bcryptjs')
const pool = require('../db')
const { requireAdmin } = require('../middleware/auth')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

const ROLES = ['admin', 'client']
const MIN_PASSWORD_LENGTH = 4
const BCRYPT_ROUNDS = 10

function toAccountDto(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    teacherId: row.teacher_id,
    teacherName: row.teacher_name || null,
    createdAt: row.created_at,
  }
}

// 프론트가 필드별로 에러를 표시할 수 있도록 기존 라우트와 같은 형식으로 응답합니다.
function fail(res, status, field, message) {
  return res.status(status).json({ errors: { [field]: [message] } })
}

async function adminCount() {
  const [rows] = await pool.query("SELECT COUNT(*) AS n FROM accounts WHERE role = 'admin'")

  return rows[0].n
}

async function findAccount(id) {
  const [rows] = await pool.query(
    `SELECT a.*, t.full_name AS teacher_name
       FROM accounts a
       LEFT JOIN teachers t ON t.id = a.teacher_id
      WHERE a.id = ?`,
    [id],
  )

  return rows[0] || null
}

// 아이디: 영소문자/숫자로 시작, 3~30자, 영소문자·숫자·.·_·- 허용
const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,29}$/

// ─────────────────────────────────────────────────────────────
// 본인 비밀번호 변경 — 로그인한 사용자 누구나 (관리자 권한 불필요)
// ⚠️ /:id 보다 먼저 선언해야 합니다.
// ─────────────────────────────────────────────────────────────
router.put('/me/password', asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}

  if (!currentPassword || !newPassword)
    return fail(res, 400, 'currentPassword', '현재 비밀번호와 새 비밀번호를 입력하세요')

  if (String(newPassword).length < MIN_PASSWORD_LENGTH)
    return fail(res, 400, 'newPassword', `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`)

  const [rows] = await pool.query('SELECT * FROM accounts WHERE id = ?', [req.user.id])
  const account = rows[0]

  if (!account)
    return fail(res, 404, 'currentPassword', '계정을 찾을 수 없습니다')

  if (!(await bcrypt.compare(currentPassword, account.password_hash)))
    return fail(res, 400, 'currentPassword', '현재 비밀번호가 올바르지 않습니다')

  await pool.query('UPDATE accounts SET password_hash = ? WHERE id = ?', [
    await bcrypt.hash(newPassword, BCRYPT_ROUNDS),
    req.user.id,
  ])

  res.status(200).end()
}))

// ─────────────────────────────────────────────────────────────
// 여기부터는 모두 관리자 전용
// ─────────────────────────────────────────────────────────────
router.use(requireAdmin)

// 👉 계정 목록
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, t.full_name AS teacher_name
       FROM accounts a
       LEFT JOIN teachers t ON t.id = a.teacher_id
      ORDER BY (a.role = 'admin') DESC, a.username`,
  )

  res.json({ accounts: rows.map(toAccountDto), total: rows.length })
}))

// 👉 계정에 연결할 교사 선택 목록 (이미 연결된 교사는 제외)
//    ⚠️ /:id 보다 먼저 선언해야 합니다.
router.get('/teacher-options', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.id, t.full_name AS fullName, t.department
       FROM teachers t
      WHERE t.status = '현직'
      ORDER BY t.department, t.full_name`,
  )

  res.json({ teachers: rows })
}))

// 👉 계정 발급
router.post('/', asyncHandler(async (req, res) => {
  const { username, password, role = 'client', teacherId = null, email = null } = req.body || {}

  if (!USERNAME_RE.test(String(username || '')))
    return fail(res, 400, 'username', '아이디는 영문 소문자/숫자 3~30자 (., _, - 사용 가능)로 입력하세요')

  if (String(password || '').length < MIN_PASSWORD_LENGTH)
    return fail(res, 400, 'password', `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`)

  if (!ROLES.includes(role))
    return fail(res, 400, 'role', '권한 값이 올바르지 않습니다')

  const [dup] = await pool.query('SELECT id FROM accounts WHERE username = ?', [username])
  if (dup.length)
    return fail(res, 409, 'username', '이미 사용 중인 아이디입니다')

  const [result] = await pool.query(
    'INSERT INTO accounts (username, email, password_hash, role, teacher_id) VALUES (?, ?, ?, ?, ?)',
    [username, email || null, await bcrypt.hash(password, BCRYPT_ROUNDS), role, teacherId || null],
  )

  res.status(201).json({ account: toAccountDto(await findAccount(result.insertId)) })
}))

// 👉 계정 수정 (권한 / 연결 교사 / 이메일)
router.put('/:id(\\d+)', asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  const account = await findAccount(id)

  if (!account)
    return fail(res, 404, 'username', '계정을 찾을 수 없습니다')

  const sets = []
  const params = []

  if (Object.prototype.hasOwnProperty.call(req.body, 'role')) {
    const { role } = req.body

    if (!ROLES.includes(role))
      return fail(res, 400, 'role', '권한 값이 올바르지 않습니다')

    // 마지막 관리자의 권한을 내리면 아무도 계정관리에 들어갈 수 없게 됩니다.
    if (account.role === 'admin' && role !== 'admin' && (await adminCount()) <= 1)
      return fail(res, 400, 'role', '마지막 관리자의 권한은 변경할 수 없습니다')

    sets.push('role = ?')
    params.push(role)
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'teacherId')) {
    sets.push('teacher_id = ?')
    params.push(req.body.teacherId || null)
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
    sets.push('email = ?')
    params.push(req.body.email || null)
  }

  if (!sets.length)
    return fail(res, 400, 'username', '변경할 내용이 없습니다')

  params.push(id)
  await pool.query(`UPDATE accounts SET ${sets.join(', ')} WHERE id = ?`, params)

  res.json({ account: toAccountDto(await findAccount(id)) })
}))

// 👉 비밀번호 재발급 (분실 시 관리자가 새 비밀번호를 지정해 전달)
router.put('/:id(\\d+)/password', asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  const { password } = req.body || {}

  if (String(password || '').length < MIN_PASSWORD_LENGTH)
    return fail(res, 400, 'password', `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`)

  const [result] = await pool.query('UPDATE accounts SET password_hash = ? WHERE id = ?', [
    await bcrypt.hash(password, BCRYPT_ROUNDS),
    id,
  ])

  if (!result.affectedRows)
    return fail(res, 404, 'password', '계정을 찾을 수 없습니다')

  res.status(200).end()
}))

// 👉 계정 삭제
router.delete('/:id(\\d+)', asyncHandler(async (req, res) => {
  const id = Number(req.params.id)

  // 스스로를 지우면 즉시 로그아웃되고 되돌릴 수 없습니다.
  if (id === Number(req.user.id))
    return fail(res, 400, 'username', '본인 계정은 삭제할 수 없습니다')

  const account = await findAccount(id)

  if (!account)
    return fail(res, 404, 'username', '계정을 찾을 수 없습니다')

  // 마지막 관리자를 지우면 아무도 계정을 만들 수 없게 됩니다.
  if (account.role === 'admin' && (await adminCount()) <= 1)
    return fail(res, 400, 'username', '마지막 관리자 계정은 삭제할 수 없습니다')

  await pool.query('DELETE FROM accounts WHERE id = ?', [id])

  res.status(200).end()
}))

module.exports = router
