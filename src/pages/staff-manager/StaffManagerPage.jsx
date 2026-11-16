import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout.jsx';
import { getStaffFilterApi, getDepartmentsApi, createStaffApi, updateStaffApi, deleteStaffApi } from '../../features/staff-manager/api/staffApi.js';
import { getUserSelectApi } from '../../features/user-manager/api/userApi.js';
import './StaffManagerPage.css';
import { IconSearch, IconRefreshCw, IconPlus, IconEdit, IconTrash, IconClose, IconCheck } from '../../components/ui/Icons.jsx';
import { AVATAR_PRESETS } from '../../components/data/avatarData.js';

// Giá trị mặc định của form
const INITIAL_FORM = {
  staffId: null,
  userId: '',
  staffCode: '',
  fullName: '',
  gender: 'Nam',
  dateOfBirth: '',
  departmentId: '',
  jobTitle: '',
  academicTitle: '',
  phoneNumber: '',
  email: '',
  adrress: '',
  avatarUrl: '',
};

export default function StaffManagerPage() {
  // Dữ liệu danh sách cán bộ, phòng ban và tài khoản người dùng
  const [staffs, setStaffs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bộ lọc tìm kiếm và phân trang
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Thông báo toast
  const [toast, setToast] = useState('');
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  // Quản lý Modal Thêm / Sửa cán bộ
  const [modalMode, setModalMode] = useState(null); // null | 'CREATE' | 'EDIT'
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Quản lý Modal xác nhận xóa cán bộ
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Tải danh mục Khoa / Phòng ban và User khi mở trang
  useEffect(() => {
    let isCancelled = false;

    const loadInitialData = async () => {
      try {
        const [deptRes, userRes] = await Promise.allSettled([getDepartmentsApi(), getUserSelectApi('STAFF')]);
        if (!isCancelled) {
          if (deptRes.status === 'fulfilled') {
            setDepartments(deptRes.value || []);
          }
          if (userRes.status === 'fulfilled') {
            setUsersList(userRes.value || []);
          }
        }
      } catch {
        // Bỏ qua lỗi danh mục nếu chưa có
      }
    };

    loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Tải danh sách cán bộ theo bộ lọc và phân trang
  useEffect(() => {
    let isCancelled = false;

    const loadStaffs = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getStaffFilterApi({
          textSearch: search.trim(),
          departmentId: selectedDept,
          pageNumber: pageNumber,
          pageSize: pageSize,
        });
        if (!isCancelled) {
          setStaffs(res.items || []);
          setTotalCount(res.totalCount || 0);
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

    loadStaffs();

    return () => {
      isCancelled = true;
    };
  }, [search, selectedDept, pageNumber, pageSize, refreshKey]);

  // Mở form thêm mới cán bộ
  const handleOpenCreate = async () => {
    try {
      const data = await getUserSelectApi('STAFF');
      setUsersList(data || []);
    } catch {
      // Bỏ qua lỗi tải danh sách user
    }

    setFormData({
      ...INITIAL_FORM,
      departmentId: departments[0]?.departmentId || '',
    });
    setModalError('');
    setModalMode('CREATE');
  };

  // Mở form chỉnh sửa cán bộ
  const handleOpenEdit = (staff) => {
    setFormData({
      staffId: staff.staffId,
      userId: staff.userId || '',
      staffCode: staff.staffCode || '',
      fullName: staff.fullName || '',
      gender: staff.gender || 'Nam',
      dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : '',
      departmentId: staff.departmentId || departments.find((d) => d.departmentName === staff.departmentName)?.departmentId || '',
      jobTitle: staff.jobTitle || '',
      academicTitle: staff.academicTitle || '',
      phoneNumber: staff.phoneNumber || '',
      email: staff.email || '',
      adrress: staff.adrress || '',
      avatarUrl: staff.avatarUrl || '',
    });
    setModalError('');
    setModalMode('EDIT');
  };

  // Đóng modal thêm / sửa
  const handleCloseModal = () => {
    setModalMode(null);
    setModalError('');
  };

  // Gửi dữ liệu form Thêm hoặc Sửa lên API
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      if (modalMode === 'CREATE') {
        if (!formData.userId) {
          setModalError('Vui lòng chọn tài khoản người dùng liên kết');
          setSubmitting(false);
          return;
        }

        await createStaffApi({
          staffId: 0,
          userId: Number(formData.userId),
          staffCode: formData.staffCode.trim(),
          fullName: formData.fullName.trim(),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          departmentId: Number(formData.departmentId),
          departmentName: '',
          email: formData.email.trim(),
          isActive: true,
          academicTitle: formData.academicTitle.trim(),
          jobTitle: formData.jobTitle.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          adrress: formData.adrress.trim(),
          avatarUrl: formData.avatarUrl ? formData.avatarUrl.trim() : '',
        });
        showToast('Thêm cán bộ mới thành công!');
      } else if (modalMode === 'EDIT') {
        await updateStaffApi({
          staffId: formData.staffId,
          staffCode: formData.staffCode.trim(),
          fullName: formData.fullName.trim(),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          departmentId: Number(formData.departmentId),
          departmentName: '',
          email: formData.email.trim(),
          isActive: true,
          academicTitle: formData.academicTitle.trim(),
          jobTitle: formData.jobTitle.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          adrress: formData.adrress.trim(),
          avatarUrl: formData.avatarUrl ? formData.avatarUrl.trim() : '',
        });
        showToast('Cập nhật thông tin cán bộ thành công!');
      }

      handleCloseModal();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setModalError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Mở hộp thoại xác nhận xóa cán bộ
  const handleOpenDelete = (staff) => {
    setDeletingStaff({
      staffId: staff.staffId,
      staffCode: staff.staffCode,
      fullName: staff.fullName,
    });
  };

  // Xác nhận xóa cán bộ
  const handleConfirmDelete = async () => {
    if (!deletingStaff) return;
    setDeleteLoading(true);

    try {
      await deleteStaffApi(deletingStaff.staffId);
      showToast(`Đã xóa cán bộ "${deletingStaff.fullName}" thành công!`);
      setDeletingStaff(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Không thể xóa cán bộ này');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Đặt lại bộ lọc tìm kiếm
  const handleResetFilter = () => {
    setSearch('');
    setSelectedDept('ALL');
    setPageNumber(1);
  };

  // Tính toán hiển thị phân trang
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromRecord = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const toRecord = Math.min(totalCount, pageNumber * pageSize);

  // Xác định chữ hiển thị trên nút submit (đọc dễ hiểu, không dùng 3 ngôi lồng nhau)
  let submitButtonText = 'Lưu thay đổi';
  if (submitting) {
    submitButtonText = 'Đang xử lý...';
  } else if (modalMode === 'CREATE') {
    submitButtonText = 'Thêm cán bộ';
  }

  return (
    <MainLayout activeTab="staffs">
      <div className="admin-page-container">
        {/* Thông báo thao tác thành công (Toast) */}
        {toast && (
          <div className="admin-toast">
            <IconCheck size={16} />
            <span>{toast}</span>
          </div>
        )}

        {/* Tiêu đề trang & Nút thêm cán bộ */}
        <div className="page-header-row">
          <div>
            <h2 className="main-title">Quản lý nhân viên cán bộ</h2>
            <span className="main-desc">Danh sách cán bộ, giảng viên Học viện Nông nghiệp Việt Nam ({totalCount} cán bộ)</span>
          </div>
          <div className="header-btn-group">
            <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
              <IconPlus size={16} />
              <span>Thêm cán bộ</span>
            </button>
          </div>
        </div>

        {/* Bảng danh sách & Bộ lọc */}
        <div className="panel-card">
          {/* Thanh tìm kiếm và bộ lọc đơn vị */}
          <div className="filter-toolbar">
            <div className="search-field">
              <IconSearch size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm mã CB, họ tên, chức vụ, SĐT..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNumber(1);
                }}
              />
            </div>

            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPageNumber(1);
              }}
            >
              <option value="ALL">Tất cả đơn vị / Khoa</option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.departmentName}
                </option>
              ))}
            </select>

            <button type="button" className="btn-reset" onClick={handleResetFilter} title="Đặt lại bộ lọc">
              <IconRefreshCw size={14} />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* Bảng dữ liệu cán bộ */}
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
                        <button type="button" className="btn-icon" title="Sửa thông tin" onClick={() => handleOpenEdit(staff)}>
                          <IconEdit size={14} />
                        </button>
                        <button type="button" className="btn-icon btn-danger" title="Xóa cán bộ" onClick={() => handleOpenDelete(staff)}>
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
                    <span key={p} className="staff-pagination-page-item">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="staff-pagination-ellipsis">...</span>}
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

        {/* Modal Thêm / Sửa Cán bộ */}
        {modalMode && (
          <div className="modal-backdrop">
            <div className="modal-card staff-modal-card">
              <div className="modal-head">
                <span className="modal-title-text">{modalMode === 'CREATE' ? 'Thêm mới cán bộ / nhân viên' : 'Cập nhật thông tin cán bộ'}</span>
                <button type="button" className="modal-x" onClick={handleCloseModal}>
                  <IconClose size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm}>
                <div className="modal-content staff-modal-body">
                  {modalError && <div className="alert-tag danger staff-modal-alert">{modalError}</div>}

                  <div className="staff-form-grid">
                    <div className="form-item">
                      <label className="field-label">Mã cán bộ *</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Ví dụ: CB001"
                        value={formData.staffCode}
                        onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-item">
                      <label className="field-label">Họ và tên *</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="staff-form-grid">
                    <div className="form-item">
                      <label className="field-label">Giới tính</label>
                      <select className="form-select" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>

                    <div className="form-item">
                      <label className="field-label">Ngày sinh</label>
                      <input
                        type="date"
                        className="text-input"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-item">
                    <label className="field-label">Khoa / Phòng ban công tác *</label>
                    <select
                      className="form-select"
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn Khoa / Phòng ban --</option>
                      {departments.map((d) => (
                        <option key={d.departmentId} value={d.departmentId}>
                          {d.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="staff-form-grid">
                    <div className="form-item">
                      <label className="field-label">Chức vụ</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Ví dụ: Giảng viên, Trưởng bộ môn..."
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      />
                    </div>

                    <div className="form-item">
                      <label className="field-label">Học hàm / Học vị</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Ví dụ: PGS. TS, ThS..."
                        value={formData.academicTitle}
                        onChange={(e) => setFormData({ ...formData, academicTitle: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="staff-form-grid">
                    <div className="form-item">
                      <label className="field-label">Số điện thoại</label>
                      <input
                        type="tel"
                        className="text-input"
                        placeholder="Ví dụ: 0912345678"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>

                    <div className="form-item">
                      <label className="field-label">Email</label>
                      <input
                        type="email"
                        className="text-input"
                        placeholder="Ví dụ: nva@vnua.edu.vn"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-item">
                    <label className="field-label">Địa chỉ</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Nhập địa chỉ cư trú..."
                      value={formData.adrress}
                      onChange={(e) => setFormData({ ...formData, adrress: e.target.value })}
                    />
                  </div>

                  {/* Khu vực chọn ảnh đại diện */}
                  <div className="form-item staff-avatar-picker-section">
                    <div className="staff-avatar-picker-header">
                      <label className="field-label staff-avatar-picker-title">Ảnh đại diện cán bộ</label>
                      {formData.avatarUrl && (
                        <button type="button" className="staff-avatar-clear-btn" onClick={() => setFormData({ ...formData, avatarUrl: '' })}>
                          Bỏ chọn ảnh
                        </button>
                      )}
                    </div>

                    <div className="staff-avatar-picker-body">
                      <div className="staff-avatar-preview-box">
                        {formData.avatarUrl ? (
                          <img
                            src={formData.avatarUrl}
                            alt="Preview"
                            className="staff-avatar-preview-img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="staff-avatar-preview-fallback">{formData.fullName ? formData.fullName.trim().charAt(0).toUpperCase() : '?'}</span>
                        )}
                      </div>

                      <div className="staff-avatar-presets-col">
                        <div className="staff-avatar-presets-title">Chọn nhanh mẫu avatar sẵn có:</div>
                        <div className="staff-avatar-presets-grid">
                          {AVATAR_PRESETS.map((preset) => {
                            const isSelected = formData.avatarUrl === preset.url;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                title={preset.label}
                                className={`staff-avatar-preset-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    avatarUrl: isSelected ? '' : preset.url,
                                  })
                                }
                              >
                                <img src={preset.url} alt={preset.label} className="staff-avatar-preset-thumb" />
                                {isSelected && <span className="staff-avatar-check-badge">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <input
                      type="text"
                      className="text-input staff-avatar-custom-input"
                      placeholder="Hoặc nhập link ảnh đại diện tùy chỉnh (https://...)"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    />
                  </div>

                  {/* Liên kết tài khoản User khi tạo mới */}
                  {modalMode === 'CREATE' && (
                    <div className="staff-user-link-section">
                      <span className="staff-user-link-title">LIÊN KẾT TÀI KHOẢN NGƯỜI DÙNG (ROLE: STAFF) *</span>
                      <div className="form-item">
                        <label className="field-label">Chọn tài khoản người dùng *</label>
                        <select
                          className="form-select"
                          value={formData.userId}
                          onChange={(e) => {
                            const selectedId = Number(e.target.value) || '';
                            const selectedUser = usersList.find((u) => u.userId === selectedId);
                            setFormData({
                              ...formData,
                              userId: selectedId,
                              email: selectedUser?.email || formData.email,
                            });
                          }}
                          required
                        >
                          <option value="">-- Chọn tài khoản người dùng đã tạo --</option>
                          {usersList.map((u) => {
                            const isAssigned = staffs.some((s) => s.userId === u.userId);
                            return (
                              <option key={u.userId} value={u.userId} disabled={isAssigned}>
                                {u.username} {u.email ? `(${u.email})` : ''} {isAssigned ? '- [Đã gắn hồ sơ]' : ''}
                              </option>
                            );
                          })}
                        </select>
                        <span className="staff-user-warning">
                          * Nếu chưa có tài khoản, vui lòng vào trang &quot;Quản lý người dùng&quot; tạo tài khoản với vai trò Cán bộ (STAFF) trước.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-foot">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitButtonText}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác nhận Xóa cán bộ */}
        {deletingStaff && (
          <div className="modal-backdrop">
            <div className="modal-card staff-delete-modal-card">
              <div className="modal-head">
                <span className="modal-title-text staff-delete-modal-title">Xác nhận xóa cán bộ</span>
                <button type="button" className="modal-x" onClick={() => setDeletingStaff(null)}>
                  <IconClose size={16} />
                </button>
              </div>

              <div className="modal-content">
                <p className="staff-delete-modal-text">
                  Bạn có chắc chắn muốn xóa hồ sơ cán bộ <strong>"{deletingStaff.fullName}"</strong> (Mã CB: {deletingStaff.staffCode}) không?
                </p>
                <p className="staff-delete-modal-warn">⚠ Hành động này sẽ khóa hồ sơ và tài khoản của cán bộ này.</p>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setDeletingStaff(null)} disabled={deleteLoading}>
                  Hủy
                </button>
                <button type="button" className="btn staff-delete-confirm-btn" onClick={handleConfirmDelete} disabled={deleteLoading}>
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
