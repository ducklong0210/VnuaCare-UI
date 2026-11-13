import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Footer from './components/Footer.jsx'
import './MainLayout.css'

/**
 * ==============================================================================
 * COMPONENT: MainLayout
 * VAI TRÒ: Khung sườn tổng thể chuẩn cấu trúc website quản trị:
 * 
 *   +-----------------------------------------------------------------------+
 *   | HEADER (100% chiều ngang ở trên cùng: Logo, Thông báo, Tài khoản)    |
 *   +-----------------------+-----------------------------------------------+
 *   | NAV (Sidebar bên trái)| NỘI DUNG CHÍNH (Main Content bên phải)        |
 *   | - Bảng điều khiển     |                                               |
 *   | - Hồ sơ khám          | Quản lý hồ sơ sức khỏe cán bộ...              |
 *   | - Quản lý nhân viên   | [Bộ lọc] [Bảng dữ liệu]                       |
 *   +-----------------------+-----------------------------------------------+
 *   | FOOTER (Chân trang ở dưới cùng: Bản quyền VNUA)                       |
 *   +-----------------------------------------------------------------------+
 * ==============================================================================
 */
export default function MainLayout({ children, activeTab = 'dashboard' }) {
  return (
    <div className="app-layout">
      {/* 1. HEADER Ở TRÊN CÙNG (100% CHIỀU RỘNG) */}
      <Header />

      {/* 2. THÂN WEBSITE: BÊN TRÁI LÀ NAV, BÊN PHẢI LÀ NỘI DUNG */}
      <div className="app-body">
        {/* Thanh Menu điều hướng bên trái (Nav) */}
        <Sidebar activeTab={activeTab} />

        {/* Vùng hiển thị nội dung chính của từng trang */}
        <main className="app-main">
          {children}
        </main>
      </div>

      {/* 3. FOOTER Ở DƯỚI CÙNG */}
      <Footer />
    </div>
  )
}
