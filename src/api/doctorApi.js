//
// Tầng API quản lý danh sách bác sĩ khám sức khỏe tại Trạm Y tế
// Hỗ trợ lọc phân trang, tải danh mục chuyên khoa và các thao tác thêm/sửa/xóa hồ sơ bác sĩ
//

import { doctorRouter } from '../utils/api-router.js';
import { getAuthHeaders, parseApiError, API_BASE_URL } from './httpClient.js';
import { METHODS } from '../utils/index.js';


// Lọc và phân trang danh sách Bác sĩ
export async function getDoctorFilterApi({ textSearch = '', specialtyId = null, pageNumber = 1, pageSize = 10 } = {}) {
  const endpoint = `${API_BASE_URL}${doctorRouter.getFilter}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify({
      textSearch: textSearch,
      specialty: specialtyId && specialtyId !== 'ALL' ? Number(specialtyId) : 0,
      pageNumber: pageNumber,
      pageSize: pageSize,
      isActive: true,
    }),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi tải danh sách bác sĩ';
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

// Lấy danh mục Chuyên khoa cho dropdown
export async function getSpecialtiesApi() {
  const endpoint = `${API_BASE_URL}${doctorRouter.getSpecialties}`;

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Lỗi khi tải danh mục chuyên khoa';
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

// Thêm mới bác sĩ
export async function createDoctorApi(data) {
  const endpoint = `${API_BASE_URL}${doctorRouter.create}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(parseApiError(result, 'Lỗi khi thêm bác sĩ'));
  }

  return result?.data ?? result;
}

// Cập nhật thông tin bác sĩ
export async function updateDoctorApi(data) {
  const endpoint = `${API_BASE_URL}${doctorRouter.update}`;

  const response = await fetch(endpoint, {
    method: METHODS.PUT,
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(parseApiError(result, 'Lỗi khi cập nhật bác sĩ'));
  }

  return result?.data ?? result;
}

// Xóa bác sĩ theo ID
export async function deleteDoctorApi(doctorId) {
  const endpoint = `${API_BASE_URL}${doctorRouter.delete(doctorId)}`;

  const response = await fetch(endpoint, {
    method: METHODS.DELETE,
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(parseApiError(result, 'Lỗi khi xóa bác sĩ'));
  }

  return result?.data ?? result;
}
