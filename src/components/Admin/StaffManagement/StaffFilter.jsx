//
// Thanh tìm kiếm và bộ lọc danh sách Cán bộ, giảng viên
// Hỗ trợ tìm theo mã cán bộ/họ tên/chức vụ/SĐT, lọc theo Khoa/Phòng ban và làm mới bộ lọc
//

import { IconSearch, IconRefreshCw } from '../../../components/SupportAgent/Icons.jsx';

export default function StaffFilter({
    search,
    onSearchChange,
    selectedDepartment,
    onDepartmentChange,
    departments = [],
    onResetFilter,
}) {
    return (
        <div className="filter-toolbar">
            <div className="search-field">
                <IconSearch size={15} className="search-icon" />
                <input
                    type="text"
                    placeholder="Tìm mã CB, họ tên, chức vụ, SĐT..."
                    value={search}
                    onChange={onSearchChange}
                />
            </div>

            <select
                className="form-select"
                value={selectedDepartment}
                onChange={onDepartmentChange}
            >
                <option value="ALL">Tất cả đơn vị / Khoa</option>
                {departments.map((department) => (
                    <option key={department.departmentId} value={department.departmentId}>
                        {department.departmentName}
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
