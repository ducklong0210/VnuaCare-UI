//
// Tầng API quản lý danh sách bác sĩ khám sức khỏe tại Trạm Y tế
// Hỗ trợ lọc phân trang, tải danh mục chuyên khoa và các thao tác thêm/sửa/xóa hồ sơ bác sĩ
//

import { doctorRouter } from '../utils/api-router.js';
import { apiRequest } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lọc và phân trang danh sách Bác sĩ
export async function getDoctorFilterApi({ textSearch = '', specialtyId = null, pageNumber = 1, pageSize = 10 } = {}) {
  const result = await apiRequest(doctorRouter.getFilter, {
    method: METHODS.POST,
    body: {
      textSearch,
      specialty: specialtyId && specialtyId !== 'ALL' ? Number(specialtyId) : 0,
      pageNumber,
      pageSize,
      isActive: true,
    },
    defaultError: 'Lỗi khi tải danh sách bác sĩ',
  });

  return {
    items: result?.data?.data || [],
    totalCount: result?.data?.totalCount || 0,
    pageNumber: result?.data?.pageNumber || pageNumber,
    pageSize: result?.data?.pageSize || pageSize,
  };
}

// Lấy danh mục Chuyên khoa cho dropdown
export async function getSpecialtiesApi() {
  const result = await apiRequest(doctorRouter.getSpecialties, {
    method: METHODS.GET,
    defaultError: 'Lỗi khi tải danh mục chuyên khoa',
  });
  return result?.data || [];
}

// Thêm mới bác sĩ
export async function createDoctorApi(data) {
  const result = await apiRequest(doctorRouter.create, {
    method: METHODS.POST,
    body: data,
    defaultError: 'Lỗi khi thêm bác sĩ',
  });
  return result?.data ?? result;
}

// Cập nhật thông tin bác sĩ
export async function updateDoctorApi(data) {
  const result = await apiRequest(doctorRouter.update, {
    method: METHODS.PUT,
    body: data,
    defaultError: 'Lỗi khi cập nhật bác sĩ',
  });
  return result?.data ?? result;
}

// Xóa bác sĩ theo ID
export async function deleteDoctorApi(doctorId) {
  const result = await apiRequest(doctorRouter.delete(doctorId), {
    method: METHODS.DELETE,
    defaultError: 'Lỗi khi xóa bác sĩ',
  });
  return result?.data ?? result;
}
