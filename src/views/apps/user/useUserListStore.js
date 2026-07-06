import { defineStore } from 'pinia'
import axios from '@axios'

export const useUserListStore = defineStore('UserListStore', {
  actions: {
    // 👉 Fetch users data
    fetchUsers(params) { return axios.get('/apps/users/list', { params }) },

    // 👉 Fetch stats
    fetchStats() { return axios.get('/apps/users/stats') },

    // 👉 Add User
    addUser(userData) {
      return new Promise((resolve, reject) => {
        axios.post('/apps/users/user', { user: userData })
          .then(response => resolve(response))
          .catch(error => reject(error))
      })
    },

    // 👉 Fetch single user
    fetchUser(id) {
      return new Promise((resolve, reject) => {
        axios.get(`/apps/users/${id}`)
          .then(response => resolve(response))
          .catch(error => reject(error))
      })
    },

    // 👉 Update user
    updateUser(id, userData) {
      return new Promise((resolve, reject) => {
        axios.put(`/apps/users/${id}`, userData)
          .then(response => resolve(response))
          .catch(error => reject(error))
      })
    },

    // 👉 Delete user
    deleteUser(id) {
      return new Promise((resolve, reject) => {
        axios.delete(`/apps/users/${id}`)
          .then(response => resolve(response))
          .catch(error => reject(error))
      })
    },

    // 👉 Fetch attendance
    fetchAttendance(params) {
      return axios.get('/apps/attendance', { params })
    },

    // 👉 Save attendance
    saveAttendance(data) {
      return axios.post('/apps/attendance', data)
    },

    // 👉 Fetch monthly dept stats
    fetchMonthlyDeptStats(params) {
      return axios.get('/apps/attendance/monthly-stats', { params })
    },

    // 👉 Fetch user attendance stats
    fetchUserAttendanceStats(userId) {
      return axios.get('/apps/attendance/user-stats', { params: { userId } })
    },

    // 👉 Fetch user yearly attendance stats
    fetchUserYearlyStats(userId) {
      return axios.get('/apps/attendance/user-yearly-stats', { params: { userId } })
    },
  },
})
