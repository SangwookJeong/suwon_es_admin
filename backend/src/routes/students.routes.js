const express = require('express')
const pool = require('../db')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

// 부서 구성: 1~2학년 = 초등1반, 3~4학년 = 초등2반, 5~6학년 = 초등3반
const DEPARTMENT_ORDER = ['초등1반', '초등2반', '초등3반']

const GRADES_OF_DEPARTMENT = {
  '초등1반': [1, 2],
  '초등2반': [3, 4],
  '초등3반': [5, 6],
}

function departmentOfGrade(grade) {
  if (grade <= 2) return DEPARTMENT_ORDER[0]
  if (grade <= 4) return DEPARTMENT_ORDER[1]

  return DEPARTMENT_ORDER[2]
}

function toArray(value) {
  if (value === undefined || value === null || value === '') return []

  return Array.isArray(value) ? value : [value]
}

// 분반선생님은 저장하지 않고 teachers.assigned_class('1-1반' 형태)로 매번 찾습니다.
// 한 분반에 분반교사 + 보조교사가 함께 있을 수 있어 분반교사를 우선합니다.
const TEACHER_NAME_SUBQUERY = `(
  SELECT t.full_name FROM teachers t
   WHERE t.assigned_class = CONCAT(s.grade, '-', s.class_no, '반')
     AND t.status = '현직'
   ORDER BY (t.position = '분반교사') DESC, t.id
   LIMIT 1
)`

function toStudentDto(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    gender: row.gender,
    department: departmentOfGrade(row.grade),
    grade: row.grade,
    classNo: row.class_no,
    teacherName: row.teacher_name || '',
    address: row.address,
    contact: row.contact,
    parentName: row.parent_name,
    parentContact: row.parent_contact,
    parentDistrict: row.parent_district,
    parentSalvation: row.parent_salvation,
    note: row.note,
    avatar: row.avatar,
  }
}

