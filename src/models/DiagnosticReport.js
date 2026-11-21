//
// Domain Model quản lý cấu trúc phiếu Chẩn đoán hình ảnh và Thăm dò chức năng
// Định nghĩa cấu hình các loại kỹ thuật, lớp FindingSection và thực thể DiagnosticReport xử lý JSON kết quả
//

export const MODALITY_CONFIG = {
  ULTRASOUND: {
    code: 'ULTRASOUND',
    label: 'Siêu âm',
    badgeClass: 'badge-ultrasound',
    color: '#0284c7',
    bgColor: '#e0f2fe',
  },
  XRAY: {
    code: 'XRAY',
    label: 'X-Quang',
    badgeClass: 'badge-xray',
    color: '#7c3aed',
    bgColor: '#ede9fe',
  },
  ECG: {
    code: 'ECG',
    label: 'Điện tim',
    badgeClass: 'badge-ecg',
    color: '#dc2626',
    bgColor: '#fee2e2',
  },
  ENDOSCOPY: {
    code: 'ENDOSCOPY',
    label: 'Nội soi',
    badgeClass: 'badge-endoscopy',
    color: '#059669',
    bgColor: '#d1fae5',
  },
  CT: {
    code: 'CT',
    label: 'Chụp CT',
    badgeClass: 'badge-ct',
    color: '#d97706',
    bgColor: '#fef3c7',
  },
  MRI: {
    code: 'MRI',
    label: 'Chụp MRI',
    badgeClass: 'badge-mri',
    color: '#4f46e5',
    bgColor: '#e0e7ff',
  },
};

/**
 * Value Object quản lý từng phân vùng / cơ quan giải phẫu kèm danh sách các gạch đầu dòng mô tả
 */
export class FindingSection {
  constructor(key, title, bullets = []) {
    this.key = key;
    this.title = title;
    this.bullets = Array.isArray(bullets) ? [...bullets] : [];
  }

  addBullet(text = '') {
    this.bullets.push(text);
  }

  removeBullet(index) {
    if (index >= 0 && index < this.bullets.length) {
      this.bullets.splice(index, 1);
    }
  }

  updateBullet(index, text) {
    if (index >= 0 && index < this.bullets.length) {
      this.bullets[index] = text;
    }
  }

  clone() {
    return new FindingSection(this.key, this.title, [...this.bullets]);
  }
}

/**
 * Factory hỗ trợ khởi tạo phiếu chẩn đoán hình ảnh trống để bác sĩ tự điền
 */
export class ModalityTemplateFactory {
  static getTemplates() {
    return [];
  }

  static createBlankReport(recordId, modalityType = 'ULTRASOUND', examTitle = '') {
    return DiagnosticReport.createBlank(recordId, modalityType, examTitle);
  }

  static createFromTemplate(templateId, recordId) {
    return DiagnosticReport.createBlank(recordId, templateId || 'ULTRASOUND');
  }
}

/**
 * Domain Entity đại diện cho một Phiếu Chẩn Đoán Hình Ảnh
 */
export class DiagnosticReport {
  constructor(data = {}) {
    this.reportId = data.reportId || null;
    this.recordId = data.recordId || 0;
    this.modalityType = (data.modalityType || 'ULTRASOUND').toUpperCase();
    this.examTitle = data.examTitle || '';
    this.techniqueDescription = data.techniqueDescription || '';
    this.conclusion = data.conclusion || '';
    this.imageUrls = data.imageUrls || '';
    this.readingDoctorId = data.readingDoctorId ? Number(data.readingDoctorId) : '';
    this.readingDoctorName = data.readingDoctorName || '';
    this.approvingDoctorId = data.approvingDoctorId ? Number(data.approvingDoctorId) : '';
    this.approvingDoctorName = data.approvingDoctorName || '';
    this.performedAt = data.performedAt ? data.performedAt.slice(0, 16) : '';

    this.sections = [];
    if (data.sections && Array.isArray(data.sections)) {
      this.sections = data.sections.map((s) =>
        s instanceof FindingSection ? s.clone() : new FindingSection(s.key, s.title, s.bullets)
      );
    }
  }

  // Khởi tạo phiếu trống hoàn toàn để bác sĩ tự do nhập mô tả
  static createBlank(recordId, modalityType = 'ULTRASOUND', examTitle = '') {
    const report = new DiagnosticReport({
      recordId: Number(recordId) || 0,
      modalityType: (modalityType || 'ULTRASOUND').toUpperCase(),
      examTitle: examTitle || '',
      techniqueDescription: '',
      conclusion: '',
      imageUrls: '',
      readingDoctorId: '',
      approvingDoctorId: '',
      performedAt: new Date().toISOString().slice(0, 16),
      sections: [new FindingSection('mo_ta', 'Mô tả hình ảnh & tổn thương', [''])],
    });
    return report;
  }

