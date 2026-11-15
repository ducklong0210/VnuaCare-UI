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
          textSearch: search.trim(),
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
                placeholder="Tìm tên đăng nhập, email..."
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
              <option value="SUPER_ADMIN">SUPER ADMIN</option>
              <option value="HEALTH_ADMIN">HEALTH ADMIN</option>
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
                          Hệ thống chưa tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && users.length > 0 && (
                  users.map((u) => (
                    <tr key={u.userId || u.username}>
                      <td className="code-font">{u.username}</td>
                      <td>{u.email || '—'}</td>
                      <td>
                        <span className="tag-badge">{u.role}</span>
                      </td>
                      <td>
                        {u.isActive ? (
                          <span className="alert-tag success">Hoạt động</span>
                        ) : (
                          <span className="alert-tag danger">Đã khóa</span>
                        )}
                      </td>
                      <td>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
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
