//
// Khai báo React Context dùng chung cho dữ liệu xác thực người dùng
// Được AuthProvider cung cấp giá trị và được hook useAuth() đọc ở mọi component trong ứng dụng
//

import { createContext } from 'react';

// Tạo Context dùng chung cho toàn bộ tính năng xác thực
export const AuthContext = createContext(null);
