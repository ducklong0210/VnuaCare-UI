// Màn hình quản lý nhân viên, cán bộ và giảng viên Học viện
// Nhúng thanh điều hướng MainLayout và liên kết component quản trị SearchStaffList
// Đóng vai trò là Page View mỏng kết nối router và giao diện phân hệ Admin

import MainLayout from '../../core/layouts/MainLayout.jsx';
import SearchStaffList from '../../components/Admin/StaffManagement/SearchStaffList.jsx';
import './StaffManagerPage.css';

export default function StaffManagerPage() {
  return (
    <MainLayout activeTab="staffs">
      <SearchStaffList />
    </MainLayout>
  );
}
