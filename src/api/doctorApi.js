// Tầng API quản lý thông tin đội ngũ bác sĩ khám bệnh tại Trạm Y tế
// Hỗ trợ tìm kiếm, lọc danh sách bác sĩ theo phân trang và chuyên khoa y tế
// Cung cấp các thao tác thêm mới hồ sơ bác sĩ, cập nhật thông tin và xóa khỏi hệ thống

import { doctorRouter } from '../utils/api-router.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Header xác thực kèm Bearer token
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// Trích xuất thông báo lỗi từ backend
function parseApiError(result, defaultMsg) {
  if (result?.message) return result.message;
  if (result?.errors && typeof result.errors === 'object') {
    const errorList = Object.values(result.errors).flat();
    if (errorList.length > 0) return errorList.join(', ');
  }
  if (result?.title) return result.title;
  return defaultMsg;
}

// Lọc và phân trang danh sách Bác sĩ
export async function getDoctorFilterApi({ textSearch = '', specialtyId = null, pageNumber = 1, pageSize = 10, isActive = true } = {}) {
  const endpoint = `${API_BASE_URL}${doctorRouter.getFilter}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      textSearch: textSearch,
      specialty: specialtyId && specialtyId !== 'ALL' ? Number(specialtyId) : 0,
      pageNumber: pageNumber,
      pageSize: pageSize,
      isActive: isActive,
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
    method: 'GET',
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
    method: 'POST',
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
    method: 'PUT',
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
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(parseApiError(result, 'Lỗi khi xóa bác sĩ'));
  }

  return result?.data ?? result;
}
