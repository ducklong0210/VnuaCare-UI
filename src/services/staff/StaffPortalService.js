//
// Tầng dịch vụ (Service) dành riêng cho Cổng thông tin Cán bộ / Giảng viên (vai trò STAFF)
// Tải hồ sơ cá nhân, danh sách bệnh án thuộc đúng cán bộ đang đăng nhập và chi tiết 4 chuyên khoa ở chế độ chỉ đọc
//

import { getMyProfileApi, updateMyProfileApi, changePasswordApi } from '../../api/userApi.js';
import { getHealthRecordFilterApi, getHealthRecordByIdApi } from '../../api/recordApi.js';
import { getVitalSignsApi } from '../../api/vitalSignsApi.js';
import { getInternalMedicineApi } from '../../api/internalMedicineApi.js';
import { getSpecialistExamsApi } from '../../api/specialistExamApi.js';
import { diagnosticReportService } from '../admin/DiagnosticReportService.js';

// Kiểm tra một hồ sơ khám có đúng là của cán bộ đang đăng nhập hay không
function belongsToCurrentStaff(record, staffProfile) {
  if (!record || !staffProfile) {
    return false;
  }

  // Cách 1: So khớp trực tiếp theo mã staffId
  if (staffProfile.staffId && record.staffId) {
    return Number(record.staffId) === Number(staffProfile.staffId);
  }

  // Cách 2: Nếu thiếu staffId thì so khớp chính xác theo mã cán bộ (employeeCode)
  const myCode = (staffProfile.employeeCode || staffProfile.staffCode || '').trim().toLowerCase();
  const recordCode = (record.employeeCode || '').trim().toLowerCase();
  if (myCode && recordCode) {
    return recordCode === myCode;
  }

  return false;
}

export const StaffPortalService = {
  // Lấy thông tin tài khoản và hồ sơ cán bộ đang đăng nhập
  getMyProfile: getMyProfileApi,

  // Cập nhật thông tin liên hệ cá nhân của cán bộ
  updateMyProfile: updateMyProfileApi,

  // Đổi mật khẩu đăng nhập cá nhân
  changePassword: changePasswordApi,

  // Lấy toàn bộ lịch sử hồ sơ khám sức khỏe của riêng cán bộ đang đăng nhập
  async getMyHealthRecords(staffProfile) {
    if (!staffProfile) {
      return [];
    }

    const staffId = staffProfile.staffId || null;
    const employeeCode = (staffProfile.employeeCode || staffProfile.staffCode || '').trim();
    const fullName = (staffProfile.fullName || '').trim();

    if (!staffId && !employeeCode) {
      return [];
    }

    // Gọi API lọc hồ sơ khám của cán bộ hiện tại
    const result = await getHealthRecordFilterApi({
      textSearch: employeeCode || fullName,
      staffId: staffId,
      pageNumber: 1,
      pageSize: 50,
    });

    // Chỉ giữ lại các hồ sơ khớp chính xác với cán bộ đang đăng nhập
    const allItems = Array.isArray(result?.items) ? result.items : [];
    const ownRecords = allItems.filter((item) => belongsToCurrentStaff(item, staffProfile));

    // Sắp xếp đưa đợt khám mới nhất lên đầu danh sách
    ownRecords.sort((a, b) => {
      const timeA = a.actualCheckupDate ? new Date(a.actualCheckupDate).getTime() : 0;
      const timeB = b.actualCheckupDate ? new Date(b.actualCheckupDate).getTime() : 0;
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return (b.recordId || 0) - (a.recordId || 0);
    });

    return ownRecords;
  },

  // Tải đồng thời đầy đủ 5 phần của một tờ bệnh án (Tổng quan, Sinh tồn, Nội khoa, Chuyên khoa lẻ, CĐHA)
  async getRecordFullDetail(recordId) {
    const [detailRes, vitalRes, internalRes, specialistRes, diagnosticRes] = await Promise.allSettled([
      getHealthRecordByIdApi(recordId),
      getVitalSignsApi(recordId),
      getInternalMedicineApi(recordId),
      getSpecialistExamsApi(recordId),
      diagnosticReportService.getReportsByRecordId(recordId),
    ]);

    // Lấy kết quả của từng phần (phần nào chưa có dữ liệu thì để null hoặc mảng rỗng)
    const recordDetail = detailRes.status === 'fulfilled' ? detailRes.value : null;
    const vitalSigns = vitalRes.status === 'fulfilled' ? vitalRes.value : null;
    const internalMedicine = internalRes.status === 'fulfilled' ? internalRes.value : null;
    const specialistExams =
      specialistRes.status === 'fulfilled' && Array.isArray(specialistRes.value) ? specialistRes.value : [];
    const diagnosticReports =
      diagnosticRes.status === 'fulfilled' && Array.isArray(diagnosticRes.value) ? diagnosticRes.value : [];

    return {
      recordDetail: recordDetail,
      vitalSigns: vitalSigns,
      internalMedicine: internalMedicine,
      specialistExams: specialistExams,
      diagnosticReports: diagnosticReports,
    };
  },
};

export default StaffPortalService;
