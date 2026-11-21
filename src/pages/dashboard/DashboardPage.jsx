//
// Trang Bảng điều khiển tổng quan (Dashboard)
// Bọc khung giao diện MainLayout và hiển thị container xử lý chính DashboardManager
//

import MainLayout from '../../core/layouts/MainLayout.jsx';
import DashboardManager from '../../components/Admin/DashboardManagement/DashboardManager.jsx';
import './DashboardPage.css';

export default function DashboardPage() {
  return (
    <MainLayout activeTab="dashboard">
      <DashboardManager />
    </MainLayout>
  );
}
