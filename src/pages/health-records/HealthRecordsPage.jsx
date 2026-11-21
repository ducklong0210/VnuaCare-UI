//
// Trang Quản lý Hồ sơ khám sức khỏe cán bộ toàn Học viện
// Bọc khung giao diện MainLayout và hiển thị container quản trị SearchHealthRecordList
//

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