  // Khởi tạo thực thể từ DTO trả về của Backend API
  static fromApi(dto) {
    const report = new DiagnosticReport(dto);
    report.sections = report.parseFindingsData(dto.findingsData);
    return report;
  }

  // Phân tích chuỗi JSON findings_data thành danh sách FindingSection
  parseFindingsData(findingsData) {
    if (!findingsData) return [];

    let parsed = null;
    if (typeof findingsData === 'string') {
      try {
        parsed = JSON.parse(findingsData);
      } catch {
        // Nếu là text thường không phải JSON, đưa vào một phân vùng mặc định
        return [new FindingSection('general_description', 'Mô tả chi tiết', [findingsData])];
      }
    } else if (typeof findingsData === 'object') {
      parsed = findingsData;
    }

    if (!parsed) return [];

    // Nếu cấu trúc có bọc trường findings
    const findingsObj = parsed.findings || parsed;
    const sections = [];

    if (typeof findingsObj === 'object' && !Array.isArray(findingsObj)) {
      Object.entries(findingsObj).forEach(([key, value]) => {
        const title = this.formatSectionTitle(key);
        let bullets = [];

        if (Array.isArray(value)) {
          bullets = value.map((item) => String(item).trim()).filter(Boolean);
        } else if (typeof value === 'string') {
          // Xử lý chuỗi có dấu gạch đầu dòng hoặc xuống dòng
          bullets = value
            .split(/\n|•|-/)
            .map((item) => item.trim())
            .filter(Boolean);
        } else if (typeof value === 'object' && value !== null) {
          bullets = Object.entries(value).map(([subKey, subVal]) => `${subKey}: ${subVal}`);
        }

        if (bullets.length === 0) {
          bullets = [''];
        }

        sections.push(new FindingSection(key, title, bullets));
      });
    }

    return sections;
  }

