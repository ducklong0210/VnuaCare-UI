import { useAuth } from '../../features/auth/hooks/useAuth.js'
import {
  IconDashboard,
  IconUsers,
  IconStaffs,
  IconDoctors,
  IconCampaigns,
  IconRecords,
  IconLogout,
} from '../../components/ui/Icons.jsx'

/**
 * ==============================================================================
 * COMPONENT: Sidebar (Thanh điều hướng bên trái / Nav)
 * VAI TRÒ: 
 *   - Hiển thị logo thương hiệu VNUA Care
 *   - Danh sách menu điều hướng các chức năng quản trị
 *   - Thông tin tài khoản đang đăng nhập và nút Đăng xuất
 * ==============================================================================
 */
export default function Sidebar({ activeTab = 'dashboard' }) {
  const { user, logout } = useAuth()

  // Danh mục menu chuẩn theo các nhóm nghiệp vụ
  const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', Icon: IconDashboard },
    { id: 'records', label: 'Hồ sơ khám cán bộ', Icon: IconRecords },
    { id: 'staffs', label: 'Quản lý nhân viên', Icon: IconStaffs },
    { id: 'doctors', label: 'Quản lý bác sĩ', Icon: IconDoctors },
    { id: 'campaigns', label: 'Đợt khám sức khỏe', Icon: IconCampaigns },
    { id: 'users', label: 'Quản lý người dùng', Icon: IconUsers },
  ]

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

      {/* 2. Danh sách Menu điều hướng (Nav List) */}
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

