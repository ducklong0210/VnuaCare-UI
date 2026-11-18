import { useEffect, useState } from 'react';
import MainLayout from '../../core/layouts/MainLayout.jsx';
import { getDoctorFilterApi, getSpecialtiesApi, createDoctorApi, updateDoctorApi, deleteDoctorApi } from '../../features/doctors/api/doctorApi.js';
import { getUserSelectApi } from '../../features/users/api/userApi.js';
import './DoctorManagerPage.css';
import { IconSearch, IconRefreshCw, IconPlus, IconEdit, IconTrash, IconClose, IconCheck } from '../../core/components/Icons.jsx';

// Giá trị mặc định của form bác sĩ
const INITIAL_FORM = {
  doctorId: null,
  userId: '',
  doctorCode: '',
  fullName: '',
  email: '',
  specialtyId: '',
  licenseNumber: '',
  hospitalName: 'Bệnh viện Đa khoa MEDLATEC',
};

export default function DoctorManagerPage() {
  // Dữ liệu danh sách bác sĩ, chuyên khoa và tài khoản người dùng
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bộ lọc tìm kiếm và phân trang
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
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

  // Quản lý Modal Thêm / Sửa bác sĩ
  const [modalMode, setModalMode] = useState(null); // null | 'CREATE' | 'EDIT'
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Quản lý Modal xác nhận xóa bác sĩ
  const [deletingDoctor, setDeletingDoctor] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Tải danh mục Chuyên khoa và User (Role: DOCTOR) khi mở trang
  useEffect(() => {
    let isCancelled = false;

    const loadInitialData = async () => {
      try {
        const [specRes, userRes] = await Promise.allSettled([getSpecialtiesApi(), getUserSelectApi('DOCTOR')]);
        if (!isCancelled) {
          if (specRes.status === 'fulfilled') {
            setSpecialties(specRes.value || []);
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

  // Tải danh sách bác sĩ theo bộ lọc và phân trang
  useEffect(() => {
    let isCancelled = false;

    const loadDoctors = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getDoctorFilterApi({
          textSearch: search.trim(),
          specialtyId: selectedSpecialty,
          pageNumber: pageNumber,
          pageSize: pageSize,
        });
        if (!isCancelled) {
          setDoctors(res.items || []);
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

    loadDoctors();

    return () => {
      isCancelled = true;
    };
  }, [search, selectedSpecialty, pageNumber, pageSize, refreshKey]);

  // Mở form thêm mới bác sĩ
  const handleOpenCreate = async () => {
    try {
      const data = await getUserSelectApi('DOCTOR');
      setUsersList(data || []);
    } catch {
      // Bỏ qua lỗi tải danh sách user
    }

    setFormData({
      ...INITIAL_FORM,
      specialtyId: specialties[0]?.specialtyId || '',
    });
    setModalError('');
    setModalMode('CREATE');
  };

  // Mở form chỉnh sửa bác sĩ
  const handleOpenEdit = (doc) => {
    setFormData({
      doctorId: doc.doctorId,
      userId: doc.userId || '',
      doctorCode: doc.doctorCode || '',
      fullName: doc.fullName || '',
      email: doc.email || '',
      specialtyId: doc.specialtyId || '',
      licenseNumber: doc.licenseNumber || '',
      hospitalName: doc.hospitalName || 'Bệnh viện Đa khoa MEDLATEC',
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
          setModalError('Vui lòng chọn tài khoản người dùng liên kết (Role: DOCTOR)');
          setSubmitting(false);
          return;
        }

        await createDoctorApi({
          doctorId: 0,
          userId: Number(formData.userId),
          doctorCode: formData.doctorCode.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          specialtyId: Number(formData.specialtyId),
          licenseNumber: formData.licenseNumber.trim(),
          hospitalName: formData.hospitalName.trim() || 'Bệnh viện Đa khoa MEDLATEC',
          isActive: true,
        });
        showToast('Thêm bác sĩ mới thành công!');
      } else if (modalMode === 'EDIT') {
        await updateDoctorApi({
          doctorId: formData.doctorId,
          doctorCode: formData.doctorCode.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          specialtyId: Number(formData.specialtyId),
          licenseNumber: formData.licenseNumber.trim(),
          hospitalName: formData.hospitalName.trim() || 'Bệnh viện Đa khoa MEDLATEC',
          isActive: true,
        });
        showToast('Cập nhật thông tin bác sĩ thành công!');
      }

      handleCloseModal();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setModalError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Mở hộp thoại xác nhận xóa bác sĩ
  const handleOpenDelete = (doc) => {
    setDeletingDoctor({
      doctorId: doc.doctorId,
      doctorCode: doc.doctorCode,
      fullName: doc.fullName,
    });
  };

  // Xác nhận xóa bác sĩ
  const handleConfirmDelete = async () => {
    if (!deletingDoctor) return;
    setDeleteLoading(true);

    try {
      await deleteDoctorApi(deletingDoctor.doctorId);
      showToast(`Đã xóa bác sĩ "${deletingDoctor.fullName}" thành công!`);
      setDeletingDoctor(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Không thể xóa bác sĩ này');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Đặt lại bộ lọc tìm kiếm
  const handleResetFilter = () => {
    setSearch('');
    setSelectedSpecialty('ALL');
    setPageNumber(1);
  };

  // Tính toán hiển thị phân trang
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromRecord = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const toRecord = Math.min(totalCount, pageNumber * pageSize);

  // Xác định chữ hiển thị trên nút submit (dễ hiểu, không lồng 3 ngôi)
  let submitButtonText = 'Lưu thay đổi';
  if (submitting) {
    submitButtonText = 'Đang xử lý...';
  } else if (modalMode === 'CREATE') {
    submitButtonText = 'Thêm bác sĩ';
  }

  return (
    <MainLayout activeTab="doctors">
      <div className="admin-page-container">
        {/* Thông báo toast thao tác thành công */}
        {toast && (
          <div className="admin-toast">
            <IconCheck size={16} />
            <span>{toast}</span>
          </div>
        )}

        {/* Tiêu đề trang & Nút thêm bác sĩ */}
        <div className="page-header-row">
          <div>
            <h2 className="main-title">Quản lý đội ngũ bác sĩ</h2>
            <span className="main-desc">Danh sách bác sĩ phụ trách khám sức khỏe cán bộ ({totalCount} bác sĩ)</span>
          </div>
          <div className="header-btn-group">
            <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
              <IconPlus size={16} />
              <span>Thêm bác sĩ</span>
            </button>
          </div>
        </div>

        {/* Bảng danh sách & Bộ lọc */}
        <div className="panel-card">
          {/* Thanh tìm kiếm và bộ lọc chuyên khoa */}
          <div className="filter-toolbar">
            <div className="search-field">
              <IconSearch size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm mã BS, họ tên, bệnh viện..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNumber(1);
                }}
              />
            </div>

            <select
              className="form-select"
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value);
                setPageNumber(1);
              }}
            >
              <option value="ALL">Tất cả chuyên khoa</option>
              {specialties.map((spec) => (
                <option key={spec.specialtyId} value={spec.specialtyId}>{spec.specialtyName}</option>
              ))}
            </select>

            <button type="button" className="btn-reset" onClick={handleResetFilter} title="Đặt lại bộ lọc">
              <IconRefreshCw size={14} />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* Bảng dữ liệu bác sĩ */}
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
                        <span className="tag-badge">{doc.specialtyName || doc.spesialtyName || '—'}</span>
                      </td>
                      <td>{doc.licenseNumber || '—'}</td>
                      <td>{doc.hospitalName || 'Bệnh viện Đa khoa MEDLATEC'}</td>
                      <td className="doctor-action-cell">
                        <button type="button" className="btn-icon" title="Sửa thông tin" onClick={() => handleOpenEdit(doc)}>
                          <IconEdit size={14} />
                        </button>
                        <button type="button" className="btn-icon btn-danger" title="Xóa bác sĩ" onClick={() => handleOpenDelete(doc)}>
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
              Hiển thị <strong>{fromRecord}</strong> – <strong>{toRecord}</strong> trên tổng số <strong>{totalCount}</strong> bác sĩ
            </div>

            <div className="doctor-pagination-wrapper">
              <div className="doctor-page-size-selector">
                <span>Hiển thị:</span>
                <select
                  className="form-select doctor-page-size-select"
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
                    <span key={p} className="doctor-pagination-page-item">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="doctor-pagination-ellipsis">...</span>}
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

        {/* Modal Thêm / Sửa Bác sĩ */}
        {modalMode && (
          <div className="modal-backdrop">
            <div className="modal-card doctor-modal-card">
              <div className="modal-head">
                <span className="modal-title-text">{modalMode === 'CREATE' ? 'Thêm mới bác sĩ' : 'Cập nhật thông tin bác sĩ'}</span>
                <button type="button" className="modal-x" onClick={handleCloseModal}>
                  <IconClose size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm}>
                <div className="modal-content doctor-modal-body">
                  {modalError && <div className="alert-tag danger doctor-modal-alert">{modalError}</div>}

                  <div className="doctor-form-grid">
                    <div className="form-item">
                      <label className="field-label">Mã bác sĩ *</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Ví dụ: BS001"
                        value={formData.doctorCode}
                        onChange={(e) => setFormData({ ...formData, doctorCode: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-item">
                      <label className="field-label">Họ và tên bác sĩ *</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Ví dụ: BS. Nguyễn Văn B"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="doctor-form-grid">
                    <div className="form-item">
                      <label className="field-label">Chuyên khoa phụ trách *</label>
                      <select
                        className="form-select"
                        value={formData.specialtyId}
                        onChange={(e) => setFormData({ ...formData, specialtyId: e.target.value })}
                        required
                      >
                        <option value="">-- Chọn chuyên khoa --</option>
                        {specialties.map((spec) => (
                          <option key={spec.specialtyId} value={spec.specialtyId}>{spec.specialtyName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-item">
                      <label className="field-label">Số chứng chỉ hành nghề</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Ví dụ: CCHN-12345/HN"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="doctor-form-grid">
                    <div className="form-item">
                      <label className="field-label">Bệnh viện công tác</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Ví dụ: Bệnh viện Đa khoa MEDLATEC"
                        value={formData.hospitalName}
                        onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                      />
                    </div>

                    <div className="form-item">
                      <label className="field-label">Email liên hệ *</label>
                      <input
                        type="email"
                        className="text-input"
                        placeholder="Ví dụ: bs.nguyen@medlatec.vn"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Liên kết tài khoản người dùng khi tạo mới */}
                  {modalMode === 'CREATE' && (
                    <div className="doctor-user-link-section">
                      <span className="doctor-user-link-title">LIÊN KẾT TÀI KHOẢN NGƯỜI DÙNG (ROLE: DOCTOR) *</span>
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
                            const isAssigned = doctors.some((d) => d.userId === u.userId);
                            return (
                              <option key={u.userId} value={u.userId} disabled={isAssigned}>{u.username} {u.email ? `(${u.email})` : ''} {isAssigned ? '- [Đã gắn hồ sơ]' : ''}</option>
                            );
                          })}
                        </select>
                        <span className="doctor-user-warning">* Nếu chưa có tài khoản, vui lòng vào trang &quot;Quản lý người dùng&quot; tạo tài khoản với vai trò Bác sĩ (DOCTOR) trước.</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-foot">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitButtonText}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác nhận Xóa bác sĩ */}
        {deletingDoctor && (
          <div className="modal-backdrop">
            <div className="modal-card doctor-delete-modal-card">
              <div className="modal-head">
                <span className="modal-title-text doctor-delete-modal-title">Xác nhận xóa bác sĩ</span>
                <button type="button" className="modal-x" onClick={() => setDeletingDoctor(null)}>
                  <IconClose size={16} />
                </button>
              </div>

              <div className="modal-content">
                <p className="doctor-delete-modal-text">
                  Bạn có chắc chắn muốn xóa hồ sơ bác sĩ <strong>"{deletingDoctor.fullName}"</strong> (Mã BS: {deletingDoctor.doctorCode}) không?
                </p>
                <p className="doctor-delete-modal-warn">⚠ Hành động này sẽ khóa hồ sơ và tài khoản của bác sĩ này.</p>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-outline" onClick={() => setDeletingDoctor(null)} disabled={deleteLoading}>
                  Hủy
                </button>
                <button type="button" className="btn doctor-delete-confirm-btn" onClick={handleConfirmDelete} disabled={deleteLoading}>{deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
