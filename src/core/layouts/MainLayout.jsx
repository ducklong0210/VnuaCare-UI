//
// Khung bố cục chính (Master Layout) dùng chung cho tất cả các trang quản trị
// Kết hợp Header cố định trên cùng, Sidebar thu gọn được bên trái, vùng nội dung chính và Footer
//

import { useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import './MainLayout.css';
import '../../styles/admin.css';

export default function MainLayout({ children, activeTab }) {
  // Trạng thái thu gọn/mở rộng Sidebar (lưu vào localStorage để giữ nguyên khi chuyển trang)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', String(next));
      return next;
    });
  };

  return (
    <div className="app-layout">
      {/* 1. HEADER Ở TRÊN CÙNG (100% CHIỀU RỘNG) */}
      <Header />

      {/* 2. THÂN WEBSITE: BÊN TRÁI LÀ NAV, BÊN PHẢI LÀ NỘI DUNG */}
      <div className="app-body">
        {/* Thanh Menu điều hướng bên trái (Nav) */}
        <Sidebar
          activeTab={activeTab}
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
        />

        {/* Vùng hiển thị nội dung chính của từng trang */}
        <main className="app-main">{children}</main>
      </div>

      {/* 3. FOOTER Ở DƯỚI CÙNG */}
      <Footer />
    </div>
  );
}
