import MainLayout from '../../layouts/MainLayout.jsx'

export default function UserManagerPage() {
  return (
    <MainLayout activeTab="users">
      <div className="admin-page-container">
        <div className="page-header-row">
          <div>
            <h2 className="main-title">Quản lý người dùng</h2>
            <span className="main-desc">Danh sách tài khoản và phân quyền hệ thống</span>
          </div>
        </div>

        <div className="panel-card">
          <div className="empty-cell">
            <div className="empty-wrap">
              <span className="empty-title">Chưa có dữ liệu người dùng</span>
              <p className="empty-desc">Bảng sẽ hiển thị dữ liệu khi kết nối với API</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
