// Tầng dịch vụ quản trị cán bộ, nhân viên cho phân hệ Quản trị viên (Admin)
// Bao bọc các API phân trang, tìm kiếm, phòng ban và quản lý hồ sơ cán bộ Học viện
// Đóng vai trò là Service Facade trung gian kết nối giữa UI Admin và Backend

import {
  getStaffFilterApi,
  getDepartmentsApi,
  createStaffApi,
  updateStaffApi,
  deleteStaffApi,
} from '../../api/staffApi.js';
import { getUserSelectApi } from '../../api/userApi.js';

export const StaffService = {
  // Lấy danh sách cán bộ theo bộ lọc và phân trang
  getStaffs: getStaffFilterApi,

  // Lấy danh mục Khoa / Phòng ban
  getDepartments: getDepartmentsApi,

  // Tạo mới hồ sơ cán bộ kèm liên kết tài khoản
  createStaff: createStaffApi,

  // Cập nhật thông tin cán bộ
  updateStaff: updateStaffApi,

  // Xóa / vô hiệu hóa hồ sơ cán bộ
  deleteStaff: deleteStaffApi,

  // Lấy danh sách tài khoản người dùng chọn lọc (Role: STAFF)
  getUserSelect: (role = 'STAFF') => getUserSelectApi(role),
};

export default StaffService;
