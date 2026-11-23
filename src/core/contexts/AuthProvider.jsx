//
// Provider quản lý trạng thái đăng nhập và phiên làm việc toàn ứng dụng
// Khôi phục user từ localStorage khi tải lại trang và cung cấp hai hàm login(), logout()
//

import { useState } from 'react';
import { AuthContext } from './authContext.js';

// Component Provider bọc quanh toàn bộ app để cung cấp user, login, logout
export function AuthProvider({ children }) {
  // Khởi tạo state 'user': kiểm tra và parse an toàn từ localStorage để tránh crash nếu dữ liệu hỏng
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      return null;
    }
  });

  // Hàm xử lý khi đăng nhập thành công
  const login = (userData) => {
    setUser(userData); // Cập nhật vào state để giao diện tự chuyển trang
    localStorage.setItem('user', JSON.stringify(userData)); // Lưu vào bộ nhớ máy
    if (userData.accessToken) {
      localStorage.setItem('accessToken', userData.accessToken);
    }
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    setUser(null); // Xóa user khỏi state -> giao diện tự quay về màn hình đăng nhập
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  return (
    // Chia sẻ các biến và hàm này cho tất cả component con bên trong dùng được
    <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
  );
}
