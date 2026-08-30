import { defineStore } from 'pinia'
import axios from '@axios'

export const useAccountStore = defineStore('AccountStore', {
  actions: {
    // 👉 계정 목록
    fetchAccounts() { return axios.get('/apps/accounts') },

    // 👉 계정에 연결할 교사 선택 목록
    fetchTeacherOptions() { return axios.get('/apps/accounts/teacher-options') },

    // 👉 계정 발급
    createAccount(payload) { return axios.post('/apps/accounts', payload) },

    // 👉 계정 수정 (권한 / 연결 교사 / 이메일)
    updateAccount(id, payload) { return axios.put(`/apps/accounts/${id}`, payload) },

    // 👉 비밀번호 재발급 (관리자가 지정)
    resetPassword(id, password) { return axios.put(`/apps/accounts/${id}/password`, { password }) },

    // 👉 본인 비밀번호 변경
    changeMyPassword(currentPassword, newPassword) {
      return axios.put('/apps/accounts/me/password', { currentPassword, newPassword })
    },

    // 👉 계정 삭제
    deleteAccount(id) { return axios.delete(`/apps/accounts/${id}`) },
  },
})

// 응답의 errors 객체에서 첫 메시지를 뽑아 화면에 보여줍니다.
export const firstErrorMessage = (error, fallback = '요청을 처리할 수 없습니다') => {
  const errors = error?.response?.data?.errors

  if (errors) {
    const first = Object.values(errors).flat().find(Boolean)
    if (first) return first
  }

  return fallback
}

export const ROLE_OPTIONS = [
  { title: '관리자', value: 'admin' },
  { title: '일반', value: 'client' },
]

export const roleLabel = role => (role === 'admin' ? '관리자' : '일반')
