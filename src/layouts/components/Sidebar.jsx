import { MENU_ITEMS } from '../../components/data/menuNavData.js'
import Tabs from '../../components/ui/Tabs.jsx'
import { useNavigation } from '../../routers/useNavigation.js'

export default function Sidebar({ activeTab }) {
  const { activeTab: currentTab, navigate } = useNavigation()
  const active = activeTab || currentTab

  return (
    <aside className="left-sidebar">
      <nav className="sidebar-nav">
        <span className="nav-section-label">CHỨC NĂNG HỆ THỐNG</span>

        <Tabs
          ButtonsContainer="ul"
          buttonsClassName="nav-list"
          buttons={
            MENU_ITEMS.map(({ id, label, Icon }) => {
              const isActive = active === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(id)}
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

