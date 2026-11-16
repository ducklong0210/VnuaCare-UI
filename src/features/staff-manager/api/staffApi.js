import { staffRouter } from '../../../utils/api-router.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Header xác thực kèm Bearer token
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken')

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

// Lọc và phân trang danh sách Cán bộ
export async function getStaffFilterApi({
  textSearch = '',
  departmentId = null,
  pageNumber = 1,
  pageSize = 10,
  isActive = true,
} = {}) {
  const endpoint = `${API_BASE_URL}${staffRouter.getFilter}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      textSearch: textSearch,
      departmentId: departmentId && departmentId !== 'ALL' ? Number(departmentId) : null,
      pageNumber: pageNumber,
      pageSize: pageSize,
      isActive: isActive,
    }),
  })

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!')
  }

  if (!response.ok) {
    throw new Error('Lỗi khi tải danh sách cán bộ')
  }

  const result = await response.json()
  return result?.data?.data || []
}

// Lấy danh mục Khoa / Phòng ban cho dropdown
export async function getDepartmentsApi() {
  const endpoint = `${API_BASE_URL}${staffRouter.getDepartments}`

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Lỗi khi tải danh mục phòng ban')
  }

  const result = await response.json()
  return result?.data || []
}

// Thêm mới cán bộ
export async function createStaffApi(data) {
  const endpoint = `${API_BASE_URL}${staffRouter.create}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  const result = await response.json()
  if (!response.ok) {
    throw new Error(result.message || 'Lỗi khi thêm cán bộ')
  }

  return result?.data ?? result
}

// Cập nhật thông tin cán bộ
export async function updateStaffApi(data) {
  const endpoint = `${API_BASE_URL}${staffRouter.update}`

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  const result = await response.json()
  if (!response.ok) {
    throw new Error(result.message || 'Lỗi khi cập nhật cán bộ')
  }

  return result?.data ?? result
}

// Xóa cán bộ theo ID
export async function deleteStaffApi(staffId) {
  const endpoint = `${API_BASE_URL}${staffRouter.delete(staffId)}`

  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  const result = await response.json()
  if (!response.ok) {
    throw new Error(result.message || 'Lỗi khi xóa cán bộ')
  }

  return result?.data ?? result
}
