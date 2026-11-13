import {
  IconDashboard,
  IconUsers,
  IconStaffs,
  IconDoctors,
  IconCampaigns,
  IconRecords,
} from '../ui/Icons.jsx'

/**
 * Danh mục các chức năng quản trị trên thanh Menu bên trái (Sidebar Nav)
 * Tách riêng dữ liệu ra đây giúp Sidebar.jsx gọn gàng và dễ mở rộng sau này
 */
export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Bảng điều khiển', Icon: IconDashboard },
  { id: 'records', label: 'Hồ sơ khám cán bộ', Icon: IconRecords },
  { id: 'staffs', label: 'Quản lý nhân viên', Icon: IconStaffs },
  { id: 'doctors', label: 'Quản lý bác sĩ', Icon: IconDoctors },
  { id: 'campaigns', label: 'Đợt khám sức khỏe', Icon: IconCampaigns },
  { id: 'users', label: 'Quản lý người dùng', Icon: IconUsers },
]
