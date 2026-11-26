//
// Trang Quản lý Nhật ký gửi Email và Cảnh báo sức khỏe định kỳ
// Bọc khung giao diện MainLayout và hiển thị container điều phối SearchEmailList
//

import MainLayout from '../../core/layouts/MainLayout.jsx';
import SearchEmailList from '../../components/Admin/EmailManagement/SearchEmailList.jsx';
import '../../components/Admin/EmailManagement/EmailManagement.css';

export default function EmailManagerPage() {
  return (
    <MainLayout activeTab="emails">
      <SearchEmailList />
    </MainLayout>
  );
}
