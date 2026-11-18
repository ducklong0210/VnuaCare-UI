// Tầng API quản lý kết quả khám nội khoa tổng quát (Tab 2)
// Tương tác với endpoint /api/v1/internalmedicines theo mã hồ sơ recordId của cán bộ
// Hỗ trợ lấy dữ liệu, thêm mới và cập nhật kết quả khám 6 hệ cơ quan nội khoa

import { internalMedicineRouter } from '../../../utils/api-router.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

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

// Lấy kết quả khám nội khoa tổng quát theo ID hồ sơ
export async function getInternalMedicineApi(recordId) {
  const endpoint = `${API_BASE_URL}${internalMedicineRouter.getByRecordId(recordId)}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result?.data || null;
}

// Thêm mới kết quả khám nội khoa
export async function createInternalMedicineExamApi(examData) {
  const endpoint = `${API_BASE_URL}${internalMedicineRouter.create}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi thêm mới kết quả khám nội khoa';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

// Cập nhật kết quả khám nội khoa
export async function updateInternalMedicineExamApi(examData) {
  const endpoint = `${API_BASE_URL}${internalMedicineRouter.update}`;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi cập nhật kết quả khám nội khoa';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

// Xóa kết quả khám nội khoa
export async function deleteInternalMedicineExamApi(internalExamId) {
  const endpoint = `${API_BASE_URL}${internalMedicineRouter.delete(internalExamId)}`;

  const response = await fetch(endpoint, {
    method: ModelMode.DELETE,
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi xóa kết quả khám nội khoa';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}
