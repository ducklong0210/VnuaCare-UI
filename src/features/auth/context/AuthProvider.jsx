import { useState } from 'react'
import { AuthContext } from './authContext.js'

// Component Provider bọc quanh toàn bộ app để cung cấp user, login, logout
export function AuthProvider({ children }) {
  // Khởi tạo state 'user': kiểm tra xem trong localStorage đã lưu thông tin người dùng từ trước chưa
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    // Nếu có dữ liệu cũ thì giải mã từ JSON sang Object, nếu chưa có thì để null (chưa đăng nhập)
    return savedUser ? JSON.parse(savedUser) : null
  })

  // Hàm xử lý khi đăng nhập thành công
  const login = (userData) => {
    setUser(userData) // Cập nhật vào state để giao diện tự chuyển trang
    localStorage.setItem('user', JSON.stringify(userData)) // Lưu vào bộ nhớ máy
    if (userData.accessToken) {
      localStorage.setItem('accessToken', userData.accessToken)
    }
  }

  // Hàm xử lý đăng xuất
  const logout = () => {
    setUser(null) // Xóa user khỏi state -> giao diện tự quay về màn hình đăng nhập
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
  }

  return (
    // Chia sẻ các biến và hàm này cho tất cả component con bên trong dùng được
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