  // Tự động định dạng tên hiển thị tiếng Việt cho các key giải phẫu phổ biến
  static formatSectionTitle(key) {
    const titleMap = {
      mo_ta: 'Mô tả hình ảnh & tổn thương',
      liver: 'Gan',
      gallbladder: 'Túi mật & Đường mật',
      pancreas: 'Tụy',
      spleen: 'Lách',
      right_kidney: 'Thận phải',
      left_kidney: 'Thận trái',
      urinary_bladder: 'Bàng quang',
      pelvic_prostate: 'Tiền liệt tuyến & Tiểu khung',
      right_lobe: 'Thùy phải',
      left_lobe: 'Thùy trái',
      isthmus: 'Eo tuyến',
      salivary_glands: 'Tuyến nước bọt',
      cervical_soft_tissue: 'Phần mềm vùng cổ & Hạch',
      chest_wall: 'Lồng ngực & Thành ngực',
      lungs: 'Nhu mô phổi hai bên',
      pleura: 'Khoang màng phổi',
      trachea_mediastinum: 'Khí phế quản & Trung thất',
      heart_shadow: 'Bóng tim',
      aorta: 'Cung động mạch chủ',
      ribs: 'Khung xương sườn',
      rhythm_parameters: 'Nhịp tim & Tần số',
      waveforms: 'Hình thái sóng điện tim',
      clinical_status: 'Đánh giá buồng tim & Dẫn truyền',
      right_breast: 'Tuyến vú phải',
      left_breast: 'Tuyến vú trái',
      axillary_lymph_nodes: 'Hạch hố nách',
      nipples: 'Núm vú hai bên',
      ears: 'Tai (Hai bên)',
      nose_nasopharynx: 'Hốc mũi & Vòm họng',
      throat_pharynx: 'Họng miệng & Amidan',
      larynx: 'Thanh quản',
    };

    if (titleMap[key]) return titleMap[key];

    // Chuyển đổi snake_case thành chữ hoa đầu từ
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatSectionTitle(key) {
    return DiagnosticReport.formatSectionTitle(key);
  }

  // Chuyển đổi thực thể thành Payload gửi lên Backend API
  toApiPayload() {
    // Đóng gói các phân vùng thành Object JSON
    const findingsMap = {};
    this.sections.forEach((sec) => {
      const validBullets = sec.bullets
        .map((b) => (typeof b === 'string' ? b.trim() : ''))
        .filter(Boolean);
      findingsMap[sec.key] = validBullets.length > 0 ? validBullets : [''];
    });

    const findingsEnvelope = {
      technique: this.techniqueDescription ? this.techniqueDescription.trim() : '',
      findings: findingsMap,
      conclusion: this.conclusion ? this.conclusion.trim() : '',
    };

    const payload = {
      recordId: Number(this.recordId),
      modalityType: (this.modalityType || 'ULTRASOUND').trim().toUpperCase(),
      examTitle: (this.examTitle || '').trim(),
      techniqueDescription: this.techniqueDescription ? this.techniqueDescription.trim() : null,
      findingsData: JSON.stringify(findingsEnvelope),
      conclusion: (this.conclusion || '').trim(),
      imageUrls: this.imageUrls ? this.imageUrls.trim() : null,
      readingDoctorId: this.readingDoctorId ? Number(this.readingDoctorId) : null,
      approvingDoctorId: this.approvingDoctorId ? Number(this.approvingDoctorId) : null,
      performedAt: this.performedAt ? new Date(this.performedAt).toISOString() : new Date().toISOString(),
    };

    if (this.reportId) {
      payload.reportId = Number(this.reportId);
    }

    return payload;
  }

  // Lấy thông tin huy hiệu giao diện tương ứng với loại kỹ thuật
  getModalityBadge() {
    return MODALITY_CONFIG[this.modalityType] || {
      code: this.modalityType,
      label: this.modalityType,
      badgeClass: 'badge-default',
      color: '#475569',
      bgColor: '#f1f5f9',
    };
  }

  // Kiểm tra phiếu đã có kết quả hoàn tất hay chưa
  isCompleted() {
    return Boolean(this.conclusion && this.conclusion.trim().length > 0);
  }

  // Thêm một gạch đầu dòng mới vào một phân vùng
  addBullet(sectionKey, text = '') {
    const sec = this.sections.find((s) => s.key === sectionKey);
    if (sec) {
      sec.addBullet(text);
    }
  }

  // Xóa một gạch đầu dòng trong phân vùng
  removeBullet(sectionKey, index) {
    const sec = this.sections.find((s) => s.key === sectionKey);
    if (sec) {
      sec.removeBullet(index);
    }
  }

  // Cập nhật nội dung một gạch đầu dòng
  updateBullet(sectionKey, index, text) {
    const sec = this.sections.find((s) => s.key === sectionKey);
    if (sec) {
      sec.updateBullet(index, text);
    }
  }

  // Thêm một phân vùng giải phẫu mới
  addSection(key, title) {
    if (!key && !title) return;
    const cleanTitle = (title || key).trim();
    const cleanKey = (key || title)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');

    if (!this.sections.some((s) => s.key === cleanKey)) {
      this.sections.push(new FindingSection(cleanKey, cleanTitle, ['']));
    }
  }

  // Xóa một phân vùng giải phẫu
  removeSection(key) {
    this.sections = this.sections.filter((s) => s.key !== key);
  }

  // Đổi tên phân vùng giải phẫu
  updateSectionTitle(key, newTitle) {
    const sec = this.sections.find((s) => s.key === key);
    if (sec && newTitle) {
      sec.title = newTitle.trim();
    }
  }

  // Kiểm tra tính hợp lệ của dữ liệu trước khi gửi lên API
  validate() {
    const errors = [];
    if (!this.examTitle || !this.examTitle.trim()) {
      errors.push('Tên phiếu khám / Chỉ định không được để trống.');
    }
    if (!this.modalityType || !this.modalityType.trim()) {
      errors.push('Loại chẩn đoán hình ảnh không được để trống.');
    }
    if (!this.conclusion || !this.conclusion.trim()) {
      errors.push('Kết luận của bác sĩ không được để trống.');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Sao chép sâu đối tượng để phục vụ quản lý state độc lập trong React
  clone() {
    const cloned = new DiagnosticReport({
      reportId: this.reportId,
      recordId: this.recordId,
      modalityType: this.modalityType,
      examTitle: this.examTitle,
      techniqueDescription: this.techniqueDescription,
      conclusion: this.conclusion,
      imageUrls: this.imageUrls,
      readingDoctorId: this.readingDoctorId,
      readingDoctorName: this.readingDoctorName,
      approvingDoctorId: this.approvingDoctorId,
      approvingDoctorName: this.approvingDoctorName,
      performedAt: this.performedAt,
    });
    cloned.sections = this.sections.map((s) => s.clone());
    return cloned;
  }
}
