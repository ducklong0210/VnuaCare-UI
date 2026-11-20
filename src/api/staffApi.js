// Tầng API quản lý danh sách cán bộ, giảng viên và nhân viên Học viện Nông nghiệp Việt Nam
// Hỗ trợ lọc danh sách cán bộ theo từ khóa, đơn vị khoa phòng và tải danh mục phòng ban
// Cung cấp các chức năng thêm mới cán bộ, chỉnh sửa hồ sơ hành chính và xóa cán bộ

import { staffRouter } from '../utils/api-router.js';
import { getAuthHeaders, parseApiError, API_BASE_URL } from './httpClient.js';
import { METHODS } from '../utils/index.js';


// Lọc và phân trang danh sách Cán bộ
export async function getStaffFilterApi({ textSearch = '', departmentId = null, pageNumber = 1, pageSize = 10 } = {}) {
  const endpoint = `${API_BASE_URL}${staffRouter.getFilter}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify({
      textSearch: textSearch,
      departmentId: departmentId && departmentId !== 'ALL' ? Number(departmentId) : 0,
      pageNumber: pageNumber,
      pageSize: pageSize,
      isActive: true,
    }),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi tải danh sách cán bộ';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return {
    items: result?.data?.data || [],
    totalCount: result?.data?.totalCount || 0,
    pageNumber: result?.data?.pageNumber || pageNumber,
    pageSize: result?.data?.pageSize || pageSize,
  };
}

// Lấy danh mục Khoa / Phòng ban cho dropdown
export async function getDepartmentsApi() {
  const endpoint = `${API_BASE_URL}${staffRouter.getDepartments}`;

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Lỗi khi tải danh mục phòng ban';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result?.data || [];
}

// Thêm mới cán bộ
export async function createStaffApi(data) {
  const endpoint = `${API_BASE_URL}${staffRouter.create}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(parseApiError(result, 'Lỗi khi thêm cán bộ'));
  }

  return result?.data ?? result;
}

// Cập nhật thông tin cán bộ
export async function updateStaffApi(data) {
  const endpoint = `${API_BASE_URL}${staffRouter.update}`;

  const response = await fetch(endpoint, {
    method: METHODS.PUT,
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(parseApiError(result, 'Lỗi khi cập nhật cán bộ'));
  }

  return result?.data ?? result;
}

// Xóa cán bộ theo ID
export async function deleteStaffApi(staffId) {
  const endpoint = `${API_BASE_URL}${staffRouter.delete(staffId)}`;

  const response = await fetch(endpoint, {
    method: METHODS.DELETE,
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(parseApiError(result, 'Lỗi khi xóa cán bộ'));
  }

  return result?.data ?? result;
}
