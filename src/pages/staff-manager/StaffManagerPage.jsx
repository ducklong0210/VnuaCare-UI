//
// Trang Quản lý danh sách Cán bộ, Giảng viên và Nhân viên
// Bọc khung giao diện MainLayout và hiển thị container quản trị SearchStaffList
//

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
