//
// Tầng API quản lý kết quả khám các chuyên khoa lẻ lâm sàng theo mã hồ sơ (recordId)
// Hỗ trợ lấy danh sách, thêm mới, cập nhật và xóa kết quả khám Mắt, TMH, Răng, Da liễu, Ngoại, Phụ khoa
//

import { specialistExamRouter } from '../utils/api-router.js';
import { apiRequest, apiGetOptional } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lấy danh sách kết quả khám các chuyên khoa lẻ theo ID hồ sơ
export async function getSpecialistExamsApi(recordId, specialtyType = null) {
  const query = specialtyType ? `?specialtyType=${encodeURIComponent(specialtyType)}` : '';
  return await apiGetOptional(`${specialistExamRouter.getByRecordId(recordId)}${query}`, []);
}

// Thêm mới kết quả khám chuyên khoa lẻ
export async function createSpecialistExamApi(examData) {
  return await apiRequest(specialistExamRouter.create, {
    method: METHODS.POST,
    body: examData,
    defaultError: 'Lỗi khi thêm mới kết quả khám chuyên khoa',
  });
}

// Cập nhật kết quả khám chuyên khoa lẻ
export async function updateSpecialistExamApi(examData) {
  return await apiRequest(specialistExamRouter.update, {
    method: METHODS.PUT,
    body: examData,
    defaultError: 'Lỗi khi cập nhật kết quả khám chuyên khoa',
  });
}

// Xóa kết quả khám chuyên khoa lẻ
export async function deleteSpecialistExamApi(specialistExamId) {
  return await apiRequest(specialistExamRouter.delete(specialistExamId), {
    method: METHODS.DELETE,
    defaultError: 'Lỗi khi xóa kết quả khám chuyên khoa',
  });
}
