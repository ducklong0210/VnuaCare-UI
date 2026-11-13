import { authorizationRouter } from '../../../utils/api-router.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// '{ loginIdentifier, password }': Tên 2 trường đúng 100% theo tài liệu Swagger của backend
export async function loginRequest({ loginIdentifier, password }) {

  // Lấy đường dẫn đăng nhập từ từ điển api-router.js
  const endpoint = `${API_BASE_URL}${authorizationRouter.login}`

  // 'fetch(...)': Gửi yêu cầu đăng nhập đến backend
  // 'await': Đợi phản hồi từ máy chủ trả về
  const response = await fetch(endpoint, {
    // Phương thức 'POST' theo đúng đặc tả của Swagger
    method: 'POST',

    // Báo cho backend biết dữ liệu gửi lên là JSON
    headers: {
      'Content-Type': 'application/json',
    },

    // Đóng gói tài khoản và mật khẩu thành chuỗi JSON
    body: JSON.stringify({
      loginIdentifier: loginIdentifier, // Email hoặc mã số cán bộ
      password: password,               // Mật khẩu
    }),
  })

  // Đọc dữ liệu JSON máy chủ trả về
  const result = await response.json()

  // Kiểm tra: nếu HTTP báo lỗi hoặc backend trả statusCode khác 200
  if (!response.ok || (result.statusCode && result.statusCode !== 200)) {
    // Lấy câu thông báo lỗi từ backend để báo cho người dùng
    throw new Error(result.message || 'Tài khoản hoặc mật khẩu không chính xác!')
  }

  // Trả về phần 'data' bên trong (chứa accessToken, fullname, role, staffCode,...)
  return result.data
}
