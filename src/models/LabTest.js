//
// Cấu hình hiển thị và hàm chuẩn hóa dữ liệu cho Phân hệ Xét nghiệm Cận lâm sàng (LabTests)
// Dùng chung cho cả giao diện Bác sĩ/Quản trị (LabTestsTab) và Cổng Cán bộ (StaffRecordDetail)
//

export const LAB_CATEGORY_CONFIG = {
  HEMATOLOGY: {
    code: 'HEMATOLOGY',
    label: 'Huyết học (Tổng phân tích tế bào máu)',
    shortLabel: 'Huyết học',
    badgeClass: 'lab-cat-hematology',
  },
  BIOCHEMISTRY: {
    code: 'BIOCHEMISTRY',
    label: 'Sinh hóa máu',
    shortLabel: 'Sinh hóa',
    badgeClass: 'lab-cat-biochemistry',
  },
  URINALYSIS: {
    code: 'URINALYSIS',
    label: 'Tổng phân tích nước tiểu',
    shortLabel: 'Nước tiểu',
    badgeClass: 'lab-cat-urinalysis',
  },
  IMMUNOLOGY: {
    code: 'IMMUNOLOGY',
    label: 'Miễn dịch & Huyết thanh',
    shortLabel: 'Miễn dịch',
    badgeClass: 'lab-cat-immunology',
  },
};

export const SAMPLE_TYPE_OPTIONS = [
  { value: 'MÁU', label: 'Mẫu Máu (Huyết học / Sinh hóa)' },
  { value: 'NƯỚC TIỂU', label: 'Mẫu Nước tiểu (Tổng phân tích nước tiểu)' },
  { value: 'KHÁC', label: 'Mẫu bệnh phẩm khác' },
];

export const ORDER_STATUS_CONFIG = {
  COMPLETED: { label: 'Đã có kết quả', tone: 'completed' },
  PROCESSING: { label: 'Đang xét nghiệm', tone: 'processing' },
  PENDING: { label: 'Chờ lấy mẫu', tone: 'pending' },
  CANCELLED: { label: 'Đã hủy', tone: 'cancelled' },
};

// Chuẩn hóa tên loại mẫu (xử lý trường hợp dữ liệu cũ lỗi font như "NU?C TI?U")
export function normalizeSampleType(sampleType) {
  const raw = (sampleType || '').trim();
  const upper = raw.toUpperCase();
  if (!raw) return 'MẪU XÉT NGHIỆM';
  if (upper.includes('TI?U') || upper.includes('TIỂU') || upper.includes('URINE')) {
    return 'NƯỚC TIỂU';
  }
  if (upper.includes('MÁU') || upper.includes('MAU') || upper.includes('BLOOD')) {
    return 'MÁU';
  }
  return raw;
}

// Lấy nhãn hiển thị cho nhóm xét nghiệm
export function getLabCategoryMeta(categoryGroup) {
  const key = (categoryGroup || '').trim().toUpperCase();
  return (
    LAB_CATEGORY_CONFIG[key] || {
      code: key || 'OTHER',
      label: categoryGroup || 'Xét nghiệm khác',
      shortLabel: categoryGroup || 'Khác',
      badgeClass: 'lab-cat-default',
    }
  );
}

// Lấy cấu hình hiển thị cờ kết quả (NORMAL / HIGH / LOW / ABNORMAL)
export function getLabFlagMeta(flag) {
  const key = (flag || '').trim().toUpperCase();
  switch (key) {
    case 'HIGH':
      return { code: 'HIGH', label: 'Cao', tone: 'danger' };
    case 'LOW':
      return { code: 'LOW', label: 'Thấp', tone: 'warning' };
    case 'ABNORMAL':
      return { code: 'ABNORMAL', label: 'Bất thường', tone: 'danger' };
    case 'NORMAL':
    default:
      return { code: 'NORMAL', label: 'Bình thường', tone: 'normal' };
  }
}

// Lấy cấu hình hiển thị trạng thái phiếu chỉ định
export function getLabOrderStatusMeta(status) {
  const key = (status || '').trim().toUpperCase();
  return ORDER_STATUS_CONFIG[key] || { label: status || 'Chưa rõ', tone: 'pending' };
}

// Gom danh sách kết quả theo nhóm categoryGroup giữ thứ tự chuẩn y khoa
export function groupLabResultsByCategory(results = []) {
  const orderPriority = ['HEMATOLOGY', 'BIOCHEMISTRY', 'URINALYSIS', 'IMMUNOLOGY'];
  const map = new Map();

  for (const item of results) {
    const key = (item.categoryGroup || 'OTHER').trim().toUpperCase();
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => {
      const idxA = orderPriority.indexOf(a);
      const idxB = orderPriority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    })
    .map(([categoryGroup, items]) => ({
      categoryGroup,
      meta: getLabCategoryMeta(categoryGroup),
      items,
    }));
}

// Đếm số chỉ số bất thường trong một phiếu xét nghiệm
export function countAbnormalResults(results = []) {
  return results.filter((r) => {
    const f = (r.flag || '').trim().toUpperCase();
    return f === 'HIGH' || f === 'LOW' || f === 'ABNORMAL';
  }).length;
}
