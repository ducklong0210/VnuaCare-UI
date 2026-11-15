import { userManagerRouter } from '../../../utils/api-router.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Header xác thực kèm Bearer token
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken')

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

// Lọc và phân trang danh sách người dùng
export async function getUserFilterApi({
  textSearch = '',
  role = '',
  pageNumber = 1,
  pageSize = 10,
} = {}) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.getFilter}`

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
  })

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!')
  }

  if (!response.ok) {
    throw new Error('Lỗi khi tải danh sách người dùng từ hệ thống')
  }

  const result = await response.json()
  return result?.data?.data || []
}

// Lấy thông tin chi tiết người dùng theo ID
export async function getUserByIdApi(id) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.getById(id)}`

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Lỗi khi tải thông tin người dùng')
  }

  const result = await response.json()
  return result?.data || null
}
