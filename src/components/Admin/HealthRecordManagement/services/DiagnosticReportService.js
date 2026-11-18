// Tầng Service hướng đối tượng quản lý nghiệp vụ Chẩn đoán hình ảnh & Thăm dò chức năng (Tab 4)
// Đóng gói toàn bộ các hàm gọi API: getReportsByRecordId, getReportById, createReport, updateReport, deleteReport
// Tự động đính kèm Bearer token xác thực, bóc tách mã lỗi backend và ánh xạ dữ liệu thành thực thể DiagnosticReport

import { diagnosticReportRouter } from '../../../../utils/api-router.js';
import { DiagnosticReport } from '../models/DiagnosticReport.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export class DiagnosticReportService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Lấy Header xác thực có Bearer Token
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  // Bóc tách thông báo lỗi chuẩn từ kết quả trả về của backend
  parseError(responseBody, defaultMessage) {
    if (responseBody?.message) return responseBody.message;
    if (responseBody?.errors && typeof responseBody.errors === 'object') {
      const errList = Object.values(responseBody.errors).flat();
      if (errList.length > 0) return errList.join(', ');
    }
    if (responseBody?.title) return responseBody.title;
    return defaultMessage;
  }

  // Lấy danh sách kết quả chẩn đoán hình ảnh theo ID hồ sơ khám
  async getReportsByRecordId(recordId, modalityType = null) {
    let endpoint = `${this.baseUrl}${diagnosticReportRouter.getByRecordId(recordId)}`;
    if (modalityType) {
      endpoint += `?modalityType=${encodeURIComponent(modalityType)}`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    const dataList = result?.data || [];
    return dataList.map((item) => DiagnosticReport.fromApi(item));
  }

  // Lấy chi tiết một phiếu kết quả chẩn đoán theo ID
  async getReportById(reportId) {
    const endpoint = `${this.baseUrl}${diagnosticReportRouter.getById(reportId)}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Không tìm thấy phiếu kết quả có ID ${reportId}`);
    }

    const result = await response.json();
    if (!result?.data) {
      throw new Error('Dữ liệu phiếu chẩn đoán rỗng');
    }

    return DiagnosticReport.fromApi(result.data);
  }

  // Thêm mới một phiếu kết quả chẩn đoán hình ảnh
  async createReport(reportInstance) {
    if (!(reportInstance instanceof DiagnosticReport)) {
      throw new Error('Dữ liệu không phải là một thực thể DiagnosticReport');
    }

    const validation = reportInstance.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(' '));
    }

    const endpoint = `${this.baseUrl}${diagnosticReportRouter.create}`;
    const payload = reportInstance.toApiPayload();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
    }

    if (!response.ok) {
      let errorMsg = 'Lỗi khi tạo mới phiếu chẩn đoán hình ảnh';
      try {
        const errJson = await response.json();
        errorMsg = this.parseError(errJson, errorMsg);
      } catch {
        // Bỏ qua lỗi parse JSON
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  }

  // Cập nhật phiếu kết quả chẩn đoán hình ảnh
  async updateReport(reportInstance) {
    if (!(reportInstance instanceof DiagnosticReport)) {
      throw new Error('Dữ liệu không phải là một thực thể DiagnosticReport');
    }

    const validation = reportInstance.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(' '));
    }

    const endpoint = `${this.baseUrl}${diagnosticReportRouter.update}`;
    const payload = reportInstance.toApiPayload();

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
    }

    if (!response.ok) {
      let errorMsg = 'Lỗi khi cập nhật phiếu chẩn đoán hình ảnh';
      try {
        const errJson = await response.json();
        errorMsg = this.parseError(errJson, errorMsg);
      } catch {
        // Bỏ qua lỗi parse JSON
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  }

  // Lưu thông minh tự động chọn tạo mới hoặc cập nhật
  async saveReport(reportInstance) {
    if (reportInstance.reportId) {
      return await this.updateReport(reportInstance);
    }
    return await this.createReport(reportInstance);
  }

  // Xóa phiếu kết quả chẩn đoán hình ảnh
  async deleteReport(reportId) {
    const endpoint = `${this.baseUrl}${diagnosticReportRouter.delete(reportId)}`;

    const response = await fetch(endpoint, {
      method: ModelMode.DELETE,
      headers: this.getAuthHeaders(),
    });

    if (response.status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
    }

    if (!response.ok) {
      let errorMsg = 'Lỗi khi xóa phiếu chẩn đoán hình ảnh';
      try {
        const errJson = await response.json();
        errorMsg = this.parseError(errJson, errorMsg);
      } catch {
        // Bỏ qua lỗi parse JSON
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  }
}

// Khởi tạo Singleton Service dùng chung cho toàn bộ ứng dụng
export const diagnosticReportService = new DiagnosticReportService();
