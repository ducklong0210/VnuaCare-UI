import MainLayout from '../../layouts/MainLayout.jsx'

export default function ProfileManagerPage() {
  return (
    <MainLayout activeTab="records">
      <div className="admin-page-container">
        <div className="page-header-row">
          <div>
            <h2 className="main-title">Hồ sơ khám cán bộ</h2>
            <span className="main-desc">Quản lý và theo dõi hồ sơ khám sức khỏe định kỳ</span>
          </div>
        </div>

        <div className="panel-card">
          <div className="empty-cell">
            <div className="empty-wrap">
              <span className="empty-title">Chưa có dữ liệu hồ sơ khám</span>
              <p className="empty-desc">Bảng sẽ hiển thị dữ liệu khi kết nối với API</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
