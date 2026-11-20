// Menu thanh bên trái (Left Sidebar) phục vụ điều hướng toàn bộ hệ thống
// Hiển thị danh mục 6 chức năng chính kèm icon nhận diện trực quan từ menuNavData.js
// Tự động làm nổi bật menu đang được chọn và kích hoạt hàm chuyển trang khi người dùng bấm chuột

import { MENU_ITEMS } from '../../../utils/index.js';
import Tabs from '../../../components/SupportAgent/Tabs.jsx';
import { useAuth } from '../../contexts/useAuth.js';
import { useNavigation } from '../../contexts/useNavigation.js';

export default function Sidebar({ activeTab, collapsed = false, onToggle }) {
  const { user } = useAuth();
  const { activeTab: currentTab, navigate } = useNavigation();
  const active = activeTab || currentTab;
  const userRole = (user?.role || '').toUpperCase();

  // Lọc danh sách menu theo quyền của vai trò đang đăng nhập
  const visibleMenuItems = MENU_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside className={`left-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {/* Hàng tiêu đề & nút thu gọn/mở rộng Sidebar */}
        <div className="sidebar-top-row">
          {!collapsed && <span className="nav-section-label">CHỨC NĂNG HỆ THỐNG</span>}
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
                  onClick={() => navigate(id)}
                  title={collapsed ? label : undefined}
                >
                  <Icon className="nav-icon" size={19} />
                  {!collapsed && <span className="nav-text">{label}</span>}
                </button>
              </li>
            );
          })}
        />
      </nav>
    </aside>
  );
}
