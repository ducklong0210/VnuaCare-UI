/**
 * ==============================================================================
 * COMPONENT: Footer (Chân trang hệ thống quản trị)
 * VAI TRÒ:
 *   - Bản quyền hệ thống Học viện Nông nghiệp Việt Nam
 *   - Thông tin phiên bản phần mềm & liên hệ hỗ trợ kỹ thuật y tế
 * ==============================================================================
 */
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
  )
}

