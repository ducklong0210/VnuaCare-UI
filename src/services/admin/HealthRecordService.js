// Tầng dịch vụ quản trị Hồ sơ khám sức khỏe cho phân hệ Quản trị viên (Admin)
// Bao bọc các API lọc, phân trang, danh mục tra cứu và thao tác CRUD hồ sơ khám
// Đóng vai trò là Service Facade trung gian đồng bộ với AccountService, DoctorService và StaffService

import {
  getHealthRecordFilterApi,
  getCampaignsSelectApi,
  getDepartmentsSelectApi,
  getClassificationsApi,
  getStatusesApi,
  getStaffsSelectApi,
  getDoctorsSelectApi,
  createHealthRecordApi,
  updateHealthRecordApi,
  deleteHealthRecordApi,
} from '../../api/recordApi.js';

export const HealthRecordService = {
  // Lấy danh sách hồ sơ khám theo bộ lọc và phân trang
  getHealthRecords: getHealthRecordFilterApi,

  // Lấy các danh mục tra cứu (Lookups) phục vụ bộ lọc và biểu mẫu
  getCampaigns: getCampaignsSelectApi,
  getDepartments: getDepartmentsSelectApi,
  getClassifications: getClassificationsApi,
  getStatuses: getStatusesApi,
  getStaffs: getStaffsSelectApi,
  getDoctors: getDoctorsSelectApi,

  // Tạo mới hồ sơ khám sức khỏe
  createHealthRecord: createHealthRecordApi,

  // Cập nhật thông tin / kết luận hồ sơ khám sức khỏe
  updateHealthRecord: updateHealthRecordApi,

  // Xóa hồ sơ khám sức khỏe
  deleteHealthRecord: deleteHealthRecordApi,
};

export default HealthRecordService;
