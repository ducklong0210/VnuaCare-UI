//
// Tầng API quản lý danh sách cán bộ, giảng viên và nhân viên Học viện
// Hỗ trợ lọc phân trang theo từ khóa, khoa/phòng ban và các thao tác thêm/sửa/xóa hồ sơ cán bộ
//

import { staffRouter } from '../utils/api-router.js';
import { apiRequest } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lọc và phân trang danh sách Cán bộ
export async function getStaffFilterApi({ textSearch = '', departmentId = null, pageNumber = 1, pageSize = 10 } = {}) {
  const result = await apiRequest(staffRouter.getFilter, {
    method: METHODS.POST,
    body: {
      textSearch,
      departmentId: departmentId && departmentId !== 'ALL' ? Number(departmentId) : 0,
      pageNumber,
      pageSize,
      isActive: true,
    },
    defaultError: 'Lỗi khi tải danh sách cán bộ',
  });

  return {
    items: result?.data?.data || [],
    totalCount: result?.data?.totalCount || 0,
    pageNumber: result?.data?.pageNumber || pageNumber,
    pageSize: result?.data?.pageSize || pageSize,
  };
}

// Lấy danh mục Khoa / Phòng ban cho dropdown
export async function getDepartmentsApi() {
  const result = await apiRequest(staffRouter.getDepartments, {
    method: METHODS.GET,
    defaultError: 'Lỗi khi tải danh mục phòng ban',
  });
  return result?.data || [];
}

// Thêm mới cán bộ
export async function createStaffApi(data) {
  const result = await apiRequest(staffRouter.create, {
    method: METHODS.POST,
    body: data,
    defaultError: 'Lỗi khi thêm cán bộ',
  });
  return result?.data ?? result;
}

// Cập nhật thông tin cán bộ
export async function updateStaffApi(data) {
  const result = await apiRequest(staffRouter.update, {
    method: METHODS.PUT,
    body: data,
    defaultError: 'Lỗi khi cập nhật cán bộ',
  });
  return result?.data ?? result;
}

// Xóa cán bộ theo ID
export async function deleteStaffApi(staffId) {
  const result = await apiRequest(staffRouter.delete(staffId), {
    method: METHODS.DELETE,
    defaultError: 'Lỗi khi xóa cán bộ',
  });
  return result?.data ?? result;
}
