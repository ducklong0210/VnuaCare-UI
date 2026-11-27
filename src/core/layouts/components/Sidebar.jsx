//
// Thanh menu điều hướng bên trái (Sidebar) hỗ trợ thu gọn trên desktop và dạng ngăn kéo trượt trên tablet/mobile
// Tự động lọc danh sách chức năng từ MENU_ITEMS theo đúng quyền hạn vai trò của tài khoản đang đăng nhập
//

import { MENU_ITEMS } from '../../../utils/index.js';
import Tabs from '../../../components/SupportAgent/Tabs.jsx';
import { useAuth } from '../../contexts/useAuth.js';
import { useNavigation } from '../../contexts/useNavigation.js';

export default function Sidebar({ activeTab, collapsed = false, onToggle, mobileOpen = false, onCloseMobile }) {
  const { user } = useAuth();
  const { activeTab: currentTab, navigate } = useNavigation();
  const active = activeTab || currentTab;
  const userRole = (user?.role || '').toUpperCase();

  // Lọc danh sách menu theo quyền của vai trò đang đăng nhập
  const visibleMenuItems = MENU_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  // Khi bấm chọn 1 mục menu: điều hướng và tự đóng ngăn kéo trên mobile
  const handleSelectMenuItem = (id) => {
    navigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`left-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      aria-label="Menu điều hướng quản trị"
    >
      <nav className="sidebar-nav">
        {/* Hàng tiêu đề & nút thu gọn (desktop) / nút đóng (mobile) */}
        <div className="sidebar-top-row">
          <span className="nav-section-label">CHỨC NĂNG HỆ THỐNG</span>

          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggle}
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {collapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>

          <button
            type="button"
            className="sidebar-mobile-close-btn"
            onClick={onCloseMobile}
            title="Đóng menu"
            aria-label="Đóng menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <Tabs
          ButtonsContainer="ul"
          buttonsClassName="nav-list"
          buttons={visibleMenuItems.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectMenuItem(id)}
                  title={collapsed ? label : undefined}
                >
                  <Icon className="nav-icon" size={19} />
                  <span className="nav-text">{label}</span>
                </button>
              </li>
            );
          })}
        />
      </nav>
    </aside>
  );
}
