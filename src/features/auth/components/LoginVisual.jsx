function LoginVisual() {
  return (
    <aside className="login-visual" aria-label="Thông tin VNUACare">
      <div className="visual-brand">
        <span className="visual-shield" aria-hidden="true">◇</span>
        <span>Cổng Quản Lý Sức Khỏe Điện Tử</span>
      </div>

      <div className="visual-copy">
        <h2>
          Chăm sóc sức khỏe cán
          <br />
          bộ Học viện Nông
          <br />
          nghiệp Việt Nam
        </h2>
        <p>
          Hệ thống kết nối trực tiếp với Trạm Y tế Học viện,
          chuẩn hóa quy trình khám sức khỏe định kỳ, quản lý
          chỉ số sinh hóa máu, nhân trắc học và phân loại sức
          khỏe Bộ Y tế.
        </p>
      </div>

      <div className="visual-benefits">
        <div className="visual-benefit">
          <span className="benefit-icon" aria-hidden="true">◉</span>
          <div>
            <strong>Bảo mật hồ sơ y tế:</strong>
            <p>Mã hóa thông tin cá nhân theo quy định bảo mật của tổ chức.</p>
          </div>
        </div>
        <div className="visual-benefit">
          <span className="benefit-icon" aria-hidden="true">◉</span>
          <div>
            <strong>38+ Chỉ số xét nghiệm chuẩn:</strong>
            <p>Theo dõi tổng chức máu, đường huyết, mỡ máu, men gan, acid uric.</p>
          </div>
        </div>
        <div className="visual-benefit">
          <span className="benefit-icon" aria-hidden="true">◉</span>
          <div>
            <strong>Phiếu khám sức khỏe điện tử:</strong>
            <p>Xuất file y tế trực tiếp có chữ ký số Trạm Y tế.</p>
          </div>
        </div>
      </div>

      <div className="visual-footer">
        <span>Thành lập từ 1956</span>
        <span>Trâu Quỳ, Gia Lâm, Hà Nội</span>
      </div>
    </aside>
  )
}

export default LoginVisual
