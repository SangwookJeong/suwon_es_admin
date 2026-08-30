const express = require('express')
const pool = require('../db')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

// 👉 학년 → 부서 매핑 (1~2학년 = 초등1반, 3~4학년 = 초등2반, 5~6학년 = 초등3반)
//    students 테이블에는 department 컬럼이 없고 학년에서 파생시킵니다.
//    교사의 department 와 같은 값이어야 출석 화면이 "로그인한 교사의 담당 부서"로
//    범위를 좁히는 필터(visibleDept)가 동작합니다.
//    ⚠️ 목업(src/@fake-db/apps/student-list.js)의 departmentOf 와 규칙을 반드시 일치시켜야 합니다.
function departmentOf(grade) {
  if (grade <= 2)
    return '초등1반'
  if (grade <= 4)
    return '초등2반'

  return '초등3반'
}

// 반 이름은 화면 표시용 부가 정보입니다. (그룹 키는 department)
function classNameOf(row) {
  return `${row.grade}학년 ${row.class_no}반`
}

function toRecord(row, present) {
  return {
    id: row.id,
    fullName: row.full_name,
    grade: row.grade,
    classNo: row.class_no,
    className: classNameOf(row),
    department: departmentOf(row.grade),
    gender: row.gender,
    contact: row.contact,
    parentName: row.parent_name,
    parentContact: row.parent_contact,
    parentDistrict: row.parent_district,
    parentSalvation: row.parent_salvation,
    avatar: row.avatar,
    present,
  }
}

const STUDENT_COLUMNS = `
  id, full_name, gender, grade, class_no, contact,
  parent_name, parent_contact, parent_district, parent_salvation, avatar
`

// 👉 특정 날짜/구분의 학생 출결 현황
router.get('/', asyncHandler(async (req, res) => {
  const { date, type = '주일오전' } = req.query

  const [students] = await pool.query(
    `SELECT ${STUDENT_COLUMNS} FROM students ORDER BY grade, class_no, full_name`,
  )

  const [presentRows] = await pool.query(
    'SELECT student_id FROM student_attendance WHERE date = ? AND type = ?',
    [date, type],
  )

  const presentIds = new Set(presentRows.map(r => r.student_id))

  const records = students.map(s => toRecord(s, presentIds.has(s.id)))

  const total = records.length
  const presentCount = records.filter(r => r.present).length

  // 반별 집계 (교사 화면의 deptStats 와 같은 형태)
  const deptStats = {}

  records.forEach(r => {
    if (!deptStats[r.department])
      deptStats[r.department] = { total: 0, present: 0 }

    deptStats[r.department].total += 1
    if (r.present)
      deptStats[r.department].present += 1
  })

  res.json({
    records,
    total,
    presentCount,
    absentCount: total - presentCount,
    rate: total > 0 ? Math.round((presentCount / total) * 100) : 0,
    deptStats,
  })
}))

