// Component Modal biểu mẫu Thêm mới / Cập nhật tài khoản người dùng
// Hỗ trợ thiết lập tên đăng nhập, mật khẩu, email và gán vai trò truy cập (Role)
// Cung cấp chức năng khóa hoặc mở khóa trạng thái tài khoản khi cập nhật

import { IconClose } from '../../SupportAgent/Icons.jsx';
import { ModelMode } from '../../../utils/index.js'

export default function AccountDetail({
  modalMode,
  formData,
  onFormChange,
  onSubmit,
  onClose,
  submitting = false,
  modalError = '',
}) {
  if (!modalMode) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card user-modal-card">
        <div className="modal-head">
          <span className="modal-title-text">
            {modalMode === ModelMode.CREATE ? 'Thêm mới tài khoản người dùng' : 'Cập nhật tài khoản người dùng'}
          </span>
          <button type="button" className="modal-x" onClick={onClose}>
            <IconClose size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-content">
            {modalError && (
              <div className="alert-tag danger" style={{ padding: '8px 12px', width: '100%' }}>
                {modalError}
              </div>
            )}

            <div className="form-item">
              <label className="field-label">Tên đăng nhập *</label>
              <input
                type="text"
                className="text-input"
                placeholder="Ví dụ: nva_staff"
                value={formData.username}
                onChange={(e) => onFormChange('username', e.target.value)}
                disabled={modalMode === ModelMode.EDIT}
                required
              />
            </div>

            {modalMode === ModelMode.CREATE && (
              <div className="form-item">
                <label className="field-label">Mật khẩu *</label>
                <input
                  type="password"
                  className="text-input"
                  placeholder="Nhập mật khẩu..."
                  value={formData.password}
                  onChange={(e) => onFormChange('password', e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-item">
              <label className="field-label">Email *</label>
              <input
                type="email"
                className="text-input"
                placeholder="Ví dụ: nva@vnua.edu.vn"
                value={formData.email}
                onChange={(e) => onFormChange('email', e.target.value)}
                required
              />
            </div>

            <div className="form-item">
              <label className="field-label">Vai trò</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => onFormChange('role', e.target.value)}
              >
                <option value="STAFF">Cán bộ</option>
                <option value="DOCTOR">Bác sĩ</option>
                <option value="HEALTH_ADMIN">Quản trị y tế</option>
                <option value="SUPER_ADMIN">Quản trị cấp cao</option>
              </select>
            </div>

            {modalMode === ModelMode.EDIT && (
              <div className="form-item">
                <label className="field-label">Trạng thái tài khoản</label>
                <select
                  className="form-select"
                  value={formData.isActive ? '1' : '0'}
                  onChange={(e) => onFormChange('isActive', e.target.value === '1')}
                >
                  <option value="1">Hoạt động</option>
                  <option value="0">Đã khóa</option>
                </select>
              </div>
            )}
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? 'Đang xử lý...'
                : modalMode === ModelMode.CREATE
                  ? 'Tạo tài khoản'
                  : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
