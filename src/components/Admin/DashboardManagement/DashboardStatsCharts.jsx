//
// Hai khung biểu đồ thanh ngang trên Dashboard: Phân loại sức khỏe và Tiến độ xử lý hồ sơ
// Nhận danh sách records từ DashboardManager để tự động đếm số lượng và tính phần trăm hiển thị
//

import {
  DEFAULT_HEALTH_CLASSIFICATIONS,
  RECORD_STATUS,
  RECORD_STATUS_LABELS,
  SystemColors,
} from '../../../utils/index.js';

// Bảng màu thanh ngang tương ứng cho từng mức phân loại sức khỏe
const CLASSIFICATION_COLORS = {
  'Loại I': SystemColors.success,
  'Loại II': SystemColors.primary,
  'Loại III': SystemColors.warning,
  'Loại IV': '#ea580c',
  'Loại V': SystemColors.danger,
};

// Hàm tính tỷ lệ phần trăm và làm tròn số nguyên (trả về 0 nếu tổng bằng 0 để tránh chia cho 0)
function calculatePercent(count, total) {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

// Hàm kiểm tra chuỗi xếp loại sức khỏe của một hồ sơ có khớp nhóm cần đếm hay không
function matchesClassification(value, targetCode) {
  const normalized = (value || '').trim();
  // Nhóm chưa xếp loại ứng với các hồ sơ có giá trị rỗng hoặc null
  if (targetCode === 'UNCLASSIFIED') return normalized === '';

  // Khớp chính xác mã xếp loại ở đầu chuỗi (tránh "Loại I" khớp "Loại II" hoặc "Loại II" khớp "Loại III")
  const escaped = targetCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}(?:\\s|\\(|$)`).test(normalized);
}

export default function DashboardStatsCharts({ records = [], loading = false }) {
  const totalRecords = records.length; // Tổng số hồ sơ dùng làm mẫu số để tính phần trăm

  // Gom nhóm và đếm số lượng hồ sơ theo từng mức Phân loại sức khỏe
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

  // Gom nhóm và đếm số lượng hồ sơ theo từng trạng thái tiến độ khám
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
      count: records.filter((r) => !r.status || r.status === RECORD_STATUS.PENDING || r.status === 'DRAFT').length,
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
