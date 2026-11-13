import { useAuth } from '../../features/auth/hooks/useAuth.js'
import { IconLogout } from '../../components/ui/Icons.jsx'
import { MENU_ITEMS } from '../../components/data/menuNavData.js'
// Import component Tabs vừa tạo
import Tabs from '../../components/ui/Tabs.jsx'

/**
 * ==============================================================================
 * COMPONENT: Sidebar (Thanh điều hướng bên trái / Nav)
 * VAI TRÒ: 
 *   - Hiển thị logo thương hiệu VNUA Care
 *   - Danh sách menu điều hướng sử dụng component Tabs
 *   - Thông tin tài khoản đang đăng nhập và nút Đăng xuất
 * ==============================================================================
 */
export default function Sidebar({ activeTab = 'dashboard' }) {
  const { user, logout } = useAuth()

  // Lấy chữ cái đầu của tên làm avatar
  const userInitial = (user?.fullname || user?.username || 'U')[0].toUpperCase()

  return (
    <aside className="admin-sidebar">
      {/* 1. Phần Logo & Tiêu đề cổng */}
      <div className="sidebar-header">
        <div className="brand-badge">
          <span className="brand-cross">+</span>
        </div>
        <div className="brand-meta">
          <span className="brand-title">VNUACARE</span>
          <span className="brand-subtitle">Quản Lý Y Tế VNUA</span>
        </div>
      </div>

      {/* 2. Danh sách Menu điều hướng (Tích hợp component Tabs) */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">CHỨC NĂNG HỆ THỐNG</span>
        <Tabs
          ButtonsContainer="ul"
          buttonsClassName="nav-list"
          buttons={
            MENU_ITEMS.map(({ id, label, Icon }) => {
              const isActive = activeTab === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="nav-icon" size={19} />
                    <span className="nav-text">{label}</span>
                  </button>
                </li>
              )
            })
          }
        />
      </nav>

      {/* 3. Phần chân Sidebar: Thông tin tài khoản & Nút Đăng xuất */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar-circle">
            {userInitial}
          </div>
          <div className="user-details">
            <span className="user-fullname" title={user?.fullname || user?.username}>
              {user?.fullname || user?.username || 'Cán bộ y tế'}
            </span>
            <span className="user-role">
              {user?.role || 'Quản trị viên'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn-logout"
          onClick={logout}
          title="Đăng xuất khỏi hệ thống"
        >
          <IconLogout size={17} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
