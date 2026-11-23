//
// Cấu hình HTTP dùng chung cho toàn bộ tầng API
// Quản lý địa chỉ máy chủ (API_BASE_URL), tự động gắn thẻ xác thực JWT và chuẩn hóa thông báo lỗi từ Backend
//

// Đọc địa chỉ máy chủ API từ file môi trường (.env) và xóa dấu "/" thừa ở cuối chuỗi để tránh lỗi ghép link (vd: //api/...)
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Tạo bộ header mặc định kèm thẻ xác thực JWT (chỉ gắn Authorization khi có token hợp lệ)
export function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// Đọc và chuẩn hóa thông báo lỗi tiếng Việt từ nhiều kiểu JSON lỗi khác nhau do Backend .NET trả về
export function parseApiError(result, defaultMsg) {
  // Trường hợp Backend trả về chuỗi thông báo lỗi trực tiếp trong trường message
  if (result?.message) return result.message;

  // Trường hợp lỗi kiểm tra dữ liệu đầu vào (ModelState Validation của .NET), gom toàn bộ mảng lỗi thành 1 chuỗi
  if (result?.errors && typeof result.errors === 'object') {
    const errorList = Object.values(result.errors).flat();
    if (errorList.length > 0) return errorList.join(', ');
  }

  // Trường hợp Backend trả về lỗi chuẩn ProblemDetails chỉ có trường title
  if (result?.title) return result.title;

  // Nếu không đọc được thông báo nào từ Backend thì dùng câu thông báo mặc định truyền vào
  return defaultMsg;
}