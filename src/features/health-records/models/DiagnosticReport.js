// Tầng Model hướng đối tượng (Domain Model) cho phiếu Chẩn đoán hình ảnh và Thăm dò chức năng
// Bao gồm: Value Object FindingSection quản lý phát hiện theo vùng, Entity DiagnosticReport xử lý nghiệp vụ
// Cung cấp ModalityTemplateFactory nạp 6 bản mẫu y khoa điền nhanh (Siêu âm, X-quang, ECG, Nội soi)

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
 * Factory cung cấp bản mẫu (Templates) khởi tạo cho từng loại kỹ thuật thăm khám
 */
export class ModalityTemplateFactory {
  static getTemplates() {
    return [
      {
        id: 'US_ABDOMEN',
        modalityType: 'ULTRASOUND',
        examTitle: 'Siêu âm ổ bụng tổng quát',
        techniqueDescription: 'Siêu âm ổ bụng tổng quát bằng đầu dò Convex 3.5MHz qua thành bụng',
        sections: [
          { key: 'liver', title: 'Gan', bullets: ['Kích thước bình thường', 'Nhu mô đều, bờ nhẵn', 'Tĩnh mạch cửa không giãn', 'Không thấy khối khu trú'] },
          { key: 'gallbladder', title: 'Túi mật & Đường mật', bullets: ['Kích thước bình thường', 'Thành mỏng đều', 'Lòng túi mật sạch, không có sỏi', 'Đường mật trong và ngoài gan không giãn'] },
          { key: 'pancreas', title: 'Tụy', bullets: ['Hình dạng và kích thước bình thường', 'Nhu mô đồng nhất, ống tụy không giãn'] },
          { key: 'spleen', title: 'Lách', bullets: ['Kích thước bình thường', 'Nhu mô đồng nhất'] },
          { key: 'right_kidney', title: 'Thận phải', bullets: ['Vị trí và kích thước bình thường', 'Phân biệt vỏ tủy rõ', 'Đài bể thận không giãn, không sỏi'] },
          { key: 'left_kidney', title: 'Thận trái', bullets: ['Vị trí và kích thước bình thường', 'Phân biệt vỏ tủy rõ', 'Đài bể thận không giãn, không sỏi'] },
          { key: 'urinary_bladder', title: 'Bàng quang', bullets: ['Căng nước tiểu, thành mỏng đều', 'Lòng bàng quang sạch, không có sỏi'] },
          { key: 'pelvic_prostate', title: 'Tiền liệt tuyến & Ổ bụng', bullets: ['Kích thước bình thường', 'Cấu trúc nhu mô đồng nhất', 'Không có dịch tự do khoang ổ bụng'] },
        ],
        defaultConclusion: 'Hình ảnh siêu âm ổ bụng hiện tại chưa thấy bất thường.',
      },
      {
        id: 'US_THYROID',
        modalityType: 'ULTRASOUND',
        examTitle: 'Siêu âm tuyến giáp',
        techniqueDescription: 'Siêu âm tuyến giáp và phần mềm vùng cổ bằng đầu dò phẳng tần số cao (linear)',
        sections: [
          { key: 'right_lobe', title: 'Thùy phải', bullets: ['Kích thước bình thường', 'Nhu mô đồng nhất, không có nốt khu trú'] },
          { key: 'left_lobe', title: 'Thùy trái', bullets: ['Kích thước bình thường', 'Nhu mô đồng nhất', 'Không thấy cấu trúc dạng nang, khối đặc'] },
          { key: 'isthmus', title: 'Eo tuyến', bullets: ['Hình dạng và cấu trúc bình thường'] },
          { key: 'salivary_glands', title: 'Tuyến nước bọt', bullets: ['Tuyến dưới hàm hai bên cấu trúc đồng nhất, ống tuyến không giãn', 'Tuyến mang tai hai bên cấu trúc đồng nhất, không thấy u'] },
          { key: 'cervical_soft_tissue', title: 'Phần mềm vùng cổ', bullets: ['Cơ ức đòn chũm và cơ vùng cổ: Bình thường', 'Hạch to vùng cổ: Không thấy'] },
        ],
        defaultConclusion: 'Hình ảnh siêu âm tuyến giáp và phần mềm vùng cổ hiện tại bình thường.',
      },
      {
        id: 'XRAY_CHEST',
        modalityType: 'XRAY',
        examTitle: 'Chụp X quang tim phổi thẳng KTS',
        techniqueDescription: 'Chụp X quang tim phổi thường quy (Kỹ thuật số KTS)',
        sections: [
          { key: 'chest_wall', title: 'Lồng ngực & Thành ngực', bullets: ['Hình dạng lồng ngực cân đối', 'Thành ngực mềm mại, không có sưng nề'] },
          { key: 'lungs', title: 'Nhu mô phổi hai bên', bullets: ['Phổi phải: Nhu mô đồng nhất, không thấy nốt mờ, không thấy tổn thương khu trú', 'Phổi trái: Nhu mô đồng nhất, không thấy nốt mờ', 'Không thấy dấu hiệu giãn phế quản, phế nang'] },
          { key: 'pleura', title: 'Khoang màng phổi', bullets: ['Khoang màng phổi hai bên sáng', 'Góc sườn hoành hai bên sáng nhọn, không tràn dịch, tràn khí'] },
          { key: 'trachea_mediastinum', title: 'Khí phế quản & Trung thất', bullets: ['Khí quản và phế quản gốc cân đối, không bị đè đẩy', 'Trung thất không giãn, không thấy hạch to'] },
          { key: 'heart_shadow', title: 'Bóng tim', bullets: ['Bóng tim hình ảnh kích thước bình thường', 'Chỉ số tim ngực trong giới hạn bình thường'] },
          { key: 'aorta', title: 'Cung động mạch chủ', bullets: ['Cung động mạch chủ không giãn, bờ đều, không vôi hóa'] },
          { key: 'ribs', title: 'Khung xương sườn', bullets: ['Các xương sườn hình dạng bình thường, không thấy tiêu xương, không gãy xương'] },
        ],
        defaultConclusion: 'Hình ảnh X quang tim phổi hiện tại không thấy bất thường.',
      },
      {
        id: 'ECG_12LEADS',
        modalityType: 'ECG',
        examTitle: 'Ghi điện tâm đồ vi tính 12 chuyển đạo',
        techniqueDescription: 'Ghi điện tâm đồ vi tính 12 chuyển đạo (I-III, aVR, aVL, aVF, V1-V6), không gắng sức',
        sections: [
          { key: 'rhythm_parameters', title: 'Nhịp tim & Tần số', bullets: ['Nhịp xoang đều', 'Tần số tim: 75 - 85 lần/phút', 'Trục điện tim: Trung gian'] },
          { key: 'waveforms', title: 'Hình thái các sóng', bullets: ['Khoảng cách PR trong giới hạn bình thường', 'Phức bộ QRS thanh mảnh, thời gian trong giới hạn bình thường', 'Hiện tại không có biến đổi sóng ST, sóng T'] },
          { key: 'clinical_status', title: 'Đánh giá dẫn truyền & buồng tim', bullets: ['Hiện tại không thấy tăng gánh nhĩ, thất', 'Không thấy rối loạn nhịp nhĩ, nhịp thất hoặc ngoại tâm thu'] },
        ],
        defaultConclusion: 'Hình ảnh điện tâm đồ hiện tại bình thường (Nhịp xoang đều).',
      },
      {
        id: 'US_BREAST',
        modalityType: 'ULTRASOUND',
        examTitle: 'Siêu âm tuyến vú hai bên (Cán bộ Nữ)',
        techniqueDescription: 'Siêu âm tuyến vú hai bên bằng đầu dò phẳng cao tần (Linear 7.5 - 10MHz)',
        sections: [
          { key: 'right_breast', title: 'Tuyến vú phải', bullets: ['Cấu trúc mô tuyến vú cân đối, sợi tuyến phân bố đều', 'Không thấy khối u, nang hay nốt bất thường', 'Hệ thống ống dẫn sữa không giãn'] },
          { key: 'left_breast', title: 'Tuyến vú trái', bullets: ['Cấu trúc mô tuyến vú bình thường, không thấy vi vôi hóa', 'Không thấy khối u dạng đặc hay tổn thương khu trú', 'Hệ thống ống dẫn sữa không giãn'] },
          { key: 'axillary_lymph_nodes', title: 'Hạch hố nách', bullets: ['Hố nách hai bên không thấy hạch to bất thường', 'Cấu trúc rốn hạch bình thường'] },
          { key: 'nipples', title: 'Núm vú hai bên', bullets: ['Núm vú hai bên cân đối, không co kéo, không tiết dịch bất thường'] },
        ],
        defaultConclusion: 'Hình ảnh siêu âm tuyến vú hai bên hiện tại bình thường (BI-RADS 1).',
      },
      {
        id: 'ENT_ENDOSCOPY',
        modalityType: 'ENDOSCOPY',
        examTitle: 'Nội soi Tai Mũi Họng',
        techniqueDescription: 'Nội soi Tai Mũi Họng ống mềm kỹ thuật số',
        sections: [
          { key: 'ears', title: 'Tai (Hai bên)', bullets: ['Tai phải: Ống tai ngoài sạch, màng nhĩ sáng, còn nón sáng', 'Tai trái: Ống tai ngoài sạch, màng nhĩ sáng, còn nón sáng'] },
          { key: 'nose_nasopharynx', title: 'Mũi xoang & Vòm', bullets: ['Hốc mũi hai bên thông thoáng, niêm mạc hồng hào', 'Cuống mũi dưới không phì đại, vách ngăn không vẹo', 'Vòm họng (VA) nhẵn sạch, không có tổ chức sùi loét'] },
          { key: 'throat_pharynx', title: 'Họng miệng', bullets: ['Niêm mạc họng hồng, không viêm loét', 'Amidan hai bên kích thước bình thường, không có hốc mủ'] },
          { key: 'larynx', title: 'Thanh quản', bullets: ['Thanh thiệt di động tốt', 'Hai dây thanh âm nhẵn, màu trắng ngọc, khép kín khi phát âm'] },
        ],
        defaultConclusion: 'Hình ảnh nội soi tai mũi họng hiện tại bình thường.',
      },
    ];
  }

