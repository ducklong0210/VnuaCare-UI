import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Footer from './components/Footer.jsx'
import './MainLayout.css'
import '../styles/admin.css'

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
        <main className="app-main">
          {children}
        </main>
      </div>

      {/* 3. FOOTER Ở DƯỚI CÙNG */}
      <Footer />
    </div>
  )
}
