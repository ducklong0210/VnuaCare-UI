import { IconBell } from '../../components/ui/Icons.jsx'

/**
 * ==============================================================================
 * COMPONENT: Header (Thanh đầu trang trên cùng)
 * VAI TRÒ:
 *   - Hiển thị tiêu đề và mô tả của trang hiện tại
 *   - Chuông thông báo y tế
 *   - Trạng thái kết nối máy chủ API
 * ==============================================================================
 */
export default function Header({ activeTab = 'dashboard' }) {
  // Bản đồ tiêu đề theo tab đang chọn
  const tabTitles = {
    dashboard: {
      title: 'Bảng điều khiển',
      subtitle: 'Cổng quản lý hồ sơ sức khỏe cán bộ Học viện Nông nghiệp Việt Nam',
    },
    records: {
      title: 'Hồ sơ khám cán bộ',
      subtitle: 'Danh sách và lịch sử khám sức khỏe định kỳ theo năm',
    },
    staffs: {
      title: 'Quản lý nhân viên',
      subtitle: 'Danh mục cán bộ, giảng viên thuộc Học viện',
    },
    doctors: {
      title: 'Quản lý bác sĩ',
      subtitle: 'Danh sách bác sĩ và chuyên khoa y tế',
    },
    campaigns: {
      title: 'Đợt khám sức khỏe',
      subtitle: 'Các chiến dịch khám định kỳ hàng năm',
    },
    users: {
      title: 'Quản lý người dùng',
      subtitle: 'Tài khoản hệ thống và phân quyền vai trò',
    },
  }

  const currentMeta = tabTitles[activeTab] || tabTitles.dashboard

  return (
    <header className="admin-header">
      {/* Tiêu đề trang bên trái */}
      <div>
        <h1 className="header-title">{currentMeta.title}</h1>
        <p className="header-subtitle">{currentMeta.subtitle}</p>
      </div>

      {/* Các công cụ thao tác nhanh bên phải */}
      <div className="header-actions">
        {/* Nút Chuông thông báo y tế */}
        <button
          type="button"
          className="notification-bell-btn"
          title="Thông báo hệ thống y tế"
        >
          <IconBell size={18} />
        </button>

        {/* Trạng thái kết nối máy chủ */}
        <span className="status-badge">
          <span className="status-dot"></span>
          Đang kết nối: VNUA API
        </span>
      </div>
    </header>
  )
}
