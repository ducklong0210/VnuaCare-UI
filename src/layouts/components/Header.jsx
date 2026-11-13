import { useAuth } from '../../features/auth/hooks/useAuth.js'
import { IconBell, IconLogout } from '../../components/ui/Icons.jsx'

/**
 * ==============================================================================
 * COMPONENT: Header (Thanh đầu trang trên cùng — Trải dài 100% chiều ngang)
 * VỊ TRÍ: Nằm ở trên đỉnh cao nhất của toàn bộ website
 * THÀNH PHẦN:
 *   - Bên trái: Logo VNUACARE và tên Cổng Y Tế
 *   - Bên phải: Trạng thái API, Chuông thông báo, Avatar + Tên cán bộ và nút Đăng xuất
 * ==============================================================================
 */
export default function Header() {
  const { user, logout } = useAuth()

  // Chữ cái đầu tên user làm avatar
  const userInitial = (user?.fullname || user?.username || 'U')[0].toUpperCase()

  return (
    <header className="top-header">
      {/* 1. GÓC TRÁI: LOGO THƯƠNG HIỆU */}
      <div className="header-brand">
        <div className="brand-badge">
          <span className="brand-cross">+</span>
        </div>
        <div className="brand-meta">
          <span className="brand-title">VNUACARE</span>
          <span className="brand-subtitle">Cổng Quản Lý Y Tế VNUA</span>
        </div>
      </div>

      {/* 2. GÓC PHẢI: TRẠNG THÁI, THÔNG BÁO, TÀI KHOẢN & ĐĂNG XUẤT */}
      <div className="header-right-tools">
        {/* Nhãn trạng thái kết nối máy chủ */}
        <span className="status-badge">
          <span className="status-dot"></span>
          Đang kết nối: VNUA API
        </span>

        {/* Nút Chuông thông báo y tế */}
        <button
          type="button"
          className="notification-bell-btn"
          title="Thông báo hệ thống y tế"
        >
          <IconBell size={18} />
        </button>

        <div className="header-divider"></div>

        {/* Khối thông tin tài khoản đang đăng nhập */}
        <div className="header-user-profile">
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

        {/* Nút Đăng xuất ở góc trên cùng */}
        <button
          type="button"
          className="btn-header-logout"
          onClick={logout}
          title="Đăng xuất khỏi hệ thống"
        >
          <IconLogout size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}
