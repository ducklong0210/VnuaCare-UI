//
// Bảng hiển thị danh sách Nhật ký gửi Email kèm thanh phân trang
// Trình bày mã nhật ký, người nhận, tiêu đề, phân loại nghiệp vụ, thời gian gửi, trạng thái và nút xem chi tiết
//

import { IconEye } from '../../SupportAgent/Icons.jsx';
import { formatDateTime } from '../../../utils/helpers.js';

// Quy đổi mã loại nghiệp vụ sang nhãn tiếng Việt và lớp màu hiển thị
function getReferenceTypeMeta(referenceType) {
  const cleanType = (referenceType || '').trim();
  if (cleanType === 'HealthCheckupRecord') {
    return { label: 'Cảnh báo sức khỏe', className: '' };
  }
  if (cleanType === 'ForgotPassword') {
    return { label: 'Khôi phục mật khẩu', className: 'type-forgot' };
  }
  return { label: cleanType || 'Hệ thống', className: 'type-system' };
}

export default function EmailTable({ emailLogs = [], loading = false, error = null, pageNumber = 1, pageSize = 10, totalCount = 0, totalPages = 1, fromRecord = 0, toRecord = 0, onPageChange, onPageSizeChange, onViewDetail }) {
  return (
    <>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã nhật ký</th>
              <th>Người nhận</th>
              <th>Tiêu đề email</th>
              <th>Phân loại</th>
              <th>Thời gian gửi</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Đang tải danh sách nhật ký gửi email...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={7} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title text-danger">Đã xảy ra lỗi</span>
                    <p className="empty-desc">{error}</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && emailLogs.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Chưa có nhật ký gửi email nào</span>
                    <p className="empty-desc">Hệ thống chưa ghi nhận email khớp với bộ lọc hiện tại.</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              emailLogs.length > 0 &&
              emailLogs.map((log) => {
                const isSuccess = (log.sentStatus || '').toLowerCase() === 'success';
                const refMeta = getReferenceTypeMeta(log.referenceType);

                return (
                  <tr key={log.emailLogId}>
                    <td>
                      <span className="code-font">{log.code || `#${log.emailLogId}`}</span>
                    </td>
                    <td>
                      <strong>{log.toEmail || '—'}</strong>
                    </td>
                    <td className="email-subject-cell">
                      <div className="email-subject-title">{log.subject || '—'}</div>
                      {!isSuccess && log.errorMessage && (
                        <div className="email-error-preview" title={log.errorMessage}>
                          Lỗi: {log.errorMessage}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`email-ref-badge ${refMeta.className}`}>
                        {refMeta.label}
                        {log.referenceId > 0 ? ` #${log.referenceId}` : ''}
                      </span>
                    </td>
                    <td>{formatDateTime(log.createdDate)}</td>
                    <td>
                      <span className={`email-status-pill ${isSuccess ? 'is-success' : 'is-failed'}`}>
                        {isSuccess ? 'Thành công' : 'Thất bại'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Xem chi tiết nội dung email đã gửi"
                        onClick={() => onViewDetail(log)}
                      >
                        <IconEye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Thanh phân trang */}
      <div className="table-pagination">
        <div className="pagination-text">
          Hiển thị <strong>{fromRecord}</strong> – <strong>{toRecord}</strong> trên tổng số <strong>{totalCount}</strong> email
        </div>

        <div className="email-pagination-wrapper">
          <div className="email-page-size-selector">
            <span>Hiển thị:</span>
            <select
              className="form-select email-page-size-select"
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

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - pageNumber) <= 1)
              .map((page, idx, list) => (
                <span key={page}>
                  {idx > 0 && list[idx - 1] !== page - 1 && <span className="email-pagination-ellipsis">...</span>}
                  <button
                    type="button"
                    className={`btn-page ${page === pageNumber ? 'active' : ''}`}
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                  >
                    {page}
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
