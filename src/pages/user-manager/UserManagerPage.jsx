// Màn hình quản lý tài khoản người dùng và phân quyền truy cập hệ thống
// Nhúng thanh điều hướng MainLayout và liên kết component quản trị SearchAccountList
// Đóng vai trò là Page View mỏng kết nối router và giao diện phân hệ Admin

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
