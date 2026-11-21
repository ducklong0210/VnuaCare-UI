//
// Provider quản lý màn hình đang mở (activeTab) trong toàn ứng dụng
// Đồng bộ tab hiện tại với URL Hash và cung cấp hàm navigate() để chuyển trang mượt không cần reload
//

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
