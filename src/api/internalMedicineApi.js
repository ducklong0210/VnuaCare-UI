//
// Tầng API quản lý phiếu khám nội khoa tổng quát theo mã hồ sơ (recordId)
// Hỗ trợ lấy kết quả khám hiện có, thêm mới, cập nhật và xóa phiếu khám nội khoa
//

import { internalMedicineRouter } from '../utils/api-router.js';
import { apiRequest, apiGetOptional } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lấy kết quả khám nội khoa tổng quát theo mã hồ sơ
export async function getInternalMedicineApi(recordId) {
  return await apiGetOptional(internalMedicineRouter.getByRecordId(recordId), null);
}

// Thêm mới kết quả khám nội khoa
export async function createInternalMedicineExamApi(examData) {
  return await apiRequest(internalMedicineRouter.create, {
    method: METHODS.POST,
    body: examData,
    defaultError: 'Lỗi khi thêm mới kết quả khám nội khoa',
  });
}

// Cập nhật kết quả khám nội khoa
export async function updateInternalMedicineExamApi(examData) {
  return await apiRequest(internalMedicineRouter.update, {
    method: METHODS.PUT,
    body: examData,
    defaultError: 'Lỗi khi cập nhật kết quả khám nội khoa',
  });
}

// Xóa kết quả khám nội khoa theo mã phiếu khám
export async function deleteInternalMedicineExamApi(internalExamId) {
  return await apiRequest(internalMedicineRouter.delete(internalExamId), {
    method: METHODS.DELETE,
    defaultError: 'Lỗi khi xóa kết quả khám nội khoa',
  });
}
