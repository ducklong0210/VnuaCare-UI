// Component bộ lọc tìm kiếm và phân loại danh sách Tài khoản người dùng
// Hỗ trợ tìm kiếm theo từ khóa (tên đăng nhập, email) và phân loại theo vai trò (Role)
// Cung cấp nút làm mới để đưa bộ lọc về trạng thái mặc định ban đầu

import { IconSearch, IconRefreshCw } from '../../SupportAgent/Icons.jsx';

export default function AccountFilter({
  search,
  onSearchChange,
  role,
  onRoleChange,
  onResetFilter,
}) {
  return (
    <div className="filter-toolbar">
      <div className="search-field">
        <IconSearch size={15} className="search-icon" />
        <input
          type="text"
          placeholder="Tìm tên đăng nhập, email..."
          value={search}
          onChange={onSearchChange}
        />
      </div>

      <select
        className="form-select"
        value={role}
        onChange={onRoleChange}
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
        onClick={onResetFilter}
        title="Đặt lại bộ lọc"
      >
        <IconRefreshCw size={14} />
        <span>Đặt lại</span>
      </button>
    </div>
  );
}
