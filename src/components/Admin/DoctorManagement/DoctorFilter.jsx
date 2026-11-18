// Component bộ lọc tìm kiếm và phân loại danh sách Bác sĩ
// Hỗ trợ tìm kiếm theo từ khóa (Mã BS, họ tên, bệnh viện) và lọc theo chuyên khoa y tế
// Cung cấp nút làm mới để đưa bộ lọc về trạng thái mặc định ban đầu

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
        {specialties.map((spec) => (
          <option key={spec.specialtyId} value={spec.specialtyId}>
            {spec.specialtyName}
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
