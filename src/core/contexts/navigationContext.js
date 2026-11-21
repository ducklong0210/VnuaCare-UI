//
// Khai báo React Context dùng chung cho trạng thái điều hướng màn hình
// Được NavigationProvider cung cấp giá trị và được hook useNavigation() đọc khi cần chuyển trang
//

import { createContext } from 'react';

export const NavigationContext = createContext(null);
