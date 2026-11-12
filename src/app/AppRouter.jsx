import { useAuth } from '../features/auth/hooks/useAuth.js'
import LoginPage from '../pages/auth/LoginPage.jsx'
import DashboardPage from '../pages/dashboard/DashboardPage.jsx'

/**
 * ==============================================================================
 * COMPONENT: AppRouter
 * VAI TRÒ: "Người gác cổng" điều hướng màn hình
 * NGUYÊN TẮC:
 *   - Nếu 'user' là null (chưa đăng nhập) -> Hiển thị màn hình LoginPage
 *   - Nếu 'user' có dữ liệu (đã đăng nhập) -> Hiển thị màn hình DashboardPage
 * ==============================================================================
 */
function AppRouter() {
  // Lấy thông tin user hiện tại từ AuthContext
  const { user } = useAuth()

  // 1. Chưa đăng nhập -> Trả về trang Đăng nhập
  if (!user) {
    return <LoginPage />
  }

  // 2. Đã đăng nhập thành công -> Trả về trang chủ Dashboard
  return <DashboardPage />
}

export default AppRouter
