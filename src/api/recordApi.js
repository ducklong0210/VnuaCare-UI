//
// Tầng API quản lý hồ sơ khám sức khỏe: lọc phân trang, xem chi tiết và thêm/sửa/xóa hồ sơ
// Đồng thời cung cấp các hàm tải danh mục chọn (đợt khám, phòng ban, cán bộ, bác sĩ)
//

import { healthRecordRouter, campaignRouter } from '../utils/api-router.js';
import { apiRequest, apiGetOptional } from './httpClient.js';
import { DEFAULT_HEALTH_CLASSIFICATIONS, DEFAULT_RECORD_STATUSES, METHODS } from '../utils/index.js';

// Lọc và phân trang danh sách Hồ sơ khám sức khỏe
export async function getHealthRecordFilterApi(filters = {}) {
  const textSearch = filters.textSearch || '';
  const campaignId = filters.campaignId || null;
  const departmentId = filters.departmentId || null;
  const staffId = filters.staffId || null;
  const status = filters.status || '';
  const healthClassification = filters.healthClassification || '';
  const pageNumber = filters.pageNumber || 1;
  const pageSize = filters.pageSize || 10;

  // Chuẩn bị dữ liệu lọc gửi lên Backend
  const bodyData = {
    textSearch: textSearch.trim(),
    pageNumber: pageNumber,
    pageSize: pageSize,
  };

  // Chỉ thêm các điều kiện lọc khi người dùng có chọn cụ thể (bỏ qua giá trị 'ALL')
  if (campaignId && campaignId !== 'ALL') {
    bodyData.campaignId = Number(campaignId);
  }
  if (departmentId && departmentId !== 'ALL') {
    bodyData.departmentId = Number(departmentId);
  }
  if (staffId) {
    bodyData.staffId = Number(staffId);
  }
  if (status && status !== 'ALL') {
    bodyData.status = status;
  }
  if (healthClassification && healthClassification !== 'ALL') {
    bodyData.healthClassification = healthClassification;
  }

  // Gửi yêu cầu lọc lên Backend qua httpClient
  const result = await apiRequest(healthRecordRouter.getFilter, {
    method: METHODS.POST,
    body: bodyData,
    defaultError: 'Lỗi khi tải danh sách hồ sơ khám',
  });

  // Trả về dữ liệu phân trang gọn 1 lớp cho màn hình hiển thị
  return {
    items: result?.data?.data || [],
    totalCount: result?.data?.totalCount || 0,
    pageNumber: result?.data?.pageNumber || pageNumber,
    pageSize: result?.data?.pageSize || pageSize,
  };
}

// Lấy danh mục Đợt khám sức khỏe cho dropdown
export async function getCampaignsSelectApi() {
  return await apiGetOptional(campaignRouter.getSelect, []);
}

// Lấy danh mục Khoa / Phòng ban cho dropdown
export async function getDepartmentsSelectApi() {
  return await apiGetOptional(healthRecordRouter.getDepartments, []);
}

// Lấy danh mục Phân loại sức khỏe chuẩn Bộ Y tế
export async function getClassificationsApi() {
  return DEFAULT_HEALTH_CLASSIFICATIONS;
}

// Lấy danh mục Trạng thái hồ sơ khám
export async function getStatusesApi() {
  return DEFAULT_RECORD_STATUSES;
}

// Lấy danh sách Cán bộ phục vụ chọn trong biểu mẫu tạo hồ sơ khám
export async function getStaffsSelectApi(departmentId = null) {
  let path = healthRecordRouter.getStaffs;
  if (departmentId && departmentId !== 'ALL') {
    path += `?departmentId=${departmentId}`;
  }
  return await apiGetOptional(path, []);
}

// Lấy danh sách Bác sĩ kết luận hồ sơ khám
export async function getDoctorsSelectApi(specialtyId = null) {
  let path = healthRecordRouter.getDoctors;
  if (specialtyId && specialtyId !== 'ALL') {
    path += `?specialtyId=${specialtyId}`;
  }
  return await apiGetOptional(path, []);
}

// Lấy chi tiết một hồ sơ khám theo mã ID
export async function getHealthRecordByIdApi(recordId) {
  const result = await apiRequest(healthRecordRouter.getById(recordId), {
    method: METHODS.GET,
    defaultError: 'Lỗi khi lấy thông tin chi tiết hồ sơ',
  });
  return result?.data || null;
}

// Thêm mới hồ sơ khám sức khỏe
export async function createHealthRecordApi(recordData) {
  return await apiRequest(healthRecordRouter.create, {
    method: METHODS.POST,
    body: recordData,
    defaultError: 'Lỗi khi thêm mới hồ sơ khám',
  });
}

// Cập nhật thông tin và kết luận hồ sơ khám
export async function updateHealthRecordApi(recordData) {
  return await apiRequest(healthRecordRouter.update, {
    method: METHODS.PUT,
    body: recordData,
    defaultError: 'Lỗi khi cập nhật hồ sơ khám',
  });
}

// Xóa hồ sơ khám sức khỏe theo mã ID
export async function deleteHealthRecordApi(recordId) {
  return await apiRequest(healthRecordRouter.delete(recordId), {
    method: METHODS.DELETE,
    defaultError: 'Lỗi khi xóa hồ sơ khám',
  });
}
