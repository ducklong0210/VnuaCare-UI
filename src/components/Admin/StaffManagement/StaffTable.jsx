//
// Bảng hiển thị danh sách Cán bộ, giảng viên kèm thanh phân trang
// Hiển thị ảnh đại diện, mã cán bộ, họ tên, đơn vị công tác, chức vụ, SĐT cùng nút sửa và xóa
//

import { IconEdit, IconTrash } from '../../../components/SupportAgent/Icons.jsx';

export default function StaffTable({
    staffs = [],
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
                            <th className="staff-th-avatar">Ảnh</th>
                            <th className="staff-th-code">Mã CB</th>
                            <th className="staff-th-name">Họ và tên</th>
                            <th className="staff-th-gender">Giới tính</th>
                            <th className="staff-th-dept">Đơn vị / Khoa</th>
                            <th className="staff-th-title">Chức vụ / Học vị</th>
                            <th className="staff-th-phone">Số điện thoại</th>
                            <th className="staff-th-action">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={8} className="empty-cell">
                                    <div className="empty-wrap">
                                        <span className="empty-title">Đang tải dữ liệu cán bộ...</span>
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

                        {!loading && !error && staffs.length === 0 && (
                            <tr>
                                <td colSpan={8} className="empty-cell">
                                    <div className="empty-wrap">
                                        <span className="empty-title">Không có dữ liệu cán bộ nào</span>
                                        <p className="empty-desc">Hệ thống chưa tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            !error &&
                            staffs.length > 0 &&
                            staffs.map((staff) => (
                                <tr key={staff.staffId}>
                                    <td className="staff-table-avatar-cell">
                                        {staff.avatarUrl ? (
                                            <img
                                                src={staff.avatarUrl}
                                                alt={staff.fullName}
                                                className="staff-table-avatar-img"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    if (e.currentTarget.nextSibling) {
                                                        e.currentTarget.nextSibling.style.display = 'inline-flex';
                                                    }
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="staff-table-avatar-fallback"
                                            style={{
                                                display: staff.avatarUrl ? 'none' : 'inline-flex',
                                            }}
                                        >
                                            {staff.fullName ? staff.fullName.trim().charAt(0).toUpperCase() : 'C'}
                                        </div>
                                    </td>
                                    <td className="code-font">{staff.staffCode}</td>
                                    <td>
                                        <div className="cell-staff">
                                            <strong>{staff.fullName}</strong>
                                            <span>{staff.email || '—'}</span>
                                        </div>
                                    </td>
                                    <td>{staff.gender || '—'}</td>
                                    <td>{staff.departmentName || '—'}</td>
                                    <td>
                                        <div className="cell-staff">
                                            <strong>{staff.jobTitle || 'Cán bộ'}</strong>
                                            <span>{staff.academicTitle || '—'}</span>
                                        </div>
                                    </td>
                                    <td>{staff.phoneNumber || '—'}</td>
                                    <td className="staff-action-cell">
                                        <button
                                            type="button"
                                            className="btn-icon"
                                            title="Sửa thông tin"
                                            onClick={() => onOpenEdit(staff)}
                                        >
                                            <IconEdit size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-icon btn-danger"
                                            title="Xóa cán bộ"
                                            onClick={() => onOpenDelete(staff)}
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
                    Hiển thị <strong>{fromRecord}</strong> – <strong>{toRecord}</strong> trên tổng số <strong>{totalCount}</strong> cán bộ
                </div>

                <div className="staff-pagination-wrapper">
                    <div className="staff-page-size-selector">
                        <span>Hiển thị:</span>
                        <select
                            className="form-select staff-page-size-select"
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
                                <span key={p} className="staff-pagination-page-item">
                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                        <span className="staff-pagination-ellipsis">...</span>
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
