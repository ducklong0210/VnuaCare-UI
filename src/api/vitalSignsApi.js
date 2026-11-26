//
// Tầng API quản lý chỉ số thể lực và dấu hiệu sinh tồn theo mã hồ sơ (recordId)
// Hỗ trợ lấy kết quả đo hiện có, thêm mới, cập nhật và xóa phiếu đo sinh hiệu
//

import { vitalSignsRouter } from '../utils/api-router.js';
import { apiRequest, apiGetOptional } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lấy chỉ số sinh tồn và thể lực theo ID hồ sơ
export async function getVitalSignsApi(recordId) {
  return await apiGetOptional(vitalSignsRouter.getByRecordId(recordId), null);
}

// Thêm mới chỉ số sinh tồn và thể lực
export async function createVitalSignsApi(vitalSignsData) {
  return await apiRequest(vitalSignsRouter.create, {
    method: METHODS.POST,
    body: vitalSignsData,
    defaultError: 'Lỗi khi thêm mới chỉ số sinh tồn',
  });
}

// Cập nhật chỉ số sinh tồn và thể lực
export async function updateVitalSignsApi(vitalSignsData) {
  return await apiRequest(vitalSignsRouter.update, {
    method: METHODS.PUT,
    body: vitalSignsData,
    defaultError: 'Lỗi khi cập nhật chỉ số sinh tồn',
  });
}

// Xóa chỉ số sinh tồn và thể lực theo ID hồ sơ
export async function deleteVitalSignsApi(recordId) {
  return await apiRequest(vitalSignsRouter.delete(recordId), {
    method: METHODS.DELETE,
    defaultError: 'Lỗi khi xóa chỉ số sinh tồn',
  });
}
