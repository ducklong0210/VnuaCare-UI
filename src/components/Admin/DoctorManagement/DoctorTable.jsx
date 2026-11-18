// Component bảng hiển thị danh sách Bác sĩ kèm thanh phân trang
// Hiển thị đầy đủ thông tin: Mã BS, Họ tên, Chuyên khoa, Số CCHN, Bệnh viện công tác
// Cung cấp các nút thao tác chỉnh sửa thông tin hoặc xóa hồ sơ bác sĩ

import { IconEdit, IconTrash } from '../../SupportAgent/Icons.jsx';

export default function DoctorTable({
  doctors = [],
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
              <th className="doctor-th-code">Mã BS</th>
              <th className="doctor-th-name">Bác sĩ phụ trách</th>
              <th className="doctor-th-specialty">Chuyên khoa</th>
              <th className="doctor-th-license">Chứng chỉ hành nghề</th>
              <th className="doctor-th-hospital">Bệnh viện công tác</th>
              <th className="doctor-th-action">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Đang tải dữ liệu bác sĩ...</span>
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

            {!loading && !error && doctors.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <div className="empty-wrap">
                    <span className="empty-title">Không có dữ liệu bác sĩ nào</span>
                    <p className="empty-desc">Hệ thống chưa tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              doctors.length > 0 &&
              doctors.map((doc) => (
                <tr key={doc.doctorId}>
                  <td className="code-font">{doc.doctorCode}</td>
                  <td>
                    <div className="cell-staff">
                      <strong>{doc.fullName}</strong>
                      <span>{doc.email || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="tag-badge">
                      {doc.specialtyName || doc.spesialtyName || '—'}
                    </span>
                  </td>
                  <td>{doc.licenseNumber || '—'}</td>
                  <td>{doc.hospitalName || 'Bệnh viện Đa khoa MEDLATEC'}</td>
                  <td className="doctor-action-cell">
                    <button
                      type="button"
                      className="btn-icon"
                      title="Sửa thông tin"
                      onClick={() => onOpenEdit(doc)}
                    >
                      <IconEdit size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-danger"
                      title="Xóa bác sĩ"
                      onClick={() => onOpenDelete(doc)}
                    >
                      <IconTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Thanh phân trang dữ liệu */}
      <div className="table-pagination">
        <div className="pagination-text">
          Hiển thị <strong>{fromRecord}</strong> – <strong>{toRecord}</strong> trên tổng số <strong>{totalCount}</strong> bác sĩ
        </div>

        <div className="doctor-pagination-wrapper">
          <div className="doctor-page-size-selector">
            <span>Hiển thị:</span>
            <select
              className="form-select doctor-page-size-select"
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
                <span key={p} className="doctor-pagination-page-item">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="doctor-pagination-ellipsis">...</span>
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
