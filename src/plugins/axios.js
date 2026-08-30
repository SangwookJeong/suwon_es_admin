import axios from 'axios'
import router from '@/router'

const axiosIns = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
})

axiosIns.interceptors.request.use(config => {
  const accessToken = JSON.parse(localStorage.getItem('accessToken') || 'null')

  if (accessToken)
    config.headers.Authorization = `Bearer ${accessToken}`

  return config
})

axiosIns.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userData')
      localStorage.removeItem('userAbilities')
      localStorage.removeItem('accessToken')

      if (router.currentRoute.value.name !== 'login')
        router.push({ name: 'login' })
    }

    return Promise.reject(error)
  },
)

export default axiosIns
