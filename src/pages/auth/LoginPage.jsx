import LoginForm from '../../features/auth/components/LoginForm.jsx'
import LoginVisual from '../../features/auth/components/LoginVisual.jsx'
import './LoginPage.css'

function LoginPage() {
  return (
    <main className="login-page">
      <LoginVisual />
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-content">
          <h1 id="login-title">Đăng Nhập Hệ Thống</h1>
          <p className="login-description">
            Đăng nhập bằng tài khoản công vụ hoặc email của bạn
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}

export default LoginPage
