//
// Tầng API quản lý hồ sơ khám sức khỏe: lọc phân trang, xem chi tiết và thêm/sửa/xóa hồ sơ
// Đồng thời cung cấp các hàm tải danh mục chọn (đợt khám, phòng ban, cán bộ, bác sĩ, chuyên khoa)
//

import { healthRecordRouter, campaignRouter, doctorRouter } from '../utils/api-router.js';
import { getAuthHeaders, parseApiError, API_BASE_URL } from './httpClient.js';
import { DEFAULT_HEALTH_CLASSIFICATIONS, DEFAULT_RECORD_STATUSES, METHODS } from '../utils/index.js';

// Lọc và phân trang danh sách Hồ sơ khám sức khỏe
export async function getHealthRecordFilterApi({
  textSearch = '', // Từ khóa tìm theo mã SID, tên cán bộ, mã nhân viên
  campaignId = null, // Mã đợt khám cần lọc (null hoặc 'ALL' là lấy tất cả)
  departmentId = null, // Mã khoa / phòng ban cần lọc
  status = '', // Trạng thái hồ sơ (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  healthClassification = '', // Phân loại sức khỏe (Loại I -> Loại V)
  pageNumber = 1, // Trang hiện tại cần lấy
  pageSize = 10, // Số dòng dữ liệu trên mỗi trang
} = {}) {
  // Ghép địa chỉ máy chủ với đường dẫn API lọc hồ sơ
  const endpoint = `${API_BASE_URL}${healthRecordRouter.getFilter}`;

  // Khởi tạo gói dữ liệu cơ bản luôn phải gửi lên Backend
  const bodyData = {
    textSearch: textSearch.trim(), // Cắt bỏ khoảng trắng thừa đầu cuối từ khóa tìm kiếm
    pageNumber: pageNumber,
    pageSize: pageSize,
  };

  // Chỉ đính kèm các tiêu chí lọc vào body khi người dùng thực sự chọn (tránh gửi chữ 'ALL' gây lỗi ép kiểu số ở Backend)
  if (campaignId && campaignId !== 'ALL') {
    bodyData.campaignId = Number(campaignId);
  }

  if (departmentId && departmentId !== 'ALL') {
    bodyData.departmentId = Number(departmentId);
  }

  if (status && status !== 'ALL') {
    bodyData.status = status;
  }

  if (healthClassification && healthClassification !== 'ALL') {
    bodyData.healthClassification = healthClassification;
  }

  // Gửi yêu cầu POST kèm thẻ JWT và gói điều kiện lọc dạng chuỗi JSON lên Backend
  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify(bodyData),
  });

  // Nếu Backend trả mã 401 nghĩa là token hết hạn hoặc chưa đăng nhập
  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  // Nếu mã HTTP không thành công (400, 403, 500...) thì đọc thông báo lỗi từ Backend và ném lỗi lên giao diện
  if (!response.ok) {
    let errorMessage = 'Lỗi khi tải danh sách hồ sơ khám';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua nếu phản hồi lỗi từ server không phải định dạng JSON
    }
    throw new Error(errorMessage);
  }

  // Đọc dữ liệu JSON trả về: lớp data ngoài là vỏ bọc ApiResponse, lớp data trong là mảng bản ghi của PagedResult
  const result = await response.json();

  // Chuẩn hóa lại thành object gọn 1 lớp để các component giao diện gọi dùng dễ hiểu hơn
  return {
    items: result?.data?.data || [], // Mảng danh sách hồ sơ của trang hiện tại
    totalCount: result?.data?.totalCount || 0, // Tổng số hồ sơ khớp bộ lọc trong toàn bộ database
    pageNumber: result?.data?.pageNumber || pageNumber, // Số trang hiện tại
    pageSize: result?.data?.pageSize || pageSize, // Số dòng trên mỗi trang
  };
}

// Lấy danh mục Đợt khám sức khỏe cho dropdown (API không phân trang nên chỉ có 1 lớp data)
export async function getCampaignsSelectApi() {
  const endpoint = `${API_BASE_URL}${campaignRouter.getSelect}`;

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  // Nếu lỗi thì trả mảng rỗng để dropdown không làm sập trang
  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return result?.data || [];
}

