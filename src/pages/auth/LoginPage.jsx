//
// Trang Đăng nhập hệ thống VnuaCare
// Bố cục hai cột chuẩn cổng y tế nội bộ: cột giới thiệu đơn vị VNUA bên trái và biểu mẫu xác thực bên phải
//

import { useNavigation } from '../../core/contexts/useNavigation.js';
import LoginForm from '../../components/Auth/LoginForm.jsx';
import './LoginPage.css';

function LoginPage() {
  const { navigate } = useNavigation();

  return (
    <main className="login-page">
      <div className="login-shell">
        {/* Cột trái: Thông tin nhận diện Trạm Y tế VNUA */}
        <aside className="login-aside" aria-label="Thông tin Cổng Sức Khỏe Điện Tử VNUA">
          <div className="login-aside-top">
            <div className="login-vnua-lockup">
              <img
                src="/logo-vnua.png"
                alt="Huy hiệu Học viện Nông nghiệp Việt Nam"
                className="login-vnua-emblem"
              />
              <div className="login-vnua-meta">
                <span className="login-vnua-org">Học viện Nông nghiệp Việt Nam</span>
                <span className="login-vnua-unit">Trạm Y tế • Cổng Sức Khỏe Điện Tử</span>
              </div>
            </div>

            <h2 className="login-aside-heading">
              Hồ sơ khám sức khỏe định kỳ tập trung &amp; bảo mật
            </h2>
            <p className="login-aside-lead">
              Hệ thống phục vụ tra cứu kết quả khám sức khỏe dành cho cán bộ, giảng viên và công tác quản lý chuyên môn tại Trạm Y tế Học viện.
            </p>

            <ul className="login-aside-list">
              <li>
                <span className="login-aside-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </span>
                <div>
                  <strong>Lưu trữ đầy đủ theo từng năm</strong>
                  <span>Tra cứu và đối chiếu kết quả giữa các đợt khám sức khỏe định kỳ.</span>
                </div>
              </li>

              <li>
                <span className="login-aside-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </span>
                <div>
                  <strong>Minh bạch 38+ chỉ số xét nghiệm</strong>
                  <span>Hiển thị rõ sinh hiệu, xét nghiệm máu, nước tiểu, chẩn đoán hình ảnh và xếp loại.</span>
                </div>
              </li>

              <li>
                <span className="login-aside-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <div>
                  <strong>Phân quyền bảo mật chặt chẽ</strong>
                  <span>Mỗi cán bộ chỉ truy cập hồ sơ cá nhân theo tài khoản được Trạm Y tế cấp.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="login-aside-footer">
            <span>Hỗ trợ kỹ thuật &amp; cấp tài khoản:</span>
            <div className="login-aside-contact">
              <span>(024) 6261 7556</span>
              <span aria-hidden="true">•</span>
              <span>tram-yte@vnua.edu.vn</span>
            </div>
          </div>
        </aside>

        {/* Cột phải: Biểu mẫu đăng nhập */}
        <section className="login-main" aria-labelledby="login-title">
          <div className="login-main-topbar">
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
          </div>

          <div className="login-header">
            <img src="/logo.png" alt="Logo VnuaCare" className="login-logo-img" />
            <h1 id="login-title" className="login-title">Đăng nhập hệ thống</h1>
            <p className="login-description">
              Sử dụng email công vụ (@vnua.edu.vn) hoặc mã số cán bộ để truy cập hồ sơ y tế.
            </p>
          </div>

          <LoginForm />

          <div className="login-card-footer">
            <div className="login-security-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Kết nối mã hóa &amp; bảo mật dữ liệu y tế nội bộ</span>
            </div>
            <div className="login-support-info">
              Trạm Y tế VNUA • Hỗ trợ: tram-yte@vnua.edu.vn
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
