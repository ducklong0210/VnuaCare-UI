//
// Tầng API quản lý phiếu Chẩn đoán hình ảnh và Thăm dò chức năng (Siêu âm, X-quang, Điện tim...)
// Hỗ trợ lấy danh sách theo hồ sơ, xem chi tiết, thêm mới, cập nhật và xóa phiếu chẩn đoán
//

import { diagnosticReportRouter } from '../utils/api-router.js';
import { apiRequest, apiGetOptional } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lấy danh sách phiếu chẩn đoán hình ảnh theo ID hồ sơ khám
export async function getDiagnosticReportsByRecordIdApi(recordId, modalityType = null) {
  const query = modalityType ? `?modalityType=${encodeURIComponent(modalityType)}` : '';
  return await apiGetOptional(`${diagnosticReportRouter.getByRecordId(recordId)}${query}`, []);
}

// Lấy chi tiết một phiếu chẩn đoán hình ảnh theo ID
export async function getDiagnosticReportByIdApi(reportId) {
  const result = await apiRequest(diagnosticReportRouter.getById(reportId), {
    method: METHODS.GET,
    defaultError: `Không tìm thấy phiếu kết quả có ID ${reportId}`,
  });

  if (!result?.data) {
    throw new Error('Dữ liệu phiếu chẩn đoán rỗng');
  }

  return result.data;
}

// Thêm mới phiếu kết quả chẩn đoán hình ảnh
export async function createDiagnosticReportApi(payload) {
  return await apiRequest(diagnosticReportRouter.create, {
    method: METHODS.POST,
    body: payload,
    defaultError: 'Lỗi khi tạo mới phiếu chẩn đoán hình ảnh',
    checkStatusCode: true,
  });
}

// Cập nhật phiếu kết quả chẩn đoán hình ảnh
export async function updateDiagnosticReportApi(payload) {
  return await apiRequest(diagnosticReportRouter.update, {
    method: METHODS.PUT,
    body: payload,
    defaultError: 'Lỗi khi cập nhật phiếu chẩn đoán hình ảnh',
    checkStatusCode: true,
  });
}

// Xóa phiếu kết quả chẩn đoán hình ảnh
export async function deleteDiagnosticReportApi(reportId) {
  return await apiRequest(diagnosticReportRouter.delete(reportId), {
    method: METHODS.DELETE,
    defaultError: 'Lỗi khi xóa phiếu chẩn đoán hình ảnh',
    checkStatusCode: true,
  });
}
