//
// Tầng dịch vụ (Service) trung gian cho phân hệ Quản lý Cán bộ và Nhân viên
// Gom nhóm các hàm từ staffApi.js phục vụ lọc phân trang, tải phòng ban và CRUD hồ sơ cán bộ
//

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
