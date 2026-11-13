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

export default function ProfileManagerPage() {
  const [records, setRecords] = useState([])
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('ALL')
  const [year, setYear] = useState('2026')
  const [grade, setGrade] = useState('ALL')

  const [activeModal, setActiveModal] = useState(false)
  const [toast, setToast] = useState('')

  const [formData, setFormData] = useState({
    recordCode: '',
    staffCode: '',
    staffName: '',
    department: 'Khoa Công nghệ thông tin',
    year: '2026',
    classification: 'Loại I',
    conclusion: '',
  })

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filteredRecords = records.filter((r) => {
    const matchSearch =
      r.recordCode.toLowerCase().includes(search.toLowerCase()) ||
      r.staffCode.toLowerCase().includes(search.toLowerCase()) ||
      r.staffName.toLowerCase().includes(search.toLowerCase())
    const matchDept = department === 'ALL' || r.department === department
    const matchGrade = grade === 'ALL' || r.classification === grade
    const matchYear = year === 'ALL' || r.year === year
    return matchSearch && matchDept && matchGrade && matchYear
  })

  const handleAddRecord = (e) => {
    e.preventDefault()
    if (!formData.recordCode.trim() || !formData.staffName.trim()) {
      showToast('Vui lòng điền đủ Mã hồ sơ và Tên cán bộ')
      return
    }

    const newRecord = {
      id: Date.now().toString(),
      recordCode: formData.recordCode.trim(),
      staffCode: formData.staffCode.trim() || 'CB-000',
      staffName: formData.staffName.trim(),
      department: formData.department,
      year: formData.year,
      classification: formData.classification,
      conclusion: formData.conclusion.trim() || 'Sức khỏe bình thường',
    }

    setRecords([newRecord, ...records])
    showToast(`Đã tạo hồ sơ cho cán bộ ${newRecord.staffName}!`)
    setActiveModal(false)
    setFormData({
      recordCode: '',
      staffCode: '',
      staffName: '',
      department: 'Khoa Công nghệ thông tin',
      year: '2026',
      classification: 'Loại I',
      conclusion: '',
    })
  }

  const handleDeleteRecord = (id, code) => {
    setRecords(records.filter((r) => r.id !== id))
    showToast(`Đã xóa hồ sơ ${code}`)
  }

  return (
    <MainLayout activeTab="records">
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
            <h2 className="main-title">Hồ sơ khám sức khỏe cán bộ</h2>
            <span className="main-desc">
              Tra cứu, quản lý và theo dõi kết quả khám sức khỏe định kỳ
            </span>
          </div>
          <div className="header-btn-group">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => showToast('Đang kết xuất danh sách hồ sơ...')}
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
              <span>Tạo hồ sơ mới</span>
            </button>
          </div>
        </div>

        {/* 2. Metrics Strip */}
        <div className="metrics-strip">
          <div className="metric-box">
            <span className="metric-label">TỔNG HỒ SƠ ĐÃ LẬP</span>
            <div className="metric-num">{records.length}</div>
            <span className="metric-note">Năm {year}</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">SỨC KHỎE LOẠI I & II</span>
            <div className="metric-num">
              {records.filter((r) => r.classification === 'Loại I' || r.classification === 'Loại II').length}
            </div>
            <span className="metric-note">Thể lực tốt & trung bình</span>
          </div>

          <div className="metric-box warning-box">
            <span className="metric-label">CẦN THEO DÕI (LOẠI III & IV)</span>
            <div className="metric-num text-danger">
              {records.filter((r) => r.classification === 'Loại III' || r.classification === 'Loại IV').length}
            </div>
            <span className="metric-note">Có chỉ số bất thường</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">TRẠNG THÁI HỆ THỐNG</span>
            <div className="metric-status-row">
              <span className="online-dot"></span>
              <span className="status-text">Sẵn sàng nhận dữ liệu API</span>
            </div>
            <span className="metric-note">/api/v1/healthcheckuprecords/filter</span>
          </div>
        </div>

        {/* 3. Filter Toolbar & Table */}
        <div className="panel-card">
          <div className="filter-toolbar">
            <div className="search-field">
              <IconSearch size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm mã hồ sơ, mã CB, họ tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="ALL">Tất cả đơn vị / Khoa</option>
              <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
              <option value="Khoa Thú y">Khoa Thú y</option>
              <option value="Khoa Nông học">Khoa Nông học</option>
              <option value="Khoa Kinh tế & PTNT">Khoa Kinh tế & PTNT</option>
              <option value="Ban Giám hiệu - Phòng ban">Ban Giám hiệu - Phòng ban</option>
            </select>

            <select
              className="form-select select-year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2026">Năm 2026</option>
              <option value="2025">Năm 2025</option>
              <option value="2024">Năm 2024</option>
            </select>

            <select
              className="form-select"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="ALL">Phân loại: Tất cả</option>
              <option value="Loại I">Loại I</option>
              <option value="Loại II">Loại II</option>
              <option value="Loại III">Loại III</option>
              <option value="Loại IV">Loại IV</option>
            </select>

            <button
              type="button"
              className="btn-reset"
              onClick={() => {
                setSearch('')
                setDepartment('ALL')
                setYear('2026')
                setGrade('ALL')
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
                  <th style={{ width: '110px' }}>Mã HS</th>
                  <th style={{ width: '220px' }}>Cán bộ khám</th>
                  <th style={{ width: '190px' }}>Đơn vị công tác</th>
                  <th style={{ width: '80px' }}>Năm</th>
                  <th style={{ width: '110px' }}>Phân loại</th>
                  <th>Kết luận bác sĩ</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      <div className="empty-wrap">
                        <span className="empty-title">Không có dữ liệu hồ sơ nào</span>
                        <p className="empty-desc">
                          Bảng sẵn sàng nhận dữ liệu khi kết nối với API: <code>POST /api/v1/healthcheckuprecords/filter</code>
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id}>
                      <td className="code-font">{r.recordCode}</td>
                      <td>
                        <div className="cell-staff">
                          <strong>{r.staffName}</strong>
                          <span>Mã CB: {r.staffCode}</span>
                        </div>
                      </td>
                      <td>{r.department}</td>
                      <td>{r.year}</td>
                      <td>
                        <span className={`tag-badge grade-${r.classification}`}>
                          {r.classification}
                        </span>
                      </td>
                      <td>{r.conclusion}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Xem chi tiết"
                          onClick={() => showToast(`Xem phiếu khám ${r.recordCode}`)}
                        >
                          <IconEye size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Sửa hồ sơ"
                          onClick={() => showToast(`Sửa phiếu khám ${r.recordCode}`)}
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-danger"
                          title="Xóa"
                          onClick={() => handleDeleteRecord(r.id, r.recordCode)}
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
              Hiển thị <strong>{filteredRecords.length}</strong> / <strong>{records.length}</strong> hồ sơ
            </span>
            <div className="pagination-buttons">
              <button type="button" disabled className="btn-page">Trước</button>
              <button type="button" className="btn-page active">1</button>
              <button type="button" disabled className="btn-page">Sau</button>
            </div>
          </div>
        </div>

        {/* 4. Modal Tạo Hồ Sơ Khám */}
        {activeModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-head">
                <span className="modal-title-text">Tạo hồ sơ khám sức khỏe</span>
                <button
                  type="button"
                  className="modal-x"
                  onClick={() => setActiveModal(false)}
                >
                  <IconClose size={16} />
                </button>
              </div>

              <form onSubmit={handleAddRecord}>
                <div className="modal-content">
                  <div className="form-item">
                    <label className="field-label">Mã phiếu khám *</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Ví dụ: HS2026-001"
                      value={formData.recordCode}
                      onChange={(e) => setFormData({ ...formData, recordCode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Mã cán bộ</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Ví dụ: CB1002"
                      value={formData.staffCode}
                      onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Họ và tên cán bộ *</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Ví dụ: PGS. TS. Nguyễn Văn B"
                      value={formData.staffName}
                      onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Đơn vị công tác</label>
                    <select
                      className="form-select"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
                      <option value="Khoa Thú y">Khoa Thú y</option>
                      <option value="Khoa Nông học">Khoa Nông học</option>
                      <option value="Khoa Kinh tế & PTNT">Khoa Kinh tế & PTNT</option>
                      <option value="Ban Giám hiệu - Phòng ban">Ban Giám hiệu - Phòng ban</option>
                    </select>
                  </div>

                  <div className="form-item">
                    <label className="field-label">Phân loại sức khỏe</label>
                    <select
                      className="form-select"
                      value={formData.classification}
                      onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                    >
                      <option value="Loại I">Loại I (Tốt)</option>
                      <option value="Loại II">Loại II (Trung bình)</option>
                      <option value="Loại III">Loại III (Cần theo dõi)</option>
                      <option value="Loại IV">Loại IV (Kém)</option>
                    </select>
                  </div>

                  <div className="form-item">
                    <label className="field-label">Kết luận bác sĩ</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Nhập kết luận hoặc ghi chú..."
                      value={formData.conclusion}
                      onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
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
                    Lưu hồ sơ
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
