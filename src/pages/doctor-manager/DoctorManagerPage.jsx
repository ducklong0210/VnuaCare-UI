// Màn hình quản lý đội ngũ bác sĩ khám sức khỏe cán bộ
// Nhúng thanh điều hướng MainLayout và liên kết component quản trị SearchDoctorList
// Đóng vai trò là Page View mỏng kết nối router và giao diện phân hệ Admin

import MainLayout from '../../core/layouts/MainLayout.jsx';
import SearchDoctorList from '../../components/Admin/DoctorManagement/SearchDoctorList.jsx';
import './DoctorManagerPage.css';

export default function DoctorManagerPage() {
  return (
    <MainLayout activeTab="doctors">
      <SearchDoctorList />
    </MainLayout>
  );
}
