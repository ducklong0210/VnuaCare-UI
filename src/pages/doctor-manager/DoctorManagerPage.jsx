import MainLayout from '../../layouts/MainLayout.jsx'

export default function DoctorManagerPage() {
  return (
    <MainLayout activeTab="doctors">
      <div className="admin-page-container">
        <div className="page-header-row">
          <div>
            <h2 className="main-title">Quản lý bác sĩ</h2>
            <span className="main-desc">Danh sách đội ngũ bác sĩ phụ trách khám sức khỏe</span>
          </div>
        </div>

        <div className="panel-card">
          <div className="empty-cell">
            <div className="empty-wrap">
              <span className="empty-title">Chưa có dữ liệu bác sĩ</span>
              <p className="empty-desc">Bảng sẽ hiển thị dữ liệu khi kết nối với API</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
