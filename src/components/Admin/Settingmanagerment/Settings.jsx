// Component Cài đặt tài khoản cá nhân: quản lý Hồ sơ cá nhân & Đổi mật khẩu
// Kết nối trực tiếp với 3 API Backend:
//   - GET  /api/v1/users/me              (Tải thông tin tài khoản & hồ sơ hiện tại)
//   - PUT  /api/v1/users/profile         (Cập nhật thông tin cá nhân)
//   - POST /api/v1/users/change-password (Đổi mật khẩu tài khoản đang đăng nhập)

import { useEffect, useState } from 'react';
import { AccountService } from '../../../services/admin/AccountService.js';
import { useAuth } from '../../../core/contexts/useAuth.js';
import { ROLE_LABELS, ROLES, AVATAR_PRESETS } from '../../../utils/index.js';
import { IconCheck, IconRefreshCw } from '../../SupportAgent/Icons.jsx';
import './Settings.css';

// Chuyển chuỗi ngày từ API sang YYYY-MM-DD cho ô <input type="date">
function toDateInputValue(dateStr) {
  if (!dateStr || dateStr.startsWith('0001-01-01')) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

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
            fullName: staff?.fullName || doctor?.fullName || user?.fullname || data.username || '',
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
  const isDoctor = displayRole === ROLES.DOCTOR;

  // Xử lý lưu cập nhật Hồ sơ cá nhân (PUT /api/v1/users/profile)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');

    // Chỉ bắt buộc Họ và tên với DOCTOR / STAFF (Admin không có cột full_name trong bảng vc_users)
    if ((isStaff || isDoctor) && !profileForm.fullName.trim()) {
      setProfileError('Họ và tên không được để trống');
      return;
    }

    setSavingProfile(true);
    try {
      // Backend yêu cầu trường fullName không rỗng nên với Admin tự gửi kèm username làm giá trị mặc định
      const resolvedFullName =
        isStaff || isDoctor
          ? profileForm.fullName.trim()
          : profileInfo?.username || user?.username || 'Admin';

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
          fullname: isStaff || isDoctor ? resolvedFullName : user.fullname,
          email: profileForm.email.trim() || user.email,
        });
      }

      showToast('Cập nhật thông tin tài khoản thành công!');
      setRefreshKey((prev) => prev + 1);
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
    isStaff || isDoctor
      ? profileForm.fullName || user?.fullname || user?.username || 'Người dùng'
      : profileInfo?.username || user?.username || 'Quản trị viên';
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
                      {profileInfo?.doctorProfile ? 'Mã bác sĩ / Chuyên khoa' : 'Mã cán bộ / Đơn vị'}
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

                {/* Các trường tự cập nhật hiển thị đúng theo cột SQL của từng vai trò */}
                <div className="settings-form-grid">
                  {(isStaff || isDoctor) && (
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
                  )}

                  <div className={`form-item ${!isStaff && !isDoctor ? 'settings-form-full' : ''}`}>
                    <label className="field-label">Email liên hệ</label>
                    <input
                      type="email"
                      className="text-input"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="Ví dụ: ten@vnua.edu.vn"
                    />
                  </div>

                  {isStaff && (
                    <>
                      <div className="form-item">
                        <label className="field-label">Số điện thoại</label>
                        <input
                          type="text"
                          className="text-input"
                          value={profileForm.phoneNumber}
                          onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div className="form-item">
                        <label className="field-label">Giới tính</label>
                        <select
                          className="form-select"
                          value={profileForm.gender}
                          onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        >
                          <option value="NAM">Nam</option>
                          <option value="NU">Nữ</option>
                          <option value="KHAC">Khác</option>
                        </select>
                      </div>

                      <div className="form-item">
                        <label className="field-label">Ngày sinh</label>
                        <input
                          type="date"
                          className="text-input"
                          value={profileForm.dateOfBirth}
                          onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                        />
                      </div>

                      <div className="form-item">
                        <label className="field-label">Địa chỉ</label>
                        <input
                          type="text"
                          className="text-input"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          placeholder="Nhập địa chỉ nơi ở / đơn vị công tác"
                        />
                      </div>

                      <div className="form-item settings-form-full">
                        <label className="field-label">Chọn ảnh đại diện</label>
                        <div className="settings-avatar-grid">
                          {AVATAR_PRESETS.map((av) => (
                            <button
                              key={av.id}
                              type="button"
                              className={`settings-avatar-option ${profileForm.avatarUrl === av.url ? 'selected' : ''}`}
                              onClick={() => setProfileForm({ ...profileForm, avatarUrl: av.url })}
                            >
                              <img src={av.url} alt={av.label} />
                              <span>{av.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="settings-form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setRefreshKey((prev) => prev + 1)}
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
