require('dotenv').config()

const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const pool = require('./db')

const seedUsers = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../sql/seed_data.json'), 'utf8'),
)

const seedStudents = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../sql/students_seed_data.json'), 'utf8'),
)

// 기존 @fake-db/jwt 데모 계정과 동일 (로그인 테스트용)
const seedAccounts = [
  { username: 'seungjin', email: 'admin@demo.com', password: 'admin', role: 'admin', teacherId: 1 },
  { username: 'sangouk', email: 'client@demo.com', password: 'client', role: 'client', teacherId: 7 },
]

// 학생 명부. 교사 시드와 독립적으로 판단합니다.
// (교사가 이미 들어있는 기존 DB 에도 학생만 추가로 채울 수 있어야 합니다)
async function seedStudentsTable() {
  const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM students')

  if (cnt > 0) {
    console.log('students 테이블에 이미 데이터가 있어 학생 시드를 건너뜁니다.')

    return
  }

  for (const s of seedStudents) {
    await pool.query(
      `INSERT INTO students
        (full_name, gender, grade, class_no, address, contact,
         parent_name, parent_contact, parent_district, parent_salvation, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.fullName, s.gender, s.grade, s.classNo, s.address || '', s.contact || '',
        s.parentName || '', s.parentContact || '', s.parentDistrict || '',
        s.parentSalvation || '미구원', s.note || '',
      ],
    )
  }

  console.log(`students ${seedStudents.length}건 삽입 완료`)
}

async function seed() {
  await seedStudentsTable()

  const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM teachers')

  if (cnt > 0) {
    console.log('teachers 테이블에 이미 데이터가 있어 교사/계정 시드를 건너뜁니다.')

    return
  }

  for (const u of seedUsers) {
    const [result] = await pool.query(
      `INSERT INTO teachers
        (id, full_name, department, position, assigned_class, extra_role, contact, service_group, bs, occupation, salvation_birthday, avatar, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        u.id, u.fullName, u.department, u.position, u.assignedClass, u.extraRole,
        u.contact, u.serviceGroup, u.bs, u.occupation, u.salvationBirthday, u.avatar, u.status,
      ],
    )

    for (const h of u.serviceHistory || []) {
      await pool.query(
        'INSERT INTO service_history (teacher_id, year, department, position, assigned_class) VALUES (?, ?, ?, ?, ?)',
        [result.insertId, h.year, h.department, h.position || '', h.assignedClass || ''],
      )
    }
  }

  console.log(`teachers ${seedUsers.length}건 삽입 완료`)

  for (const a of seedAccounts) {
    const passwordHash = await bcrypt.hash(a.password, 10)

    await pool.query(
      'INSERT INTO accounts (username, email, password_hash, role, teacher_id) VALUES (?, ?, ?, ?, ?)',
      [a.username, a.email, passwordHash, a.role, a.teacherId],
    )
  }

  console.log(`accounts ${seedAccounts.length}건 삽입 완료 (admin@demo.com/admin, client@demo.com/client)`)
}

seed()
  .then(() => pool.end())
  .catch(err => {
    console.error(err)
    pool.end()
    process.exit(1)
  })
