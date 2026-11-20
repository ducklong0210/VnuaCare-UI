// Màn hình quản lý Hồ sơ khám sức khỏe cán bộ toàn học viện
// Nhúng thanh điều hướng MainLayout và liên kết container quản trị SearchHealthRecordList
// Đóng vai trò là Page View mỏng đồng bộ với DoctorManagerPage, StaffManagerPage và UserManagerPage

import MainLayout from '../../core/layouts/MainLayout.jsx';
import SearchHealthRecordList from '../../components/Admin/HealthRecordManagement/SearchHealthRecordList.jsx';
import './HealthRecordsPage.css';

export default function HealthRecordsPage() {
  return (
    <MainLayout activeTab="records">
      <SearchHealthRecordList />
    </MainLayout>
  );
}
