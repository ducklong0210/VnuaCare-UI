//
// Tầng API quản lý Xét nghiệm Cận lâm sàng (LabTests: Huyết học, Sinh hóa, Nước tiểu)
// Hỗ trợ lấy danh mục chỉ số chuẩn, lấy phiếu & kết quả theo hồ sơ, tạo phiếu, lưu hàng loạt kết quả và xóa phiếu
//

import { labTestRouter } from '../utils/api-router.js';
import { apiRequest, apiGetOptional } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lấy danh mục chỉ số xét nghiệm chuẩn kèm dải tham chiếu (tùy chọn lọc theo nhóm categoryGroup)
export async function getLabIndicatorsApi(categoryGroup = null) {
  const query = categoryGroup ? `?categoryGroup=${encodeURIComponent(categoryGroup)}` : '';
  return await apiGetOptional(`${labTestRouter.getIndicators}${query}`, []);
}

// Lấy toàn bộ phiếu chỉ định và danh sách kết quả xét nghiệm chi tiết theo ID hồ sơ khám
export async function getLabTestsByRecordIdApi(recordId) {
  return await apiGetOptional(labTestRouter.getByRecordId(recordId), []);
}

// Tạo mới phiếu chỉ định xét nghiệm cho một hồ sơ khám (trả về orderId)
export async function createLabTestOrderApi(payload) {
  const result = await apiRequest(labTestRouter.createOrder, {
    method: METHODS.POST,
    body: payload,
    defaultError: 'Lỗi khi tạo mới phiếu chỉ định xét nghiệm',
    checkStatusCode: true,
  });
  return result?.data ?? null;
}

// Lưu hoặc cập nhật hàng loạt kết quả chỉ số xét nghiệm cho phiếu chỉ định (tự động gắn cờ HIGH/LOW/NORMAL)
export async function saveLabTestResultsApi(payload) {
  return await apiRequest(labTestRouter.saveResults, {
    method: METHODS.POST,
    body: payload,
    defaultError: 'Lỗi khi lưu kết quả xét nghiệm',
    checkStatusCode: true,
  });
}

// Xóa phiếu chỉ định xét nghiệm (kèm các chỉ số kết quả bên trong)
export async function deleteLabTestOrderApi(orderId) {
  return await apiRequest(labTestRouter.deleteOrder(orderId), {
    method: METHODS.DELETE,
    defaultError: 'Lỗi khi xóa phiếu chỉ định xét nghiệm',
    checkStatusCode: true,
  });
}
