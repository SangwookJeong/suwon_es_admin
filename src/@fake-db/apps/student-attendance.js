import mock from '@/@fake-db/mock'
import { useMock } from '@/@fake-db/useMock'
import { mockStudents } from '@/@fake-db/apps/student-list'

if (useMock)
  registerStudentAttendanceMock()

function registerStudentAttendanceMock() {
// 학생 출결 목업.
// 실제 백엔드(backend/src/routes/student-attendance.routes.js)와 같은 응답 형태를 흉내냅니다.
// 저장한 내용은 새로고침하면 사라집니다. (메모리 보관)

  // key = `${date}_${type}` -> 출석한 학생 id 집합
  const attendance = new Map()

  const keyOf = (date, type) => `${date}_${type}`

  // ℹ️ 시드 고정 난수 — 새로고침해도 같은 과거 출결이 나오도록 합니다.
  let seed = 20260830

  const rand = () => {
    seed = seed + 0x6D2B79F5 | 0

    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)

    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t

    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }

  const toDateStr = d => d.toISOString().slice(0, 10)

  // 최근 8주치 일요일에 대해 그럴듯한 과거 출결을 만들어 둡니다.
  // (이게 없으면 월별 통계가 항상 0이라 화면 확인이 어렵습니다)
  const seedPastAttendance = () => {
    if (!mockStudents.length)
      return

    const sunday = new Date()

    sunday.setDate(sunday.getDate() - sunday.getDay()) // 이번 주 일요일

    for (let week = 0; week < 8; week++) {
      const date = toDateStr(sunday)
      const present = new Set()

      mockStudents.forEach(s => {
        if (rand() < 0.85)
          present.add(s.id)
      })

      attendance.set(keyOf(date, '주일오전'), present)
      sunday.setDate(sunday.getDate() - 7)
    }
  }

  let seeded = false

  // mockStudents 는 student-list.js 가 채우므로 첫 요청 때 한 번만 초기화합니다.
  const ensureSeeded = () => {
    if (seeded || !mockStudents.length)
      return

    seeded = true
    seedPastAttendance()
  }

  const buildRecords = (date, type) => {
    const present = attendance.get(keyOf(date, type)) || new Set()

    return mockStudents.map(s => ({
      id: s.id,
      fullName: s.fullName,
      grade: s.grade,
      classNo: s.classNo,
      className: `${s.grade}학년 ${s.classNo}반`,
      department: s.department,
      gender: s.gender,
      contact: s.contact,
      parentName: s.parentName,
      parentContact: s.parentContact,
      parentDistrict: s.parentDistrict,
      parentSalvation: s.parentSalvation,
      avatar: s.avatar,
      present: present.has(s.id),
    }))
  }

  // 👉 월별 반 평균 출석 통계 (/:date 형태가 없어 순서 무관하지만 명시적으로 먼저 등록)
  mock.onGet('/apps/students/attendance/monthly-stats').reply(config => {
    ensureSeeded()

    const { month, type = '주일오전' } = config.params ?? {}

    const days = [...attendance.keys()]
      .filter(k => k.startsWith(month) && k.endsWith(`_${type}`))

    const deptMonthlyStats = {}

    mockStudents.forEach(s => {
      if (!deptMonthlyStats[s.department])
        deptMonthlyStats[s.department] = { total: 0, presentAvg: 0, rate: 0, days: days.length }

      deptMonthlyStats[s.department].total += 1
    })

    const presentSum = {}

    days.forEach(k => {
      const present = attendance.get(k)

      mockStudents.forEach(s => {
        if (present.has(s.id))
          presentSum[s.department] = (presentSum[s.department] || 0) + 1
      })
    })

    Object.keys(deptMonthlyStats).forEach(dept => {
      const entry = deptMonthlyStats[dept]

      if (!days.length) {
        entry.presentAvg = 0
        entry.rate = 0

        return
      }

      entry.presentAvg = Math.round(((presentSum[dept] || 0) / days.length) * 10) / 10
      entry.rate = entry.total > 0 ? Math.round((entry.presentAvg / entry.total) * 100) : 0
    })

    return [200, { deptMonthlyStats, days: days.length }]
  })

  // 👉 개인 출석 통계 (월간/분기/연간)
  mock.onGet('/apps/students/attendance/user-stats').reply(config => {
    ensureSeeded()

    const studentId = Number(config.params?.studentId ?? config.params?.userId)
    const sessions = [...attendance.keys()]

    const calc = filterFn => {
      const scoped = sessions.filter(k => filterFn(k.split('_')[0]))
      const total = scoped.length
      const present = scoped.filter(k => attendance.get(k).has(studentId)).length

      return { total, present, rate: total > 0 ? Math.round((present / total) * 100) : 0 }
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const quarter = Math.floor(month / 3)
    const qStart = quarter * 3
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`

    return [200, {
      monthly: { ...calc(d => d.startsWith(monthPrefix)), label: `${month + 1}월` },
      quarterly: {
        ...calc(d => {
          if (!d.startsWith(`${year}-`))
            return false

          const m = Number(d.split('-')[1]) - 1

          return m >= qStart && m < qStart + 3
        }),
        label: `${quarter + 1}분기`,
      },
      yearly: { ...calc(d => d.startsWith(`${year}-`)), label: `${year}년` },
    }]
  })

  // 👉 개인 연도별 출석 통계
  mock.onGet('/apps/students/attendance/user-yearly-stats').reply(config => {
    ensureSeeded()

    const studentId = Number(config.params?.studentId ?? config.params?.userId)
    const sessions = [...attendance.keys()]
    const years = [...new Set(sessions.map(k => k.slice(0, 4)))].sort((a, b) => b - a)

    const yearlyStats = {}

    years.forEach(y => {
      const scoped = sessions.filter(k => k.startsWith(`${y}-`))
      const total = scoped.length
      const present = scoped.filter(k => attendance.get(k).has(studentId)).length

      yearlyStats[Number(y)] = { total, present, rate: total > 0 ? Math.round((present / total) * 100) : 0 }
    })

    return [200, { yearlyStats }]
  })

  // 👉 특정 날짜/구분의 출결 현황
  mock.onGet('/apps/students/attendance').reply(config => {
    ensureSeeded()

    const { date, type = '주일오전' } = config.params ?? {}
    const records = buildRecords(date, type)

    const total = records.length
    const presentCount = records.filter(r => r.present).length

    const deptStats = {}

    records.forEach(r => {
      if (!deptStats[r.department])
        deptStats[r.department] = { total: 0, present: 0 }

      deptStats[r.department].total += 1
      if (r.present)
        deptStats[r.department].present += 1
    })

    return [200, {
      records,
      total,
      presentCount,
      absentCount: total - presentCount,
      rate: total > 0 ? Math.round((presentCount / total) * 100) : 0,
      deptStats,
    }]
  })

  // 👉 출결 저장 (해당 date+type 의 출석자 목록을 통째로 교체)
  mock.onPost('/apps/students/attendance').reply(config => {
    ensureSeeded()

    const { date, type = '주일오전', presentIds = [] } = JSON.parse(config.data || '{}')

    if (!date)
      return [400, { errors: { date: ['날짜가 필요합니다'] } }]

    attendance.set(keyOf(date, type), new Set(presentIds))

    return [200]
  })
}
