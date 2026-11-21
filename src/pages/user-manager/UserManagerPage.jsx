//
// Trang Quản lý Tài khoản người dùng và phân quyền hệ thống
// Bọc khung giao diện MainLayout và hiển thị container quản trị SearchAccountList
//

import MainLayout from '../../core/layouts/MainLayout.jsx';
import SearchAccountList from '../../components/Admin/AccountManagement/SearchAccountList.jsx';
import './UserManagerPage.css';

export default function UserManagerPage() {
  return (
    <MainLayout activeTab="users">
      <SearchAccountList />
    </MainLayout>
  );
}
