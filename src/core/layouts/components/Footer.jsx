//
// Chân trang (Footer) của giao diện hệ thống quản trị VnuaCare
// Hiển thị thông tin bản quyền Học viện Nông nghiệp Việt Nam và phiên bản hệ thống
//

export default function Footer() {
  return (
    <footer className="admin-footer">
      <div className="footer-left">
        <span>© 2026 <strong>Học viện Nông nghiệp Việt Nam</strong> — Hệ thống quản lý hồ sơ sức khỏe điện tử VNUACare</span>
      </div>
      <div className="footer-right">
        <span className="footer-version">Phiên bản <strong>v1.0.0</strong></span>
        <span className="footer-divider">•</span>
        <span className="footer-support">Phòng Y tế VNUA</span>
      </div>
    </footer>
  );
}
