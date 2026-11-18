// Khung giao diện chính (Master Layout) dùng chung cho tất cả các trang quản trị
// Tổ chức bố cục chuẩn: Header cố định trên cùng, Sidebar menu điều hướng bên trái và Footer dưới cùng
// Nhận children đại diện cho nội dung của từng chức năng hiển thị tại vùng app-main

import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import './MainLayout.css';
import '../../styles/admin.css';

export default function MainLayout({ children, activeTab }) {
  return (
    <div className="app-layout">
      {/* 1. HEADER Ở TRÊN CÙNG (100% CHIỀU RỘNG) */}
      <Header />

      {/* 2. THÂN WEBSITE: BÊN TRÁI LÀ NAV, BÊN PHẢI LÀ NỘI DUNG */}
      <div className="app-body">
        {/* Thanh Menu điều hướng bên trái (Nav) */}
        <Sidebar activeTab={activeTab} />

        {/* Vùng hiển thị nội dung chính của từng trang */}
        <main className="app-main">{children}</main>
      </div>

      {/* 3. FOOTER Ở DƯỚI CÙNG */}
      <Footer />
    </div>
  );
}
