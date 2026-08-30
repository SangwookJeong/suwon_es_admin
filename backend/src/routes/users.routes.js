const express = require('express')
const pool = require('../db')

const router = express.Router()

function toArray(value) {
  if (value === undefined || value === null || value === '') return []

  return Array.isArray(value) ? value : [value]
}

function toUserDto(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    department: row.department,
    position: row.position,
    assignedClass: row.assigned_class,
    extraRole: row.extra_role,
    contact: row.contact,
    serviceGroup: row.service_group,
    bs: row.bs,
    occupation: row.occupation,
    salvationBirthday: row.salvation_birthday,
    avatar: row.avatar,
    status: row.status,
  }
}

// 👉 교사 목록 (부서/소속/직업/상태/B·S 모두 다중 선택 필터 가능 - 배열 또는 단일값)
router.get('/list', async (req, res) => {
  const {
    q = '',
    perPage = 10,
    currentPage = 1,
  } = req.query

  const departments = toArray(req.query.department)
  const serviceGroups = toArray(req.query.serviceGroup)
  const occupations = toArray(req.query.occupation)
  const statuses = toArray(req.query.status)
  const bsList = toArray(req.query.bs)

  const where = ['(full_name LIKE ? OR contact LIKE ?)']
  const params = [`%${q}%`, `%${q}%`]

  if (departments.length) { where.push('department IN (?)'); params.push(departments) }
  if (serviceGroups.length) { where.push('service_group IN (?)'); params.push(serviceGroups) }
  if (occupations.length) { where.push('occupation IN (?)'); params.push(occupations) }
  if (statuses.length) { where.push('status IN (?)'); params.push(statuses) }
  if (bsList.length) { where.push('bs IN (?)'); params.push(bsList) }

  const whereSql = `WHERE ${where.join(' AND ')}`

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM teachers ${whereSql}`, params)
  const totalUsers = countRows[0].total
  const perPageNum = Number(perPage) || 10
  const currentPageNum = Number(currentPage) || 1
  const totalPage = Math.ceil(totalUsers / perPageNum) || 1
  const offset = (currentPageNum - 1) * perPageNum

  const [rows] = await pool.query(
    `SELECT * FROM teachers ${whereSql} ORDER BY id LIMIT ? OFFSET ?`,
    [...params, perPageNum, offset],
  )

  res.json({ users: rows.map(toUserDto), totalPage, totalUsers })
})

// 👉 교사 통계 (실제 출석 데이터 기반 출석률)
router.get('/stats', async (req, res) => {
  const [totalRows] = await pool.query('SELECT COUNT(*) AS total FROM teachers')
  const [statusRows] = await pool.query('SELECT status, COUNT(*) AS cnt FROM teachers GROUP BY status')
  const [deptRows] = await pool.query('SELECT department, COUNT(*) AS cnt FROM teachers GROUP BY department')

  const [sessionRows] = await pool.query('SELECT COUNT(DISTINCT CONCAT(date, \'_\', type)) AS total FROM attendance')
  const totalSessions = sessionRows[0].total

  const [activeTeachers] = await pool.query(
    'SELECT id, full_name, department, avatar FROM teachers WHERE status = ?',
    ['현직'],
  )
  const [presentCounts] = await pool.query(
    'SELECT teacher_id, COUNT(*) AS cnt FROM attendance GROUP BY teacher_id',
  )
  const presentByTeacher = new Map(presentCounts.map(r => [r.teacher_id, r.cnt]))

  const attendanceList = activeTeachers
    .map(t => ({
      id: t.id,
      fullName: t.full_name,
      department: t.department,
      avatar: t.avatar,
      attendanceRate: totalSessions > 0
        ? Math.round(((presentByTeacher.get(t.id) || 0) / totalSessions) * 100)
        : 0,
    }))
    .sort((a, b) => b.attendanceRate - a.attendanceRate)

  const statusCounts = Object.fromEntries(statusRows.map(r => [r.status, r.cnt]))
  const deptCounts = Object.fromEntries(deptRows.map(r => [r.department, r.cnt]))

  res.json({
    total: totalRows[0].total,
    statusCounts,
    deptCounts,
    top10: attendanceList.slice(0, 10),
    bottom10: attendanceList.slice(-10).reverse(),
  })
})

// 👉 교사 추가
router.post('/user', async (req, res) => {
  const u = req.body.user || {}

  const [result] = await pool.query(
    `INSERT INTO teachers
      (full_name, department, position, assigned_class, extra_role, contact, service_group, bs, occupation, salvation_birthday, avatar, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      u.fullName, u.department, u.position || '', u.assignedClass || '', u.extraRole || '',
      u.contact || '', u.serviceGroup || '', u.bs, u.occupation || '', u.salvationBirthday || '',
      u.avatar || '', u.status || '현직',
    ],
  )

  const [rows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [result.insertId])

  res.status(201).json({ user: toUserDto(rows[0]) })
})

// 👉 교사 상세 조회 (연도별 봉사현황 포함)
router.get('/:id(\\d+)', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [req.params.id])
  if (!rows[0]) return res.status(404).end()

  const [historyRows] = await pool.query(
    'SELECT year, department, position, assigned_class AS assignedClass FROM service_history WHERE teacher_id = ? ORDER BY year',
    [req.params.id],
  )

  res.json({ ...toUserDto(rows[0]), serviceHistory: historyRows })
})

// 👉 교사 수정
router.put('/:id(\\d+)', async (req, res) => {
  const fieldMap = {
    fullName: 'full_name',
    department: 'department',
    position: 'position',
    assignedClass: 'assigned_class',
    extraRole: 'extra_role',
    contact: 'contact',
    serviceGroup: 'service_group',
    bs: 'bs',
    occupation: 'occupation',
    salvationBirthday: 'salvation_birthday',
    avatar: 'avatar',
    status: 'status',
  }

  const sets = []
  const params = []

  Object.entries(fieldMap).forEach(([key, column]) => {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      sets.push(`${column} = ?`)
      params.push(req.body[key])
    }
  })

  if (!sets.length) return res.status(400).end()

  params.push(req.params.id)

  const [result] = await pool.query(`UPDATE teachers SET ${sets.join(', ')} WHERE id = ?`, params)
  if (!result.affectedRows) return res.status(404).end()

  const [rows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [req.params.id])

  res.json(toUserDto(rows[0]))
})

// 👉 교사 삭제
router.delete('/:id(\\d+)', async (req, res) => {
  const [result] = await pool.query('DELETE FROM teachers WHERE id = ?', [req.params.id])
  if (!result.affectedRows) return res.status(404).end()

  res.status(200).end()
})

module.exports = router
