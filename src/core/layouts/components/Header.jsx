//
// Thanh công cụ trên cùng (Top Header) của hệ thống quản trị
// Hiển thị nút mở menu mobile, logo VnuaCare, trạng thái kết nối API, thông tin tài khoản và nút đăng xuất
//

import { useAuth } from '../../contexts/useAuth.js';
import { useNavigation } from '../../contexts/useNavigation.js';
import { IconBell, IconLogout } from '../../../components/SupportAgent/Icons.jsx';
import { ROLE_LABELS } from '../../../utils/index.js';

export default function Header({ mobileMenuOpen = false, onToggleMobileMenu }) {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();

  // Chữ cái đầu tên user làm avatar và chuẩn hóa vai trò chữ hoa
  const displayName = user?.fullName || user?.username || 'Cán bộ y tế';
  const userInitial = displayName[0].toUpperCase();
  const normalizedRole = (user?.role || '').toUpperCase();

  return (
    <header className="top-header">
      {/* BÊN TRÁI: NÚT MENU MOBILE + LOGO */}
      <div className="header-left-group">
        <button
          type="button"
          className="header-mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        <button
          type="button"
          className="header-brand"
          onClick={() => navigate('home')}
          title="Về Trang chủ VnuaCare"
        >
          <span className="brand-logo-wrap">
            <img src="/logo.png" alt="Logo VnuaCare" className="brand-logo-img" />
          </span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-meta">
            <span className="brand-title">VNUACARE</span>
            <span className="brand-subtitle">Cổng Quản Lý Y Tế VNUA</span>
          </span>
        </button>
      </div>

      {/* BÊN PHẢI: TRẠNG THÁI, THÔNG BÁO, TÀI KHOẢN & ĐĂNG XUẤT */}
      <div className="header-right-tools">
        {/* Nhãn trạng thái kết nối máy chủ */}
        <span className="status-badge">
          <span className="status-dot"></span>
          Đang kết nối: VNUA API
        </span>

        {/* Nút Chuông thông báo y tế */}
        <button type="button" className="notification-bell-btn" title="Thông báo hệ thống y tế" aria-label="Thông báo hệ thống y tế">
          <IconBell size={18} />
        </button>

        <div className="header-divider" aria-hidden="true"></div>

        {/* Khối thông tin tài khoản đang đăng nhập */}
        <div className="header-user-profile" title={`${displayName} — ${ROLE_LABELS[normalizedRole] || user?.role || 'Quản trị viên'}`}>
          <div className="user-avatar-circle">{userInitial}</div>
          <div className="user-details">
            <span className="user-fullname">{displayName}</span>
            <span className="user-role">{ROLE_LABELS[normalizedRole] || user?.role || 'Quản trị viên'}</span>
          </div>
        </div>

        {/* Nút Đăng xuất ở góc trên cùng */}
        <button
          type="button"
          className="btn-header-logout"
          onClick={() => {
            logout();
            navigate('home');
          }}
          title="Đăng xuất khỏi hệ thống"
          aria-label="Đăng xuất khỏi hệ thống"
        >
          <IconLogout size={16} />
          <span className="btn-logout-label">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
