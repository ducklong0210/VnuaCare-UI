//
// Khung bố cục chính (Master Layout) dùng chung cho tất cả các trang quản trị
// Kết hợp Header cố định trên cùng, Sidebar thu gọn được (trên desktop) / ngăn kéo trượt (trên mobile), vùng nội dung chính và Footer
//

import { useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import './MainLayout.css';
import '../../styles/admin.css';

export default function MainLayout({ children, activeTab }) {
  // Trạng thái thu gọn/mở rộng Sidebar trên desktop (lưu vào localStorage để giữ nguyên khi chuyển trang)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );

  // Trạng thái đóng/mở ngăn kéo menu trên tablet và điện thoại
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((currentCollapsed) => {
      const nextCollapsed = !currentCollapsed;
      localStorage.setItem('sidebarCollapsed', String(nextCollapsed));
      return nextCollapsed;
    });
  };

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen((currentOpen) => !currentOpen);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-layout">
      {/* 1. HEADER Ở TRÊN CÙNG (100% CHIỀU RỘNG) */}
      <Header
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={handleToggleMobileMenu}
      />

      {/* 2. THÂN WEBSITE: BÊN TRÁI LÀ NAV, BÊN PHẢI LÀ NỘI DUNG */}
      <div className="app-body">
        {/* Lớp phủ mờ khi mở menu trượt trên tablet/mobile */}
        {mobileMenuOpen && (
          <div
            className="sidebar-mobile-backdrop"
            onClick={handleCloseMobileMenu}
            aria-hidden="true"
          />
        )}

        {/* Thanh Menu điều hướng bên trái (Nav) */}
        <Sidebar
          activeTab={activeTab}
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={handleCloseMobileMenu}
        />

        {/* Vùng hiển thị nội dung chính của từng trang */}
        <main className="app-main">{children}</main>
      </div>

      {/* 3. FOOTER Ở DƯỚI CÙNG */}
      <Footer />
    </div>
  );
}
