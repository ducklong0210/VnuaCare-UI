//
// Custom Hook tiện ích giúp đọc trạng thái tab hiện tại và hàm chuyển trang từ NavigationContext
// Kiểm tra an toàn và báo lỗi nếu gọi ngoài phạm vi bọc của NavigationProvider
//

import { useContext } from 'react';
import { NavigationContext } from './navigationContext.js';

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation phải được sử dụng bên trong NavigationProvider');
  }
  return context;
}
