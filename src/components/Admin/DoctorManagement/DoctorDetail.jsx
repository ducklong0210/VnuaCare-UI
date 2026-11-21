//
// Modal biểu mẫu Thêm mới và Cập nhật thông tin hồ sơ Bác sĩ
// Cho phép nhập mã bác sĩ, chuyên khoa, chứng chỉ hành nghề, nơi công tác và liên kết tài khoản DOCTOR
//

import { IconClose } from '../../SupportAgent/Icons.jsx';
import { ModelMode } from '../../../utils/index.js'
export default function DoctorDetail({
    modalMode,
    formData,
    onFormChange,
    onSubmit,
    onClose,
    submitting = false,
    modalError = '',
    specialties = [],
    usersList = [],
    doctors = [],
}) {
    if (!modalMode) return null;

    let submitButtonText = 'Lưu thay đổi';
    if (submitting) {
        submitButtonText = 'Đang xử lý...';
    } else if (modalMode === ModelMode.CREATE) {
        submitButtonText = 'Thêm bác sĩ';
    }

    return (
        <div className="modal-backdrop">
            <div className="modal-card doctor-modal-card">
                <div className="modal-head">
                    <span className="modal-title-text">
                        {modalMode === ModelMode.CREATE ? 'Thêm mới bác sĩ' : 'Cập nhật thông tin bác sĩ'}
                    </span>
                    <button type="button" className="modal-x" onClick={onClose}>
                        <IconClose size={16} />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="modal-content doctor-modal-body">
                        {modalError && (
                            <div className="alert-tag danger doctor-modal-alert">
                                {modalError}
                            </div>
                        )}

                        <div className="doctor-form-grid">
                            <div className="form-item">
                                <label className="field-label">Mã bác sĩ *</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Ví dụ: BS001"
                                    value={formData.doctorCode}
                                    onChange={(e) => onFormChange('doctorCode', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-item">
                                <label className="field-label">Họ và tên bác sĩ *</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Ví dụ: BS. Nguyễn Văn B"
                                    value={formData.fullName}
                                    onChange={(e) => onFormChange('fullName', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="doctor-form-grid">
                            <div className="form-item">
                                <label className="field-label">Chuyên khoa phụ trách *</label>
                                <select
                                    className="form-select"
                                    value={formData.specialtyId}
                                    onChange={(e) => onFormChange('specialtyId', e.target.value)}
                                    required
                                >
                                    <option value="">-- Chọn chuyên khoa --</option>
                                    {specialties.map((specialty) => (
                                        <option key={specialty.specialtyId} value={specialty.specialtyId}>
                                            {specialty.specialtyName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-item">
                                <label className="field-label">Số chứng chỉ hành nghề</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Ví dụ: CCHN-12345/HN"
                                    value={formData.licenseNumber}
                                    onChange={(e) => onFormChange('licenseNumber', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="doctor-form-grid">
                            <div className="form-item">
                                <label className="field-label">Bệnh viện công tác</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Ví dụ: Bệnh viện Đa khoa MEDLATEC"
                                    value={formData.hospitalName}
                                    onChange={(e) => onFormChange('hospitalName', e.target.value)}
                                />
                            </div>

                            <div className="form-item">
                                <label className="field-label">Email liên hệ *</label>
                                <input
                                    type="email"
                                    className="text-input"
                                    placeholder="Ví dụ: bs.nguyen@medlatec.vn"
                                    value={formData.email}
                                    onChange={(e) => onFormChange('email', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Liên kết tài khoản người dùng khi tạo mới */}
                        {modalMode === ModelMode.CREATE && (
                            <div className="doctor-user-link-section">
                                <span className="doctor-user-link-title">
                                    LIÊN KẾT TÀI KHOẢN NGƯỜI DÙNG (ROLE: DOCTOR) *
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
                                        }} required>
                                        <option value="">-- Chọn tài khoản người dùng đã tạo --</option>
                                        {usersList.map((u) => {
                                            const isAssigned = doctors.some((d) => d.userId === u.userId);
                                            return (
                                                <option key={u.userId} value={u.userId} disabled={isAssigned}>
                                                    {u.username} {u.email ? `(${u.email})` : ''} {isAssigned ? '- [Đã gắn hồ sơ]' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <span className="doctor-user-warning">
                                        * Nếu chưa có tài khoản, vui lòng vào trang &quot;Quản lý người dùng&quot; tạo tài khoản với vai trò Bác sĩ (DOCTOR) trước.
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-foot">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitButtonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
