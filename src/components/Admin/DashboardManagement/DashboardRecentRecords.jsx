//
// Bảng hiển thị tối đa 5 hồ sơ khám gần đây nhất trên Dashboard
// Nhận danh sách records, trạng thái loading từ DashboardManager và hỗ trợ nút chuyển nhanh sang trang Hồ sơ khám
//

import { RECORD_STATUS, RECORD_STATUS_LABELS } from '../../../utils/index.js';
import { formatDate } from '../../../utils/utils.js';

export default function DashboardRecentRecords({ records = [], loading = false, onViewAll }) {
  // Cắt lấy tối đa năm hồ sơ đầu tiên để hiển thị gọn trên Dashboard
  const recentRecords = records.slice(0, 5);

  return (
    <div className="panel-card">
      {/* Tiêu đề khối và nút chuyển nhanh sang trang Hồ sơ khám */}
      <div className="recent-records-header">
        <div>
          <h3 className="stat-panel-title">Hồ sơ khám gần đây</h3>
        </div>

        {/* Chỉ hiện nút "Xem tất cả hồ sơ" nếu người dùng có quyền mở trang Hồ sơ khám */}
        {onViewAll && (
          <button type="button" className="btn btn-outline" onClick={onViewAll}>
            Xem tất cả hồ sơ &rarr;
          </button>
        )}
      </div>

      {/* Bảng danh sách hồ sơ gần nhất */}
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
            {/* Trạng thái đang tải dữ liệu từ API */}
            {loading && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Đang tải danh sách hồ sơ gần đây...</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Trạng thái đã tải xong nhưng chưa có hồ sơ nào */}
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

            {/* Duyệt mảng các hồ sơ gần đây để vẽ từng dòng bảng */}
            {!loading &&
              recentRecords.map((record) => {
                // Nếu hồ sơ chưa có trạng thái hoặc ở trạng thái DRAFT thì quy về Chờ khám (PENDING)
                const statusCode = !record.status || record.status === 'DRAFT' ? RECORD_STATUS.PENDING : record.status;
                // Đổi mã trạng thái tiếng Anh sang nhãn tiếng Việt để hiển thị
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
