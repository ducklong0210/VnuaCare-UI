//
// Thanh tìm kiếm và bộ lọc danh sách Hồ sơ khám sức khỏe
// Hỗ trợ tìm theo mã SID/tên cán bộ và lọc theo Đợt khám, Khoa/Phòng, Xếp loại sức khỏe, Trạng thái
//

import { IconSearch, IconRefreshCw } from '../../SupportAgent/Icons.jsx';

export default function HealthRecordFilter({
  search,
  onSearchChange,
  selectedCampaign,
  onCampaignChange,
  selectedDepartment,
  onDepartmentChange,
  selectedClassification,
  onClassificationChange,
  selectedStatus,
  onStatusChange,
  campaigns = [],
  departments = [],
  classifications = [],
  statuses = [],
  onReset,
}) {
  return (
    <div className="filter-toolbar">
      {/* Ô tìm kiếm từ khóa */}
      <div className="search-field">
        <IconSearch size={15} className="search-icon" />
        <input
          type="text"
          placeholder="Tìm mã SID, tên/mã cán bộ, bác sĩ..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Lọc theo Đợt khám */}
      <select
        className="form-select"
        value={selectedCampaign}
        onChange={(e) => onCampaignChange(e.target.value)}
      >
        <option value="ALL">Tất cả đợt khám</option>
        {campaigns.map((campaign) => (
          <option key={campaign.campaignId} value={campaign.campaignId}>
            {campaign.campaignName} ({campaign.year})
          </option>
        ))}
      </select>

      {/* Lọc theo Khoa / Phòng */}
      <select
        className="form-select"
        value={selectedDepartment}
        onChange={(e) => onDepartmentChange(e.target.value)}
      >
        <option value="ALL">Tất cả khoa / phòng</option>
        {departments.map((department) => (
          <option key={department.departmentId} value={department.departmentId}>
            {department.departmentName}
          </option>
        ))}
      </select>

      {/* Lọc theo Xếp loại sức khỏe */}
      <select
        className="form-select"
        value={selectedClassification}
        onChange={(e) => onClassificationChange(e.target.value)}
      >
        <option value="ALL">Tất cả xếp loại SK</option>
        {classifications.map((item) => (
          <option key={item.classificationCode} value={item.classificationCode}>
            {item.classificationName}
          </option>
        ))}
      </select>

      {/* Lọc theo Trạng thái hồ sơ */}
      <select
        className="form-select"
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="ALL">Tất cả trạng thái</option>
        {statuses.map((item) => (
          <option key={item.statusCode} value={item.statusCode}>
            {item.statusName}
          </option>
        ))}
      </select>

      {/* Nút đặt lại bộ lọc */}
      <button type="button" className="btn-reset" onClick={onReset} title="Đặt lại bộ lọc">
        <IconRefreshCw size={14} />
        <span>Đặt lại</span>
      </button>
    </div>
  );
}
