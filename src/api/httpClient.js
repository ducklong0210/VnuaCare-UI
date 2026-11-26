//
// Cấu hình và hàm gọi HTTP dùng chung cho toàn bộ tầng API
// Quản lý địa chỉ máy chủ (API_BASE_URL), tự động gắn thẻ JWT, đọc JSON an toàn và chuẩn hóa lỗi từ Backend
//

// Đọc địa chỉ máy chủ API từ file môi trường (.env) và xóa dấu "/" thừa ở cuối chuỗi (tránh lỗi //api/...)
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Tạo bộ header mặc định kèm thẻ xác thực JWT (chỉ gắn Authorization khi đã có token)
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

// Đọc và chuẩn hóa thông báo lỗi tiếng Việt từ các kiểu JSON lỗi do Backend .NET trả về
export function parseApiError(result, defaultMsg) {
  // Trường hợp Backend trả chuỗi lỗi trực tiếp trong trường message
  if (result?.message) {
    return result.message;
  }

  // Trường hợp lỗi kiểm tra dữ liệu đầu vào (Validation), gom mảng lỗi thành 1 chuỗi
  if (result?.errors && typeof result.errors === 'object') {
    const errorList = Object.values(result.errors).flat();
    if (errorList.length > 0) {
      return errorList.join(', ');
    }
  }

  // Trường hợp Backend trả lỗi chuẩn ProblemDetails chỉ có trường title
  if (result?.title) {
    return result.title;
  }

  // Nếu không đọc được lỗi cụ thể thì dùng câu mặc định
  return defaultMsg;
}

// Đọc dữ liệu JSON từ phản hồi một cách an toàn (không bị lỗi nếu server trả 204 hoặc nội dung rỗng)
async function parseJsonSafe(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Hàm gửi yêu cầu HTTP dùng chung cho các API cần xác thực (tự gắn token và kiểm tra lỗi 401/403/HTTP)
export async function apiRequest(path, options = {}) {
  const method = options.method || 'GET';
  const body = options.body;
  const defaultError = options.defaultError || 'Có lỗi xảy ra';
  const checkStatusCode = options.checkStatusCode || false;

  // Ghép địa chỉ máy chủ với đường dẫn API
  const endpoint = `${API_BASE_URL}${path}`;

  // Chuẩn bị cấu hình gửi đi
  const fetchOptions = {
    method: method,
    headers: getAuthHeaders(),
  };

  // Chỉ đóng gói body thành JSON khi có truyền dữ liệu gửi lên (POST / PUT)
  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  // Gửi yêu cầu tới Backend
  const response = await fetch(endpoint, fetchOptions);

  // Kiểm tra lỗi 401: phiên đăng nhập hết hạn hoặc chưa đăng nhập
  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  // Đọc dữ liệu JSON máy chủ trả về
  const result = await parseJsonSafe(response);

  // Kiểm tra lỗi 403: tài khoản không có quyền thực hiện thao tác này
  if (response.status === 403) {
    throw new Error(parseApiError(result, 'Bạn không có quyền thực hiện thao tác này!'));
  }

  // Kiểm tra lỗi HTTP khác (400, 404, 500...) hoặc statusCode bên trong JSON khác 200
  const isBackendStatusError = checkStatusCode && result?.statusCode && result.statusCode !== 200;
  if (!response.ok || isBackendStatusError) {
    throw new Error(parseApiError(result, defaultError));
  }

  return result;
}

// Hàm GET an toàn cho danh mục dropdown hoặc phiếu chưa có dữ liệu (lỗi thì trả fallback để không sập trang)
export async function apiGetOptional(path, fallback = null) {
  const endpoint = `${API_BASE_URL}${path}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return fallback;
  }

  const result = await parseJsonSafe(response);
  return result?.data ?? fallback;
}
