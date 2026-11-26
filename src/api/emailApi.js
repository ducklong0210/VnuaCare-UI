//
// Tầng API riêng cho phân hệ Nhật ký gửi Email và Cảnh báo sức khỏe suy giảm qua Email
// Kết nối trực tiếp tới EmailLogController (/api/v1/emaillogs) và 2 endpoint cảnh báo của HealthCheckupRecordController
//

import { emailLogRouter, healthRecordRouter } from '../utils/api-router.js';
import { apiRequest } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lọc và phân trang danh sách nhật ký Email đã gửi (POST /api/v1/emaillogs/filter)
export async function getEmailLogFilterApi(filters = {}) {
  const textSearch = filters.textSearch || '';
  const sentStatus = filters.sentStatus || '';
  const referenceType = filters.referenceType || '';
  const referenceId = filters.referenceId || null;
  const fromDate = filters.fromDate || '';
  const toDate = filters.toDate || '';
  const pageNumber = filters.pageNumber || 1;
  const pageSize = filters.pageSize || 10;

  // Chuẩn bị dữ liệu lọc gửi lên Backend
  const bodyData = {
    textSearch: textSearch.trim(),
    pageNumber: pageNumber,
    pageSize: pageSize,
  };

  // Chỉ gắn các tiêu chí lọc khi người dùng có chọn cụ thể (bỏ qua giá trị 'ALL')
  if (sentStatus && sentStatus !== 'ALL') {
    bodyData.sentStatus = sentStatus;
  }
  if (referenceType && referenceType !== 'ALL') {
    bodyData.referenceType = referenceType;
  }
  if (referenceId && Number(referenceId) > 0) {
    bodyData.referenceId = Number(referenceId);
  }
  if (fromDate) {
    bodyData.fromDate = `${fromDate}T00:00:00`;
  }
  if (toDate) {
    bodyData.toDate = `${toDate}T23:59:59`;
  }

  const result = await apiRequest(emailLogRouter.getFilter, {
    method: METHODS.POST,
    body: bodyData,
    defaultError: 'Lỗi khi tải danh sách nhật ký gửi email',
  });

  return {
    items: result?.data?.data || [],
    totalCount: result?.data?.totalCount || 0,
    pageNumber: result?.data?.pageNumber || pageNumber,
    pageSize: result?.data?.pageSize || pageSize,
  };
}

// Xem chi tiết một bản ghi nhật ký gửi Email theo ID (GET /api/v1/emaillogs/{id})
export async function getEmailLogByIdApi(emailLogId) {
  const result = await apiRequest(emailLogRouter.getById(emailLogId), {
    method: METHODS.GET,
    defaultError: 'Lỗi khi tải chi tiết nhật ký gửi email',
  });

  return result?.data || null;
}

// Lấy danh sách cán bộ có xếp loại sức khỏe suy giảm so với năm trước (GET /api/v1/healthcheckuprecords/declined-health)
export async function getDeclinedHealthRecordsApi(campaignId = null) {
  let path = healthRecordRouter.getDeclinedHealth;
  if (campaignId && campaignId !== 'ALL') {
    path += `?campaignId=${Number(campaignId)}`;
  }

  const result = await apiRequest(path, {
    method: METHODS.GET,
    defaultError: 'Lỗi khi tải danh sách cán bộ có sức khỏe suy giảm',
  });

  return result?.data || [];
}

// Gửi Email cảnh báo sức khỏe suy giảm (gửi lẻ theo recordId hoặc hàng loạt theo campaignId)
export async function sendHealthAlertEmailApi(options = {}) {
  const recordId = options.recordId || null;
  const campaignId = options.campaignId || null;
  const forceResend = Boolean(options.forceResend);

  const bodyData = {
    recordId: recordId ? Number(recordId) : null,
    campaignId: campaignId && campaignId !== 'ALL' ? Number(campaignId) : null,
    forceResend: forceResend,
  };

  const result = await apiRequest(healthRecordRouter.sendHealthAlert, {
    method: METHODS.POST,
    body: bodyData,
    defaultError: 'Lỗi khi gửi email cảnh báo sức khỏe',
  });

  return result?.data || null;
}
