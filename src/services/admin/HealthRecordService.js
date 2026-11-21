//
// Tầng dịch vụ (Service) trung gian cho phân hệ Quản lý Hồ sơ khám sức khỏe
// Gom nhóm các hàm từ recordApi.js phục vụ lọc phân trang, tải danh mục tra cứu và CRUD hồ sơ khám
//

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
