import { useAuth } from '../features/auth/hooks/useAuth.js'
import { useNavigation } from '../routers/useNavigation.js'
import LoginPage from '../pages/auth/LoginPage.jsx'
import DashboardPage from '../pages/dashboard/DashboardPage.jsx'
import DoctorManagerPage from '../pages/doctor-manager/DoctorManagerPage.jsx'
import UserManagerPage from '../pages/user-manager/UserManagerPage.jsx'
import ProfileManagerPage from '../pages/profile-manager/ProfileManagerPage.jsx'
import MainLayout from '../layouts/MainLayout.jsx'

function PlaceholderPage({ tabId, title, apiRoute }) {
  return (
    <MainLayout activeTab={tabId}>
      <div className="admin-page-container">
        <div className="page-header-row">
          <div>
            <h2 className="main-title">{title}</h2>
            <span className="main-desc">Phân hệ quản trị đang trong tiến trình chuẩn bị dữ liệu</span>
          </div>
        </div>
        <div className="panel-card">
          <div className="empty-cell">
            <div className="empty-wrap">
              <span className="empty-title">Chức năng {title}</span>
              <p className="empty-desc">
                Sẵn sàng kết nối với API: <code>{apiRoute}</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function AppRouter() {
  const { user } = useAuth()
  const { activeTab } = useNavigation()

  // 1. Chưa đăng nhập -> Trả về trang Đăng nhập
  if (!user) {
    return <LoginPage />
  }

  // 2. Điều hướng màn hình theo tab đang được chọn
  switch (activeTab) {
    case 'doctors':
      return <DoctorManagerPage />
    case 'users':
      return <UserManagerPage />
    case 'records':
      return <ProfileManagerPage />
    case 'staffs':
      return (
        <PlaceholderPage
          tabId="staffs"
          title="Quản lý nhân viên cán bộ"
          apiRoute="POST /api/v1/staffs/filter"
        />
      )
    case 'campaigns':
      return (
        <PlaceholderPage
          tabId="campaigns"
          title="Đợt khám sức khỏe"
          apiRoute="POST /api/v1/campaigns/filter"
        />
      )
    case 'dashboard':
    default:
      return <DashboardPage />
  }
}

export default AppRouter
