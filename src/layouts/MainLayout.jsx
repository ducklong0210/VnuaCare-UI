import { useAuth } from '../features/auth/hooks/useAuth.js'
import {
  IconDashboard,
  IconUsers,
  IconStaffs,
  IconDoctors,
  IconCampaigns,
  IconRecords,
  IconLogout,
  IconBell,
} from '../components/ui/Icons.jsx'
import './MainLayout.css'

/**
 * ==============================================================================
 * COMPONENT: MainLayout
 * VAI TRÒ: Khung sườn quản trị tiêu chuẩn (Enterprise Medical Admin)
 * ==============================================================================
 */
export default function MainLayout({ children, activeTab = 'dashboard' }) {
  const { user, logout } = useAuth()

  // Danh mục menu quản lý chuẩn theo Swagger
  const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', Icon: IconDashboard },
    { id: 'records', label: 'Hồ sơ khám cán bộ', Icon: IconRecords },
    { id: 'staffs', label: 'Quản lý nhân viên', Icon: IconStaffs },
    { id: 'doctors', label: 'Quản lý bác sĩ', Icon: IconDoctors },
    { id: 'campaigns', label: 'Đợt khám sức khỏe', Icon: IconCampaigns },
    { id: 'users', label: 'Quản lý người dùng', Icon: IconUsers },
  ]

  // Lấy chữ cái đầu của tên để làm avatar tối giản
  const userInitial = (user?.fullname || user?.username || 'U')[0].toUpperCase()

  return (
    <div className="admin-root">
      {/* 1. THANH ĐIỀU HƯỚNG BÊN TRÁI (SIDEBAR) */}
      <aside className="admin-sidebar">
        {/* Phần Logo thương hiệu */}
        <div className="sidebar-header">
          <div className="brand-badge">
            <span className="brand-cross">+</span>
          </div>
          <div className="brand-meta">
            <span className="brand-title">VNUACARE</span>
            <span className="brand-subtitle">Quản Lý Y Tế VNUA</span>
          </div>
        </div>

        {/* Danh sách các mục menu */}
        <nav className="sidebar-nav">
          <span className="nav-section-label">CHỨC NĂNG HỆ THỐNG</span>
          <ul className="nav-list">
            {menuItems.map(({ id, label, Icon }) => {
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
            })}
          </ul>
        </nav>

        {/* Khối tài khoản & Nút Đăng xuất ở cuối sidebar */}
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

      {/* 2. KHU VỰC NỘI DUNG CHÍNH (BÊN PHẢI) */}
      <div className="admin-body">
        {/* Thanh Header trên cùng */}
        <header className="admin-header">
          <div>
            <h1 className="header-title">
              {menuItems.find((m) => m.id === activeTab)?.label || 'Bảng điều khiển'}
            </h1>
            <p className="header-subtitle">
              Cổng quản lý hồ sơ sức khỏe cán bộ Học viện Nông nghiệp Việt Nam
            </p>
          </div>

          <div className="header-actions">
            {/* Chuông thông báo y tế */}
            <button
              type="button"
              className="notification-bell-btn"
              title="Thông báo hệ thống y tế"
            >
              <IconBell size={18} />
            </button>

            <span className="status-badge">
              <span className="status-dot"></span>
              Đang kết nối: VNUA API
            </span>
          </div>
        </header>

        {/* Nội dung trang */}
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  )
}
