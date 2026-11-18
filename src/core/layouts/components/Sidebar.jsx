// Menu thanh bên trái (Left Sidebar) phục vụ điều hướng toàn bộ hệ thống
// Hiển thị danh mục 6 chức năng chính kèm icon nhận diện trực quan từ menuNavData.js
// Tự động làm nổi bật menu đang được chọn và kích hoạt hàm chuyển trang khi người dùng bấm chuột

import { MENU_ITEMS } from '../../data/menuNavData.js';
import Tabs from '../../components/Tabs.jsx';
import { useNavigation } from '../../contexts/useNavigation.js';

export default function Sidebar({ activeTab }) {
  const { activeTab: currentTab, navigate } = useNavigation();
  const active = activeTab || currentTab;

  return (
    <aside className="left-sidebar">
      <nav className="sidebar-nav">
        <span className="nav-section-label">CHỨC NĂNG HỆ THỐNG</span>

        <Tabs
          ButtonsContainer="ul"
          buttonsClassName="nav-list"
          buttons={MENU_ITEMS.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <button type="button" className={`nav-link ${isActive ? 'active' : ''}`} onClick={() => navigate(id)}>
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
