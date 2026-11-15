import { useEffect, useState } from 'react'
import MainLayout from '../../layouts/MainLayout.jsx'
import { getUserFilterApi } from '../../features/user-manager/api/userApi.js'
import { IconSearch, IconRefreshCw } from '../../components/ui/Icons.jsx'

export default function UserManagerPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('ALL')

  useEffect(() => {
    let isCancelled = false

    const loadUsers = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getUserFilterApi({
          keyword: search.trim(),
          role: role === 'ALL' ? '' : role,
        })
        if (!isCancelled) {
          setUsers(data || [])
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

    loadUsers()

    return () => {
      isCancelled = true
    }
  }, [search, role])

  const handleResetFilter = () => {
    setSearch('')
    setRole('ALL')
  }

  return (
    <MainLayout activeTab="users">
      <div className="admin-page-container">
        
        {/* Tiêu đề trang */}
        <div className="page-header-row">
          <div>
            <h2 className="main-title">Quản lý người dùng</h2>
            <span className="main-desc">Danh sách tài khoản và phân quyền hệ thống</span>
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
                placeholder="Tìm tên đăng nhập, họ tên, email..."
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

          {/* Bảng danh sách người dùng */}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '140px' }}>Tên đăng nhập</th>
                  <th style={{ width: '220px' }}>Họ và tên</th>
                  <th style={{ width: '220px' }}>Email</th>
                  <th style={{ width: '140px' }}>Vai trò</th>
                  <th style={{ width: '120px' }}>Trạng thái</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
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
                        <p className="empty-desc">
                          Sẵn sàng nạp dữ liệu khi gọi API: <code>POST /api/v1/users/filter</code>
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && users.length > 0 && (
                  users.map((u) => (
                    <tr key={u.id || u.username}>
                      <td className="code-font">{u.username}</td>
                      <td><strong>{u.fullname || u.fullName}</strong></td>
                      <td>{u.email || '—'}</td>
                      <td><span className="tag-badge">{u.role}</span></td>
                      <td><span className="alert-tag success">{u.status || 'ACTIVE'}</span></td>
                      <td style={{ textAlign: 'center' }}>...</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </MainLayout>
  )
}
