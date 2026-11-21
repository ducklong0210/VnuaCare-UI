//
// Thanh tìm kiếm và bộ lọc danh sách Bác sĩ khám bệnh
// Hỗ trợ tìm theo mã bác sĩ/họ tên/bệnh viện, lọc theo chuyên khoa và nút làm mới bộ lọc
//

import { IconSearch, IconRefreshCw } from '../../SupportAgent/Icons.jsx';

export default function DoctorFilter({
  search,
  onSearchChange,
  selectedSpecialty,
  onSpecialtyChange,
  specialties = [],
  onResetFilter,
}) {
  return (
    <div className="filter-toolbar">
      <div className="search-field">
        <IconSearch size={15} className="search-icon" />
        <input
          type="text"
          placeholder="Tìm mã BS, họ tên, bệnh viện..."
          value={search}
          onChange={onSearchChange}
        />
      </div>

      <select
        className="form-select"
        value={selectedSpecialty}
        onChange={onSpecialtyChange}
      >
        <option value="ALL">Tất cả chuyên khoa</option>
        {specialties.map((specialty) => (
          <option key={specialty.specialtyId} value={specialty.specialtyId}>
            {specialty.specialtyName}
          </option>
        ))}
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
