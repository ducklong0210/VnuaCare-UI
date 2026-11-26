//
// Bộ điều hướng và kiểm soát phân quyền trung tâm của toàn bộ ứng dụng
// Phân luồng màn hình theo vai trò đăng nhập (Khách, Cán bộ STAFF và nhóm Quản trị / Bác sĩ)
//

import { useAuth } from '../core/contexts/useAuth.js';
import { useNavigation } from '../core/contexts/useNavigation.js';
import { ROLES, MENU_ITEMS } from '../utils/index.js';
import HomePage from '../pages/home/HomePage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import DoctorManagerPage from '../pages/doctor-manager/DoctorManagerPage.jsx';
import UserManagerPage from '../pages/user-manager/UserManagerPage.jsx';
import HealthRecordsPage from '../pages/health-records/HealthRecordsPage.jsx';
import StaffManagerPage from '../pages/staff-manager/StaffManagerPage.jsx';
import EmailManagerPage from '../pages/email-manager/EmailManagerPage.jsx';
import SettingsAdmin from '../pages/settings/SettingsAdmin.jsx';
import StaffPortalPage from '../pages/staff-portal/StaffPortalPage.jsx';
import MainLayout from '../core/layouts/MainLayout.jsx';

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

// Kiểm tra vai trò hiện tại có được phép vào tab tương ứng không (mặc định từ chối nếu tab không có trong MENU_ITEMS)
function canAccessTab(tabId, userRole) {
  const menuItem = MENU_ITEMS.find((item) => item.id === tabId);
  if (!menuItem || !menuItem.roles) return false;
  return menuItem.roles.includes(userRole);
}

function AppRouter() {
  const { user } = useAuth();
  const { activeTab } = useNavigation();

  // 1. Chưa đăng nhập: chỉ được xem Trang chủ hoặc Trang đăng nhập
  if (!user) {
    if (activeTab === 'login') {
      return <LoginPage />;
    }
    return <HomePage />;
  }

  // Cho phép mọi vai trò đã đăng nhập xem lại Trang chủ
  if (activeTab === 'home') {
    return <HomePage />;
  }

  const userRole = (user.role || '').toUpperCase();

  // 2. Vai trò STAFF (Cán bộ / Giảng viên): vào cổng riêng (không vào giao diện Admin)
  if (userRole === ROLES.STAFF) {
    return <StaffPortalPage />;
  }

  // 3. Vai trò SUPER_ADMIN, HEALTH_ADMIN, DOCTOR: vào khung Admin nhưng chặn các tab không đủ quyền
  const targetTab = canAccessTab(activeTab, userRole) ? activeTab : 'dashboard';

  switch (targetTab) {
    case 'doctors':
      return <DoctorManagerPage />;
    case 'users':
      return <UserManagerPage />;
    case 'records':
      return <HealthRecordsPage />;
    case 'staffs':
      return <StaffManagerPage />;
    case 'emails':
      return <EmailManagerPage />;
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
