//
// Thanh tìm kiếm và bộ lọc danh sách Nhật ký gửi Email
// Hỗ trợ tìm theo mã log / email / tiêu đề, lọc trạng thái, loại nghiệp vụ và khoảng ngày gửi
//

import { IconSearch, IconRefreshCw } from '../../SupportAgent/Icons.jsx';
import { EMAIL_SENT_STATUSES, EMAIL_REFERENCE_TYPES } from '../../../utils/index.js';

export default function EmailFilter({ search, onSearchChange, sentStatus, onStatusChange, referenceType, onReferenceTypeChange, fromDate, onFromDateChange, toDate, onToDateChange, onResetFilter }) {
  return (
    <div className="filter-toolbar">
      {/* Ô tìm kiếm theo mã nhật ký, email người nhận hoặc tiêu đề */}
      <div className="search-field">
        <IconSearch size={15} className="search-icon" />
        <input
          type="text"
          placeholder="Tìm mã log, email người nhận, tiêu đề..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Lọc theo trạng thái gửi */}
      <select className="form-select" value={sentStatus} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="ALL">Tất cả trạng thái</option>
        {EMAIL_SENT_STATUSES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      {/* Lọc theo loại nghiệp vụ */}
      <select className="form-select" value={referenceType} onChange={(e) => onReferenceTypeChange(e.target.value)}>
        <option value="ALL">Tất cả phân loại</option>
        {EMAIL_REFERENCE_TYPES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      {/* Lọc từ ngày */}
      <div className="email-date-group">
        <span className="email-date-label">Từ:</span>
        <input
          type="date"
          className="email-date-input"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
        />
      </div>

      {/* Lọc đến ngày */}
      <div className="email-date-group">
        <span className="email-date-label">Đến:</span>
        <input
          type="date"
          className="email-date-input"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
        />
      </div>

      {/* Nút đặt lại bộ lọc */}
      <button type="button" className="btn-reset" onClick={onResetFilter} title="Đặt lại toàn bộ bộ lọc">
        <IconRefreshCw size={14} />
        <span>Đặt lại</span>
      </button>
    </div>
  );
}
