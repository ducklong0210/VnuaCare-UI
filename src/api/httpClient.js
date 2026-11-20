

// Cấu hình HTTP dùng chung cho toàn bộ tầng API: địa chỉ máy chủ, header JWT và bộ đọc lỗi từ Backend

// Đọc địa chỉ máy chủ API từ file môi trường (.env) và xóa dấu "/" thừa ở cuối chuỗi để tránh lỗi ghép link (vd: //api/...)
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Tạo bộ header mặc định kèm thẻ xác thực JWT để gửi trong mọi request cần đăng nhập
export function getAuthHeaders() {
  const token = localStorage.getItem('accessToken'); // Đọc "chìa khóa" JWT đã lưu trong trình duyệt lúc đăng nhập
  return {
    'Content-Type': 'application/json', // Báo với Backend rằng dữ liệu gửi đi có định dạng JSON
    Authorization: `Bearer ${token}`, // Đính kèm thẻ JWT theo chuẩn Bearer để Backend kiểm tra quyền
  };
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