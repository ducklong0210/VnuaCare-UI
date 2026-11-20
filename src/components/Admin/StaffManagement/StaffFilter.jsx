// Component bộ lọc tìm kiếm và phân loại danh sách Cán bộ, nhân viên
// Hỗ trợ tìm kiếm theo từ khóa (Mã CB, họ tên, chức vụ, SĐT) và lọc theo Khoa / Phòng ban
// Cung cấp nút làm mới để đưa bộ lọc về trạng thái mặc định ban đầu

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

export function FilterDepartment({
    selectedDepartment,
    onDepartmentChange,
    departments = [],
}) {
    return (
        <>
            <select
                className="form-select"
                value={selectedDepartment}
                onChange={onDepartmentChange}>
                <option value="ALL">Tất cả đơn vị / Khoa</option>
                {departments.map((department) => (
                    <option key={department.departmentId} value={department.departmentId}>
                        {department.departmentName}
                    </option>
                ))}
            </select>
        </>
    );
}
