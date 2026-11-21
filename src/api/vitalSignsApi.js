//
// Tầng API quản lý chỉ số thể lực và dấu hiệu sinh tồn theo mã hồ sơ (recordId)
// Hỗ trợ lấy kết quả đo hiện có, thêm mới, cập nhật và xóa phiếu đo sinh hiệu
//

import { vitalSignsRouter } from '../utils/api-router.js';
import { getAuthHeaders, parseApiError, API_BASE_URL } from './httpClient.js';
import { METHODS } from '../utils/index.js';


// Lấy chỉ số sinh tồn và thể lực theo ID hồ sơ
export async function getVitalSignsApi(recordId) {
  const endpoint = `${API_BASE_URL}${vitalSignsRouter.getByRecordId(recordId)}`;

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result?.data || null;
}

// Thêm mới chỉ số sinh tồn và thể lực
export async function createVitalSignsApi(vitalSignsData) {
  const endpoint = `${API_BASE_URL}${vitalSignsRouter.create}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify(vitalSignsData),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi thêm mới chỉ số sinh tồn';
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

// Cập nhật chỉ số sinh tồn và thể lực
export async function updateVitalSignsApi(vitalSignsData) {
  const endpoint = `${API_BASE_URL}${vitalSignsRouter.update}`;

  const response = await fetch(endpoint, {
    method: METHODS.PUT,
    headers: getAuthHeaders(),
    body: JSON.stringify(vitalSignsData),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi cập nhật chỉ số sinh tồn';
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

// Xóa chỉ số sinh tồn và thể lực theo ID hồ sơ
export async function deleteVitalSignsApi(recordId) {
  const endpoint = `${API_BASE_URL}${vitalSignsRouter.delete(recordId)}`;

  const response = await fetch(endpoint, {
    method: METHODS.DELETE,
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi xóa chỉ số sinh tồn';
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
