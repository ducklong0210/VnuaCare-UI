//
// Tầng API quản lý phiếu khám nội khoa tổng quát theo mã hồ sơ (recordId)
// Hỗ trợ lấy kết quả khám hiện có, thêm mới, cập nhật và xóa phiếu khám nội khoa
//

import { internalMedicineRouter } from '../utils/api-router.js';
import { getAuthHeaders, parseApiError, API_BASE_URL } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lấy kết quả khám nội khoa tổng quát theo mã hồ sơ (trả về object kết quả hoặc null nếu chưa khám)
export async function getInternalMedicineApi(recordId) {
  const endpoint = `${API_BASE_URL}${internalMedicineRouter.getByRecordId(recordId)}`;

  // Gửi yêu cầu GET kèm thẻ JWT để lấy phiếu khám nội khoa của hồ sơ
  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  // Nếu hồ sơ chưa có dữ liệu khám nội khoa (hoặc Backend báo lỗi) thì trả về null để form hiển thị trống
  if (!response.ok) {
    return null;
  }

  // API trả về một bản ghi duy nhất nên chỉ có một lớp data bên trong khung ApiResponse
  const result = await response.json();
  return result?.data || null;
}

// Gửi dữ liệu thêm mới kết quả khám nội khoa lên Backend
export async function createInternalMedicineExamApi(examData) {
  const endpoint = `${API_BASE_URL}${internalMedicineRouter.create}`;

  // Gửi yêu cầu POST kèm thẻ JWT và dữ liệu phiếu khám chuyển sang chuỗi JSON
  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
  });

  // Kiểm tra lỗi hết hạn phiên đăng nhập
  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  // Nếu có lỗi từ Backend thì trích xuất thông báo lỗi và ném lên giao diện
  if (!response.ok) {
    let errorMessage = 'Lỗi khi thêm mới kết quả khám nội khoa';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua nếu phản hồi lỗi từ server không phải định dạng JSON
    }
    throw new Error(errorMessage);
  }

  // Trả nguyên phản hồi JSON từ Backend xác nhận đã lưu thành công
  return await response.json();
}

// Gửi dữ liệu cập nhật kết quả khám nội khoa đã tồn tại lên Backend
export async function updateInternalMedicineExamApi(examData) {
  const endpoint = `${API_BASE_URL}${internalMedicineRouter.update}`;

  // Gửi yêu cầu PUT kèm thẻ JWT và dữ liệu phiếu khám mới
  const response = await fetch(endpoint, {
    method: METHODS.PUT,
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
  });

  // Kiểm tra lỗi hết hạn phiên đăng nhập
  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  // Nếu có lỗi từ Backend thì trích xuất thông báo lỗi và ném lên giao diện
  if (!response.ok) {
    let errorMessage = 'Lỗi khi cập nhật kết quả khám nội khoa';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua nếu phản hồi lỗi từ server không phải định dạng JSON
    }
    throw new Error(errorMessage);
  }

  // Trả nguyên phản hồi JSON từ Backend xác nhận đã cập nhật thành công
  return await response.json();
}

// Gửi yêu cầu xóa kết quả khám nội khoa theo mã phiếu khám
export async function deleteInternalMedicineExamApi(internalExamId) {
  const endpoint = `${API_BASE_URL}${internalMedicineRouter.delete(internalExamId)}`;

  // Gửi yêu cầu DELETE kèm thẻ JWT lên Backend
  const response = await fetch(endpoint, {
    method: METHODS.DELETE,
    headers: getAuthHeaders(),
  });

  // Kiểm tra lỗi hết hạn phiên đăng nhập
  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  // Nếu có lỗi từ Backend thì trích xuất thông báo lỗi và ném lên giao diện
  if (!response.ok) {
    let errorMessage = 'Lỗi khi xóa kết quả khám nội khoa';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua nếu phản hồi lỗi từ server không phải định dạng JSON
    }
    throw new Error(errorMessage);
  }

  // Trả nguyên phản hồi JSON từ Backend xác nhận đã xóa thành công
  return await response.json();
}
