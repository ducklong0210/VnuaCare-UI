//
// Provider quản lý màn hình đang mở (activeTab) trong toàn ứng dụng
// Đồng bộ tab hiện tại với History API (/pathname) và cung cấp hàm navigate() chuyển trang mượt không cần reload
//

import { useState, useEffect } from 'react';
import { NavigationContext } from './navigationContext.js';
import { ROLES } from '../../utils/index.js';

function getDefaultTab() {
  const token = localStorage.getItem('accessToken');
  if (!token) return 'home';
  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if ((savedUser?.role || '').toUpperCase() === ROLES.STAFF) {
      return 'staff-portal';
    }
  } catch {
    // Bỏ qua nếu dữ liệu user bị hỏng
  }
  return 'dashboard';
}

export function NavigationProvider({ children }) {
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname.replace('/', '').trim();
    return path || getDefaultTab();
  });

  const navigate = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState(null, '', `/${tabId}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '').trim();
      setActiveTab(path || getDefaultTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return <NavigationContext.Provider value={{ activeTab, navigate }}>{children}</NavigationContext.Provider>;
}
