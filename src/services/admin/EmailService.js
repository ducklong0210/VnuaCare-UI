//
// Tầng dịch vụ (Service) trung gian cho phân hệ Nhật ký gửi Email và Cảnh báo sức khỏe qua Email
// Gom nhóm các hàm từ emailApi.js và danh mục đợt khám để các màn hình quản trị gọi thống nhất
//

import { getEmailLogFilterApi, getEmailLogByIdApi, getDeclinedHealthRecordsApi, sendHealthAlertEmailApi } from '../../api/emailApi.js';
import { getCampaignsSelectApi } from '../../api/recordApi.js';

export const EmailService = {
  // Lấy danh sách nhật ký email đã gửi theo bộ lọc và phân trang
  getEmailLogs: getEmailLogFilterApi,

  // Xem chi tiết nội dung HTML và trạng thái của một nhật ký email
  getEmailLogById: getEmailLogByIdApi,

  // Lấy danh sách cán bộ có sức khỏe suy giảm so với năm trước
  getDeclinedHealthRecords: getDeclinedHealthRecordsApi,

  // Gửi email cảnh báo sức khỏe suy giảm (gửi lẻ hoặc hàng loạt)
  sendHealthAlertEmail: sendHealthAlertEmailApi,

  // Lấy danh mục đợt khám sức khỏe phục vụ lọc cảnh báo theo đợt
  getCampaigns: getCampaignsSelectApi,
};

export default EmailService;
