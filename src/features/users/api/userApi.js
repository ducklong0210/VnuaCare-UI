// Tầng API quản lý tài khoản người dùng và phân quyền truy cập hệ thống
// Cung cấp các chức năng lọc danh sách người dùng, tra cứu danh mục vai trò (ADMIN, DOCTOR, STAFF)
// Hỗ trợ tạo tài khoản mới, cập nhật phân quyền, đặt lại mật khẩu và khóa/xóa tài khoản

import { userManagerRouter } from '../../../core/utils/api-router.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Header xác thực kèm Bearer token
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// Lọc và phân trang danh sách người dùng
export async function getUserFilterApi({ textSearch = '', role = '', pageNumber = 1, pageSize = 10 } = {}) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.getFilter}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      textSearch: textSearch,
      role: role === 'ALL' ? '' : role,
      pageNumber: pageNumber,
      pageSize: pageSize,
      isActive: true,
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
    method: 'GET',
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
    method: 'POST',
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
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Lỗi khi cập nhật người dùng');
  }

  return result?.data ?? result;
}

// Xóa hoặc khóa tài khoản người dùng
export async function deleteUserApi(id) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.delete(id)}`;

  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Lỗi khi xóa người dùng');
  }

  return result?.data ?? result;
}

// Lấy danh sách tài khoản theo vai trò phục vụ dropdown
export async function getUserSelectApi(role = 'STAFF') {
  const query = role ? `?role=${encodeURIComponent(role)}&isActive=true` : '?isActive=true';
  const endpoint = `${API_BASE_URL}${userManagerRouter.getSelect}${query}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Lỗi khi tải danh sách tài khoản';
    try {
      const err = await response.json();
      if (err?.message) errorMessage = err.message;
    } catch {
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result?.data || [];
}
