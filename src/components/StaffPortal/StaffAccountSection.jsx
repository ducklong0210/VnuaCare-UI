//
// Phân hệ Đổi mật khẩu dành riêng cho Cán bộ / Giảng viên trong Cổng Cán bộ (vai trò STAFF)
// Thông tin cá nhân chỉ hiển thị ở thanh định danh phía trên và không cho phép cán bộ tự chỉnh sửa
//

import { useState } from 'react';
import { StaffPortalService } from '../../services/staff/StaffPortalService.js';
import { IconCheck } from '../SupportAgent/Icons.jsx';

export default function StaffAccountSection({ showToast }) {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Xử lý đổi mật khẩu đăng nhập cho cán bộ
  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }
    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setPasswordError('Mật khẩu mới không được trùng mật khẩu hiện tại.');
      return;
    }

    setSavingPassword(true);
    try {
      await StaffPortalService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Đổi mật khẩu thành công.');
    } catch (error) {
      setPasswordError(error.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <section className="sp-account-sheet">
      <div className="sp-account-header">
        <h2>Đổi mật khẩu đăng nhập</h2>
        <p>
          Cập nhật mật khẩu định kỳ để bảo vệ hồ sơ sức khỏe cá nhân. Nếu cần điều chỉnh thông tin cá nhân (họ tên, số điện thoại, email, đơn vị), vui lòng liên hệ Trạm Y tế VNUA.
        </p>
      </div>

      <div className="sp-account-body">
        <form onSubmit={handleChangePassword} className="sp-password-form">
          {passwordError && (
            <div className="sp-alert-error" role="alert">
              {passwordError}
            </div>
          )}

          <div className="sp-field">
            <label htmlFor="sp-old-pass">Mật khẩu hiện tại *</label>
            <input
              id="sp-old-pass"
              type="password"
              value={passwordForm.oldPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, oldPassword: event.target.value })}
              placeholder="Nhập mật khẩu đang sử dụng"
              required
            />
          </div>

          <div className="sp-field">
            <label htmlFor="sp-new-pass">Mật khẩu mới *</label>
            <input
              id="sp-new-pass"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              placeholder="Tối thiểu 6 ký tự"
              required
            />
          </div>

          <div className="sp-field">
            <label htmlFor="sp-confirm-pass">Xác nhận mật khẩu mới *</label>
            <input
              id="sp-confirm-pass"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <div className="sp-form-actions">
            <button
              type="button"
              className="sp-btn sp-btn-outline"
              onClick={() => {
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordError('');
              }}
              disabled={savingPassword}
            >
              Nhập lại
            </button>
            <button type="submit" className="sp-btn sp-btn-primary" disabled={savingPassword}>
              <IconCheck size={15} />
              <span>{savingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
