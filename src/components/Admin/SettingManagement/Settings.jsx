//
// Màn hình Cài đặt tài khoản cá nhân gồm hai tab Hồ sơ cá nhân và Đổi mật khẩu
// Gọi AccountService để tải/cập nhật thông tin phù hợp từng vai trò và đổi mật khẩu tài khoản đang đăng nhập
//

import { useEffect, useState } from 'react';
import { AccountService } from '../../../services/admin/AccountService.js';
import { useAuth } from '../../../core/contexts/useAuth.js';
import { ROLE_LABELS, ROLES } from '../../../utils/index.js';
import { toDateInputValue } from '../../../utils/helpers.js';
import { IconCheck, IconRefreshCw } from '../../SupportAgent/Icons.jsx';
import './Settings.css';

export default function Settings() {
  const { user, login } = useAuth();

  // Tab con đang mở: 'PROFILE' (Hồ sơ cá nhân) | 'PASSWORD' (Đổi mật khẩu)
  const [activeTab, setActiveTab] = useState('PROFILE');

  // Thông tin đầy đủ trả về từ GET /api/v1/users/me
  const [profileInfo, setProfileInfo] = useState(null); // Đối tượng UserModel từ Backend
  const [loading, setLoading] = useState(false); // Trạng thái đang tải hồ sơ cá nhân
  const [refreshKey, setRefreshKey] = useState(0); // Biến đếm tăng thêm 1 mỗi khi cần tải lại hồ sơ cá nhân

  // Form cập nhật Hồ sơ cá nhân
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    avatarUrl: '',
    gender: 'NAM',
    dateOfBirth: '',
  }); // Đối tượng dữ liệu biểu mẫu cập nhật hồ sơ cá nhân
  const [savingProfile, setSavingProfile] = useState(false); // Trạng thái đang lưu hồ sơ cá nhân
  const [profileError, setProfileError] = useState(''); // Chuỗi lỗi khi lưu hồ sơ

  // Form Đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }); // Đối tượng dữ liệu biểu mẫu đổi mật khẩu
  const [savingPassword, setSavingPassword] = useState(false); // Trạng thái đang gửi yêu cầu đổi mật khẩu
  const [passwordError, setPasswordError] = useState(''); // Chuỗi lỗi khi đổi mật khẩu

  // Thông báo toast nhanh góc màn hình
  const [toast, setToast] = useState(''); // Chuỗi thông báo nổi góc màn hình (tự ẩn sau 3 giây)
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Tải thông tin tài khoản hiện tại từ GET /api/v1/users/me
  useEffect(() => {
    let isCancelled = false;

    const fetchMyProfile = async () => {
      setLoading(true);
      setProfileError('');
      try {
        const data = await AccountService.getMyProfile();
        if (!isCancelled && data) {
          setProfileInfo(data);
          const staff = data.staffProfile;
          const doctor = data.doctorProfile;
          setProfileForm({
            fullName: data.fullName || data.fullname || doctor?.fullName || staff?.fullName || user?.fullName || user?.fullname || '',
            email: data.email || '',
            phoneNumber: staff?.phoneNumber || '',
            address: staff?.address || staff?.adrress || '',
            avatarUrl: staff?.avatarUrl || '',
            gender: staff?.gender || 'NAM',
            dateOfBirth: toDateInputValue(staff?.dateOfBirth),
          });
        }
      } catch (err) {
        if (!isCancelled) {
          setProfileError(err.message || 'Không thể tải thông tin hồ sơ cá nhân');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchMyProfile();
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const displayRole = (profileInfo?.role || user?.role || '').toUpperCase();
  const isStaff = displayRole === ROLES.STAFF;

  // Xử lý lưu cập nhật Hồ sơ cá nhân (PUT /api/v1/users/profile)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');

    const resolvedFullName = profileForm.fullName.trim();
    if (!resolvedFullName) {
      setProfileError('Họ và tên không được để trống');
      return;
    }

    setSavingProfile(true);
    try {
      await AccountService.updateMyProfile({
        fullName: resolvedFullName,
        email: profileForm.email.trim() || null,
        phoneNumber: isStaff ? profileForm.phoneNumber.trim() || null : null,
        address: isStaff ? profileForm.address.trim() || null : null,
        avatarUrl: isStaff ? profileForm.avatarUrl.trim() || null : null,
        gender: isStaff ? profileForm.gender || null : null,
        dateOfBirth: isStaff && profileForm.dateOfBirth ? new Date(profileForm.dateOfBirth).toISOString() : null,
      });

      // Đồng bộ lại thông tin mới lên Header (AuthContext)
      if (user) {
        login({
          ...user,
          fullName: resolvedFullName,
          fullname: resolvedFullName,
          email: profileForm.email.trim() || user.email,
        });
      }

      showToast('Cập nhật thông tin tài khoản thành công!');
      setRefreshKey((currentKey) => currentKey + 1);
    } catch (err) {
      setProfileError(err.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  // Xử lý Đổi mật khẩu (POST /api/v1/users/change-password)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ các trường mật khẩu');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }

    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setPasswordError('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      return;
    }

    setSavingPassword(true);
    try {
      await AccountService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Đổi mật khẩu thành công!');
    } catch (err) {
      setPasswordError(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSavingPassword(false);
    }
  };

  const displayName =
    profileForm.fullName ||
    profileInfo?.fullName ||
    user?.fullName ||
    user?.fullname ||
    profileInfo?.username ||
    user?.username ||
    'Quản trị viên';
  const userInitial = displayName[0].toUpperCase();

  return (
    <div className="admin-page-container">
      {/* Thông báo toast */}
      {toast && (
        <div className="admin-toast">
          <IconCheck size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Tiêu đề trang */}
      <div className="page-header-row">
        <div>
          <h2 className="main-title">Cài đặt tài khoản</h2>
          <span className="main-desc">Quản lý thông tin hồ sơ cá nhân và bảo mật mật khẩu đăng nhập</span>
        </div>
      </div>

      <div className="settings-layout">
        {/* Khối tổng quan tài khoản đang đăng nhập */}
        <div className="settings-profile-banner">
          <div className="settings-banner-left">
            <div className="settings-avatar-lg">
              {profileForm.avatarUrl ? <img src={profileForm.avatarUrl} alt={displayName} /> : userInitial}
            </div>
            <div className="settings-banner-info">
              <h3>{displayName}</h3>
              <div className="settings-banner-meta">
                <span>@{profileInfo?.username || user?.username}</span>
                <span>•</span>
                <span>{profileForm.email || 'Chưa cập nhật email'}</span>
                <span className="settings-role-badge">{ROLE_LABELS[displayRole] || displayRole}</span>
              </div>
            </div>
          </div>

          <span className="settings-status-active">● Đang hoạt động</span>
        </div>

        {/* Khối 2 Tab: Hồ sơ cá nhân & Đổi mật khẩu */}
        <div className="settings-card">
          <div className="settings-tabs-bar">
            <button
              type="button"
              className={`settings-tab-btn ${activeTab === 'PROFILE' ? 'active' : ''}`}
              onClick={() => setActiveTab('PROFILE')}
            >
              1. Hồ sơ cá nhân
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${activeTab === 'PASSWORD' ? 'active' : ''}`}
              onClick={() => setActiveTab('PASSWORD')}
            >
              2. Đổi mật khẩu
            </button>
          </div>

          <div className="settings-card-body">
            {/* TAB 1: HỒ SƠ CÁ NHÂN */}
            {activeTab === 'PROFILE' && (
              <form onSubmit={handleSaveProfile}>
                {profileError && <div className="settings-alert error">{profileError}</div>}

                {/* Thông tin định danh chỉ đọc */}
                <div className="settings-readonly-grid">
                  <div className="settings-readonly-item">
                    <span className="settings-readonly-label">Tên đăng nhập</span>
                    <span className="settings-readonly-value">{profileInfo?.username || user?.username || '—'}</span>
                  </div>
                  <div className="settings-readonly-item">
                    <span className="settings-readonly-label">Vai trò hệ thống</span>
                    <span className="settings-readonly-value">{ROLE_LABELS[displayRole] || displayRole || '—'}</span>
                  </div>
                  <div className="settings-readonly-item">
                    <span className="settings-readonly-label">
                      {profileInfo?.doctorProfile ? 'Mã bác sĩ / Chuyên khoa' : 'Loại tài khoản'}
                    </span>
                    <span className="settings-readonly-value">
                      {profileInfo?.doctorProfile
                        ? `${profileInfo.doctorProfile.doctorCode || '—'}${profileInfo.doctorProfile.specialtyName ? ` • ${profileInfo.doctorProfile.specialtyName}` : ''}`
                        : profileInfo?.staffProfile
                          ? `${profileInfo.staffProfile.employeeCode || '—'}${profileInfo.staffProfile.departmentName ? ` • ${profileInfo.staffProfile.departmentName}` : ''}`
                          : 'Tài khoản quản trị'}
                    </span>
                  </div>
                </div>

                {/* Các trường tự cập nhật: Họ và tên + Email cho mọi vai trò */}
                <div className="settings-form-grid">
                  <div className="form-item">
                    <label className="field-label">Họ và tên *</label>
                    <input
                      type="text"
                      className="text-input"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Email liên hệ</label>
                    <input
                      type="email"
                      className="text-input"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="Ví dụ: ten@vnua.edu.vn"
                    />
                  </div>
                </div>

                <div className="settings-form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setRefreshKey((currentKey) => currentKey + 1)}
                    disabled={loading || savingProfile}
                  >
                    <IconRefreshCw size={14} />
                    <span>Tải lại</span>
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={savingProfile || loading}>
                    <IconCheck size={15} />
                    <span>{savingProfile ? 'Đang lưu...' : 'Lưu thông tin cá nhân'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: ĐỔI MẬT KHẨU */}
            {activeTab === 'PASSWORD' && (
              <form onSubmit={handleChangePassword}>
                {passwordError && <div className="settings-alert error">{passwordError}</div>}

                <div className="settings-password-wrap">
                  <div className="form-item">
                    <label className="field-label">Mật khẩu hiện tại *</label>
                    <input
                      type="password"
                      className="text-input"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      placeholder="Nhập mật khẩu đang sử dụng"
                      required
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Mật khẩu mới *</label>
                    <input
                      type="password"
                      className="text-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Tối thiểu 6 ký tự"
                      required
                    />
                  </div>

                  <div className="form-item">
                    <label className="field-label">Xác nhận mật khẩu mới *</label>
                    <input
                      type="password"
                      className="text-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                  </div>
                </div>

                <div className="settings-form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                    }}
                    disabled={savingPassword}
                  >
                    Nhập lại
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                    <IconCheck size={15} />
                    <span>{savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