// Lấy danh mục Khoa / Phòng ban cho dropdown
export async function getDepartmentsSelectApi() {
  const endpoint = `${API_BASE_URL}${healthRecordRouter.getDepartments}`;

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  // Nếu lỗi thì trả mảng rỗng để dropdown vẫn hiển thị an toàn
  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return result?.data || [];
}

// Lấy danh mục Phân loại sức khỏe chuẩn hóa sẵn ở Frontend theo quy định Bộ Y tế
export async function getClassificationsApi() {
  return DEFAULT_HEALTH_CLASSIFICATIONS;
}

// Lấy danh mục Trạng thái hồ sơ khám chuẩn hóa sẵn ở Frontend
export async function getStatusesApi() {
  return DEFAULT_RECORD_STATUSES;
}

// Lấy danh sách Cán bộ phục vụ chọn trong biểu mẫu tạo hồ sơ khám (có thể lọc theo phòng ban)
export async function getStaffsSelectApi(departmentId = null) {
  let endpoint = `${API_BASE_URL}${healthRecordRouter.getStaffs}`;
  // Nếu có chọn phòng ban cụ thể thì nối thêm tham số query lên URL
  if (departmentId && departmentId !== 'ALL') {
    endpoint += `?departmentId=${departmentId}`;
  }

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

// Lấy danh sách Bác sĩ kết luận hồ sơ khám (có thể lọc theo chuyên khoa)
export async function getDoctorsSelectApi(specialtyId = null) {
  let endpoint = `${API_BASE_URL}${healthRecordRouter.getDoctors}`;
  // Nếu có chọn chuyên khoa cụ thể thì nối thêm tham số query lên URL
  if (specialtyId && specialtyId !== 'ALL') {
    endpoint += `?specialtyId=${specialtyId}`;
  }

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

// Lấy danh mục Chuyên khoa y tế cho dropdown
export async function getSpecialtiesApi() {
  const endpoint = `${API_BASE_URL}${doctorRouter.getSpecialties}`;

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

// Lấy chi tiết một hồ sơ khám theo mã ID
export async function getHealthRecordByIdApi(recordId) {
  const endpoint = `${API_BASE_URL}${healthRecordRouter.getById(recordId)}`;

  const response = await fetch(endpoint, {
    method: METHODS.GET,
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Lỗi khi lấy thông tin chi tiết hồ sơ';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua nếu phản hồi lỗi từ server không phải JSON
    }
    throw new Error(errorMessage);
  }

  // Trả về object chi tiết hồ sơ bên trong lớp data (hoặc null nếu không tìm thấy)
  const result = await response.json();
  return result?.data || null;
}

// Gửi dữ liệu tạo mới hồ sơ khám sức khỏe lên Backend
export async function createHealthRecordApi(recordData) {
  const endpoint = `${API_BASE_URL}${healthRecordRouter.create}`;

  const response = await fetch(endpoint, {
    method: METHODS.POST,
    headers: getAuthHeaders(),
    body: JSON.stringify(recordData),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi thêm mới hồ sơ khám';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua nếu phản hồi lỗi từ server không phải JSON
    }
    throw new Error(errorMessage);
  }

  // Trả nguyên phản hồi JSON từ Backend (gồm success, message và dữ liệu vừa tạo)
  return await response.json();
}

// Gửi dữ liệu cập nhật thông tin và kết luận hồ sơ khám lên Backend
export async function updateHealthRecordApi(recordData) {
  const endpoint = `${API_BASE_URL}${healthRecordRouter.update}`;

  const response = await fetch(endpoint, {
    method: METHODS.PUT,
    headers: getAuthHeaders(),
    body: JSON.stringify(recordData),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi cập nhật hồ sơ khám';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua nếu phản hồi lỗi từ server không phải JSON
    }
    throw new Error(errorMessage);
  }

  // Trả nguyên phản hồi JSON từ Backend để màn hình hiển thị thông báo kết quả
  return await response.json();
}

// Gửi yêu cầu xóa một hồ sơ khám sức khỏe theo mã ID
export async function deleteHealthRecordApi(recordId) {
  const endpoint = `${API_BASE_URL}${healthRecordRouter.delete(recordId)}`;

  const response = await fetch(endpoint, {
    method: METHODS.DELETE,
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi xóa hồ sơ khám';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua nếu phản hồi lỗi từ server không phải JSON
    }
    throw new Error(errorMessage);
  }

  // Trả nguyên phản hồi JSON từ Backend xác nhận đã xóa thành công
  return await response.json();
}
