import { userManagerRouter } from '../../../utils/api-router.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Lấy Header chứa Token xác thực
function getAuthHeaders() {
  let token = localStorage.getItem('accessToken') || localStorage.getItem('token')

  // Nếu chưa có token lẻ, thử đọc từ object user đã lưu
  if (!token) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      token = user?.accessToken || user?.token
    } catch {
      token = null
    }
  }

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Lấy danh sách người dùng qua phương thức POST (kèm Body theo Swagger)
export async function getUserFilterApi({
  pageNumber = 1,
  pageSize = 10,
  page,
  size,
  textSearch = '',
  keyword = '',
  role = '',
  isActive = true,
} = {}) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.getFilter}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      textSearch: textSearch || keyword || '',
      pageNumber: page || pageNumber || 1,
      pageSize: size || pageSize || 10,
      role: role === 'ALL' ? '' : role,
      isActive: isActive,
    }),
  })

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn (401 Unauthorized). Vui lòng đăng xuất và đăng nhập lại!')
  }

  if (!response.ok) {
    throw new Error(`Lỗi khi tải danh sách người dùng (Mã lỗi: ${response.status})`)
  }

  const result = await response.json()

  // Backend C# trả về ApiResponse<PaginationList<UserModel>>:
  // result.data là đối tượng phân trang { data: [...danh sách user...], totalCount, pageNumber, pageSize }
  // Danh sách mảng người dùng thực sự nằm ở result.data.data!
  if (Array.isArray(result?.data?.data)) {
    return result.data.data
  }
  if (Array.isArray(result?.data)) {
    return result.data
  }
  return []
}

// Lấy chi tiết 1 người dùng theo ID
export async function getUserByIdApi({ id }) {
  const endpoint = `${API_BASE_URL}${userManagerRouter.getById(id)}`

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn (401 Unauthorized). Vui lòng đăng xuất và đăng nhập lại!')
  }

  if (!response.ok) {
    throw new Error(`Lỗi khi tải thông tin người dùng (Mã lỗi: ${response.status})`)
  }

  const result = await response.json()
  return result?.data || null
}

// Hàm lấy nhanh danh sách người dùng (gọi vào getUserFilterApi)
export async function getListUserApi() {
  return await getUserFilterApi()
}
