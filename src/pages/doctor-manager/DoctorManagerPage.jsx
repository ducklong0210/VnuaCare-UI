import { useState } from 'react'
import MainLayout from '../../layouts/MainLayout.jsx'
import {
  IconSearch,
  IconPlus,
  IconDownload,
  IconCheck,
  IconClose,
  IconEye,
  IconEdit,
  IconTrash,
  IconRefreshCw,
} from '../../components/ui/Icons.jsx'

export default function DoctorManagerPage() {
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('ALL')
  const [status, setStatus] = useState('ALL')

  const [activeModal, setActiveModal] = useState(false)
  const [toast, setToast] = useState('')

  const [formData, setFormData] = useState({
    code: '',
    fullName: '',
    specialty: 'Nội khoa',
    degree: 'Bác sĩ CKI',
    phone: '',
    email: '',
  })

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filteredDoctors = doctors.filter((doc) => {
    const matchSearch =
      doc.fullName.toLowerCase().includes(search.toLowerCase()) ||
      doc.code.toLowerCase().includes(search.toLowerCase())
    const matchSpecialty = specialty === 'ALL' || doc.specialty === specialty
    const matchStatus = status === 'ALL' || doc.status === status
    return matchSearch && matchSpecialty && matchStatus
  })

  const handleAddDoctor = (e) => {
    e.preventDefault()
    if (!formData.fullName.trim() || !formData.code.trim()) {
      showToast('Vui lòng điền đủ Mã bác sĩ và Họ tên')
      return
    }

    const newDoc = {
      id: Date.now().toString(),
      code: formData.code.trim(),
      fullName: formData.fullName.trim(),
      specialty: formData.specialty,
      degree: formData.degree,
      phone: formData.phone.trim() || '—',
      email: formData.email.trim() || '—',
      status: 'ACTIVE',
    }

    setDoctors([newDoc, ...doctors])
    showToast(`Đã thêm bác sĩ ${newDoc.fullName} thành công!`)
    setActiveModal(false)
    setFormData({
      code: '',
      fullName: '',
      specialty: 'Nội khoa',
      degree: 'Bác sĩ CKI',
      phone: '',
      email: '',
    })
  }

  const handleDeleteDoctor = (id, name) => {
    setDoctors(doctors.filter((d) => d.id !== id))
    showToast(`Đã xóa bác sĩ ${name}`)
  }

  return (
    <MainLayout activeTab="doctors">
      <div className="admin-page-container">
        {toast && (
          <div className="admin-toast">
            <IconCheck size={16} />
            <span>{toast}</span>
          </div>
        )}

        {/* 1. Header Row */}
        <div className="page-header-row">
          <div>
            <h2 className="main-title">Quản lý danh sách bác sĩ</h2>
            <span className="main-desc">
              Đội ngũ bác sĩ phụ trách khám sức khỏe cán bộ VNUA
            </span>
          </div>
          <div className="header-btn-group">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => showToast('Đang kết xuất danh sách bác sĩ...')}
            >
              <IconDownload size={15} />
              <span>Xuất Excel</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveModal(true)}
            >
              <IconPlus size={15} />
              <span>Thêm bác sĩ mới</span>
            </button>
          </div>
        </div>

        {/* 2. Metrics Strip */}
        <div className="metrics-strip">
          <div className="metric-box">
            <span className="metric-label">TỔNG SỐ BÁC SĨ</span>
            <div className="metric-num">{doctors.length}</div>
            <span className="metric-note">Đã đăng ký trong hệ thống</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">ĐANG LÀM VIỆC</span>
            <div className="metric-num">
              {doctors.filter((d) => d.status === 'ACTIVE').length}
            </div>
            <span className="metric-note">Sẵn sàng phân công khám</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">CHUYÊN KHOA PHỤ TRÁCH</span>
            <div className="metric-num">
              {new Set(doctors.map((d) => d.specialty)).size || 0}
            </div>
            <span className="metric-note">Nội, Ngoại, Mắt, RHM, TMH...</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">TRẠNG THÁI HỆ THỐNG</span>
            <div className="metric-status-row">
              <span className="online-dot"></span>
              <span className="status-text">Sẵn sàng nhận dữ liệu API</span>
            </div>
            <span className="metric-note">/api/v1/doctors/filter</span>
          </div>
        </div>

        {/* 3. Filter Toolbar & Table */}
        <div className="panel-card">
          <div className="filter-toolbar">
            <div className="search-field">
              <IconSearch size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm mã bác sĩ, họ tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="ALL">Tất cả chuyên khoa</option>
              <option value="Nội khoa">Nội khoa</option>
              <option value="Ngoại khoa">Ngoại khoa</option>
              <option value="Mắt">Mắt</option>
              <option value="Răng Hàm Mặt">Răng Hàm Mặt</option>
              <option value="Tai Mũi Họng">Tai Mũi Họng</option>
              <option value="Chẩn đoán hình ảnh">Chẩn đoán hình ảnh</option>
              <option value="Xét nghiệm">Xét nghiệm</option>
            </select>

            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang công tác</option>
              <option value="INACTIVE">Tạm nghỉ</option>
            </select>

            <button
              type="button"
              className="btn-reset"
              onClick={() => {
                setSearch('')
                setSpecialty('ALL')
                setStatus('ALL')
              }}
              title="Đặt lại bộ lọc"
            >
              <IconRefreshCw size={14} />
              <span>Đặt lại</span>
            </button>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Mã BS</th>
                  <th style={{ width: '220px' }}>Họ và tên</th>
                  <th style={{ width: '160px' }}>Chuyên khoa</th>
                  <th style={{ width: '140px' }}>Trình độ / Học vị</th>
                  <th style={{ width: '130px' }}>Số điện thoại</th>
                  <th style={{ width: '130px' }}>Trạng thái</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      <div className="empty-wrap">
                        <span className="empty-title">Không có dữ liệu bác sĩ nào</span>
                        <p className="empty-desc">
                          Bảng sẵn sàng nhận dữ liệu khi kết nối với API: <code>POST /api/v1/doctors/filter</code>
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doc) => (
                    <tr key={doc.id}>
                      <td className="code-font">{doc.code}</td>
                      <td>
                        <div className="cell-staff">
                          <strong>{doc.fullName}</strong>
                          <span>{doc.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="tag-badge">{doc.specialty}</span>
                      </td>
                      <td>{doc.degree}</td>
                      <td>{doc.phone}</td>
                      <td>
                        {doc.status === 'ACTIVE' ? (
                          <span className="alert-tag success">Đang công tác</span>
                        ) : (
                          <span className="alert-tag muted">Tạm nghỉ</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Xem hồ sơ"
                          onClick={() => showToast(`Xem thông tin ${doc.fullName}`)}
                        >
                          <IconEye size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Sửa thông tin"
                          onClick={() => showToast(`Chỉnh sửa ${doc.fullName}`)}
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-danger"
                          title="Xóa"
                          onClick={() => handleDeleteDoctor(doc.id, doc.fullName)}
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

          <div className="table-pagination">
            <span className="pagination-text">
              Hiển thị <strong>{filteredDoctors.length}</strong> / <strong>{doctors.length}</strong> bác sĩ
            </span>
            <div className="pagination-buttons">
              <button type="button" disabled className="btn-page">Trước</button>
              <button type="button" className="btn-page active">1</button>
              <button type="button" disabled className="btn-page">Sau</button>
            </div>
          </div>
        </div>

        {/* 4. Modal Thêm Bác sĩ Mới */}
        {activeModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-head">
                <span className="modal-title-text">Thêm bác sĩ mới</span>
                <button
                  type="button"
                  className="modal-x"
                  onClick={() => setActiveModal(false)}
                >
                  <IconClose size={16} />
                </button>
              </div>

              <form onSubmit={handleAddDoctor}>
                <div className="modal-content">
                  <div className="form-item">
                    <label className="field-label">Mã bác sĩ *</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Ví dụ: BS001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Họ và tên bác sĩ *</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Chuyên khoa</label>
                    <select
                      className="form-select"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    >
                      <option value="Nội khoa">Nội khoa</option>
                      <option value="Ngoại khoa">Ngoại khoa</option>
                      <option value="Mắt">Mắt</option>
                      <option value="Răng Hàm Mặt">Răng Hàm Mặt</option>
                      <option value="Tai Mũi Họng">Tai Mũi Họng</option>
                      <option value="Chẩn đoán hình ảnh">Chẩn đoán hình ảnh</option>
                      <option value="Xét nghiệm">Xét nghiệm</option>
                    </select>
                  </div>

                  <div className="form-item">
                    <label className="field-label">Trình độ / Học vị</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Ví dụ: Thạc sĩ, Bác sĩ CKI..."
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Số điện thoại</label>
                    <input
                      type="tel"
                      className="text-input"
                      placeholder="Ví dụ: 0912345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Email</label>
                    <input
                      type="email"
                      className="text-input"
                      placeholder="Ví dụ: bsa@vnua.edu.vn"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-foot">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setActiveModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Lưu bác sĩ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