// 👉 출결 저장 (해당 date+type 의 출석자 목록을 통째로 교체)
router.post('/', asyncHandler(async (req, res) => {
  const { date, type = '주일오전', presentIds = [] } = req.body || {}

  if (!date)
    return res.status(400).json({ errors: { date: ['날짜가 필요합니다'] } })

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()
    await conn.query('DELETE FROM student_attendance WHERE date = ? AND type = ?', [date, type])

    if (presentIds.length) {
      await conn.query(
        'INSERT INTO student_attendance (student_id, date, type) VALUES ?',
        [presentIds.map(id => [id, date, type])],
      )
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
}))

// 👉 월별 반 평균 출석 통계
router.get('/monthly-stats', asyncHandler(async (req, res) => {
  const { month, type = '주일오전' } = req.query

  const [students] = await pool.query('SELECT id, grade FROM students')

  const [dayRows] = await pool.query(
    'SELECT DISTINCT date FROM student_attendance WHERE DATE_FORMAT(date, \'%Y-%m\') = ? AND type = ?',
    [month, type],
  )

  const days = dayRows.length

  // 부서는 학년에서 파생되므로 GROUP BY 는 학년으로 하고 JS 에서 부서로 합칩니다.
  const [presentRows] = await pool.query(
    `SELECT s.grade AS grade, COUNT(*) AS cnt
       FROM student_attendance a
       JOIN students s ON s.id = a.student_id
      WHERE DATE_FORMAT(a.date, '%Y-%m') = ? AND a.type = ?
      GROUP BY s.grade`,
    [month, type],
  )

  const presentByDept = new Map()

  presentRows.forEach(r => {
    const dept = departmentOf(r.grade)

    presentByDept.set(dept, (presentByDept.get(dept) || 0) + Number(r.cnt))
  })

  const deptMonthlyStats = {}

  students.forEach(s => {
    const key = departmentOf(s.grade)

    if (!deptMonthlyStats[key])
      deptMonthlyStats[key] = { total: 0, presentAvg: 0, rate: 0, days }

    deptMonthlyStats[key].total += 1
  })

  Object.values(deptMonthlyStats).forEach(entry => { entry.days = days })

  Object.keys(deptMonthlyStats).forEach(key => {
    const entry = deptMonthlyStats[key]

    if (days === 0) {
      entry.presentAvg = 0
      entry.rate = 0

      return
    }

    const presentSum = presentByDept.get(key) || 0

    entry.presentAvg = Math.round((presentSum / days) * 10) / 10
    entry.rate = entry.total > 0 ? Math.round((entry.presentAvg / entry.total) * 100) : 0
  })

  res.json({ deptMonthlyStats, days })
}))

function calcRate(sessions, presentKeys, filterFn) {
  const scoped = sessions.filter(s => filterFn(s.date))
  const total = scoped.length
  const present = scoped.filter(s => presentKeys.has(`${s.date}_${s.type}`)).length

  return { total, present, rate: total > 0 ? Math.round((present / total) * 100) : 0 }
}

// 출석한 날짜/구분 집합을 만들어 둡니다.
// sessions = 전체 출석 세션(= 출석 체크가 한 번이라도 이뤄진 날), presentKeys = 이 학생이 출석한 날
async function loadSessions(studentId) {
  const [sessions] = await pool.query('SELECT DISTINCT date, type FROM student_attendance')

  const [presentRows] = await pool.query(
    'SELECT date, type FROM student_attendance WHERE student_id = ?',
    [studentId],
  )

  return { sessions, presentKeys: new Set(presentRows.map(r => `${r.date}_${r.type}`)) }
}

// 👉 개인 출석 통계 (월간/분기/연간)
router.get('/user-stats', asyncHandler(async (req, res) => {
  const studentId = req.query.studentId || req.query.userId

  const { sessions, presentKeys } = await loadSessions(studentId)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const quarter = Math.floor(month / 3)
  const qStart = quarter * 3

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const yearPrefix = `${year}-`

  const monthly = calcRate(sessions, presentKeys, d => d.startsWith(monthPrefix))

  const quarterly = calcRate(sessions, presentKeys, d => {
    if (!d.startsWith(yearPrefix))
      return false

    const m = Number(d.split('-')[1]) - 1

    return m >= qStart && m < qStart + 3
  })

  const yearly = calcRate(sessions, presentKeys, d => d.startsWith(yearPrefix))

  res.json({
    monthly: { ...monthly, label: `${month + 1}월` },
    quarterly: { ...quarterly, label: `${quarter + 1}분기` },
    yearly: { ...yearly, label: `${year}년` },
  })
}))

// 👉 개인 연도별 출석 통계
router.get('/user-yearly-stats', asyncHandler(async (req, res) => {
  const studentId = req.query.studentId || req.query.userId

  const { sessions, presentKeys } = await loadSessions(studentId)

  const years = [...new Set(sessions.map(s => s.date.slice(0, 4)))].sort((a, b) => b - a)

  const yearlyStats = {}

  years.forEach(y => {
    yearlyStats[Number(y)] = calcRate(sessions, presentKeys, d => d.startsWith(`${y}-`))
  })

  res.json({ yearlyStats })
}))

module.exports = router
