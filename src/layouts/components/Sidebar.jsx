import { MENU_ITEMS } from '../../components/data/menuNavData.js'
import Tabs from '../../components/ui/Tabs.jsx'

export default function Sidebar({ activeTab = 'dashboard' }) {
  return (
    <aside className="left-sidebar">
      <nav className="sidebar-nav">
        <span className="nav-section-label">CHỨC NĂNG HỆ THỐNG</span>

        {/* Tích hợp component Tabs để hiển thị các nút chuyển trang */}
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
    </aside>
  )
}
