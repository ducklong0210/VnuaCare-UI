//
// Custom Hook tiện ích giúp lấy nhanh thông tin đăng nhập từ AuthContext
// Trả về đối tượng { user, login, logout } để sử dụng ở bất kỳ màn hình nào
//

import { useContext } from 'react';
import { AuthContext } from './authContext.js';

/**
 * Custom Hook tiện ích để lấy nhanh thông tin đăng nhập ở bất kỳ đâu:
 * const { user, login, logout } = useAuth()
 */
export function useAuth() {
  return useContext(AuthContext);
}
