import { useState } from 'react'
import MainLayout from '../../layouts/MainLayout.jsx'
import {
  IconSearch,
  IconPlus,
  IconDownload,
  IconCheck,
  IconClose,
  IconEdit,
  IconTrash,
  IconRefreshCw,
} from '../../components/ui/Icons.jsx'

export default function UserManagerPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('ALL')
  const [status, setStatus] = useState('ALL')

  const [activeModal, setActiveModal] = useState(false)
  const [toast, setToast] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    role: 'STAFF',
    password: '',
  })

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.fullname.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = role === 'ALL' || u.role === role
    const matchStatus = status === 'ALL' || u.status === status
    return matchSearch && matchRole && matchStatus
  })

  const handleAddUser = (e) => {
    e.preventDefault()
    if (!formData.username.trim() || !formData.fullname.trim() || !formData.password.trim()) {
      showToast('Vui lòng điền đủ Tên đăng nhập, Họ tên và Mật khẩu')
      return
    }

    const newUser = {
      id: Date.now().toString(),
      username: formData.username.trim(),
      fullname: formData.fullname.trim(),
      email: formData.email.trim() || '—',
      role: formData.role,
      status: 'ACTIVE',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    }

    setUsers([newUser, ...users])
    showToast(`Đã tạo tài khoản ${newUser.username} thành công!`)
    setActiveModal(false)
    setFormData({
      username: '',
      fullname: '',
      email: '',
      role: 'STAFF',
      password: '',
    })
  }

  const handleDeleteUser = (id, username) => {
    setUsers(users.filter((u) => u.id !== id))
    showToast(`Đã xóa tài khoản ${username}`)
  }

  return (
    <MainLayout activeTab="users">
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
            <h2 className="main-title">Quản lý người dùng hệ thống</h2>
            <span className="main-desc">
              Danh sách tài khoản và phân quyền truy cập hệ thống VnuaCare
            </span>
          </div>
          <div className="header-btn-group">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => showToast('Đang kết xuất danh sách người dùng...')}
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
              <span>Thêm tài khoản mới</span>
            </button>
          </div>
        </div>

        {/* 2. Metrics Strip */}
        <div className="metrics-strip">
          <div className="metric-box">
            <span className="metric-label">TỔNG TÀI KHOẢN</span>
            <div className="metric-num">{users.length}</div>
            <span className="metric-note">Người dùng trong hệ thống</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">QUẢN TRỊ VIÊN</span>
            <div className="metric-num">
              {users.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length}
            </div>
            <span className="metric-note">Quyền Admin & Quản trị</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">CÁN BỘ / BÁC SĨ</span>
            <div className="metric-num">
              {users.filter((u) => u.role === 'DOCTOR' || u.role === 'STAFF').length}
            </div>
            <span className="metric-note">Thao tác nghiệp vụ khám</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">TRẠNG THÁI HỆ THỐNG</span>
            <div className="metric-status-row">
              <span className="online-dot"></span>
              <span className="status-text">Sẵn sàng nhận dữ liệu API</span>
            </div>
            <span className="metric-note">/api/v1/users/filter</span>
          </div>
        </div>

        {/* 3. Filter Toolbar & Table */}
        <div className="panel-card">
          <div className="filter-toolbar">
            <div className="search-field">
              <IconSearch size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm tài khoản, họ tên, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="STAFF">STAFF</option>
            </select>

            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
            </select>

            <button
              type="button"
              className="btn-reset"
              onClick={() => {
                setSearch('')
                setRole('ALL')
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
                  <th style={{ width: '130px' }}>Tên đăng nhập</th>
                  <th style={{ width: '220px' }}>Họ và tên</th>
                  <th style={{ width: '200px' }}>Email</th>
                  <th style={{ width: '130px' }}>Vai trò</th>
                  <th style={{ width: '120px' }}>Trạng thái</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      <div className="empty-wrap">
                        <span className="empty-title">Không có dữ liệu người dùng nào</span>
                        <p className="empty-desc">
                          Bảng sẵn sàng nhận dữ liệu khi kết nối với API: <code>POST /api/v1/users/filter</code>
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="code-font">{u.username}</td>
                      <td>
                        <strong>{u.fullname}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className="tag-badge">{u.role}</span>
                      </td>
                      <td>
                        {u.status === 'ACTIVE' ? (
                          <span className="alert-tag success">Hoạt động</span>
                        ) : (
                          <span className="alert-tag danger">Đã khóa</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Sửa thông tin"
                          onClick={() => showToast(`Chỉnh sửa ${u.username}`)}
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-danger"
                          title="Xóa"
                          onClick={() => handleDeleteUser(u.id, u.username)}
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
              Hiển thị <strong>{filteredUsers.length}</strong> / <strong>{users.length}</strong> người dùng
            </span>
            <div className="pagination-buttons">
              <button type="button" disabled className="btn-page">Trước</button>
              <button type="button" className="btn-page active">1</button>
              <button type="button" disabled className="btn-page">Sau</button>
            </div>
          </div>
        </div>

        {/* 4. Modal Thêm Người dùng Mới */}
        {activeModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-head">
                <span className="modal-title-text">Thêm tài khoản người dùng</span>
                <button
                  type="button"
                  className="modal-x"
                  onClick={() => setActiveModal(false)}
                >
                  <IconClose size={16} />
                </button>
              </div>

              <form onSubmit={handleAddUser}>
                <div className="modal-content">
                  <div className="form-item">
                    <label className="field-label">Tên đăng nhập *</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Ví dụ: nva_staff"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Họ và tên *</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      required
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

                  <div className="form-item">
                    <label className="field-label">Vai trò</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="STAFF">STAFF (Cán bộ)</option>
                      <option value="DOCTOR">DOCTOR (Bác sĩ)</option>
                      <option value="ADMIN">ADMIN (Quản trị)</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Quản trị cấp cao)</option>
                    </select>
                  </div>

                  <div className="form-item">
                    <label className="field-label">Mật khẩu ban đầu *</label>
                    <input
                      type="password"
                      className="text-input"
                      placeholder="Nhập mật khẩu..."
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
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
                    Tạo tài khoản
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
