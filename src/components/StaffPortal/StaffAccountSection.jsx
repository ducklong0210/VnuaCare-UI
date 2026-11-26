//
// Phân hệ tự quản lý Thông tin cá nhân và Đổi mật khẩu ngay trong Cổng Cán bộ (vai trò STAFF)
// Cho phép cán bộ cập nhật email, số điện thoại, địa chỉ, ngày sinh, ảnh đại diện và đổi mật khẩu mà không cần vào Admin
//

import { useState } from 'react';
import { StaffPortalService } from '../../services/staff/StaffPortalService.js';
import { useAuth } from '../../core/contexts/useAuth.js';
import { AVATAR_PRESETS } from '../../utils/index.js';
import { toDateInputValue } from '../../utils/helpers.js';
import { IconCheck, IconRefreshCw } from '../SupportAgent/Icons.jsx';

// Chuẩn hóa giá trị giới tính về dạng thống nhất ('Nam' | 'Nữ' | 'Khác') giống màn hình Admin
function normalizeGenderValue(gender) {
  const clean = (gender || '').trim().toUpperCase();
  if (clean === 'NU' || clean === 'NỮ' || clean === 'FEMALE') {
    return 'Nữ';
  }
  if (clean === 'KHAC' || clean === 'KHÁC' || clean === 'OTHER') {
    return 'Khác';
  }
  return 'Nam';
}

// Khởi tạo dữ liệu form thông tin cá nhân từ kết quả /users/me và thông tin đăng nhập hiện tại
function buildInitialProfileForm(profileInfo, user) {
  const staff = profileInfo?.staffProfile || {};
  const fullName = profileInfo?.fullName || profileInfo?.fullname || staff.fullName || user?.fullName || user?.fullname || '';

  return {
    fullName: fullName,
    email: profileInfo?.email || staff.email || '',
    phoneNumber: staff.phoneNumber || '',
    address: staff.address || staff.adrress || '',
    avatarUrl: staff.avatarUrl || '',
    gender: normalizeGenderValue(staff.gender),
    dateOfBirth: toDateInputValue(staff.dateOfBirth),
  };
}

export default function StaffAccountSection({ profileInfo, onProfileUpdated, showToast }) {
  const { user, login } = useAuth();
  const [subTab, setSubTab] = useState('PROFILE');

  const [profileForm, setProfileForm] = useState(() => buildInitialProfileForm(profileInfo, user));
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');

    const trimmedName = profileForm.fullName.trim();
    if (!trimmedName) {
      setProfileError('Họ và tên không được để trống.');
      return;
    }

    setSavingProfile(true);
    try {
      await StaffPortalService.updateMyProfile({
        fullName: trimmedName,
        email: profileForm.email.trim() || null,
        phoneNumber: profileForm.phoneNumber.trim() || null,
        address: profileForm.address.trim() || null,
        avatarUrl: profileForm.avatarUrl.trim() || null,
        gender: profileForm.gender || null,
        dateOfBirth: profileForm.dateOfBirth ? new Date(profileForm.dateOfBirth).toISOString() : null,
      });

      if (user) {
        login({
          ...user,
          fullName: trimmedName,
          fullname: trimmedName,
          email: profileForm.email.trim() || user.email,
        });
      }

      showToast('Đã cập nhật thông tin cá nhân thành công.');
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setProfileError(err.message || 'Không thể cập nhật thông tin cá nhân.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      setPasswordError(err.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setSavingPassword(false);
    }
  };

  const staff = profileInfo?.staffProfile || null;

  return (
    <section className="sp-account-sheet">
      <div className="sp-clinical-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'PROFILE'}
          className={`sp-clinical-tab ${subTab === 'PROFILE' ? 'active' : ''}`}
          onClick={() => setSubTab('PROFILE')}
        >
          Thông tin cá nhân
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'PASSWORD'}
          className={`sp-clinical-tab ${subTab === 'PASSWORD' ? 'active' : ''}`}
          onClick={() => setSubTab('PASSWORD')}
        >
          Đổi mật khẩu
        </button>
      </div>

      <div className="sp-account-body">
        {subTab === 'PROFILE' && (
          <form onSubmit={handleSaveProfile}>
            {profileError && <div className="sp-alert-error" role="alert">{profileError}</div>}

            <div className="sp-readonly-strip">
              <div>
                <span className="sp-kv-label">Tên đăng nhập</span>
                <span className="sp-kv-value">{profileInfo?.username || user?.username || '—'}</span>
              </div>
              <div>
                <span className="sp-kv-label">Mã cán bộ</span>
                <span className="sp-kv-value sp-code">{staff?.employeeCode || staff?.staffCode || 'Chưa liên kết'}</span>
              </div>
              <div>
                <span className="sp-kv-label">Đơn vị / Khoa</span>
                <span className="sp-kv-value">{staff?.departmentName || '—'}</span>
              </div>
            </div>

            <div className="sp-form-grid">
              <div className="sp-field">
                <label htmlFor="sp-fullname">Họ và tên *</label>
                <input
                  id="sp-fullname"
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  placeholder="Nhập họ và tên đầy đủ"
                  required
                />
              </div>

              <div className="sp-field">
                <label htmlFor="sp-email">Email liên hệ</label>
                <input
                  id="sp-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="ten@vnua.edu.vn"
                />
              </div>

              <div className="sp-field">
                <label htmlFor="sp-phone">Số điện thoại</label>
                <input
                  id="sp-phone"
                  type="text"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="sp-field">
                <label htmlFor="sp-gender">Giới tính</label>
                <select
                  id="sp-gender"
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="sp-field">
                <label htmlFor="sp-dob">Ngày sinh</label>
                <input
                  id="sp-dob"
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="sp-field">
                <label htmlFor="sp-address">Địa chỉ</label>
                <input
                  id="sp-address"
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Địa chỉ liên hệ"
                />
              </div>

              <div className="sp-field sp-field-full">
                <label>Ảnh đại diện</label>
                <div className="sp-avatar-picker">
                  {AVATAR_PRESETS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      className={`sp-avatar-opt ${profileForm.avatarUrl === av.url ? 'selected' : ''}`}
                      onClick={() => setProfileForm({ ...profileForm, avatarUrl: av.url })}
                    >
                      <img src={av.url} alt={av.label} />
                      <span>{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sp-form-actions">
              <button
                type="button"
                className="sp-btn sp-btn-outline"
                onClick={onProfileUpdated}
                disabled={savingProfile}
              >
                <IconRefreshCw size={14} />
                <span>Tải lại</span>
              </button>
              <button type="submit" className="sp-btn sp-btn-primary" disabled={savingProfile}>
                <IconCheck size={15} />
                <span>{savingProfile ? 'Đang lưu...' : 'Lưu thông tin'}</span>
              </button>
            </div>
          </form>
        )}

        {subTab === 'PASSWORD' && (
          <form onSubmit={handleChangePassword} className="sp-password-form">
            {passwordError && <div className="sp-alert-error" role="alert">{passwordError}</div>}

            <div className="sp-field">
              <label htmlFor="sp-old-pass">Mật khẩu hiện tại *</label>
              <input
                id="sp-old-pass"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
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
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
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
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
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
        )}
      </div>
    </section>
  );
}
