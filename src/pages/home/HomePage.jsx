//
// Trang chủ giới thiệu Cổng Tra Cứu & Xem Kết Quả Khám Sức Khỏe Cán Bộ VNUA
// Cung cấp thông tin tổng quan hệ thống và điều hướng nhanh sang trang Đăng nhập, Sổ sức khỏe hoặc Bảng điều khiển
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
          <button
            type="button"
            className="home-brand"
            onClick={() => navigate('home')}
            aria-label="Trang chủ VnuaCare"
          >
            <img src="/logo.png" alt="Logo VnuaCare" className="home-brand-logo-img" />
          </button>

          <nav className="home-nav-links" aria-label="Điều hướng nội dung trang chủ">
            <a href="#noi-dung">Nội dung tra cứu</a>
            <a href="#huong-dan">Hướng dẫn</a>
            <a href="#lien-he">Liên hệ Trạm Y tế</a>
          </nav>

          <div className="home-nav-actions">
            {user ? (
              <button
                type="button"
                className="home-btn-primary"
                onClick={() => navigate(targetTab)}
              >
                <span>{isStaff ? 'Xem hồ sơ của tôi' : 'Vào bảng quản lý'}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <div className="home-hero-provenance">
              <img
                src="/logo-vnua.png"
                alt=""
                aria-hidden="true"
                className="home-provenance-emblem"
              />
              <span>Trạm Y tế • Học viện Nông nghiệp Việt Nam</span>
            </div>

            <h1 className="home-hero-title">
              Tra cứu hồ sơ và kết quả khám sức khỏe cán bộ VNUA
            </h1>

            <p className="home-hero-desc">
              Nền tảng tra cứu kết quả khám sức khỏe định kỳ trực tuyến dành cho toàn thể cán bộ, giảng viên và người lao động Học viện Nông nghiệp Việt Nam.
            </p>

            <div className="home-hero-actions">
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>

              <a href="#huong-dan" className="home-btn-hero-secondary">
                Xem hướng dẫn tra cứu
              </a>
            </div>

            <dl className="home-hero-facts">
              <div>
                <dt>Xét nghiệm</dt>
                <dd>38+ chỉ số máu &amp; nước tiểu</dd>
              </div>
              <div>
                <dt>Phân loại</dt>
                <dd>Tiêu chuẩn Bộ Y tế (Loại I – V)</dd>
              </div>
              <div>
                <dt>Lưu trữ</dt>
                <dd>Đầy đủ lịch sử theo từng năm</dd>
              </div>
            </dl>
          </div>

          {/* Minh họa trực quan phiếu kết quả Sổ Sức Khỏe Điện Tử */}
          <div className="home-hero-preview" aria-label="Minh họa giao diện phiếu kết quả khám sức khỏe">
            <div className="preview-sheet">
              <div className="preview-sheet-head">
                <div>
                  <div className="preview-sheet-title">Sổ sức khỏe điện tử</div>
                  <div className="preview-sheet-sub">Đợt khám định kỳ năm 2026 • Trạm Y tế VNUA</div>
                </div>
                <span className="preview-status-pill">Đã hoàn thành</span>
              </div>

              <div className="preview-vitals-row">
                <div className="preview-vital-cell">
                  <span className="preview-vital-label">Chỉ số BMI</span>
                  <strong className="preview-vital-value">21.8</strong>
                  <span className="preview-vital-note">Bình thường</span>
                </div>
                <div className="preview-vital-cell">
                  <span className="preview-vital-label">Huyết áp</span>
                  <strong className="preview-vital-value">118/76</strong>
                  <span className="preview-vital-note">mmHg</span>
                </div>
                <div className="preview-vital-cell">
                  <span className="preview-vital-label">Nhịp tim</span>
                  <strong className="preview-vital-value">72</strong>
                  <span className="preview-vital-note">lần / phút</span>
                </div>
              </div>

              <div className="preview-checklist">
                <div className="preview-check-item">
                  <span>Xét nghiệm máu &amp; sinh hóa (Glucose, Men gan, Mỡ máu)</span>
                  <span className="preview-check-state">Đã có kết quả</span>
                </div>
                <div className="preview-check-item">
                  <span>Siêu âm ổ bụng, X-quang tim phổi &amp; Điện tâm đồ</span>
                  <span className="preview-check-state">Đã có kết quả</span>
                </div>
                <div className="preview-check-item">
                  <span>Khám lâm sàng Nội khoa &amp; Chuyên khoa</span>
                  <span className="preview-check-state">Đã kết luận</span>
                </div>
              </div>

              <div className="preview-conclusion">
                <div>
                  <span className="preview-conclusion-label">Kết luận phân loại sức khỏe</span>
                  <p className="preview-conclusion-text">
                    Các chỉ số cơ bản ổn định, duy trì chế độ vận động và khám định kỳ hằng năm.
                  </p>
                </div>
                <span className="preview-grade-badge">Loại I</span>
              </div>
            </div>
            <p className="preview-caption">Minh họa cấu trúc hồ sơ hiển thị sau khi cán bộ đăng nhập</p>
          </div>
        </div>
      </section>

      {/* 3. CÁC THÔNG TIN CÁN BỘ CÓ THỂ XEM */}
      <section id="noi-dung" className="home-section">
        <div className="home-section-header">
          <h2 className="section-title">Cán bộ có thể tra cứu những thông tin gì?</h2>
          <p className="section-desc">
            Dữ liệu khám sức khỏe định kỳ được Trạm Y tế số hóa, kiểm duyệt chuyên môn và lưu trữ bảo mật theo từng năm công tác.
          </p>
        </div>

        <div className="home-capabilities-grid">
          <article className="capability-item">
            <div className="capability-head">
              <div className="capability-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3 className="capability-title">Chỉ số sinh hiệu &amp; thể lực</h3>
            </div>
            <p className="capability-desc">
              Theo dõi các thông số thể lực cơ bản gồm chiều cao, cân nặng, chỉ số khối cơ thể (BMI), huyết áp động mạch và nhịp mạch qua từng đợt khám.
            </p>
            <div className="capability-meta">Chiều cao • Cân nặng • BMI • Huyết áp • Mạch</div>
          </article>

          <article className="capability-item">
            <div className="capability-head">
              <div className="capability-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6" />
                  <path d="M9 15h6" />
                </svg>
              </div>
              <h3 className="capability-title">Kết quả 38+ chỉ số xét nghiệm</h3>
            </div>
            <p className="capability-desc">
              Tra cứu bảng kết quả phân tích huyết học, sinh hóa máu và tổng phân tích nước tiểu kèm ngưỡng tham chiếu giúp nhận biết sớm chỉ số cần lưu ý.
            </p>
            <div className="capability-meta">Glucose • AST/ALT • Mỡ máu • Acid uric • Thận</div>
          </article>

          <article className="capability-item">
            <div className="capability-head">
              <div className="capability-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className="capability-title">Chẩn đoán hình ảnh &amp; thăm dò chức năng</h3>
            </div>
            <p className="capability-desc">
              Xem đầy đủ mô tả chuyên môn và kết luận của bác sĩ đối với các hạng mục cận lâm sàng quan trọng trong đợt khám sức khỏe định kỳ.
            </p>
            <div className="capability-meta">Siêu âm ổ bụng • X-quang • Điện tâm đồ • Tai Mũi Họng</div>
          </article>

          <article className="capability-item">
            <div className="capability-head">
              <div className="capability-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="capability-title">Kết luận &amp; phân loại sức khỏe</h3>
            </div>
            <p className="capability-desc">
              Xem kết luận phân loại sức khỏe theo tiêu chuẩn Bộ Y tế (từ Loại I đến Loại V) cùng tư vấn chuyên môn và theo dõi biến động giữa các năm.
            </p>
            <div className="capability-meta">Phân loại Loại I – V • Tư vấn bác sĩ • So sánh theo năm</div>
          </article>
        </div>
      </section>

      {/* 4. HƯỚNG DẪN TRA CỨU ĐƠN GIẢN */}
      <section id="huong-dan" className="home-section home-section-tight">
        <div className="home-guide-box">
          <div className="guide-header">
            <h2 className="guide-title">Quy trình đăng nhập và tra cứu kết quả</h2>
            <p className="guide-subtitle">
              Thực hiện 3 bước sau để xem toàn bộ hồ sơ khám sức khỏe định kỳ cá nhân.
            </p>
          </div>

          <ol className="guide-steps-row">
            <li className="guide-step">
              <span className="step-circle" aria-hidden="true">1</span>
              <div className="guide-step-body">
                <strong>Đăng nhập tài khoản cá nhân</strong>
                <p>Sử dụng email công vụ (@vnua.edu.vn) hoặc Mã số cán bộ do Trạm Y tế cấp.</p>
              </div>
            </li>
            <li className="guide-step">
              <span className="step-circle" aria-hidden="true">2</span>
              <div className="guide-step-body">
                <strong>Chọn đợt khám cần xem</strong>
                <p>Xem danh sách các đợt khám sức khỏe định kỳ được lưu trữ theo từng năm công tác.</p>
              </div>
            </li>
            <li className="guide-step">
              <span className="step-circle" aria-hidden="true">3</span>
              <div className="guide-step-body">
                <strong>Tra cứu chi tiết kết quả</strong>
                <p>Xem đầy đủ chỉ số xét nghiệm, kết quả siêu âm, điện tâm đồ và lời khuyên của bác sĩ.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* 5. THÔNG TIN TRẠM Y TẾ VNUA & LIÊN HỆ */}
      <section id="lien-he" className="home-section home-section-tight">
        <div className="home-contact-band">
          <div className="contact-band-left">
            <h2 className="contact-title-clean">Trạm Y tế Học viện Nông nghiệp Việt Nam</h2>
            <p className="contact-sub-clean">
              Nếu cán bộ chưa có tài khoản, quên mật khẩu hoặc cần hỗ trợ đối chiếu hồ sơ sức khỏe, vui lòng liên hệ trực tiếp Trạm Y tế:
            </p>
            <ul className="contact-items-list">
              <li>
                <span className="contact-item-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span>
                  <strong>Địa chỉ:</strong> Trạm Y tế VNUA, Thị trấn Trâu Quỳ, Gia Lâm, Hà Nội
                </span>
              </li>
              <li>
                <span className="contact-item-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span>
                  <strong>Điện thoại hỗ trợ:</strong>{' '}
                  <a href="tel:02462617556" className="contact-link">(024) 6261 7556</a>
                </span>
              </li>
              <li>
                <span className="contact-item-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <span>
                  <strong>Hộp thư điện tử:</strong>{' '}
                  <a href="mailto:tram-yte@vnua.edu.vn" className="contact-link">tram-yte@vnua.edu.vn</a>
                </span>
              </li>
            </ul>
          </div>

          <div className="contact-band-right">
            <p className="contact-hours-note">Tiếp nhận hỗ trợ trong giờ hành chính (Thứ 2 – Thứ 6)</p>
            <button
              type="button"
              className="home-btn-hero-primary"
              onClick={() => navigate(user ? targetTab : 'login')}
            >
              <span>{user ? (isStaff ? 'Xem hồ sơ của tôi' : 'Vào bảng điều khiển') : 'Đăng nhập ngay'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
