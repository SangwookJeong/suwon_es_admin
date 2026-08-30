const express = require('express')
const pool = require('../db')

const router = express.Router()

// 👉 특정 날짜/구분의 출결 현황
router.get('/', async (req, res) => {
  const { date, type } = req.query

  const [teachers] = await pool.query(
    'SELECT id, full_name, department, contact, service_group, bs, avatar FROM teachers WHERE status = ? ORDER BY id',
    ['현직'],
  )
  const [presentRows] = await pool.query(
    'SELECT teacher_id FROM attendance WHERE date = ? AND type = ?',
    [date, type],
  )
  const presentIds = new Set(presentRows.map(r => r.teacher_id))

  const records = teachers.map(t => ({
    id: t.id,
    fullName: t.full_name,
    department: t.department,
    contact: t.contact,
    serviceGroup: t.service_group,
    bs: t.bs,
    avatar: t.avatar,
    present: presentIds.has(t.id),
  }))

  const totalCount = records.length
  const presentCount = records.filter(r => r.present).length

  const deptStats = {}

  ;[...new Set(records.map(r => r.department))].forEach(dept => {
    const deptRecords = records.filter(r => r.department === dept)

    deptStats[dept] = {
      total: deptRecords.length,
      present: deptRecords.filter(r => r.present).length,
    }
  })

  res.json({
    records,
    total: totalCount,
    presentCount,
    absentCount: totalCount - presentCount,
    rate: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
    deptStats,
  })
})

// 👉 출결 저장 (해당 date+type의 출석자 목록을 통째로 교체)
router.post('/', async (req, res) => {
  const { date, type, presentIds = [] } = req.body

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()
    await conn.query('DELETE FROM attendance WHERE date = ? AND type = ?', [date, type])

    if (presentIds.length) {
      const values = presentIds.map(id => [id, date, type])

      await conn.query('INSERT INTO attendance (teacher_id, date, type) VALUES ?', [values])
    }

    await conn.commit()
    res.status(200).end()
  }
  catch (err) {
    await conn.rollback()
    throw err
  }
  finally {
    conn.release()
  }
})

// 👉 월별 부서 평균 출석 통계
router.get('/monthly-stats', async (req, res) => {
  const { month, type } = req.query

  const [teachers] = await pool.query(
    'SELECT id, department FROM teachers WHERE status = ?',
    ['현직'],
  )

  const [dayRows] = await pool.query(
    'SELECT DISTINCT date FROM attendance WHERE DATE_FORMAT(date, \'%Y-%m\') = ? AND type = ?',
    [month, type],
  )
  const days = dayRows.length

  const [presentRows] = await pool.query(
    `SELECT t.department AS department, COUNT(*) AS cnt
     FROM attendance a
     JOIN teachers t ON t.id = a.teacher_id
     WHERE DATE_FORMAT(a.date, '%Y-%m') = ? AND a.type = ? AND t.status = '현직'
     GROUP BY t.department`,
    [month, type],
  )
  const presentByDept = new Map(presentRows.map(r => [r.department, r.cnt]))

  const deptMonthlyStats = {}

  ;[...new Set(teachers.map(t => t.department))].forEach(dept => {
    const total = teachers.filter(t => t.department === dept).length

    if (days === 0) {
      deptMonthlyStats[dept] = { total, presentAvg: 0, rate: 0, days: 0 }

      return
    }

    const presentSum = presentByDept.get(dept) || 0
    const presentAvg = Math.round((presentSum / days) * 10) / 10
    const rate = total > 0 ? Math.round((presentAvg / total) * 100) : 0

    deptMonthlyStats[dept] = { total, presentAvg, rate, days }
  })

  res.json({ deptMonthlyStats, days })
})

function calcRate(sessions, presentDates, filterFn) {
  const keys = sessions.filter(s => filterFn(s.date))
  const total = keys.length
  const present = keys.filter(s => presentDates.has(`${s.date}_${s.type}`)).length

  return { total, present, rate: total > 0 ? Math.round((present / total) * 100) : 0 }
}

// 👉 개인 출석 통계 (월간/분기/연간)
router.get('/user-stats', async (req, res) => {
  const { userId } = req.query

  const [sessions] = await pool.query('SELECT DISTINCT date, type FROM attendance')
  const [presentRows] = await pool.query(
    'SELECT date, type FROM attendance WHERE teacher_id = ?',
    [userId],
  )
  const presentDates = new Set(presentRows.map(r => `${r.date}_${r.type}`))

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const quarter = Math.floor(month / 3)
  const qStart = quarter * 3

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const yearPrefix = `${year}-`

  const monthly = calcRate(sessions, presentDates, d => d.startsWith(monthPrefix))
  const quarterly = calcRate(sessions, presentDates, d => {
    if (!d.startsWith(yearPrefix)) return false
    const m = Number(d.split('-')[1]) - 1

    return m >= qStart && m < qStart + 3
  })
  const yearly = calcRate(sessions, presentDates, d => d.startsWith(yearPrefix))

  res.json({
    monthly: { ...monthly, label: `${month + 1}월` },
    quarterly: { ...quarterly, label: `${quarter + 1}분기` },
    yearly: { ...yearly, label: `${year}년` },
  })
})

// 👉 개인 연도별 출석 통계
router.get('/user-yearly-stats', async (req, res) => {
  const { userId } = req.query

  const [sessions] = await pool.query('SELECT DISTINCT date, type FROM attendance')
  const [presentRows] = await pool.query(
    'SELECT date, type FROM attendance WHERE teacher_id = ?',
    [userId],
  )
  const presentDates = new Set(presentRows.map(r => `${r.date}_${r.type}`))

  const years = [...new Set(sessions.map(s => s.date.slice(0, 4)))].sort((a, b) => b - a)

  const yearlyStats = {}

  years.forEach(y => {
    const { total, present, rate } = calcRate(sessions, presentDates, d => d.startsWith(`${y}-`))

    yearlyStats[Number(y)] = { total, present, rate }
  })

  res.json({ yearlyStats })
})

module.exports = router
