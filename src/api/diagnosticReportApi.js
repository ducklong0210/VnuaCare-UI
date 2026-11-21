//
// Tầng API quản lý phiếu Chẩn đoán hình ảnh và Thăm dò chức năng (Siêu âm, X-quang, Điện tim...)
// Hỗ trợ lấy danh sách theo hồ sơ, xem chi tiết, thêm mới, cập nhật và xóa phiếu chẩn đoán
//

import { diagnosticReportRouter } from '../utils/api-router.js';
import { getAuthHeaders, parseApiError, API_BASE_URL } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lấy danh sách phiếu chẩn đoán hình ảnh theo ID hồ sơ khám
export async function getDiagnosticReportsByRecordIdApi(recordId, modalityType = null) {
  let endpoint = `${API_BASE_URL}${diagnosticReportRouter.getByRecordId(recordId)}`;
  if (modalityType) {
    endpoint += `?modalityType=${encodeURIComponent(modalityType)}`;
  }

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return result?.data || [];
}

// Lấy chi tiết một phiếu chẩn đoán hình ảnh theo ID
export async function getDiagnosticReportByIdApi(reportId) {
  const endpoint = `${API_BASE_URL}${diagnosticReportRouter.getById(reportId)}`;

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Không tìm thấy phiếu kết quả có ID ${reportId}`);
  }

  const result = await response.json();
  if (!result?.data) {
    throw new Error('Dữ liệu phiếu chẩn đoán rỗng');
  }

  return result.data;
}

// Thêm mới phiếu kết quả chẩn đoán hình ảnh
export async function createDiagnosticReportApi(payload) {
  const endpoint = `${API_BASE_URL}${diagnosticReportRouter.create}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || (result.statusCode && result.statusCode !== 200)) {
    throw new Error(parseApiError(result, 'Lỗi khi tạo mới phiếu chẩn đoán hình ảnh'));
  }

  return result;
}

// Cập nhật phiếu kết quả chẩn đoán hình ảnh
export async function updateDiagnosticReportApi(payload) {
  const endpoint = `${API_BASE_URL}${diagnosticReportRouter.update}`;

  const response = await fetch(endpoint, {
    method: METHODS.PUT,
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || (result.statusCode && result.statusCode !== 200)) {
    throw new Error(parseApiError(result, 'Lỗi khi cập nhật phiếu chẩn đoán hình ảnh'));
  }

  return result;
}

// Xóa phiếu kết quả chẩn đoán hình ảnh
export async function deleteDiagnosticReportApi(reportId) {
  const endpoint = `${API_BASE_URL}${diagnosticReportRouter.delete(reportId)}`;

  const response = await fetch(endpoint, {
    method: METHODS.DELETE,
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || (result.statusCode && result.statusCode !== 200)) {
    throw new Error(parseApiError(result, 'Lỗi khi xóa phiếu chẩn đoán hình ảnh'));
  }

  return result;
}
