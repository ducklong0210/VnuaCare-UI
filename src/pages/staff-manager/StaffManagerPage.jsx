import { useEffect, useState } from 'react'
import MainLayout from '../../layouts/MainLayout.jsx'
import {
  getStaffFilterApi,
  getDepartmentsApi,
  createStaffApi,
  updateStaffApi,
  deleteStaffApi,
} from '../../features/staff-manager/api/staffApi.js'
import {
  IconSearch,
  IconRefreshCw,
  IconPlus,
  IconEdit,
  IconTrash,
  IconClose,
  IconCheck,
} from '../../components/ui/Icons.jsx'

export default function StaffManagerPage() {
  // Danh sách cán bộ và danh mục phòng ban
  const [staffs, setStaffs] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Bộ lọc tìm kiếm
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [refreshKey, setRefreshKey] = useState(0)

  // Thông báo toast
  const [toast, setToast] = useState('')
  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  // Quản lý Modal Thêm / Sửa
  const [modalMode, setModalMode] = useState(null) // null | 'CREATE' | 'EDIT'
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')
  const [formData, setFormData] = useState({
    staffId: null,
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
    username: '',
    password: '',
  })

  // Quản lý Modal xác nhận xóa
  const [deletingStaff, setDeletingStaff] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Tải danh mục Khoa / Phòng ban khi mở trang
  useEffect(() => {
    let isCancelled = false

    const loadDepartments = async () => {
      try {
        const data = await getDepartmentsApi()
        if (!isCancelled) {
          setDepartments(data || [])
        }
      } catch {
        // Bỏ qua lỗi danh mục nếu chưa có
      }
    }

    loadDepartments()

    return () => {
      isCancelled = true
    }
  }, [])

  // Tải danh sách cán bộ theo bộ lọc
  useEffect(() => {
    let isCancelled = false

    const loadStaffs = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getStaffFilterApi({
          textSearch: search.trim(),
          departmentId: selectedDept,
        })
        if (!isCancelled) {
          setStaffs(data || [])
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Không thể kết nối đến máy chủ')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadStaffs()

    return () => {
      isCancelled = true
    }
  }, [search, selectedDept, refreshKey])

  // Mở form thêm mới cán bộ
  const handleOpenCreate = () => {
    setFormData({
      staffId: null,
      staffCode: '',
      fullName: '',
      gender: 'Nam',
      dateOfBirth: '',
      departmentId: departments[0]?.departmentId || '',
      jobTitle: '',
      academicTitle: '',
      phoneNumber: '',
      email: '',
      adrress: '',
      username: '',
      password: '',
    })
    setModalError('')
    setModalMode('CREATE')
  }

  // Mở form chỉnh sửa cán bộ
  const handleOpenEdit = (staff) => {
    setFormData({
      staffId: staff.staffId,
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
      username: '',
      password: '',
    })
    setModalError('')
    setModalMode('EDIT')
  }

  // Đóng modal
  const handleCloseModal = () => {
    setModalMode(null)
    setModalError('')
  }

  // Xử lý gửi Form Thêm / Sửa
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setModalError('')

    try {
      if (modalMode === 'CREATE') {
        await createStaffApi({
          staffCode: formData.staffCode.trim(),
          fullName: formData.fullName.trim(),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          departmentId: Number(formData.departmentId),
          jobTitle: formData.jobTitle.trim(),
          academicTitle: formData.academicTitle.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email.trim(),
          adrress: formData.adrress.trim(),
          username: formData.username.trim(),
          password: formData.password,
        })
        showToast('Thêm cán bộ mới thành công!')
      } else if (modalMode === 'EDIT') {
        await updateStaffApi({
          staffId: formData.staffId,
          staffCode: formData.staffCode.trim(),
          fullName: formData.fullName.trim(),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          departmentId: Number(formData.departmentId),
          jobTitle: formData.jobTitle.trim(),
          academicTitle: formData.academicTitle.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email.trim(),
          adrress: formData.adrress.trim(),
        })
        showToast('Cập nhật thông tin cán bộ thành công!')
      }

      handleCloseModal()
      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      setModalError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setSubmitting(false)
    }
  }

  // Mở hộp thoại xác nhận xóa
  const handleOpenDelete = (staff) => {
    setDeletingStaff({
      staffId: staff.staffId,
      staffCode: staff.staffCode,
      fullName: staff.fullName,
    })
  }

  // Xác nhận xóa cán bộ
  const handleConfirmDelete = async () => {
    if (!deletingStaff) return
    setDeleteLoading(true)

    try {
      await deleteStaffApi(deletingStaff.staffId)
      showToast(`Đã xóa cán bộ "${deletingStaff.fullName}" thành công!`)
      setDeletingStaff(null)
      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      showToast(err.message || 'Không thể xóa cán bộ này')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Đặt lại bộ lọc
  const handleResetFilter = () => {
    setSearch('')
    setSelectedDept('ALL')
  }

  return (
    <MainLayout activeTab="staffs">
      <div className="admin-page-container">
        
        {/* Thông báo Toast */}
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
            <span className="main-desc">Danh sách cán bộ, giảng viên Học viện Nông nghiệp Việt Nam</span>
          </div>
          <div className="header-btn-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenCreate}
            >
              <IconPlus size={16} />
              <span>Thêm cán bộ</span>
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
                placeholder="Tìm mã CB, họ tên, chức vụ, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">Tất cả đơn vị / Khoa</option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.departmentName}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn-reset"
              onClick={handleResetFilter}
              title="Đặt lại bộ lọc"
            >
              <IconRefreshCw size={14} />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* Bảng danh sách cán bộ */}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Mã CB</th>
                  <th style={{ width: '220px' }}>Họ và tên</th>
                  <th style={{ width: '80px' }}>Giới tính</th>
                  <th style={{ width: '200px' }}>Đơn vị / Khoa</th>
                  <th style={{ width: '160px' }}>Chức vụ / Học vị</th>
                  <th style={{ width: '130px' }}>Số điện thoại</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      <div className="empty-wrap">
                        <span className="empty-title">Đang tải dữ liệu cán bộ...</span>
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

                {!loading && !error && staffs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      <div className="empty-wrap">
                        <span className="empty-title">Không có dữ liệu cán bộ nào</span>
                        <p className="empty-desc">
                          Hệ thống chưa tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && staffs.length > 0 && (
                  staffs.map((staff) => (
                    <tr key={staff.staffId}>
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
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Sửa thông tin"
                          onClick={() => handleOpenEdit(staff)}
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-danger"
                          title="Xóa cán bộ"
                          onClick={() => handleOpenDelete(staff)}
                        >
                          <IconTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Modal Thêm / Sửa Cán bộ */}
        {modalMode && (
          <div className="modal-backdrop">
            <div className="modal-card" style={{ maxWidth: '540px' }}>
              <div className="modal-head">
                <span className="modal-title-text">
                  {modalMode === 'CREATE' ? 'Thêm mới cán bộ / nhân viên' : 'Cập nhật thông tin cán bộ'}
                </span>
                <button
                  type="button"
                  className="modal-x"
                  onClick={handleCloseModal}
                >
                  <IconClose size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm}>
                <div className="modal-content" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {modalError && (
                    <div className="alert-tag danger" style={{ padding: '8px 12px', width: '100%' }}>
                      {modalError}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-item">
                      <label className="field-label">Giới tính</label>
                      <select
                        className="form-select"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                  {modalMode === 'CREATE' && (
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f766e', display: 'block', marginBottom: '8px' }}>
                        TÀI KHOẢN ĐĂNG NHẬP HỆ THỐNG
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-item">
                          <label className="field-label">Tên đăng nhập *</label>
                          <input
                            type="text"
                            className="text-input"
                            placeholder="Ví dụ: cb001"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-item">
                          <label className="field-label">Mật khẩu *</label>
                          <input
                            type="password"
                            className="text-input"
                            placeholder="Mật khẩu tài khoản..."
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <div className="modal-foot">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCloseModal}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Đang xử lý...' : modalMode === 'CREATE' ? 'Thêm cán bộ' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác nhận Xóa cán bộ */}
        {deletingStaff && (
          <div className="modal-backdrop">
            <div className="modal-card" style={{ maxWidth: '420px' }}>
              <div className="modal-head">
                <span className="modal-title-text" style={{ color: '#dc2626' }}>
                  Xác nhận xóa cán bộ
                </span>
                <button
                  type="button"
                  className="modal-x"
                  onClick={() => setDeletingStaff(null)}
                >
                  <IconClose size={16} />
                </button>
              </div>

              <div className="modal-content">
                <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                  Bạn có chắc chắn muốn xóa hồ sơ cán bộ <strong>"{deletingStaff.fullName}"</strong> (Mã CB: {deletingStaff.staffCode}) không?
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#dc2626' }}>
                  ⚠ Hành động này sẽ khóa hồ sơ và tài khoản của cán bộ này.
                </p>
              </div>

              <div className="modal-foot">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setDeletingStaff(null)}
                  disabled={deleteLoading}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    borderColor: '#dc2626',
                  }}
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  )
}
