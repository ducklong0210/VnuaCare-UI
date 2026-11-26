//
// Tầng dịch vụ (Service) cho phiếu Chẩn đoán hình ảnh và Thăm dò chức năng
// Kết nối diagnosticReportApi.js với Model DiagnosticReport để kiểm tra hợp lệ và chuyển đổi dữ liệu JSON
//

import {
  getDiagnosticReportsByRecordIdApi,
  getDiagnosticReportByIdApi,
  createDiagnosticReportApi,
  updateDiagnosticReportApi,
  deleteDiagnosticReportApi,
} from '../../api/diagnosticReportApi.js';
import { DiagnosticReport } from '../../models/DiagnosticReport.js';

export class DiagnosticReportService {
  // Lấy danh sách phiếu chẩn đoán hình ảnh theo ID hồ sơ khám (sắp xếp cố định theo reportId để không nhảy thứ tự sau khi lưu)
  async getReportsByRecordId(recordId, modalityType = null) {
    const dataList = await getDiagnosticReportsByRecordIdApi(recordId, modalityType);
    const reports = dataList.map((item) => DiagnosticReport.fromApi(item));
    return reports.sort((a, b) => (a.reportId || 0) - (b.reportId || 0));
  }

  // Lấy chi tiết một phiếu kết quả chẩn đoán theo ID
  async getReportById(reportId) {
    const data = await getDiagnosticReportByIdApi(reportId);
    return DiagnosticReport.fromApi(data);
  }

  // Thêm mới một phiếu kết quả chẩn đoán hình ảnh
  async createReport(reportInstance) {
    this.#assertValidReport(reportInstance);
    return await createDiagnosticReportApi(reportInstance.toApiPayload());
  }

  // Cập nhật phiếu kết quả chẩn đoán hình ảnh
  async updateReport(reportInstance) {
    this.#assertValidReport(reportInstance);
    return await updateDiagnosticReportApi(reportInstance.toApiPayload());
  }

  // Lưu thông minh: tự động chọn tạo mới hoặc cập nhật
  async saveReport(reportInstance) {
    if (reportInstance.reportId) {
      return await this.updateReport(reportInstance);
    }
    return await this.createReport(reportInstance);
  }

  // Xóa phiếu kết quả chẩn đoán hình ảnh
  async deleteReport(reportId) {
    return await deleteDiagnosticReportApi(reportId);
  }

  // Kiểm tra hợp lệ thực thể DiagnosticReport trước khi gửi lên API
  #assertValidReport(reportInstance) {
    if (!(reportInstance instanceof DiagnosticReport)) {
      throw new Error('Dữ liệu không phải là một thực thể DiagnosticReport');
    }

    const validation = reportInstance.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(' '));
    }
  }
}

export const diagnosticReportService = new DiagnosticReportService();
