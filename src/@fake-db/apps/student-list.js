import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar6 from '@images/avatars/avatar-6.png'
import avatar7 from '@images/avatars/avatar-7.png'
import avatar8 from '@images/avatars/avatar-8.png'
import mock from '@/@fake-db/mock'
import { useMock } from '@/@fake-db/useMock'

// 학생 출결 목업(student-attendance.js)이 같은 학생 목록을 사용합니다.
// let 바인딩이라 import 순서와 무관하게 요청 시점에 채워진 값을 읽습니다.
export let mockStudents = []

if (useMock)
  registerStudentListMock()

function registerStudentListMock() {
// 👉 분반 구성 — 교사 목업(user-list.js)의 2026년 담당 분반과 동일하게 맞췄습니다.
//    key = `${학년}-${반}`, value = 분반선생님 이름
  const classTeachers = {
    '1-1': '남귀중', '1-2': '이영란', '1-3': '김재민', '1-4': '김지영', '1-5': '김종혁', '1-6': '이은주',
    '2-1': '한지수', '2-2': '김이슬', '2-3': '조서영', '2-4': '정지혜', '2-5': '이하은', '2-6': '박채린',
    '3-1': '박현진', '3-2': '허유정', '3-3': '황인숙', '3-4': '박도현', '3-5': '신민서',
    '4-1': '유한철', '4-2': '손새라', '4-3': '이슬이', '4-4': '정여민', '4-5': '정은비', '4-6': '김은혜',
    '5-1': '정성한', '5-2': '박효경', '5-3': '유인지', '5-4': '이시연', '5-5': '안혜송', '5-6': '조현서',
    '6-1': '최명근', '6-2': '김성혁', '6-3': '박용원', '6-4': '이성심', '6-5': '김효숙', '6-6': '최유주', '6-7': '박유빈',
  }

  // ℹ️ 시드 고정 난수(mulberry32) — 새로고침해도 항상 같은 목업이 나오도록 합니다.
  let seed = 20260823

  const rand = () => {
    seed = seed + 0x6D2B79F5 | 0

    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)

    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t

    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }

  const pick = arr => arr[Math.floor(rand() * arr.length)]
  const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1))

  const surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍', '유', '고', '문', '양', '손', '배', '백', '허', '남', '심']

  const boyNames = ['민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지후', '준서', '건우', '현우', '우진', '선우', '서진', '연우', '유준', '정우', '승우', '준우', '지훈', '시윤', '은우', '도현', '재윤', '민재', '태윤', '동현', '주호']

  const girlNames = ['서연', '서윤', '지우', '서현', '하은', '하윤', '민서', '지유', '윤서', '채원', '수아', '지아', '지윤', '다은', '은서', '예은', '수빈', '소율', '예린', '지안', '아린', '시은', '유나', '채은', '가은', '나윤', '하율', '주아', '하린']

  const fatherNames = ['성호', '재훈', '동주', '기석', '태영', '광수', '민철', '영진', '준혁', '상현', '진우', '경택', '용대', '수영', '병철', '종민', '대한', '형준', '승철', '재호']
  const motherNames = ['미영', '선희', '은정', '혜진', '수정', '경아', '영숙', '지현', '아름', '민경', '유진', '소영', '정아', '현주', '보람', '다정', '윤경', '나영', '희수', '주희']

  // 동 → 구, 구역 매핑 (부모님 구역은 거주 동네를 따라갑니다)
  const areas = [
    { gu: '영통구', dong: '영통동', district: '영통구역' },
    { gu: '영통구', dong: '매탄동', district: '매탄구역' },
    { gu: '영통구', dong: '원천동', district: '영통구역' },
    { gu: '영통구', dong: '망포동', district: '망포구역' },
    { gu: '영통구', dong: '이의동', district: '광교구역' },
    { gu: '팔달구', dong: '인계동', district: '인계구역' },
    { gu: '팔달구', dong: '우만동', district: '인계구역' },
    { gu: '팔달구', dong: '매교동', district: '매교구역' },
    { gu: '권선구', dong: '권선동', district: '권선구역' },
    { gu: '권선구', dong: '세류동', district: '세류구역' },
    { gu: '권선구', dong: '호매실동', district: '호매실구역' },
    { gu: '장안구', dong: '정자동', district: '정자구역' },
    { gu: '장안구', dong: '조원동', district: '조원구역' },
    { gu: '장안구', dong: '천천동', district: '율전구역' },
    { gu: '장안구', dong: '율전동', district: '율전구역' },
  ]

  const apartments = ['주공1단지', '벽산아파트', '삼성래미안', 'e편한세상', '힐스테이트', '푸르지오', '아이파크', '한양아파트', '신동아파밀리에', '광교센트럴', '자이아파트', '동보아파트']

  const notes = [
    '견과류 알레르기 있음',
    '차량 이용 (매탄 노선)',
    '조부모님과 함께 거주',
    '형제 자매 함께 출석 (동생 유치부)',
    '새가족 (2026년 등록)',
    '주일 오후 학원 일정으로 조퇴',
    '천식으로 심한 운동 자제 필요',
    '부모님 중 한 분만 교회 출석',
    '전학 예정 (하반기)',
    '수련회 참석 희망',
    '찬양팀 활동 중',
    '암송 우수 학생',
  ]

  const phone = () => `010-${String(randInt(1000, 9999))}-${String(randInt(1000, 9999))}`

  // 👉 학년 → 부서 매핑 (1~2학년 = 초등1반, 3~4학년 = 초등2반, 5~6학년 = 초등3반)
  const departmentOf = grade => {
    if (grade <= 2) return '초등1반'
    if (grade <= 4) return '초등2반'

    return '초등3반'
  }

  const departmentOrder = ['초등1반', '초등2반', '초등3반']

  // 더미 사진 — avatar-5(수염 있는 성인)와 중복 이미지(avatar-9~15)는 제외하고 성별에 맞춰 배정합니다
  const boyAvatars = [avatar1, avatar3, avatar7]
  const girlAvatars = [avatar2, avatar4, avatar6, avatar8]

  const usedNames = new Set()

  const uniqueName = isBoy => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const name = pick(surnames) + pick(isBoy ? boyNames : girlNames)

      if (!usedNames.has(name)) {
        usedNames.add(name)

        return name
      }
    }

    // 30번 안에 못 뽑으면 뒤에 번호를 붙여 중복을 피합니다
    const fallback = `${pick(surnames)}${pick(isBoy ? boyNames : girlNames)}${usedNames.size}`

    usedNames.add(fallback)

    return fallback
  }

  const students = []
  let nextId = 1

  Object.entries(classTeachers).forEach(([classKey, teacherName]) => {
    const [grade, classNo] = classKey.split('-').map(Number)
    const headcount = randInt(4, 6)

    for (let i = 0; i < headcount; i++) {
      const isBoy = rand() < 0.5
      const fullName = uniqueName(isBoy)
      const area = pick(areas)

      // 고학년일수록 본인 휴대폰 보유율이 높습니다
      const hasOwnPhone = rand() < (grade >= 4 ? 0.8 : 0.3)

      // 부모님 성함: 70%는 아버지(자녀와 같은 성), 30%는 어머니(다른 성)
      const isFather = rand() < 0.7

      const parentName = isFather
        ? fullName[0] + pick(fatherNames)
        : pick(surnames) + pick(motherNames)

      students.push({
        id: nextId++,
        fullName,
        gender: isBoy ? '남' : '여',
        department: departmentOf(grade),
        grade,
        classNo,
        teacherName,
        address: `경기 수원시 ${area.gu} ${area.dong} ${pick(apartments)} ${randInt(101, 115)}동 ${randInt(1, 15)}${String(randInt(1, 4)).padStart(2, '0')}호`,
        contact: hasOwnPhone ? phone() : '',
        parentName,
        parentContact: phone(),
        parentDistrict: area.district,
        parentSalvation: rand() < 0.7 ? '구원' : '미구원',
        note: rand() < 0.25 ? pick(notes) : '',
        avatar: pick(isBoy ? boyAvatars : girlAvatars),
      })
    }
  })

  mockStudents = students

  // 다중/단일 선택 값을 배열로 정규화 (빈 값이면 필터 없음을 의미하는 빈 배열)
  const toFilterArray = value => {
    if (value === undefined || value === null || value === '') return []

    return Array.isArray(value) ? value : [value]
  }

  // 👉 학생 목록 반환 (학년/반/구역/구원여부 다중 선택 필터 지원)
  mock.onGet('/apps/students/list').reply(config => {
    const {
      q = '',
      perPage = 10,
      currentPage = 1,
    } = config.params ?? {}

    const departments = toFilterArray(config.params?.department)
    const grades = toFilterArray(config.params?.grade).map(Number)
    const classNos = toFilterArray(config.params?.classNo).map(Number)
    const districts = toFilterArray(config.params?.parentDistrict)
    const salvations = toFilterArray(config.params?.parentSalvation)
    const teachers = toFilterArray(config.params?.teacherName)

    const queryLower = q.toLowerCase()

    let filteredStudents = students.filter(student =>
      (
        student.fullName.toLowerCase().includes(queryLower)
      || student.parentName.toLowerCase().includes(queryLower)
      || student.teacherName.toLowerCase().includes(queryLower)
      || student.contact.includes(q)
      || student.parentContact.includes(q)
      || student.address.includes(q)
      )
    && (!departments.length || departments.includes(student.department))
    && (!grades.length || grades.includes(student.grade))
    && (!classNos.length || classNos.includes(student.classNo))
    && (!districts.length || districts.includes(student.parentDistrict))
    && (!salvations.length || salvations.includes(student.parentSalvation))
    && (!teachers.length || teachers.includes(student.teacherName)),
    )

    const totalPage = Math.ceil(filteredStudents.length / perPage) || 1
    const totalStudents = filteredStudents.length

    if (perPage) {
      const firstIndex = (currentPage - 1) * perPage
      const lastIndex = perPage * currentPage

      filteredStudents = filteredStudents.slice(firstIndex, lastIndex)
    }

    return [200, { students: filteredStudents, totalPage, totalStudents }]
  })

  // 👉 학생 통계 (부서별 / 학년별 인원)
  mock.onGet('/apps/students/stats').reply(() => {
    const deptCounts = {}
    const gradeCounts = {}

    departmentOrder.forEach(dept => {
      deptCounts[dept] = 0
    })

    students.forEach(s => {
      deptCounts[s.department] = (deptCounts[s.department] || 0) + 1
      gradeCounts[s.grade] = (gradeCounts[s.grade] || 0) + 1
    })

    return [200, {
      total: students.length,
      deptCounts,
      gradeCounts,
      departmentOrder,
    }]
  })

  // 👉 분반 구성 (필터/입력 폼에서 사용하는 학년·반·담당교사 목록)
  mock.onGet('/apps/students/classes').reply(() => {
    const classes = Object.entries(classTeachers).map(([classKey, teacherName]) => {
      const [grade, classNo] = classKey.split('-').map(Number)

      return { grade, classNo, teacherName, department: departmentOf(grade) }
    })

    return [200, {
      classes,
      departmentOrder,
      districts: [...new Set(students.map(s => s.parentDistrict))].sort(),
    }]
  })

  // 👉 학생 추가
  mock.onPost('/apps/students/student').reply(config => {
    const { student } = JSON.parse(config.data)
    const { length } = students
    let lastIndex = 0

    if (length)
      lastIndex = students[length - 1].id

    student.id = lastIndex + 1
    students.push(student)

    return [201, { student }]
  })

  // 👉 학생 상세 조회
  mock.onGet(/\/apps\/students\/\d+/).reply(config => {
    const id = Number(config.url?.substring(config.url.lastIndexOf('/') + 1))
    const student = students.find(e => e.id === id)

    if (student)
      return [200, student]

    return [404]
  })

  // 👉 학생 수정
  mock.onPut(/\/apps\/students\/\d+/).reply(config => {
    const id = Number(config.url?.substring(config.url.lastIndexOf('/') + 1))
    const studentIndex = students.findIndex(e => e.id === id)

    if (studentIndex !== -1) {
      students[studentIndex] = { ...students[studentIndex], ...JSON.parse(config.data) }

      return [200, students[studentIndex]]
    }

    return [404]
  })

  // 👉 학생 삭제
  mock.onDelete(/\/apps\/students\/\d+/).reply(config => {
    const id = Number(config.url?.substring(config.url.lastIndexOf('/') + 1))
    const studentIndex = students.findIndex(e => e.id === id)

    if (studentIndex !== -1) {
      students.splice(studentIndex, 1)

      return [200]
    }

    return [404]
  })
}
