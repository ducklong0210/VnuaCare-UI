// Quản lý trạng thái màn hình đang hoạt động (activeTab) trong toàn bộ ứng dụng
// Đồng bộ tab hiện tại với URL Hash để hỗ trợ người dùng bookmark hoặc refresh trang
// Cung cấp hàm navigate(tabId) để chuyển đổi nhanh giữa các màn hình chức năng

import { useState, useEffect } from 'react';
import { NavigationContext } from './navigationContext.js';

export function NavigationProvider({ children }) {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    return hash || 'dashboard';
  });

  const navigate = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = `#/${tabId}`;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return <NavigationContext.Provider value={{ activeTab, navigate }}>{children}</NavigationContext.Provider>;
}
