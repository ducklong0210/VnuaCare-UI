import { useState } from 'react'
import MainLayout from '../../layouts/MainLayout.jsx'
import {
  IconRecords,
  IconAlertTriangle,
  IconMail,
  IconPlus,
  IconRefreshCw,
  IconSearch,
  IconDownload,
  IconEye,
  IconCheck,
  IconClose,
  IconTag,
} from '../../components/ui/Icons.jsx'
import './DashboardPage.css'

/**
 * ==============================================================================
 * COMPONENT: DashboardPage
 * VAI TRÒ: Trang chủ quản lý hồ sơ sức khỏe cán bộ VNUA
 * TÍNH NĂNG ĐẦY ĐỦ:
 *   1. Tìm kiếm cán bộ & Lọc theo Khoa/Viện, Năm khám
 *   2. Nút Xuất file Excel báo cáo y tế
 *   3. Danh sách hồ sơ mẫu thực tế (có hiển thị Tiểu đường, Huyết áp...)
 *   4. Nút bấm Gửi email cảnh báo trực tiếp
 *   5. Popup (Modal) thêm thông tin bệnh lý mới linh hoạt cho cán bộ
 * ==============================================================================
 */
export default function DashboardPage() {
  // Danh sách hồ sơ cán bộ (Khởi tạo rỗng, sẵn sàng nạp dữ liệu từ API thật)
  const [records, setRecords] = useState([])

  // State tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [activeTab, setActiveTab] = useState('all')

  // State quản lý Modal thêm bệnh lý mới
  const [selectedRecordForCondition, setSelectedRecordForCondition] = useState(null)
  const [newConditionName, setNewConditionName] = useState('Tiểu đường Type 2')
  const [successToast, setSuccessToast] = useState('')

  // Hàm xử lý gửi email cảnh báo cho cán bộ
  const handleSendEmail = (recordId, staffName) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, alertStatus: 'sent' } : r))
    )
    showToast(`Đã gửi email cảnh báo sức khỏe thành công đến cán bộ: ${staffName}`)
  }

  // Hàm mở popup để thêm bệnh lý mới
  const handleOpenAddCondition = (record) => {
    setSelectedRecordForCondition(record)
    setNewConditionName('Tiểu đường Type 2')
  }

  // Hàm lưu bệnh lý mới vào hồ sơ của cán bộ
  const handleSaveCondition = () => {
    if (!selectedRecordForCondition || !newConditionName.trim()) return

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === selectedRecordForCondition.id) {
          // Xóa chữ "Bình thường" nếu có, và thêm bệnh lý mới vào
          const filtered = r.conditions.filter((c) => c !== 'Bình thường')
          if (!filtered.includes(newConditionName.trim())) {
            filtered.push(newConditionName.trim())
          }
          return {
            ...r,
            conditions: filtered,
            alertStatus: 'pending', // Phát hiện bệnh lý mới -> kích hoạt cảnh báo
            classification: 'Loại III',
          }
        }
        return r
      })
    )

    showToast(`Đã bổ sung ghi nhận "${newConditionName}" vào hồ sơ năm 2026 của ${selectedRecordForCondition.fullname}!`)
    setSelectedRecordForCondition(null)
  }

  // Hiển thị thông báo góc màn hình
  const showToast = (msg) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(''), 4000)
  }

  // Lọc danh sách theo ô tìm kiếm, Khoa/Viện và Tab
  const filteredRecords = records.filter((r) => {
    const matchSearch =
      r.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchDept = selectedDept === 'ALL' || r.department === selectedDept

    if (activeTab === 'warning') {
      return matchSearch && matchDept && r.alertStatus === 'pending'
    }
    return matchSearch && matchDept
  })

  return (
    <MainLayout activeTab="dashboard">
      <div className="health-dashboard">

        {/* Thông báo thao tác thành công (Toast) */}
        {successToast && (
          <div className="toast-notification">
            <IconCheck size={18} />
            <span>{successToast}</span>
          </div>
        )}

        {/* 1. DÃY 3 CARD TỔNG QUAN HÀNH ĐỘNG CHÍNH */}
        <section className="dashboard-summary-cards">
          {/* Card 1: Quản lý hồ sơ & Đợt khám hàng năm */}
          <div className="summary-card">
            <div className="card-badge primary">
              <IconRecords size={16} />
              <span>HỒ SƠ CÁN BỘ</span>
            </div>
            <div className="summary-content">
              <h3>Hồ sơ & Đợt khám hàng năm</h3>
              <p>Theo dõi lịch sử khám định kỳ các năm: 2024, 2025, 2026</p>
            </div>
            <div className="card-actions">
              <button type="button" className="action-pill-btn primary">
                <IconPlus size={15} />
                <span>Thêm hồ sơ mới</span>
              </button>
              <button type="button" className="action-pill-btn outline">
                <IconRefreshCw size={15} />
                <span>Đợt khám 2026</span>
              </button>
            </div>
          </div>

          {/* Card 2: Cảnh báo bất thường & Gửi Email */}
          <div className="summary-card warning-border">
            <div className="card-badge warning">
              <IconAlertTriangle size={16} />
              <span>CẢNH BÁO BẤT THƯỜNG</span>
            </div>
            <div className="summary-content">
              <h3>Chỉ số bất thường & Gửi Email</h3>
              <p>Phát hiện bệnh lý mới và gửi email khuyến nghị đến cán bộ</p>
            </div>
            <div className="card-actions">
              <button
                type="button"
                className="action-pill-btn warning"
                onClick={() => setActiveTab('warning')}
              >
                <IconMail size={15} />
                <span>Xem ca cần gửi email</span>
              </button>
            </div>
          </div>

          {/* Card 3: Cơ chế thêm thông tin bệnh lý linh hoạt */}
          <div className="summary-card info-border">
            <div className="card-badge info">
              <IconTag size={16} />
              <span>THÔNG TIN MỞ RỘNG</span>
            </div>
            <div className="summary-content">
              <h3>Ghi nhận bệnh lý linh hoạt</h3>
              <p>Dễ dàng bổ sung bệnh lý mới: Tiểu đường, Tim mạch, Mỡ máu...</p>
            </div>
            <div className="card-actions">
              <button
                type="button"
                className="action-pill-btn outline"
                onClick={() => {
                  if (records.length > 0) {
                    handleOpenAddCondition(records[0])
                  } else {
                    showToast('Bảng chưa có hồ sơ cán bộ nào. Cần nạp dữ liệu từ API hoặc tạo hồ sơ trước.')
                  }
                }}
              >
                <IconPlus size={15} />
                <span>Thêm loại bệnh lý</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. KHU VỰC BẢNG QUẢN LÝ TRUNG TÂM VỚI THANH TÌM KIẾM & BỘ LỌC */}
        <section className="records-table-container">
          
          {/* Thanh công cụ tìm kiếm, lọc theo Khoa và Xuất Excel */}
          <div className="table-toolbar">
            <div className="toolbar-search-wrap">
              <div className="search-input-box">
                <IconSearch size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm theo họ tên hoặc mã cán bộ (VD: CB0142, Bình...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Dropdown lọc theo Khoa / Phòng ban */}
              <select
                className="filter-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="ALL">Tất cả Khoa / Đơn vị VNUA</option>
                <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
                <option value="Khoa Thú y">Khoa Thú y</option>
                <option value="Khoa Nông học">Khoa Nông học</option>
                <option value="Khoa Kinh tế & PTNT">Khoa Kinh tế & PTNT</option>
              </select>

              {/* Dropdown chọn năm khám */}
              <select className="filter-select year-select" defaultValue="2026">
                <option value="2026">Năm 2026 (Hiện tại)</option>
                <option value="2025">Năm 2025</option>
                <option value="2024">Năm 2024</option>
              </select>
            </div>

            {/* Nút Xuất file Excel báo cáo */}
            <div className="toolbar-actions">
              <button
                type="button"
                className="btn-export-excel"
                onClick={() => showToast('Đang xuất danh sách hồ sơ cán bộ năm 2026 ra file Excel...')}
              >
                <IconDownload size={16} />
                <span>Xuất Excel</span>
              </button>
            </div>
          </div>

          {/* Tab lọc trạng thái */}
          <div className="table-filter-tabs">
            <button
              type="button"
              className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Tất cả cán bộ ({records.length})
            </button>
            <button
              type="button"
              className={`filter-tab ${activeTab === 'warning' ? 'active' : ''}`}
              onClick={() => setActiveTab('warning')}
            >
              Cần gửi email cảnh báo ({records.filter((r) => r.alertStatus === 'pending').length})
            </button>
          </div>

          {/* Bảng dữ liệu hồ sơ cán bộ */}
          <div className="table-responsive">
            <table className="medical-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Mã CB</th>
                  <th style={{ width: '220px' }}>Họ và tên cán bộ</th>
                  <th style={{ width: '180px' }}>Khoa / Phòng ban</th>
                  <th style={{ width: '100px' }}>Năm khám</th>
                  <th style={{ width: '120px' }}>Phân loại</th>
                  <th>Bệnh lý ghi nhận (Có thể thêm mới)</th>
                  <th style={{ width: '160px' }}>Trạng thái cảnh báo</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '52px 20px', color: '#64748b' }}>
                      <div className="empty-state-box">
                        <IconRecords size={36} className="empty-icon" />
                        <h4>Chưa có dữ liệu hồ sơ cán bộ</h4>
                        <p>
                          Bảng sẵn sàng hiển thị dữ liệu từ các API backend:
                          <code>POST /api/v1/staffs/filter</code> và <code>POST /api/v1/healthcheckuprecords/filter</code>
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id}>
                      {/* Mã cán bộ */}
                      <td>
                        <span className="code-badge">{r.id}</span>
                      </td>

                      {/* Họ tên */}
                      <td>
                        <div className="staff-meta">
                          <strong className="staff-name">{r.fullname}</strong>
                          <span className="staff-sub">{r.gender} • Sinh năm {r.birthYear}</span>
                        </div>
                      </td>

                      {/* Khoa phòng */}
                      <td>
                        <span className="dept-text">{r.department}</span>
                      </td>

                      {/* Năm khám gần nhất */}
                      <td>
                        <span className="year-badge">{r.lastYear}</span>
                      </td>

                      {/* Phân loại sức khỏe theo Bộ Y tế */}
                      <td>
                        <span className={`classification-badge ${r.classification === 'Loại I' ? 'grade-1' : r.classification === 'Loại II' ? 'grade-2' : 'grade-3'}`}>
                          {r.classification}
                        </span>
                      </td>

                      {/* Cột bệnh lý linh hoạt (Có nút + Thêm bệnh lý mới trực tiếp) */}
                      <td>
                        <div className="conditions-wrap">
                          {r.conditions.map((cond, idx) => (
                            <span
                              key={idx}
                              className={`condition-chip ${cond.includes('Tiểu đường') ? 'chip-red' : cond.includes('huyết áp') ? 'chip-orange' : cond.includes('Mỡ máu') ? 'chip-purple' : 'chip-neutral'}`}
                            >
                              {cond}
                            </span>
                          ))}
                          {/* Nút bấm để thêm bệnh lý mới cho cán bộ này */}
                          <button
                            type="button"
                            className="btn-add-condition-inline"
                            title="Thêm bệnh lý mới phát sinh cho cán bộ này"
                            onClick={() => handleOpenAddCondition(r)}
                          >
                            + Thêm
                          </button>
                        </div>
                      </td>

                      {/* Cảnh báo Email */}
                      <td>
                        {r.alertStatus === 'pending' && (
                          <div className="alert-action-group">
                            <span className="status-badge-red">⚠ Chưa gửi mail</span>
                            <button
                              type="button"
                              className="btn-send-mail-now"
                              onClick={() => handleSendEmail(r.id, r.fullname)}
                              title="Gửi email cảnh báo khuyến nghị y tế ngay"
                            >
                              Gửi mail
                            </button>
                          </div>
                        )}
                        {r.alertStatus === 'sent' && (
                          <span className="status-badge-green">
                            <IconCheck size={14} /> Đã gửi email
                          </span>
                        )}
                        {r.alertStatus === 'none' && (
                          <span className="status-badge-gray">Bình thường</span>
                        )}
                      </td>

                      {/* Nút xem chi tiết hồ sơ */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-view-detail"
                          title="Xem toàn bộ phiếu khám sức khỏe"
                          onClick={() => showToast(`Mở chi tiết phiếu khám của ${r.fullname}`)}
                        >
                          <IconEye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. MODAL POPUP: THÊM THÔNG TIN BỆNH LÝ MỚI LINH HOẠT */}
        {selectedRecordForCondition && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Ghi nhận bệnh lý mới</h3>
                  <span className="modal-subtitle">
                    Hồ sơ: <strong>{selectedRecordForCondition.fullname}</strong> ({selectedRecordForCondition.id})
                  </span>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedRecordForCondition(null)}
                >
                  <IconClose size={18} />
                </button>
              </div>

              <div className="modal-body">
                <p className="modal-instruction">
                  Chọn hoặc nhập tình trạng sức khỏe mới phát hiện trong đợt khám năm 2026. Thông tin này sẽ được gắn vào hồ sơ và tự động đề xuất gửi email cảnh báo:
                </p>

                <div className="form-group-field">
                  <label>Chọn bệnh lý phổ biến:</label>
                  <div className="quick-condition-pills">
                    {['Tiểu đường Type 2', 'Tăng huyết áp', 'Rối loạn lipid máu', 'Gan nhiễm mỡ', 'Axit uric cao / Gout'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`condition-select-pill ${newConditionName === item ? 'selected' : ''}`}
                        onClick={() => setNewConditionName(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group-field">
                  <label htmlFor="custom-condition">Hoặc nhập tên bệnh lý / ghi chú khác:</label>
                  <input
                    id="custom-condition"
                    type="text"
                    className="modal-input"
                    value={newConditionName}
                    onChange={(e) => setNewConditionName(e.target.value)}
                    placeholder="VD: Thoái hóa đốt sống cổ, Viêm dạ dày..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setSelectedRecordForCondition(null)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn-modal-save"
                  onClick={handleSaveCondition}
                >
                  Lưu vào hồ sơ năm 2026
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  )
}
