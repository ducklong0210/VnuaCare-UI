import { useState } from 'react'
import MainLayout from '../../layouts/MainLayout.jsx'
import {
  IconSearch,
  IconPlus,
  IconDownload,
  IconCheck,
  IconClose,
  IconEye,
  IconRefreshCw,
} from '../../components/ui/Icons.jsx'
import './DashboardPage.css'

/**
 * ==============================================================================
 * TRANG QUẢN TRỊ HỒ SƠ SỨC KHỎE CÁN BỘ (Enterprise Clean Style)
 * Thiết kế chuẩn phần mềm quản lý nghiệp vụ:
 *   - Không văn vẻ giải thích, không banner quảng cáo kiểu AI
 *   - Bố cục chặt chẽ, mật độ thông tin cao, tập trung vào thao tác thực tế
 * ==============================================================================
 */
export default function DashboardPage() {
  // Danh sách hồ sơ cán bộ (Khởi tạo rỗng để nạp API thật)
  const [records, setRecords] = useState([])

  // Bộ lọc tìm kiếm
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('ALL')
  const [year, setYear] = useState('2026')
  const [healthType, setHealthType] = useState('ALL')
  const [alertFilter, setAlertFilter] = useState('ALL')

  // Modal thêm thông tin bệnh lý mới
  const [activeModal, setActiveModal] = useState(null)
  const [conditionInput, setConditionInput] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Lọc dữ liệu theo các tiêu chí trên thanh công cụ
  const filteredList = records.filter((item) => {
    const matchSearch =
      item.fullname.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
    const matchDept = department === 'ALL' || item.department === department
    const matchHealth = healthType === 'ALL' || item.classification === healthType
    const matchAlert =
      alertFilter === 'ALL' ||
      (alertFilter === 'ALERT' && item.alertStatus === 'pending') ||
      (alertFilter === 'SENT' && item.alertStatus === 'sent')

    return matchSearch && matchDept && matchHealth && matchAlert
  })

  // Đếm nhanh các chỉ số
  const totalCount = records.length
  const alertCount = records.filter((r) => r.alertStatus === 'pending').length
  const chronicCount = records.filter((r) => r.conditions && r.conditions.some((c) => c !== 'Bình thường')).length

  return (
    <MainLayout activeTab="dashboard">
      <div className="admin-page-container">
        
        {/* Thông báo thao tác góc phải */}
        {toast && (
          <div className="admin-toast">
            <IconCheck size={16} />
            <span>{toast}</span>
          </div>
        )}

        {/* 1. THANH TIÊU ĐỀ TRANG & NÚT HÀNH ĐỘNG CHÍNH */}
        <div className="page-header-row">
          <div>
            <h2 className="main-title">Quản lý hồ sơ sức khỏe cán bộ</h2>
            <span className="main-desc">Đợt khám sức khỏe định kỳ năm {year} — Học viện Nông nghiệp Việt Nam</span>
          </div>
          <div className="header-btn-group">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => showToast('Đang kết xuất danh sách hồ sơ ra file Excel...')}
            >
              <IconDownload size={15} />
              <span>Xuất Excel</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => showToast('Mở form thêm hồ sơ cán bộ mới...')}
            >
              <IconPlus size={15} />
              <span>Thêm hồ sơ mới</span>
            </button>
          </div>
        </div>

        {/* 2. DÃY CHỈ SỐ NHANH (METRICS STRIP - THIẾT KẾ GỌN GÀNG, KHÔNG VĂN VẺ) */}
        <div className="metrics-strip">
          <div className="metric-box">
            <span className="metric-label">TỔNG SỐ HỒ SƠ</span>
            <div className="metric-num">{totalCount}</div>
            <span className="metric-note">Đã đăng ký năm {year}</span>
          </div>

          <div className="metric-box warning-box">
            <span className="metric-label">CẦN GỬI EMAIL CẢNH BÁO</span>
            <div className="metric-num text-danger">{alertCount}</div>
            <span className="metric-note">Chỉ số khám bất thường</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">PHÁT HIỆN BỆNH LÝ MẠN TÍNH</span>
            <div className="metric-num">{chronicCount}</div>
            <span className="metric-note">Tiểu đường, Huyết áp, Mỡ máu...</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">TRẠNG THÁI HỆ THỐNG</span>
            <div className="metric-status-row">
              <span className="online-dot"></span>
              <span className="status-text">Sẵn sàng nhận dữ liệu API</span>
            </div>
            <span className="metric-note">/api/v1/healthcheckuprecords</span>
          </div>
        </div>

        {/* 3. BẢNG DỮ LIỆU & BỘ LỌC CHUYÊN NGHIỆP */}
        <div className="panel-card">
          
          {/* Thanh bộ lọc 1 hàng tiêu chuẩn phần mềm */}
          <div className="filter-toolbar">
            <div className="search-field">
              <IconSearch size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm mã cán bộ, họ tên..."
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
              value={healthType}
              onChange={(e) => setHealthType(e.target.value)}
            >
              <option value="ALL">Phân loại sức khỏe: Tất cả</option>
              <option value="Loại I">Loại I (Tốt)</option>
              <option value="Loại II">Loại II (Trung bình)</option>
              <option value="Loại III">Loại III (Cần theo dõi)</option>
              <option value="Loại IV">Loại IV (Kém)</option>
            </select>

            <select
              className="form-select"
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value="ALERT">Chưa gửi email cảnh báo</option>
              <option value="SENT">Đã gửi email</option>
            </select>

            <button
              type="button"
              className="btn-reset"
              onClick={() => {
                setSearch('')
                setDepartment('ALL')
                setHealthType('ALL')
                setAlertFilter('ALL')
              }}
              title="Đặt lại bộ lọc"
            >
              <IconRefreshCw size={14} />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* Bảng dữ liệu chính */}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Mã CB</th>
                  <th style={{ width: '220px' }}>Họ và tên</th>
                  <th style={{ width: '190px' }}>Đơn vị công tác</th>
                  <th style={{ width: '90px' }}>Năm</th>
                  <th style={{ width: '120px' }}>Phân loại</th>
                  <th>Bệnh lý ghi nhận (Thêm linh hoạt)</th>
                  <th style={{ width: '160px' }}>Cảnh báo Email</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-cell">
                      <div className="empty-wrap">
                        <span className="empty-title">Không có dữ liệu hồ sơ nào</span>
                        <p className="empty-desc">
                          Bảng sẵn sàng nhận dữ liệu khi kết nối với API: <code>POST /api/v1/healthcheckuprecords/filter</code>
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((r) => (
                    <tr key={r.id}>
                      <td className="code-font">{r.id}</td>
                      <td>
                        <div className="cell-staff">
                          <strong>{r.fullname}</strong>
                          <span>{r.gender} • {r.birthYear}</span>
                        </div>
                      </td>
                      <td>{r.department}</td>
                      <td>{r.lastYear}</td>
                      <td>
                        <span className={`tag-badge grade-${r.classification}`}>
                          {r.classification}
                        </span>
                      </td>
                      <td>
                        <div className="cell-conditions">
                          {r.conditions.map((c, i) => (
                            <span key={i} className="chip-condition">{c}</span>
                          ))}
                          <button
                            type="button"
                            className="btn-inline-add"
                            onClick={() => {
                              setActiveModal(r)
                              setConditionInput('')
                            }}
                          >
                            + Thêm
                          </button>
                        </div>
                      </td>
                      <td>
                        {r.alertStatus === 'pending' ? (
                          <span className="alert-tag danger">⚠ Cần gửi email</span>
                        ) : r.alertStatus === 'sent' ? (
                          <span className="alert-tag success">✓ Đã gửi mail</span>
                        ) : (
                          <span className="alert-tag muted">Bình thường</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Xem chi tiết phiếu khám"
                          onClick={() => showToast(`Xem hồ sơ của ${r.fullname}`)}
                        >
                          <IconEye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Chân bảng: Phân trang & Thống kê */}
          <div className="table-pagination">
            <span className="pagination-text">
              Hiển thị <strong>{filteredList.length}</strong> / <strong>{totalCount}</strong> hồ sơ cán bộ
            </span>
            <div className="pagination-buttons">
              <button type="button" disabled className="btn-page">Trước</button>
              <button type="button" className="btn-page active">1</button>
              <button type="button" disabled className="btn-page">Sau</button>
            </div>
          </div>

        </div>

        {/* 4. MODAL NHẬP BỆNH LÝ MỚI (CHỈ MỞ KHI BẤM THAO TÁC) */}
        {activeModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-head">
                <span className="modal-title-text">Bổ sung bệnh lý vào hồ sơ</span>
                <button
                  type="button"
                  className="modal-x"
                  onClick={() => setActiveModal(null)}
                >
                  <IconClose size={16} />
                </button>
              </div>

              <div className="modal-content">
                <div className="modal-info-strip">
                  <span>Cán bộ: <strong>{activeModal.fullname}</strong> ({activeModal.id})</span>
                  <span>Đợt khám: <strong>Năm {year}</strong></span>
                </div>

                <div className="form-item">
                  <label className="field-label">Chọn nhanh bệnh lý phát hiện:</label>
                  <div className="select-chips">
                    {['Tiểu đường Type 2', 'Tăng huyết áp', 'Rối loạn mỡ máu', 'Gan nhiễm mỡ', 'Axit uric cao / Gout'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`chip-btn ${conditionInput === opt ? 'active' : ''}`}
                        onClick={() => setConditionInput(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-item">
                  <label htmlFor="input-cond" className="field-label">Hoặc gõ tên bệnh lý mới:</label>
                  <input
                    id="input-cond"
                    type="text"
                    className="text-input"
                    placeholder="Nhập bệnh lý hoặc kết luận của bác sĩ..."
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-foot">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setActiveModal(null)}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (!conditionInput.trim()) return
                    setRecords((prev) =>
                      prev.map((r) =>
                        r.id === activeModal.id
                          ? {
                              ...r,
                              conditions: [...r.conditions.filter((c) => c !== 'Bình thường'), conditionInput.trim()],
                              alertStatus: 'pending',
                              classification: 'Loại III',
                            }
                          : r
                      )
                    )
                    showToast(`Đã thêm ghi nhận "${conditionInput}" vào hồ sơ!`)
                    setActiveModal(null)
                  }}
                >
                  Lưu vào hồ sơ
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  )
}
