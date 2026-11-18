// Component bảng hiển thị danh sách Tài khoản người dùng kèm thanh phân trang
// Hiển thị tên đăng nhập, email, huy hiệu vai trò, trạng thái tài khoản và ngày khởi tạo
// Cung cấp các nút chỉnh sửa quyền hạn/thông tin và nút xóa tài khoản

import { IconEdit, IconTrash } from '../../SupportAgent/Icons.jsx';

export default function AccountTable({
  users = [],
  loading = false,
  error = null,
  onOpenEdit,
  onOpenDelete,
  pageNumber = 1,
  pageSize = 10,
  totalCount = 0,
  totalPages = 1,
  fromRecord = 0,
  toRecord = 0,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Tên đăng nhập</th>
              <th style={{ width: '260px' }}>Email</th>
              <th style={{ width: '160px' }}>Vai trò</th>
              <th style={{ width: '140px' }}>Trạng thái</th>
              <th style={{ width: '160px' }}>Ngày tạo</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title text-danger">Đã xảy ra lỗi</span>
                    <p className="empty-desc">{error}</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && users.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Không có dữ liệu người dùng</span>
                    <p className="empty-desc">Hệ thống chưa tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              users.length > 0 &&
              users.map((u) => (
                <tr key={u.userId || u.username}>
                  <td className="code-font">{u.username}</td>
                  <td>{u.email || '—'}</td>
                  <td>
                    <span className="tag-badge">{u.role}</span>
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="alert-tag success">Hoạt động</span>
                    ) : (
                      <span className="alert-tag danger">Đã khóa</span>
                    )}
                  </td>
                  <td>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('vi-VN')
                      : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      title="Sửa thông tin"
                      onClick={() => onOpenEdit(u)}
                    >
                      <IconEdit size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-danger"
                      title="Xóa tài khoản"
                      onClick={() => onOpenDelete(u)}
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
          Hiển thị <strong>{fromRecord}</strong> - <strong>{toRecord}</strong> trên tổng số <strong>{totalCount}</strong> tài khoản
        </div>

        <div className="user-pagination-wrapper">
          <div className="user-page-size-selector">
            <span>Hiển thị:</span>
            <select
              className="form-select user-page-size-select"
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
                <span key={p} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="user-pagination-ellipsis">...</span>
                  )}
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
