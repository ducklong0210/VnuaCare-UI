import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import './MainLayout.css'

/**
 * ==============================================================================
 * COMPONENT: MainLayout
 * VAI TRÒ: 
 *   - "Nhạc trưởng" lắp ghép các thành phần bố cục chung của trang web:
 *     1. Sidebar (Thanh menu bên trái / Nav)
 *     2. Header (Thanh tiêu đề trên cùng)
 *     3. Main (Vùng hiển thị nội dung từng trang - children)
 *     4. Footer (Chân trang hệ thống)
 * ==============================================================================
 */
export default function MainLayout({ children, activeTab = 'dashboard' }) {
  return (
    <div className="admin-root">
      {/* 1. Thanh điều hướng bên trái (Nav / Sidebar) */}
      <Sidebar activeTab={activeTab} />

      {/* 2. Vùng hiển thị nội dung chính bên phải */}
      <div className="admin-body">
        {/* Header trên cùng */}
        <Header activeTab={activeTab} />

        {/* Nội dung cụ thể của trang */}
        <main className="admin-main">
          {children}
        </main>

        {/* Chân trang */}
        <Footer />
      </div>
    </div>
  )
}
