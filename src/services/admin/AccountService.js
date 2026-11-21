//
// Tầng dịch vụ (Service) trung gian cho phân hệ Quản lý Tài khoản và Cài đặt cá nhân
// Gom nhóm các hàm từ userApi.js để màn hình giao diện gọi thống nhất theo nghiệp vụ
//

import {
  getUserFilterApi,
  getUserByIdApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  getUserSelectApi,
  getMyProfileApi,
  updateMyProfileApi,
  changePasswordApi,
} from '../../api/userApi.js';

export const AccountService = {
  // Lấy danh sách tài khoản theo bộ lọc và phân trang
  getAccounts: getUserFilterApi,

  // Lấy chi tiết tài khoản theo ID
  getAccountById: getUserByIdApi,

  // Tạo tài khoản mới kèm mật khẩu và phân quyền ban đầu
  createAccount: createUserApi,

  // Cập nhật thông tin tài khoản và vai trò
  updateAccount: updateUserApi,

  // Xóa / vô hiệu hóa tài khoản
  deleteAccount: deleteUserApi,

  // Lấy danh sách tài khoản chọn lọc (theo vai trò)
  getUserSelect: getUserSelectApi,

  // Lấy thông tin hồ sơ cá nhân của tài khoản đang đăng nhập
  getMyProfile: getMyProfileApi,

  // Tự cập nhật hồ sơ cá nhân (Họ tên, Email, SĐT, Địa chỉ, Avatar...)
  updateMyProfile: updateMyProfileApi,

  // Tự đổi mật khẩu tài khoản đang đăng nhập
  changePassword: changePasswordApi,
};

export default AccountService;