  static createFromTemplate(templateId, recordId) {
    const templates = ModalityTemplateFactory.getTemplates();
    const template = templates.find((t) => t.id === templateId) || templates[0];

    const report = new DiagnosticReport();
    report.recordId = recordId;
    report.modalityType = template.modalityType;
    report.examTitle = template.examTitle;
    report.techniqueDescription = template.techniqueDescription;
    report.conclusion = template.defaultConclusion;
    report.performedAt = new Date().toISOString();

    report.sections = template.sections.map((sec) => new FindingSection(sec.key, sec.title, [...sec.bullets]));
    return report;
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
          bullets = ['Chưa có mô tả'];
        }

        sections.push(new FindingSection(key, title, bullets));
      });
    }

    return sections;
  }

  // Tự động định dạng tên hiển thị tiếng Việt cho các key giải phẫu phổ biến
  static formatSectionTitle(key) {
    const titleMap = {
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
    // Đóng gói các phân vùng thành Object JSON mảng chuẩn Cách 1
    const findingsMap = {};
    this.sections.forEach((sec) => {
      findingsMap[sec.key] = sec.bullets.length > 0 ? sec.bullets : ['Bình thường'];
    });

    const findingsEnvelope = {
      technique: this.techniqueDescription,
      findings: findingsMap,
      conclusion: this.conclusion,
    };

    const payload = {
      recordId: Number(this.recordId),
      modalityType: this.modalityType.trim().toUpperCase(),
      examTitle: this.examTitle.trim(),
      techniqueDescription: this.techniqueDescription ? this.techniqueDescription.trim() : null,
      findingsData: JSON.stringify(findingsEnvelope),
      conclusion: this.conclusion.trim(),
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
    if (!key) return;
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
    if (!this.sections.some((s) => s.key === cleanKey)) {
      this.sections.push(new FindingSection(cleanKey, title || this.formatSectionTitle(cleanKey), ['']));
    }
  }

  // Xóa một phân vùng giải phẫu
  removeSection(key) {
    this.sections = this.sections.filter((s) => s.key !== key);
  }

  // Kiểm tra tính hợp lệ của dữ liệu trước khi gửi lên API
  validate() {
    const errors = [];
    if (!this.examTitle || !this.examTitle.trim()) {
      errors.push('Tiêu đề phiếu khám không được để trống.');
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
