import { defineStore } from 'pinia'
import axios from '@axios'

export const useStudentListStore = defineStore('StudentListStore', {
  actions: {
    // 👉 학생 목록 조회
    fetchStudents(params) { return axios.get('/apps/students/list', { params }) },

    // 👉 학생 통계 (전체/학년별/구원여부별 인원)
    fetchStats() { return axios.get('/apps/students/stats') },

    // 👉 분반 구성 (학년·반·분반선생님) + 구역 목록
    fetchClasses() { return axios.get('/apps/students/classes') },

    // 👉 학생 추가
    addStudent(studentData) {
      return axios.post('/apps/students/student', { student: studentData })
    },

    // 👉 학생 상세 조회
    fetchStudent(id) { return axios.get(`/apps/students/${id}`) },

    // 👉 학생 수정
    updateStudent(id, studentData) { return axios.put(`/apps/students/${id}`, studentData) },

    // 👉 학생 삭제
    deleteStudent(id) { return axios.delete(`/apps/students/${id}`) },

    // ── 출결 (학생 전용 API) ──

    // 👉 로그인한 교사 정보 — 본인 담당 범위를 정하는 데만 사용합니다. (교사 조회가 맞습니다)
    fetchUser(id) { return axios.get(`/apps/users/${id}`) },

    // 👉 출결 조회
    fetchAttendance(params) { return axios.get('/apps/students/attendance', { params }) },

    // 👉 출결 저장
    saveAttendance(data) { return axios.post('/apps/students/attendance', data) },

    // 👉 월별 반 평균 출석 통계
    fetchMonthlyDeptStats(params) {
      return axios.get('/apps/students/attendance/monthly-stats', { params })
    },

    // 👉 개인 출석 통계 (월간/분기/연간)
    fetchUserAttendanceStats(studentId) {
      return axios.get('/apps/students/attendance/user-stats', { params: { studentId } })
    },

    // 👉 개인 연도별 출석 통계
    fetchUserYearlyStats(studentId) {
      return axios.get('/apps/students/attendance/user-yearly-stats', { params: { studentId } })
    },
  },
})
