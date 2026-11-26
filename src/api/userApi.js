//
// Tầng API quản lý tài khoản người dùng, phân quyền và hồ sơ cá nhân
// Hỗ trợ lọc phân trang, CRUD tài khoản, xem/cập nhật thông tin cá nhân và đổi mật khẩu
//

import { userManagerRouter } from '../utils/api-router.js';
import { apiRequest, apiGetOptional } from './httpClient.js';
import { METHODS } from '../utils/index.js';

// Lọc và phân trang danh sách người dùng
export async function getUserFilterApi({ textSearch = '', role = '', pageNumber = 1, pageSize = 10 } = {}) {
  // Nếu chọn "Tất cả vai trò" ('ALL') thì gửi chuỗi rỗng để Backend trả về đủ mọi vai trò
  const cleanRole = role && role !== 'ALL' ? role : '';

  const result = await apiRequest(userManagerRouter.getFilter, {
    method: METHODS.POST,
    body: { textSearch, role: cleanRole, pageNumber, pageSize },
    defaultError: 'Lỗi khi tải danh sách người dùng từ hệ thống',
  });

  return {
    items: result?.data?.data || [],
    totalCount: result?.data?.totalCount || 0,
    pageNumber: result?.data?.pageNumber || pageNumber,
    pageSize: result?.data?.pageSize || pageSize,
  };
}

// Lấy thông tin chi tiết người dùng theo ID
export async function getUserByIdApi(id) {
  const result = await apiRequest(userManagerRouter.getById(id), {
    method: METHODS.GET,
    defaultError: 'Lỗi khi tải thông tin người dùng',
  });
  return result?.data || null;
}

// Tạo mới người dùng
export async function createUserApi(data) {
  const result = await apiRequest(userManagerRouter.create, {
    method: METHODS.POST,
    body: data,
    defaultError: 'Lỗi khi tạo người dùng',
  });
  return result?.data ?? result;
}

// Cập nhật thông tin người dùng
export async function updateUserApi(data) {
  const result = await apiRequest(userManagerRouter.update, {
    method: METHODS.PUT,
    body: data,
    defaultError: 'Lỗi khi cập nhật người dùng',
  });
  return result?.data ?? result;
}

// Xóa người dùng theo ID
export async function deleteUserApi(id) {
  const result = await apiRequest(userManagerRouter.delete(id), {
    method: METHODS.DELETE,
    defaultError: 'Lỗi khi xóa người dùng',
  });
  return result?.data ?? result;
}

// Lấy danh sách tài khoản người dùng theo vai trò
export async function getUserSelectApi(role = '') {
  const query = role ? `?role=${encodeURIComponent(role)}&isActive=true` : '?isActive=true';
  return await apiGetOptional(`${userManagerRouter.getSelect}${query}`, []);
}

// Lấy thông tin hồ sơ cá nhân của người đang đăng nhập (GET /api/v1/users/me)
export async function getMyProfileApi() {
  const result = await apiRequest(userManagerRouter.getMe, {
    method: METHODS.GET,
    defaultError: 'Không thể tải thông tin hồ sơ cá nhân',
    checkStatusCode: true,
  });
  return result?.data || null;
}

// Cập nhật thông tin hồ sơ cá nhân (PUT /api/v1/users/profile)
export async function updateMyProfileApi(data) {
  const result = await apiRequest(userManagerRouter.updateProfile, {
    method: METHODS.PUT,
    body: data,
    defaultError: 'Cập nhật hồ sơ cá nhân thất bại',
    checkStatusCode: true,
  });
  return result?.data ?? result;
}

// Đổi mật khẩu tài khoản đang đăng nhập (POST /api/v1/users/change-password)
export async function changePasswordApi(data) {
  const result = await apiRequest(userManagerRouter.changePassword, {
    method: METHODS.POST,
    body: data,
    defaultError: 'Đổi mật khẩu thất bại',
    checkStatusCode: true,
  });
  return result?.data ?? result;
}
