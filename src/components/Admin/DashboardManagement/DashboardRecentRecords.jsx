// Component Bước 3 của Dashboard: Bảng hiển thị 5 hồ sơ khám gần đây nhất
// Tái sử dụng hằng số RECORD_STATUS & RECORD_STATUS_LABELS từ utils/index.js
// Nhận props:
//   - records   : Mảng danh sách hồ sơ khám lấy từ Backend
//   - loading   : Trạng thái đang tải dữ liệu (true/false)
//   - onViewAll : Hàm chuyển nhanh sang trang Quản lý Hồ sơ khám đầy đủ

import { RECORD_STATUS, RECORD_STATUS_LABELS } from '../../../utils/index.js';
import { formatDate } from '../../../utils/utils.js';


export default function DashboardRecentRecords({ records = [], loading = false, onViewAll }) {
  // Lấy tối đa 5 hồ sơ đầu tiên để hiển thị gọn trên Dashboard
  const recentRecords = records.slice(0, 5);

  return (
    <div className="panel-card">
      {/* Tiêu đề khối & nút chuyển nhanh sang trang Hồ sơ khám */}
      <div className="recent-records-header">
        <div>
          <h3 className="stat-panel-title">Hồ sơ khám gần đây</h3>
        </div>

        {onViewAll && (
          <button type="button" className="btn btn-outline" onClick={onViewAll}>
            Xem tất cả hồ sơ &rarr;
          </button>
        )}
      </div>

      {/* Bảng  hồ sơ gần nhất */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã SID</th>
              <th>Cán bộ khám</th>
              <th>Đợt khám</th>
              <th>Ngày khám</th>
              <th>Xếp loại SK</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Đang tải danh sách hồ sơ gần đây...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && recentRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Chưa có hồ sơ khám nào</span>
                    <p className="empty-desc">Khi tạo hồ sơ mới, danh sách sẽ tự động hiển thị tại đây.</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              recentRecords.map((record) => {
                const statusCode = record.status || RECORD_STATUS.PENDING;
                const statusLabel = RECORD_STATUS_LABELS[statusCode] || RECORD_STATUS_LABELS[RECORD_STATUS.PENDING];

                return (
                  <tr key={record.recordId}>
                    <td>
                      <span className="recent-sid-badge">{record.sidCode || '—'}</span>
                    </td>
                    <td>
                      <div className="cell-staff">
                        <strong>{record.staffName || '—'}</strong>
                        <span>
                          {record.employeeCode || '—'}
                          {record.departmentName ? ` • ${record.departmentName}` : ''}
                        </span>
                      </div>
                    </td>
                    <td>{record.campaignName || '—'}</td>
                    <td>{formatDate(record.actualCheckupDate)}</td>
                    <td>
                      <span className="recent-grade-text">
                        {record.healthClassification || 'Chưa xếp loại'}
                      </span>
                    </td>
                    <td>
                      <span className={`recent-status-pill status-${statusCode.toLowerCase()}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
