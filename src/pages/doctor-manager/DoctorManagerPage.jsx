//
// Trang Quản lý đội ngũ Bác sĩ khám sức khỏe
// Bọc khung giao diện MainLayout và hiển thị container quản trị SearchDoctorList
//

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
