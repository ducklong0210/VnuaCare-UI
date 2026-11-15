import { userManagerRouter } from '../../../utils/api-router.js'

// Lấy địa chỉ máy chủ API từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// 1. Hàm lấy Token đăng nhập để gửi kèm cho Backend nhận diện người dùng
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken')

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

// 2. Hàm lấy danh sách người dùng (dùng chung cho cả hiển thị ban đầu và khi tìm kiếm/lọc)
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

  // Bắt lỗi nếu tài khoản chưa đăng nhập hoặc token hết hạn
  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!')
  }

  if (!response.ok) {
    throw new Error('Lỗi khi tải danh sách người dùng từ hệ thống')
  }

  const result = await response.json()

  // Mảng danh sách người dùng thực sự nằm trong result.data.data
  return result?.data?.data || []
}

// 3. Hàm xem chi tiết 1 người dùng theo ID
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
