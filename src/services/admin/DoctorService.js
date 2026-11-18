// Tầng dịch vụ quản trị bác sĩ cho phân hệ Quản trị viên (Admin)
// Bao bọc các API phân trang, tìm kiếm, chuyên khoa và quản lý hồ sơ bác sĩ
// Đóng vai trò là Service Facade trung gian kết nối giữa UI Admin và Backend

import {
  getDoctorFilterApi,
  getSpecialtiesApi,
  createDoctorApi,
  updateDoctorApi,
  deleteDoctorApi,
} from '../../api/doctorApi.js';
import { getUserSelectApi } from '../../api/userApi.js';

export const DoctorService = {
  // Lấy danh sách bác sĩ theo bộ lọc và phân trang
  getDoctors: getDoctorFilterApi,

  // Lấy danh mục Chuyên khoa
  getSpecialties: getSpecialtiesApi,

  // Tạo mới hồ sơ bác sĩ kèm liên kết tài khoản
  createDoctor: createDoctorApi,

  // Cập nhật thông tin bác sĩ
  updateDoctor: updateDoctorApi,

  // Xóa / vô hiệu hóa hồ sơ bác sĩ
  deleteDoctor: deleteDoctorApi,

  // Lấy danh sách tài khoản người dùng chọn lọc (Role: DOCTOR)
  getUserSelect: (role = 'DOCTOR') => getUserSelectApi(role),
};

export default DoctorService;
