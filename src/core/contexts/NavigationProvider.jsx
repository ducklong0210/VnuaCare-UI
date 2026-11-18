// Quản lý trạng thái màn hình đang hoạt động (activeTab) trong toàn bộ ứng dụng
// Đồng bộ tab hiện tại với URL Hash để hỗ trợ người dùng bookmark hoặc refresh trang
// Cung cấp hàm navigate(tabId) để chuyển đổi nhanh giữa các màn hình chức năng

import { useState, useEffect } from 'react';
import { NavigationContext } from './navigationContext.js';

export function NavigationProvider({ children }) {
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname.replace('/', '').trim();
    if (path) {
      return path;
    }
    // Nếu chưa có path: nếu đã đăng nhập thì vào dashboard, chưa đăng nhập thì hiển thị homepage
    const token = localStorage.getItem('accessToken');
    return token ? 'dashboard' : 'home';
  });

  const navigate = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState(null, '', `/${tabId}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '').trim();
      setActiveTab(path || (localStorage.getItem('accessToken') ? 'dashboard' : 'home'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return <NavigationContext.Provider value={{ activeTab, navigate }}>{children}</NavigationContext.Provider>;
}
