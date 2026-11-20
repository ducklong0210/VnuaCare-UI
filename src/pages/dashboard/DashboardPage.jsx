// Màn hình Bảng điều khiển tổng quan (Dashboard)
// Nhúng khung MainLayout và liên kết container DashboardManager đồng bộ với các trang quản trị khác

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
