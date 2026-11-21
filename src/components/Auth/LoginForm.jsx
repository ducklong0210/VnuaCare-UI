//
// Biểu mẫu đăng nhập hệ thống VnuaCare
// Gọi loginRequest xác thực tài khoản, lưu phiên vào AuthContext và điều hướng theo vai trò người dùng
//

import { useState } from 'react';
import { loginRequest } from '../../api/authApi.js';
import { useAuth } from '../../core/contexts/useAuth.js';
import { useNavigation } from '../../core/contexts/useNavigation.js';

function LoginForm() {
  const { login } = useAuth();
  const { navigate } = useNavigation();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Hàm xử lý sự kiện khi người dùng bấm nút Đăng nhập
  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await loginRequest({
        loginIdentifier: loginIdentifier.trim(),
        password: password,
      });

      // Lưu thông tin đăng nhập rồi chuyển sang Dashboard
      login(data);
      navigate('dashboard');
    } catch (error) {
      setErrorMessage(error.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {/* Khối hiển thị thông báo lỗi */}
      {errorMessage && (
        <div className="form-error" role="alert">
          <svg className="error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Trường Email hoặc Mã số */}
      <div className="form-field">
        <label htmlFor="login-identifier">Tài khoản / Email cán bộ</label>
        <div className="text-field-input-wrap">
          <span className="text-field-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <input
            id="login-identifier"
            name="loginIdentifier"
            type="text"
            value={loginIdentifier}
            onChange={(event) => setLoginIdentifier(event.target.value)}
            autoComplete="username"
            placeholder="name@vnua.edu.vn hoặc Mã cán bộ"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Trường Mật khẩu */}
      <div className="password-field">
        <div className="password-label-row">
          <label htmlFor="password">Mật khẩu</label>
          <button className="text-button" type="button" tabIndex={-1}>
            Quên mật khẩu?
          </button>
        </div>
        <div className="password-input-wrap">
          <span className="password-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu tài khoản"
            required
            disabled={isLoading}
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Duy trì đăng nhập */}
      <div className="remember-row-wrap">
        <label className="remember-row">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            disabled={isLoading}
          />
          <span>Duy trì đăng nhập trên thiết bị này</span>
        </label>
      </div>

      {/* Nút đăng nhập */}
      <button className="primary-button" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <svg className="login-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span>Đang xác thực...</span>
          </>
        ) : (
          <>
            <span>Đăng nhập hệ thống</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

export default LoginForm;
