// Tầng API quản lý kết quả khám các chuyên khoa lẻ lâm sàng (Tab 3)
// Tương tác với endpoint /api/v1/specialistexams theo mã hồ sơ recordId và loại chuyên khoa specialtyType
// Hỗ trợ lấy kết quả, thêm mới và cập nhật dữ liệu khám Mắt, Tai Mũi Họng, Răng, Da liễu, Ngoại, Phụ khoa

import { specialistExamRouter } from '../utils/api-router.js';
import { getAuthHeaders, parseApiError, API_BASE_URL } from './httpClient.js';



// Lấy danh sách kết quả khám các chuyên khoa lẻ theo ID hồ sơ
export async function getSpecialistExamsApi(recordId, specialtyType = null) {
  let endpoint = `${API_BASE_URL}${specialistExamRouter.getByRecordId(recordId)}`;
  if (specialtyType) {
    endpoint += `?specialtyType=${encodeURIComponent(specialtyType)}`;
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return result?.data || [];
}

// Thêm mới kết quả khám chuyên khoa lẻ
export async function createSpecialistExamApi(examData) {
  const endpoint = `${API_BASE_URL}${specialistExamRouter.create}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi thêm mới kết quả khám chuyên khoa';
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

// Cập nhật kết quả khám chuyên khoa lẻ
export async function updateSpecialistExamApi(examData) {
  const endpoint = `${API_BASE_URL}${specialistExamRouter.update}`;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi cập nhật kết quả khám chuyên khoa';
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

// Xóa kết quả khám chuyên khoa lẻ
export async function deleteSpecialistExamApi(specialistExamId) {
  const endpoint = `${API_BASE_URL}${specialistExamRouter.delete(specialistExamId)}`;

  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi xóa kết quả khám chuyên khoa';
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