// 👉 학생 목록 (부서/학년/반/분반선생님/구역/구원여부 다중 선택 필터)
router.get('/list', asyncHandler(async (req, res) => {
  const { q = '', perPage = 10, currentPage = 1 } = req.query

  const departments = toArray(req.query.department)
  const grades = toArray(req.query.grade).map(Number).filter(Number.isFinite)
  const classNos = toArray(req.query.classNo).map(Number).filter(Number.isFinite)
  const teacherNames = toArray(req.query.teacherName)
  const districts = toArray(req.query.parentDistrict)
  const salvations = toArray(req.query.parentSalvation)

  const where = [
    `(s.full_name LIKE ? OR s.parent_name LIKE ? OR s.contact LIKE ?
      OR s.parent_contact LIKE ? OR s.address LIKE ? OR ${TEACHER_NAME_SUBQUERY} LIKE ?)`,
  ]

  const like = `%${q}%`
  const params = [like, like, like, like, like, like]

  // 부서 필터는 소속 학년 목록으로 풀어서 넘깁니다.
  if (departments.length) {
    const deptGrades = departments.flatMap(d => GRADES_OF_DEPARTMENT[d] || [])

    // 알 수 없는 부서만 넘어온 경우 결과가 없어야 합니다.
    if (!deptGrades.length) where.push('1 = 0')
    else { where.push('s.grade IN (?)'); params.push(deptGrades) }
  }

  if (grades.length) { where.push('s.grade IN (?)'); params.push(grades) }
  if (classNos.length) { where.push('s.class_no IN (?)'); params.push(classNos) }
  if (districts.length) { where.push('s.parent_district IN (?)'); params.push(districts) }
  if (salvations.length) { where.push('s.parent_salvation IN (?)'); params.push(salvations) }
  if (teacherNames.length) { where.push(`${TEACHER_NAME_SUBQUERY} IN (?)`); params.push(teacherNames) }

  const whereSql = `WHERE ${where.join(' AND ')}`

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM students s ${whereSql}`,
    params,
  )

  const totalStudents = countRows[0].total
  const perPageNum = Number(perPage) || 10
  const currentPageNum = Number(currentPage) || 1
  const totalPage = Math.ceil(totalStudents / perPageNum) || 1
  const offset = (currentPageNum - 1) * perPageNum

  const [rows] = await pool.query(
    `SELECT s.*, ${TEACHER_NAME_SUBQUERY} AS teacher_name
       FROM students s ${whereSql}
      ORDER BY s.grade, s.class_no, s.full_name
      LIMIT ? OFFSET ?`,
    [...params, perPageNum, offset],
  )

  res.json({ students: rows.map(toStudentDto), totalPage, totalStudents })
}))

// 👉 학생 통계 (부서별 / 학년별 인원)
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalRows] = await pool.query('SELECT COUNT(*) AS total FROM students')
  const [gradeRows] = await pool.query('SELECT grade, COUNT(*) AS cnt FROM students GROUP BY grade')

  const gradeCounts = {}
  const deptCounts = {}

  DEPARTMENT_ORDER.forEach(dept => {
    deptCounts[dept] = 0
  })

  gradeRows.forEach(r => {
    gradeCounts[r.grade] = r.cnt
    deptCounts[departmentOfGrade(r.grade)] += r.cnt
  })

  res.json({
    total: totalRows[0].total,
    deptCounts,
    gradeCounts,
    departmentOrder: DEPARTMENT_ORDER,
  })
}))

// 👉 분반 구성 + 구역 목록 (필터/입력 폼 선택지)
// 분반 목록은 현직 교사에게 배정된 '학년-반' 에서 만들고,
// 학생만 있고 담당 교사가 아직 없는 분반도 빠지지 않도록 합집합으로 모읍니다.
router.get('/classes', asyncHandler(async (req, res) => {
  const [teacherRows] = await pool.query(
    `SELECT assigned_class, full_name, position FROM teachers
      WHERE status = '현직' AND assigned_class REGEXP '^[1-6]-[0-9]+반$'
      ORDER BY (position = '분반교사') DESC, id`,
  )

  const [studentClassRows] = await pool.query(
    'SELECT DISTINCT grade, class_no FROM students',
  )

  // key = `${grade}-${classNo}` → 먼저 들어온 교사(분반교사 우선)를 담당으로 둡니다.
  const byKey = new Map()

  teacherRows.forEach(t => {
    const [grade, classNo] = t.assigned_class.replace('반', '').split('-').map(Number)
    const key = `${grade}-${classNo}`

    if (!byKey.has(key))
      byKey.set(key, { grade, classNo, teacherName: t.full_name, department: departmentOfGrade(grade) })
  })

  studentClassRows.forEach(r => {
    const key = `${r.grade}-${r.class_no}`

    if (!byKey.has(key)) {
      byKey.set(key, {
        grade: r.grade,
        classNo: r.class_no,
        teacherName: '',
        department: departmentOfGrade(r.grade),
      })
    }
  })

  const classes = [...byKey.values()].sort((a, b) => a.grade - b.grade || a.classNo - b.classNo)

  const [districtRows] = await pool.query(
    `SELECT DISTINCT parent_district FROM students
      WHERE parent_district <> '' ORDER BY parent_district`,
  )

  res.json({
    classes,
    departmentOrder: DEPARTMENT_ORDER,
    districts: districtRows.map(r => r.parent_district),
  })
}))

// 👉 학생 추가
router.post('/student', asyncHandler(async (req, res) => {
  const s = req.body.student || {}

  if (!s.fullName || !s.grade || !s.classNo)
    return res.status(400).json({ errors: { fullName: ['이름, 학년, 반은 필수입니다'] } })

  const [result] = await pool.query(
    `INSERT INTO students
      (full_name, gender, grade, class_no, address, contact,
       parent_name, parent_contact, parent_district, parent_salvation, note, avatar)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      s.fullName, s.gender || '남', Number(s.grade), Number(s.classNo),
      s.address || '', s.contact || '', s.parentName || '', s.parentContact || '',
      s.parentDistrict || '', s.parentSalvation || '미구원', s.note || '', s.avatar || '',
    ],
  )

  const [rows] = await pool.query(
    `SELECT s.*, ${TEACHER_NAME_SUBQUERY} AS teacher_name FROM students s WHERE s.id = ?`,
    [result.insertId],
  )

  return res.status(201).json({ student: toStudentDto(rows[0]) })
}))

// 👉 학생 상세 조회
router.get('/:id(\\d+)', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, ${TEACHER_NAME_SUBQUERY} AS teacher_name FROM students s WHERE s.id = ?`,
    [req.params.id],
  )

  if (!rows[0]) return res.status(404).end()

  return res.json(toStudentDto(rows[0]))
}))

// 👉 학생 수정
router.put('/:id(\\d+)', asyncHandler(async (req, res) => {
  // teacherName 은 teachers 에서 파생되는 값이라 여기서 저장하지 않습니다.
  const fieldMap = {
    fullName: 'full_name',
    gender: 'gender',
    grade: 'grade',
    classNo: 'class_no',
    address: 'address',
    contact: 'contact',
    parentName: 'parent_name',
    parentContact: 'parent_contact',
    parentDistrict: 'parent_district',
    parentSalvation: 'parent_salvation',
    note: 'note',
    avatar: 'avatar',
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

  const [result] = await pool.query(`UPDATE students SET ${sets.join(', ')} WHERE id = ?`, params)
  if (!result.affectedRows) return res.status(404).end()

  const [rows] = await pool.query(
    `SELECT s.*, ${TEACHER_NAME_SUBQUERY} AS teacher_name FROM students s WHERE s.id = ?`,
    [req.params.id],
  )

  return res.json(toStudentDto(rows[0]))
}))

// 👉 학생 삭제
router.delete('/:id(\\d+)', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id])
  if (!result.affectedRows) return res.status(404).end()

  return res.status(200).end()
}))

module.exports = router
