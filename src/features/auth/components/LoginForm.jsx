import { useState } from 'react'
// Import hàm gọi API đăng nhập vừa viết từ thư mục api
import { loginRequest } from '../api/authApi.js'
// Import useAuth để báo cho toàn bộ ứng dụng biết người dùng đã đăng nhập thành công
import { useAuth } from '../hooks/useAuth.js'

function LoginForm() {
  // Lấy hàm login từ AuthContext
  const { login } = useAuth()

  // Các state lưu giá trị người dùng nhập vào ô input
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // State quản lý trạng thái khi bấm nút
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Hàm xử lý sự kiện khi người dùng bấm nút 'Đăng nhập'
  const handleSubmit = async (event) => {
    // Ngăn trình duyệt tự ý tải lại trang
    event.preventDefault()

    setIsLoading(true)
    setErrorMessage('')

    try {
      // 1. Gọi API gửi tài khoản & mật khẩu đến máy chủ
      const data = await loginRequest({
        loginIdentifier: loginIdentifier,
        password: password,
      })

      // 2. Lưu thông tin đăng nhập vào AuthContext
      // Khi hàm login() này chạy, AppRouter sẽ tự động chuyển sang trang Dashboard!
      login(data)

    } catch (error) {
      // Nếu có lỗi: Lưu câu lỗi để hiển thị lên màn hình
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {/* Khối hiển thị thông báo lỗi (chỉ hiện khi có lỗi) */}
      {errorMessage && (
        <div className="form-error" role="alert">
          ⚠ {errorMessage}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="login-identifier">
          Email công vụ hoặc Mã số cán bộ VNUA
        </label>
        <div className="text-field-input-wrap">
          <span className="text-field-icon" aria-hidden="true">✉</span>
          <input
            id="login-identifier"
            name="loginIdentifier"
            value={loginIdentifier}
            onChange={(event) => setLoginIdentifier(event.target.value)}
            autoComplete="username"
            placeholder="dmhung@vnua.edu.vn"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="password-field">
        <div className="password-label-row">
          <label htmlFor="password">Mật khẩu tài khoản</label>
          <button className="text-button" type="button">Quên mật khẩu?</button>
        </div>
        <div className="password-input-wrap">
          <span className="password-icon" aria-hidden="true">♙</span>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            required
            disabled={isLoading}
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? '◉' : '◎'}
          </button>
        </div>
      </div>

      <label className="remember-row">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />
        <span>Duy trì đăng nhập trên thiết bị này</span>
      </label>

      {/* Nút đăng nhập */}
      <button className="primary-button" type="submit" disabled={isLoading}>
        <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  )
}

export default LoginForm
