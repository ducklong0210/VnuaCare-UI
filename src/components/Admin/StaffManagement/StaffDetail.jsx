// Component Modal biểu mẫu Thêm mới / Cập nhật hồ sơ Cán bộ, nhân viên
// Hỗ trợ nhập liệu thông tin cá nhân, chức vụ, học vị, đơn vị công tác và chọn ảnh đại diện
// Cung cấp chức năng liên kết với tài khoản người dùng tương ứng (Role: STAFF)

import { IconClose } from '../../../components/SupportAgent/Icons.jsx';
import { AVATAR_PRESETS, ModelMode } from '../../../utils/index.js';

export default function StaffDetail({
    modalMode,
    formData,
    onFormChange,
    onSubmit,
    onClose,
    submitting = false,
    modalError = '',
    departments = [],
    usersList = [],
    staffs = [],
}) {
    if (!modalMode) return null;

    let submitButtonText = 'Lưu thay đổi';
    if (submitting) {
        submitButtonText = 'Đang xử lý...';
    } else if (modalMode === ModelMode.CREATE) {
        submitButtonText = 'Thêm cán bộ';
    }

    return (
        <div className="modal-backdrop">
            <div className="modal-card staff-modal-card">
                <div className="modal-head">
                    <span className="modal-title-text">
                        {modalMode === ModelMode.CREATE
                            ? 'Thêm mới cán bộ / nhân viên'
                            : 'Cập nhật thông tin cán bộ'}
                    </span>
                    <button type="button" className="modal-x" onClick={onClose}>
                        <IconClose size={16} />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="modal-content staff-modal-body">
                        {modalError && (
                            <div className="alert-tag danger staff-modal-alert">
                                {modalError}
                            </div>
                        )}

                        <div className="staff-form-grid">
                            <div className="form-item">
                                <label className="field-label">Mã cán bộ *</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Ví dụ: CB001"
                                    value={formData.staffCode}
                                    onChange={(e) => onFormChange('staffCode', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-item">
                                <label className="field-label">Họ và tên *</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    value={formData.fullName}
                                    onChange={(e) => onFormChange('fullName', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="staff-form-grid">
                            <div className="form-item">
                                <label className="field-label">Giới tính</label>
                                <select
                                    className="form-select"
                                    value={formData.gender}
                                    onChange={(e) => onFormChange('gender', e.target.value)}
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>

                            <div className="form-item">
                                <label className="field-label">Ngày sinh</label>
                                <input
                                    type="date"
                                    className="text-input"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => onFormChange('dateOfBirth', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-item">
                            <label className="field-label">Khoa / Phòng ban công tác *</label>
                            <select
                                className="form-select"
                                value={formData.departmentId}
                                onChange={(e) => onFormChange('departmentId', e.target.value)}
                                required
                            >
                                <option value="">-- Chọn Khoa / Phòng ban --</option>
                                {departments.map((d) => (
                                    <option key={d.departmentId} value={d.departmentId}>
                                        {d.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="staff-form-grid">
                            <div className="form-item">
                                <label className="field-label">Chức vụ</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Ví dụ: Giảng viên, Trưởng bộ môn..."
                                    value={formData.jobTitle}
                                    onChange={(e) => onFormChange('jobTitle', e.target.value)}
                                />
                            </div>

                            <div className="form-item">
                                <label className="field-label">Học hàm / Học vị</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Ví dụ: PGS. TS, ThS..."
                                    value={formData.academicTitle}
                                    onChange={(e) => onFormChange('academicTitle', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="staff-form-grid">
                            <div className="form-item">
                                <label className="field-label">Số điện thoại</label>
                                <input
                                    type="tel"
                                    className="text-input"
                                    placeholder="Ví dụ: 0912345678"
                                    value={formData.phoneNumber}
                                    onChange={(e) => onFormChange('phoneNumber', e.target.value)}
                                />
                            </div>

                            <div className="form-item">
                                <label className="field-label">Email</label>
                                <input
                                    type="email"
                                    className="text-input"
                                    placeholder="Ví dụ: nva@vnua.edu.vn"
                                    value={formData.email}
                                    onChange={(e) => onFormChange('email', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-item">
                            <label className="field-label">Địa chỉ</label>
                            <input
                                type="text"
                                className="text-input"
                                placeholder="Nhập địa chỉ cư trú..."
                                value={formData.adrress}
                                onChange={(e) => onFormChange('adrress', e.target.value)}
                            />
                        </div>

                        {/* Khu vực chọn ảnh đại diện */}
                        <div className="form-item staff-avatar-picker-section">
                            <div className="staff-avatar-picker-header">
                                <label className="field-label staff-avatar-picker-title">
                                    Ảnh đại diện cán bộ
                                </label>
                                {formData.avatarUrl && (
                                    <button
                                        type="button"
                                        className="staff-avatar-clear-btn"
                                        onClick={() => onFormChange('avatarUrl', '')}
                                    >
                                        Bỏ chọn ảnh
                                    </button>
                                )}
                            </div>

                            <div className="staff-avatar-picker-body">
                                <div className="staff-avatar-preview-box">
                                    {formData.avatarUrl ? (
                                        <img
                                            src={formData.avatarUrl}
                                            alt="Preview"
                                            className="staff-avatar-preview-img"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <span className="staff-avatar-preview-fallback">
                                            {formData.fullName
                                                ? formData.fullName.trim().charAt(0).toUpperCase()
                                                : '?'}
                                        </span>
                                    )}
                                </div>

                                <div className="staff-avatar-presets-col">
                                    <div className="staff-avatar-presets-title">
                                        Chọn nhanh mẫu avatar sẵn có:
                                    </div>
                                    <div className="staff-avatar-presets-grid">
                                        {AVATAR_PRESETS.map((preset) => {
                                            const isSelected = formData.avatarUrl === preset.url;
                                            return (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    title={preset.label}
                                                    className={`staff-avatar-preset-btn ${isSelected ? 'selected' : ''}`}
                                                    onClick={() =>
                                                        onFormChange(
                                                            'avatarUrl',
                                                            isSelected ? '' : preset.url
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={preset.url}
                                                        alt={preset.label}
                                                        className="staff-avatar-preset-thumb"
                                                    />
                                                    {isSelected && (
                                                        <span className="staff-avatar-check-badge">✓</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <input
                                type="text"
                                className="text-input staff-avatar-custom-input"
                                placeholder="Hoặc nhập link ảnh đại diện tùy chỉnh (https://...)"
                                value={formData.avatarUrl}
                                onChange={(e) => onFormChange('avatarUrl', e.target.value)}
                            />
                        </div>

                        {/* Liên kết tài khoản User khi tạo mới */}
                        {modalMode === ModelMode.CREATE && (
                            <div className="staff-user-link-section">
                                <span className="staff-user-link-title">
                                    LIÊN KẾT TÀI KHOẢN NGƯỜI DÙNG (ROLE: STAFF) *
                                </span>
                                <div className="form-item">
                                    <label className="field-label">Chọn tài khoản người dùng *</label>
                                    <select
                                        className="form-select"
                                        value={formData.userId}
                                        onChange={(e) => {
                                            const selectedId = Number(e.target.value) || '';
                                            const selectedUser = usersList.find((u) => u.userId === selectedId);
                                            onFormChange('userId', selectedId);
                                            if (selectedUser?.email) {
                                                onFormChange('email', selectedUser.email);
                                            }
                                        }}
                                        required
                                    >
                                        <option value="">-- Chọn tài khoản người dùng đã tạo --</option>
                                        {usersList.map((u) => {
                                            const isAssigned = staffs.some((s) => s.userId === u.userId);
                                            return (
                                                <option
                                                    key={u.userId}
                                                    value={u.userId}
                                                    disabled={isAssigned}
                                                >
                                                    {u.username} {u.email ? `(${u.email})` : ''}{' '}
                                                    {isAssigned ? '- [Đã gắn hồ sơ]' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <span className="staff-user-warning">
                                        * Nếu chưa có tài khoản, vui lòng vào trang &quot;Quản lý người dùng&quot; tạo tài khoản với vai trò Cán bộ (STAFF) trước.
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-foot">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitButtonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
