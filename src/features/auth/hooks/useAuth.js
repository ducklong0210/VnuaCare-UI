import { useContext } from 'react'
import { AuthContext } from '../context/authContext.js'

/**
 * Custom Hook tiện ích để lấy nhanh thông tin đăng nhập ở bất kỳ đâu:
 * const { user, login, logout } = useAuth()
 */
export function useAuth() {
  return useContext(AuthContext)
}
