//
// Bảng danh sách Hồ sơ khám sức khỏe kèm thanh phân trang
// Hiển thị mã SID, cán bộ, đợt khám, ngày khám, xếp loại, trạng thái và các nút xem/khám, sửa, xóa
//

import { IconEye, IconEdit, IconTrash } from '../../SupportAgent/Icons.jsx';
import { formatDate, getClassificationMeta, getStatusMeta } from '../../../utils/helpers.js';

// Hiển thị nhãn phân loại sức khỏe theo Bộ Y tế (Loại I - Loại V)
function renderClassificationBadge(classification) {
  const { label, tone } = getClassificationMeta(classification);
  const badgeClass = tone === 'muted' ? 'grade-none' : tone;
  return <span className={`grade-badge ${badgeClass}`}>{label}</span>;
}

// Hiển thị nhãn trạng thái hồ sơ khám
function renderStatusBadge(status) {
  const { label, tone } = getStatusMeta(status);
  return <span className={`status-pill status-${tone}`}>{label}</span>;
}

export default function HealthRecordTable({
  records = [],
  loading = false,
  error = null,
  pageNumber = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onEdit,
  onDelete,
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromRecord = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const toRecord = Math.min(totalCount, pageNumber * pageSize);

  return (
    <>
      {/* Bảng dữ liệu hồ sơ khám */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="record-th-sid">Mã SID</th>
              <th className="record-th-staff">Cán bộ khám</th>
              <th className="record-th-campaign">Đợt khám</th>
              <th className="record-th-date">Ngày khám</th>
              <th className="record-th-grade">Xếp loại SK</th>
              <th className="record-th-doctor">Bác sĩ kết luận</th>
              <th className="record-th-status">Trạng thái</th>
              <th className="record-th-action">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Đang tải dữ liệu hồ sơ khám...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={8} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title text-danger">Đã xảy ra lỗi</span>
                    <p className="empty-desc">{error}</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && records.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Không có dữ liệu hồ sơ khám nào</span>
                    <p className="empty-desc">Hệ thống chưa tìm thấy hồ sơ phù hợp với bộ lọc hiện tại.</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              records.length > 0 &&
              records.map((rec) => (
                <tr key={rec.recordId}>
                  <td>
                    <span className="record-sid-badge">{rec.sidCode}</span>
                  </td>
                  <td>
                    <div className="cell-staff">
                      <strong>{rec.staffName || '—'}</strong>
                      <span>
                        {rec.employeeCode || '—'} {rec.departmentName ? `• ${rec.departmentName}` : ''}
                      </span>
                    </div>
                  </td>
                  <td>{rec.campaignName || '—'}</td>
                  <td>{formatDate(rec.actualCheckupDate)}</td>
                  <td>{renderClassificationBadge(rec.healthClassification)}</td>
                  <td>{rec.doctorName || 'Chưa phân công'}</td>
                  <td>{renderStatusBadge(rec.status)}</td>
                  <td className="record-action-cell">
                    <button
                      type="button"
                      className="btn-icon btn-detail"
                      title="Xem & Điền các phiếu khám chuyên khoa"
                      onClick={() => onViewDetail(rec)}
                    >
                      <IconEye size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      title="Cập nhật kết luận / thông tin hồ sơ"
                      onClick={() => onEdit(rec)}
                    >
                      <IconEdit size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-danger"
                      title="Xóa hồ sơ khám"
                      onClick={() => onDelete(rec)}
                    >
                      <IconTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Thanh phân trang */}
      <div className="table-pagination">
        <div className="pagination-text">
          Hiển thị <strong>{fromRecord}</strong> – <strong>{toRecord}</strong> trên tổng số <strong>{totalCount}</strong> hồ sơ
        </div>

        <div className="record-pagination-wrapper">
          <div className="record-page-size-selector">
            <span>Hiển thị:</span>
            <select
              className="form-select record-page-size-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>

          <div className="pagination-buttons">
            <button
              type="button"
              className="btn-page"
              disabled={pageNumber <= 1 || loading}
              onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
            >
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageNumber) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="record-pagination-page-item">
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="record-pagination-ellipsis">...</span>}
                  <button
                    type="button"
                    className={`btn-page ${p === pageNumber ? 'active' : ''}`}
                    onClick={() => onPageChange(p)}
                    disabled={loading}
                  >
                    {p}
                  </button>
                </span>
              ))}

            <button
              type="button"
              className="btn-page"
              disabled={pageNumber >= totalPages || loading}
              onClick={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
