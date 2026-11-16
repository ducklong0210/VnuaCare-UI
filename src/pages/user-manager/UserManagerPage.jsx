import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout.jsx';
import { getUserFilterApi, createUserApi, updateUserApi, deleteUserApi } from '../../features/user-manager/api/userApi.js';
import './UserManagerPage.css';
import { IconSearch, IconRefreshCw, IconPlus, IconEdit, IconTrash, IconClose, IconCheck } from '../../components/ui/Icons.jsx';

export default function UserManagerPage() {
  // Dữ liệu danh sách người dùng
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bộ lọc tìm kiếm & Phân trang
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Thông báo toast
  const [toast, setToast] = useState('');
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  // Quản lý Modal (Thêm / Sửa)
  const [modalMode, setModalMode] = useState(null); // null | 'CREATE' | 'EDIT'
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    userId: null,
    username: '',
    password: '',
    email: '',
    role: 'STAFF',
    isActive: true,
  });

  // Quản lý Modal xác nhận xóa
  const [deletingUser, setDeletingUser] = useState(null); // null | { userId, username }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Tải danh sách người dùng mỗi khi bộ lọc thay đổi hoặc sau khi thêm/sửa/xóa
  useEffect(() => {
    let isCancelled = false;

    const loadUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getUserFilterApi({
          textSearch: search.trim(),
          role: role === 'ALL' ? '' : role,
          pageNumber: pageNumber,
          pageSize: pageSize,
        });
        if (!isCancelled) {
          setUsers(data.items || []);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Không thể kết nối đến máy chủ');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isCancelled = true;
    };
  }, [search, role, pageNumber, pageSize, refreshKey]);

  // Mở form thêm mới
  const handleOpenCreate = () => {
    setFormData({
      userId: null,
      username: '',
      password: '',
      email: '',
      role: 'STAFF',
      isActive: true,
    });
    setModalError('');
    setModalMode('CREATE');
  };

  // Mở form chỉnh sửa
  const handleOpenEdit = (user) => {
    setFormData({
      userId: user.userId,
      username: user.username,
      password: '',
      email: user.email || '',
      role: user.role || 'STAFF',
      isActive: user.isActive,
    });
    setModalError('');
    setModalMode('EDIT');
  };

  // Đóng modal
  const handleCloseModal = () => {
    setModalMode(null);
    setModalError('');
  };

  // Xử lý lưu form (Thêm hoặc Sửa)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      if (modalMode === 'CREATE') {
        await createUserApi({
          username: formData.username.trim(),
          password: formData.password,
          email: formData.email.trim(),
          role: formData.role,
          isActive: formData.isActive,
        });
        showToast('Tạo tài khoản người dùng thành công!');
      } else if (modalMode === 'EDIT') {
        await updateUserApi({
          userId: formData.userId,
          email: formData.email.trim(),
          role: formData.role,
          isActive: formData.isActive,
        });
        showToast('Cập nhật tài khoản thành công!');
      }

      handleCloseModal();
      setRefreshKey((prev) => prev + 1); // Kích hoạt tải lại dữ liệu mới
    } catch (err) {
      setModalError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Mở hộp thoại xác nhận xóa trên màn hình
  const handleOpenDelete = (user) => {
    setDeletingUser({ userId: user.userId, username: user.username });
  };

  // Thực hiện xóa sau khi xác nhận
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);

    try {
      await deleteUserApi(deletingUser.userId);
      showToast(`Đã xóa tài khoản "${deletingUser.username}" thành công!`);
      setDeletingUser(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Không thể xóa tài khoản này');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Đặt lại bộ lọc
  const handleResetFilter = () => {
    setSearch('');
    setRole('ALL');
    setPageNumber(1);
  };

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromRecord = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const toRecord = Math.min(totalCount, pageNumber * pageSize);

  return (
    <MainLayout activeTab="users">
      <div className="admin-page-container">
        {/* Thông báo Toast góc phải */}
        {toast && (
          <div className="admin-toast">
            <IconCheck size={16} />
            <span>{toast}</span>
          </div>
        )}

        {/* Tiêu đề trang & Nút thêm tài khoản */}
        <div className="page-header-row">
          <div>
            <h2 className="main-title">Quản lý người dùng</h2>
            <span className="main-desc">Danh sách tài khoản và phân quyền hệ thống ({totalCount} tài khoản)</span>
          </div>
          <div className="header-btn-group">
            <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
              <IconPlus size={16} />
              <span>Thêm tài khoản</span>
            </button>
          </div>
        </div>

        {/* Khung nội dung chính */}
        <div className="panel-card">
          {/* Thanh tìm kiếm & bộ lọc */}
          <div className="filter-toolbar">
            <div className="search-field">
              <IconSearch size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm tên đăng nhập, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNumber(1);
                }}
              />
            </div>

            <select
              className="form-select"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPageNumber(1);
              }}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="SUPER_ADMIN">SUPER ADMIN</option>
              <option value="HEALTH_ADMIN">HEALTH ADMIN</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="STAFF">STAFF</option>
            </select>

            <button type="button" className="btn-reset" onClick={handleResetFilter} title="Đặt lại bộ lọc">
              <IconRefreshCw size={14} />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* Bảng danh sách tài khoản người dùng */}
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
                      <td>{u.isActive ? <span className="alert-tag success">Hoạt động</span> : <span className="alert-tag danger">Đã khóa</span>}</td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" className="btn-icon" title="Sửa thông tin" onClick={() => handleOpenEdit(u)}>
                          <IconEdit size={14} />
                        </button>
                        <button type="button" className="btn-icon btn-danger" title="Xóa tài khoản" onClick={() => handleOpenDelete(u)}>
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
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1);
                  }}
                >
                  <option value={5}>5 / trang</option>
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>

              <div className="pagination-buttons">
                <button type="button" className="btn-page" disabled={pageNumber <= 1 || loading} onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}>
                  Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageNumber) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="user-pagination-ellipsis">...</span>}
                      <button type="button" className={`btn-page ${p === pageNumber ? 'active' : ''}`} onClick={() => setPageNumber(p)} disabled={loading}>
                        {p}
                      </button>
                    </span>
                  ))}

                <button
                  type="button"
                  className="btn-page"
                  disabled={pageNumber >= totalPages || loading}
                  onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Thêm / Sửa người dùng */}
        {modalMode && (
          <div className="modal-backdrop">
            <div className="modal-card user-modal-card">
              <div className="modal-head">
                <span className="modal-title-text">{modalMode === 'CREATE' ? 'Thêm mới tài khoản người dùng' : 'Cập nhật tài khoản người dùng'}</span>
                <button type="button" className="modal-x" onClick={handleCloseModal}>
                  <IconClose size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm}>
                <div className="modal-content">
                  {modalError && (
                    <div className="alert-tag danger" style={{ padding: '8px 12px', width: '100%' }}>
                      {modalError}
                    </div>
                  )}

                  <div className="form-item">
                    <label className="field-label">Tên đăng nhập *</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Ví dụ: nva_staff"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={modalMode === 'EDIT'}
                      required
                    />
                  </div>

                  {modalMode === 'CREATE' && (
                    <div className="form-item">
                      <label className="field-label">Mật khẩu *</label>
                      <input
                        type="password"
                        className="text-input"
                        placeholder="Nhập mật khẩu..."
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div className="form-item">
                    <label className="field-label">Email *</label>
                    <input
                      type="email"
                      className="text-input"
                      placeholder="Ví dụ: nva@vnua.edu.vn"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Vai trò</label>
                    <select className="form-select" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                      <option value="STAFF">STAFF (Cán bộ)</option>
                      <option value="DOCTOR">DOCTOR (Bác sĩ)</option>
                      <option value="HEALTH_ADMIN">HEALTH ADMIN (Quản trị y tế)</option>
                      <option value="SUPER_ADMIN">SUPER ADMIN (Quản trị cấp cao)</option>
                    </select>
                  </div>

                  {modalMode === 'EDIT' && (
                    <div className="form-item">
                      <label className="field-label">Trạng thái tài khoản</label>
                      <select
                        className="form-select"
                        value={formData.isActive ? 'ACTIVE' : 'LOCKED'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.value === 'ACTIVE',
                          })
                        }
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="LOCKED">Đã khóa</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="modal-foot">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang xử lý...' : modalMode === 'CREATE' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác nhận Xóa tài khoản trên màn hình */}
        {deletingUser && (
          <div className="modal-backdrop">
            <div className="modal-card user-delete-modal-card">
              <div className="modal-head">
                <span className="modal-title-text user-delete-modal-title">Xác nhận xóa tài khoản</span>
                <button type="button" className="modal-x" onClick={() => setDeletingUser(null)}>
                  <IconClose size={16} />
                </button>
              </div>

              <div className="modal-content">
                <p className="user-delete-modal-text">
                  Bạn có chắc chắn muốn xóa tài khoản <strong>"{deletingUser.username}"</strong> không?
                </p>
                <p className="user-delete-modal-warn">⚠ Hành động này sẽ khóa vĩnh viễn tài khoản người dùng này trong hệ thống.</p>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setDeletingUser(null)} disabled={deleteLoading}>
                  Hủy
                </button>
                <button type="button" className="btn user-delete-confirm-btn" onClick={handleConfirmDelete} disabled={deleteLoading}>
                  {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
