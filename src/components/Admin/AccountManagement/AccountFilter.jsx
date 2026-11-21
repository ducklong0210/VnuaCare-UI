//
// Thanh tìm kiếm và bộ lọc danh sách Tài khoản người dùng
// Hỗ trợ tìm theo tên đăng nhập/email, lọc theo vai trò và làm mới bộ lọc về mặc định
//

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
