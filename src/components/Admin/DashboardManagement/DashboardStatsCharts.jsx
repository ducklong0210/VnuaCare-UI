// Component Bước 2 của Dashboard: Hiển thị 2 khung thống kê dạng thanh ngang trực quan
//   1. Khung bên trái: Tỷ lệ Phân loại sức khỏe (dùng danh mục DEFAULT_HEALTH_CLASSIFICATIONS từ utils/index.js)
//   2. Khung bên phải: Tiến độ xử lý hồ sơ khám (dùng RECORD_STATUS & RECORD_STATUS_LABELS từ utils/index.js)
// Nhận props:
//   - records : Mảng danh sách hồ sơ khám lấy từ Backend
//   - loading : Trạng thái đang tải dữ liệu (true/false)

import {
  DEFAULT_HEALTH_CLASSIFICATIONS,
  RECORD_STATUS,
  RECORD_STATUS_LABELS,
  SystemColors,
} from '../../../utils/index.js';

// Màu thanh ngang tương ứng cho từng phân loại sức khỏe
const CLASSIFICATION_COLORS = {
  'Loại I': SystemColors.success,
  'Loại II': SystemColors.primary,
  'Loại III': SystemColors.warning,
  'Loại IV': '#ea580c',
  'Loại V': SystemColors.danger,
};

// Hàm tính phần trăm: (count / total) * 100, làm tròn số nguyên
function calculatePercent(count, total) {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

// Hàm kiểm tra chuỗi xếp loại sức khỏe của 1 hồ sơ có khớp loại cần đếm hay không
function matchesClassification(value, targetCode) {
  const normalized = (value || '').trim();
  if (targetCode === 'UNCLASSIFIED') return normalized === '';

  // Với "Loại I" cần loại trừ "Loại II", "Loại III", "Loại IV" vì cùng bắt đầu bằng "Loại I"
  if (targetCode === 'Loại I') {
    return (
      normalized.includes('Loại I') &&
      !normalized.includes('Loại II') &&
      !normalized.includes('Loại III') &&
      !normalized.includes('Loại IV') &&
      !normalized.includes('Loại V')
    );
  }
  return normalized.includes(targetCode);
}

export default function DashboardStatsCharts({ records = [], loading = false }) {
  const totalRecords = records.length; // Tổng số hồ sơ dùng để tính tỷ lệ phần trăm

  // 1. Thống kê Phân loại sức khỏe (tái sử dụng DEFAULT_HEALTH_CLASSIFICATIONS từ utils/index.js)
  const classificationStats = [
    ...DEFAULT_HEALTH_CLASSIFICATIONS.map((item) => ({
      label: item.label,
      count: records.filter((r) => matchesClassification(r.healthClassification, item.key)).length,
      color: CLASSIFICATION_COLORS[item.key] || SystemColors.primary,
    })),
    {
      label: 'Chưa xếp loại',
      count: records.filter((r) => matchesClassification(r.healthClassification, 'UNCLASSIFIED')).length,
      color: SystemColors.muted,
    },
  ];

  // 2. Thống kê Trạng thái tiến độ hồ sơ (tái sử dụng RECORD_STATUS & RECORD_STATUS_LABELS từ utils/index.js)
  const statusStats = [
    {
      label: RECORD_STATUS_LABELS[RECORD_STATUS.COMPLETED],
      count: records.filter((r) => r.status === RECORD_STATUS.COMPLETED).length,
      color: SystemColors.success,
    },
    {
      label: RECORD_STATUS_LABELS[RECORD_STATUS.IN_PROGRESS],
      count: records.filter((r) => r.status === RECORD_STATUS.IN_PROGRESS).length,
      color: SystemColors.info,
    },
    {
      label: RECORD_STATUS_LABELS[RECORD_STATUS.PENDING],
      count: records.filter((r) => !r.status || r.status === RECORD_STATUS.PENDING).length,
      color: SystemColors.warning,
    },
    {
      label: RECORD_STATUS_LABELS[RECORD_STATUS.CANCELLED],
      count: records.filter((r) => r.status === RECORD_STATUS.CANCELLED).length,
      color: SystemColors.danger,
    },
  ];

  return (
    <div className="dashboard-charts-grid">
      {/* KHUNG TRÁI: TỶ LỆ PHÂN LOẠI SỨC KHỎE */}
      <div className="stat-panel">
        <div className="stat-panel-header">
          <h3 className="stat-panel-title">Phân loại sức khỏe (Bộ Y tế)</h3>
          <span className="stat-panel-sub">Tính trên {totalRecords} hồ sơ</span>
        </div>

        <div className="stat-bar-list">
          {classificationStats.map((item) => {
            const percent = calculatePercent(item.count, totalRecords);
            return (
              <div key={item.label} className="stat-bar-row">
                <div className="stat-bar-top">
                  <span className="stat-bar-name">{item.label}</span>
                  <span className="stat-bar-value">
                    <strong>{loading ? '...' : item.count}</strong> hồ sơ ({percent}%)
                  </span>
                </div>
                <div className="stat-bar-track">
                  <div
                    className="stat-bar-fill"
                    style={{ width: `${percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KHUNG PHẢI: TIẾN ĐỘ XỬ LÝ HỒ SƠ KHÁM */}
      <div className="stat-panel">
        <div className="stat-panel-header">
          <h3 className="stat-panel-title">Tiến độ hồ sơ khám</h3>
          <span className="stat-panel-sub">Trạng thái khám hiện tại</span>
        </div>

        <div className="stat-bar-list">
          {statusStats.map((item) => {
            const percent = calculatePercent(item.count, totalRecords);
            return (
              <div key={item.label} className="stat-bar-row">
                <div className="stat-bar-top">
                  <span className="stat-bar-name">{item.label}</span>
                  <span className="stat-bar-value">
                    <strong>{loading ? '...' : item.count}</strong> hồ sơ ({percent}%)
                  </span>
                </div>
                <div className="stat-bar-track">
                  <div
                    className="stat-bar-fill"
                    style={{ width: `${percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
