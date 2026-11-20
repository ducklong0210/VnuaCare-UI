// Thanh công cụ trên cùng (Top Header) của giao diện hệ thống
// Hiển thị logo VnuaCare, trạng thái kết nối máy chủ API và chuông thông báo y tế
// Hiển thị thông tin tài khoản đang đăng nhập (tên, vai trò) kèm nút đăng xuất khỏi hệ thống

import { useAuth } from '../../contexts/useAuth.js';
import { useNavigation } from '../../contexts/useNavigation.js';
import { IconBell, IconLogout } from '../../../components/SupportAgent/Icons.jsx';
import { ROLE_LABELS } from '../../../utils/index.js';

export default function Header() {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();

  // Chữ cái đầu tên user làm avatar
  const userInitial = (user?.fullname || user?.username || 'U')[0].toUpperCase();

  return (
    <header className="top-header">
      {/*  LOGO */}
      <div
        className="header-brand"
        onClick={() => navigate('home')}
        style={{ cursor: 'pointer' }}
        title="Về Trang chủ VnuaCare"
      >
        <img src="/logo.png" alt="Logo VnuaCare" className="brand-logo-img" />
        <div className="brand-divider" aria-hidden="true" />
        <div className="brand-meta">
          <span className="brand-title">VNUACARE</span>
          <span className="brand-subtitle">Cổng Quản Lý Y Tế VNUA</span>
        </div>
      </div>

      {/* TRẠNG THÁI, THÔNG BÁO, TÀI KHOẢN & ĐĂNG XUẤT */}
      <div className="header-right-tools">
        {/* Nhãn trạng thái kết nối máy chủ */}
        <span className="status-badge">
          <span className="status-dot"></span>
          Đang kết nối: VNUA API
        </span>

        {/* Nút Chuông thông báo y tế */}
        <button type="button" className="notification-bell-btn" title="Thông báo hệ thống y tế">
          <IconBell size={18} />
        </button>

        <div className="header-divider"></div>

        {/* Khối thông tin tài khoản đang đăng nhập */}
        <div className="header-user-profile">
          <div className="user-avatar-circle">{userInitial}</div>
          <div className="user-details">
            <span className="user-fullname" title={user?.fullname || user?.username}>{user?.fullname || user?.username || 'Cán bộ y tế'}</span>
            <span className="user-role">{ROLE_LABELS[user?.role] || user?.role || 'Quản trị viên'}</span>
          </div>
        </div>

        {/* Nút Đăng xuất ở góc trên cùng */}
        <button type="button" className="btn-header-logout" onClick={() => { logout(); navigate('home'); }} title="Đăng xuất khỏi hệ thống">
          <IconLogout size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
