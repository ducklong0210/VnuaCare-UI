// Bộ điều hướng và phân quyền trung tâm của ứng dụng (Routing Guard)
// Quản lý điều hướng giữa Trang chủ (HomePage), Trang Đăng nhập (LoginPage) và Phân hệ Quản trị (Dashboard, Bác sĩ, Nhân viên, Hồ sơ)
// Đọc activeTab từ NavigationContext để hiển thị màn hình chức năng tương ứng mà không cần reload trang

import { useAuth } from '../core/contexts/useAuth.js';
import { useNavigation } from '../core/contexts/useNavigation.js';
import HomePage from '../pages/home/HomePage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import DoctorManagerPage from '../pages/doctor-manager/DoctorManagerPage.jsx';
import UserManagerPage from '../pages/user-manager/UserManagerPage.jsx';
import HealthRecordsPage from '../pages/health-records/HealthRecordsPage.jsx';
import StaffManagerPage from '../pages/staff-manager/StaffManagerPage.jsx';
import MainLayout from '../core/layouts/MainLayout.jsx';
import SettingsAdmin from '../pages/settings/SettingsAdmin.jsx';

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
  );
}

function AppRouter() {
  const { user } = useAuth();
  const { activeTab } = useNavigation();

  //  Chưa đăng nhập
  if (!user) {
    if (activeTab === 'login') {
      return <LoginPage />;
    }
    // Mặc định hoặc tab 'home' hiển thị Trang chủ VnuaCare
    return <HomePage />;
  }

  switch (activeTab) {
    case 'home':
      return <HomePage />;
    case 'doctors':
      return <DoctorManagerPage />;
    case 'users':
      return <UserManagerPage />;
    case 'records':
      return <HealthRecordsPage />;
    case 'staffs':
      return <StaffManagerPage />;
      case 'settings':
        return <SettingsAdmin />;
    case 'campaigns':
      return <PlaceholderPage tabId="campaigns" title="Đợt khám sức khỏe" apiRoute="POST /api/v1/campaigns/filter" />;
    case 'dashboard':
    default:
      return <DashboardPage />;
  }
}

export default AppRouter;
