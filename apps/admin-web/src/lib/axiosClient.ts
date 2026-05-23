import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { getAccessToken } from './cognito'
import { toast } from 'sonner'

const api_base = import.meta.env.VITE_API_BASE_URL

const api: AxiosInstance = axios.create({
  baseURL: api_base,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? error.message
    toast.error(message)
    return Promise.reject(new Error(`API error: ${message}`))
  },
)

export default api
