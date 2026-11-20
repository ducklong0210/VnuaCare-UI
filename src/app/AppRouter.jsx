// Bộ điều hướng và phân quyền trung tâm của ứng dụng (Routing Guard)
// Phân tách luồng hiển thị theo vai trò đăng nhập (Role-Based Access Control):
//   - Chưa đăng nhập : HomePage / LoginPage
//   - STAFF          : StaffPortalPage (Cổng cán bộ / giảng viên riêng)
//   - SUPER_ADMIN, HEALTH_ADMIN, DOCTOR : Vào chung khung Quản trị (MainLayout),
//     nhưng Sidebar & AppRouter tự động ẩn/chặn các chức năng không thuộc quyền theo cấu hình MENU_ITEMS

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

// Kiểm tra vai trò hiện tại có được phép vào tab tương ứng không (dựa trên MENU_ITEMS)
function canAccessTab(tabId, userRole) {
  const menuItem = MENU_ITEMS.find((item) => item.id === tabId);
  if (!menuItem || !menuItem.roles) return true;
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
