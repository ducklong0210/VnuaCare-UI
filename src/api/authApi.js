//
// Tầng API xử lý đăng nhập và xác thực tài khoản người dùng
// Gửi tên đăng nhập và mật khẩu lên Backend để nhận về JWT accessToken cùng thông tin vai trò
//

import { authorizationRouter } from '../utils/api-router.js';
import { METHODS } from '../utils/index.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function loginRequest({ loginIdentifier, password }) {
  // Lấy đường dẫn đăng nhập từ api-router.js
  const endpoint = `${API_BASE_URL}${authorizationRouter.login}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: {
      'Content-Type': 'application/json',
    },
    // Đóng gói tài khoản và mật khẩu thành chuỗi JSON
    body: JSON.stringify({
      loginIdentifier: loginIdentifier, // Email hoặc mã số cán bộ
      password: password, // Mật khẩu
    }),
  });

  // Đọc dữ liệu JSON máy chủ trả về
  const result = await response.json();

  // Kiểm tra: nếu HTTP báo lỗi hoặc backend trả statusCode khác 200
  if (!response.ok || (result.statusCode && result.statusCode !== 200)) {
    // Lấy câu thông báo lỗi từ backend để báo cho người dùng
    throw new Error(result.message || 'Tài khoản hoặc mật khẩu không chính xác!');
  }

  // Trả về phần 'data' bên trong (chứa accessToken, fullname, role, staffCode,...)
  return result.data;
}
