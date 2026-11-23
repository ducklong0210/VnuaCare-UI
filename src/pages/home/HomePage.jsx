//
// Trang chủ giới thiệu Cổng Tra Cứu & Xem Kết Quả Khám Sức Khỏe Cán Bộ VNUA
// Cung cấp thông tin tổng quan hệ thống và điều hướng nhanh sang trang Đăng nhập hoặc Bảng điều khiển
//

import { useAuth } from '../../core/contexts/useAuth.js';
import { useNavigation } from '../../core/contexts/useNavigation.js';
import { ROLES } from '../../utils/index.js';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const isStaff = (user?.role || '').toUpperCase() === ROLES.STAFF;
  const targetTab = isStaff ? 'staff-portal' : 'dashboard';

  return (
    <div className="home-container">
      {/* 1. THANH ĐIỀU HƯỚNG TRÊN CÙNG (NAVBAR) */}
      <header className="home-navbar">
        <div className="home-nav-inner">
          <div className="home-brand" onClick={() => navigate('home')}>
            <img src="/logo.png" alt="Logo VnuaCare" className="home-brand-logo-img" />
          </div>

          <div className="home-nav-actions">
            {user ? (
              <button
                type="button"
                className="home-btn-primary"
                onClick={() => navigate(targetTab)}
              >
                <span>{isStaff ? 'Xem hồ sơ của tôi' : 'Vào bảng quản lý'}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className="home-btn-primary"
                onClick={() => navigate('login')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Đăng nhập tra cứu</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. BANNER GIỚI THIỆU CHÍNH (HERO) */}
      <section className="home-hero">
        <div className="home-hero-glow" aria-hidden="true" />
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <span className="hero-badge-dot"></span>
            <span>Cổng Tra Cứu Thông Tin &amp; Kết Quả Khám Sức Khỏe Điện Tử</span>
          </div>

          <h1 className="home-hero-title">
            Tra Cứu Hồ Sơ &amp; Kết Quả Khám Sức Khỏe Cán Bộ VNUA
          </h1>

          <p className="home-hero-desc">
            Nền tảng tra cứu kết quả khám sức khỏe định kỳ trực tuyến dành cho toàn thể cán bộ, giảng viên và người lao động Học viện Nông nghiệp Việt Nam.
          </p>

          <div className="home-hero-btns">
            <button
              type="button"
              className="home-btn-hero-primary"
              onClick={() => navigate(user ? targetTab : 'login')}
            >
              <span>
                {user
                  ? isStaff
                    ? 'Xem hồ sơ sức khỏe của tôi'
                    : 'Vào bảng điều khiển quản lý'
                  : 'Đăng nhập xem hồ sơ sức khỏe'}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 3. CÁC THÔNG TIN CÁN BỘ CÓ THỂ XEM */}
      <section className="home-section">
        <div className="home-section-header">
          <span className="section-badge">THÔNG TIN HỒ SƠ</span>
          <h2 className="section-title">Cán Bộ Có Thể Tra Cứu Những Thông Tin Gì?</h2>
          <p className="section-desc">
            Dữ liệu khám sức khỏe định kỳ được Trạm Y tế số hóa và lưu trữ bảo mật. Cán bộ chỉ cần đăng nhập để xem đầy đủ các thông tin:
          </p>
        </div>

        <div className="home-info-cards-grid">
          <div className="info-card">
            <div className="info-card-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3 className="info-card-title">Chỉ Số Sinh Hiệu &amp; Thể Lực</h3>
            <p className="info-card-desc">
              Xem lại các chỉ số thể lực cơ bản: chiều cao, cân nặng, chỉ số khối cơ thể (BMI), huyết áp động mạch và nhịp mạch qua các đợt khám.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M12 18v-6" />
                <path d="M9 15h6" />
              </svg>
            </div>
            <h3 className="info-card-title">Kết Quả 38+ Chỉ Số Xét Nghiệm</h3>
            <p className="info-card-desc">
              Tra cứu bảng kết quả phân tích máu và nước tiểu: đường huyết (Glucose), men gan (AST/ALT), mỡ máu (Lipid/Cholesterol), acid uric và chức năng thận.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="info-card-title">Kết Quả Chẩn Đoán Hình Ảnh</h3>
            <p className="info-card-desc">
              Xem kết quả và mô tả chuyên môn của bác sĩ về Siêu âm ổ bụng, Chụp X-quang tim phổi, Điện tâm đồ vi tính (ECG) và Nội soi Tai Mũi Họng.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="info-card-title">Kết Luận &amp; Xếp Loại Sức Khỏe</h3>
            <p className="info-card-desc">
              Xem kết luận phân loại sức khỏe (Loại I đến Loại V theo tiêu chuẩn Bộ Y tế) cùng lời khuyên, hướng dẫn chăm sóc sức khỏe của bác sĩ.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HƯỚNG DẪN TRA CỨU ĐƠN GIẢN */}
      <section className="home-section" style={{ paddingTop: '0' }}>
        <div className="home-guide-box">
          <h3 className="guide-title">Cách Thức Đăng Nhập Tra Cứu</h3>
          <div className="guide-steps-row">
            <div className="guide-step">
              <span className="step-circle">1</span>
              <div>
                <strong>Đăng nhập tài khoản</strong>
                <p>Sử dụng email công vụ (@vnua.edu.vn) hoặc Mã số cán bộ do Trạm Y tế cấp.</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="step-circle">2</span>
              <div>
                <strong>Chọn đợt khám cần xem</strong>
                <p>Xem danh sách các đợt khám sức khỏe định kỳ theo từng năm công tác.</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="step-circle">3</span>
              <div>
                <strong>Xem chi tiết kết quả</strong>
                <p>Tra cứu chi tiết các chỉ số xét nghiệm, kết quả siêu âm, điện tim và kết luận của bác sĩ.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THÔNG TIN TRẠM Y TẾ VNUA & LIÊN HỆ */}
      <section className="home-section" style={{ paddingTop: '0' }}>
        <div className="home-simple-contact">
          <div className="simple-contact-left">
            <span className="section-badge">LIÊN HỆ HỖ TRỢ</span>
            <h3 className="contact-title-clean">Trạm Y Tế Học Viện Nông Nghiệp Việt Nam</h3>
            <p className="contact-sub-clean">
              Nếu cán bộ chưa có tài khoản hoặc cần hỗ trợ tra cứu thông tin hồ sơ sức khỏe, vui lòng liên hệ Trạm Y tế:
            </p>
            <div className="simple-contact-items">
              <div>📍 <strong>Địa chỉ:</strong> Trạm Y tế VNUA, Thị trấn Trâu Quỳ, Gia Lâm, Hà Nội</div>
              <div>📞 <strong>Điện thoại hỗ trợ:</strong> (024) 6261 7556</div>
              <div>✉️ <strong>Hộp thư điện tử:</strong> tram-yte@vnua.edu.vn</div>
            </div>
          </div>
          <div className="simple-contact-right">
            <button
              type="button"
              className="home-btn-hero-primary"
              onClick={() => navigate(user ? 'dashboard' : 'login')}
            >
              <span>{user ? 'Vào bảng điều khiển' : 'Đăng nhập ngay'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 6. CHÂN TRANG (FOOTER) */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="footer-left">
            <div className="footer-brand-title">VnuaCare — Cổng Tra Cứu Thông Tin Sức Khỏe Cán Bộ VNUA</div>
            <p className="footer-copyright">
              © 2026 Học viện Nông nghiệp Việt Nam (Vietnam National University of Agriculture).
            </p>
          </div>
          <div className="footer-right">
            <span>Dành riêng cho cán bộ, giảng viên &amp; nhân viên Học viện</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
