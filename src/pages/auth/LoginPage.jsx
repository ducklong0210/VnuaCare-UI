import { useNavigation } from '../../core/contexts/useNavigation.js';
import LoginForm from '../../components/Auth/LoginForm.jsx';
import './LoginPage.css';

function LoginPage() {
  const { navigate } = useNavigation();

  return (
    <main className="login-page">
      {/* Nền hiệu ứng ánh sáng dịu y tế */}
      <div className="login-backdrop-glow" aria-hidden="true" />

      {/* Thẻ đăng nhập trung tâm bo góc hiện đại */}
      <section className="login-card" aria-labelledby="login-title">
        {/* Nút quay lại trang chủ */}
        <button
          type="button"
          className="login-back-home-btn"
          onClick={() => navigate('home')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          <span>Quay lại Trang chủ</span>
        </button>

        {/* Header thương hiệu VNUA Care */}
        <div className="login-header">
          <img src="/logo.png" alt="Logo VnuaCare" className="login-logo-img" />

          <h1 id="login-title" className="login-title">Đăng Nhập Hệ Thống</h1>
          <p className="login-description">
            Cổng quản lý hồ sơ khám sức khỏe định kỳ &amp; y tế điện tử
          </p>
        </div>

        {/* Biểu mẫu đăng nhập */}
        <LoginForm />

        {/* Chân thẻ hiển thị thông tin bảo mật & liên hệ */}
        <div className="login-card-footer">
          <div className="login-security-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Bảo mật dữ liệu y tế theo chuẩn Bộ Y tế</span>
          </div>
          <div className="login-support-info">
            Trạm Y tế VNUA • Hỗ trợ: tram-yte@vnua.edu.vn
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
