//
// Tầng API quản lý tài khoản người dùng, phân quyền và hồ sơ cá nhân
// Hỗ trợ lọc phân trang, CRUD tài khoản, xem/cập nhật thông tin cá nhân và đổi mật khẩu
//

import { userManagerRouter } from '../utils/api-router.js';
import { getAuthHeaders, parseApiError, API_BASE_URL } from './httpClient.js';
import { METHODS } from '../utils/index.js';



// Lọc và phân trang danh sách người dùng
export async function getUserFilterApi({ textSearch = '', role = '', pageNumber = 1, pageSize = 10 } = {}) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.getFilter}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify({
      textSearch: textSearch,
      role: role,
      pageNumber: pageNumber,
      pageSize: pageSize,
    }),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi tải danh sách người dùng từ hệ thống';
    try {
      const err = await response.json();
      if (err?.message) {
        errorMessage = err.message;
      }
    } catch {
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return {
    items: result?.data?.data || [],
    totalCount: result?.data?.totalCount || 0,
    pageNumber: result?.data?.pageNumber || pageNumber,
    pageSize: result?.data?.pageSize || pageSize,
  };
}

// Lấy thông tin chi tiết người dùng theo ID
export async function getUserByIdApi(id) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.getById(id)}`;

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Lỗi khi tải thông tin người dùng');
  }

  const result = await response.json();
  return result?.data || null;
}

// Tạo mới người dùng
export async function createUserApi(data) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.create}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Lỗi khi tạo người dùng');
  }

  return result?.data ?? result;
}

// Cập nhật thông tin người dùng
export async function updateUserApi(data) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.update}`;

  const response = await fetch(endpoint, {
    method: METHODS.PUT,
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Lỗi khi cập nhật người dùng');
  }

  return result?.data ?? result;
}

// Xóa người dùng theo ID
export async function deleteUserApi(id) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.delete(id)}`;

  const response = await fetch(endpoint, {
    method: METHODS.DELETE,
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Lỗi khi xóa người dùng');
  }

  return result?.data ?? result;
}

// Lấy danh sách tài khoản người dùng theo vai trò
export async function getUserSelectApi(role = '') {
  const endpoint = `${API_BASE_URL}${userManagerRouter.getSelect(role)}`;

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return result?.data || [];
}

// Lấy thông tin hồ sơ cá nhân của người đang đăng nhập (GET /api/v1/users/me)
export async function getMyProfileApi() {
  const endpoint = `${API_BASE_URL}${userManagerRouter.getMe}`;

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || (result.statusCode && result.statusCode !== 200)) {
    throw new Error(parseApiError(result, 'Không thể tải thông tin hồ sơ cá nhân'));
  }

  return result?.data || null;
}

// Cập nhật thông tin hồ sơ cá nhân (PUT /api/v1/users/profile)
export async function updateMyProfileApi(data) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.updateProfile}`;

  const response = await fetch(endpoint, {
    method: METHODS.PUT,
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || (result.statusCode && result.statusCode !== 200)) {
    throw new Error(parseApiError(result, 'Cập nhật hồ sơ cá nhân thất bại'));
  }

  return result?.data ?? result;
}

// Đổi mật khẩu tài khoản đang đăng nhập (POST /api/v1/users/change-password)
export async function changePasswordApi(data) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.changePassword}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || (result.statusCode && result.statusCode !== 200)) {
    throw new Error(parseApiError(result, 'Đổi mật khẩu thất bại'));
  }

  return result?.data ?? result;
}
