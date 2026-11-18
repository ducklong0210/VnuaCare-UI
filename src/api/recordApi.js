// Tầng API quản lý hồ sơ khám sức khỏe: lọc danh sách, phân trang và các thao tác thêm/sửa/xóa hồ sơ
// Cung cấp các hàm tải danh mục lựa chọn (Lookups): đợt khám, phòng ban, danh sách bác sĩ và cán bộ
// Định nghĩa 2 danh mục chuẩn tĩnh: DEFAULT_HEALTH_CLASSIFICATIONS (Bộ Y tế) và DEFAULT_RECORD_STATUSES

import { healthRecordRouter, campaignRouter, doctorRouter } from '../utils/api-router.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Header xác thực kèm Bearer token
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// Trích xuất thông báo lỗi từ backend
function parseApiError(result, defaultMsg) {
  if (result?.message) return result.message;
  if (result?.errors && typeof result.errors === 'object') {
    const errorList = Object.values(result.errors).flat();
    if (errorList.length > 0) return errorList.join(', ');
  }
  if (result?.title) return result.title;
  return defaultMsg;
}

// Lọc và phân trang danh sách Hồ sơ khám sức khỏe
export async function getHealthRecordFilterApi({
  textSearch = '',
  campaignId = null,
  departmentId = null,
  status = '',
  healthClassification = '',
  pageNumber = 1,
  pageSize = 10,
} = {}) {
  const endpoint = `${API_BASE_URL}${healthRecordRouter.getFilter}`;

  const bodyData = {
    textSearch: textSearch.trim(),
    pageNumber: pageNumber,
    pageSize: pageSize,
  };

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

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bodyData),
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!response.ok) {
    let errorMessage = 'Lỗi khi tải danh sách hồ sơ khám';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
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

// Lấy danh mục Đợt khám sức khỏe cho dropdown
export async function getCampaignsSelectApi() {
  const endpoint = `${API_BASE_URL}${campaignRouter.getSelect}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

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
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return result?.data || [];
}

// Danh mục Phân loại sức khỏe chuẩn theo Bộ Y tế (Loại I - Loại V)
export const DEFAULT_HEALTH_CLASSIFICATIONS = [
  {
    key: 'Loại I',
    value: 'Loại I',
    label: 'Loại I (Rất khỏe)',
    classificationCode: 'Loại I',
    classificationName: 'Loại I (Rất khỏe)',
  },
  {
    key: 'Loại II',
    value: 'Loại II',
    label: 'Loại II (Khỏe)',
    classificationCode: 'Loại II',
    classificationName: 'Loại II (Khỏe)',
  },
  {
    key: 'Loại III',
    value: 'Loại III',
    label: 'Loại III (Trung bình)',
    classificationCode: 'Loại III',
    classificationName: 'Loại III (Trung bình)',
  },
  {
    key: 'Loại IV',
    value: 'Loại IV',
    label: 'Loại IV (Yếu)',
    classificationCode: 'Loại IV',
    classificationName: 'Loại IV (Yếu)',
  },
  {
    key: 'Loại V',
    value: 'Loại V',
    label: 'Loại V (Rất yếu)',
    classificationCode: 'Loại V',
    classificationName: 'Loại V (Rất yếu)',
  },
];

// Danh mục Trạng thái hồ sơ khám sức khỏe
export const DEFAULT_RECORD_STATUSES = [
  {
    key: 'DRAFT',
    value: 'DRAFT',
    label: 'Mới tiếp nhận (Chưa khám)',
    statusCode: 'DRAFT',
    statusName: 'Mới tiếp nhận (Chưa khám)',
  },
  {
    key: 'IN_PROGRESS',
    value: 'IN_PROGRESS',
    label: 'Đang khám',
    statusCode: 'IN_PROGRESS',
    statusName: 'Đang khám',
  },
  {
    key: 'COMPLETED',
    value: 'COMPLETED',
    label: 'Đã hoàn thành',
    statusCode: 'COMPLETED',
    statusName: 'Đã hoàn thành',
  },
  {
    key: 'CANCELLED',
    value: 'CANCELLED',
    label: 'Đã hủy',
    statusCode: 'CANCELLED',
    statusName: 'Đã hủy',
  },
];

// Lấy danh mục Phân loại sức khỏe (chuẩn hóa ở Frontend theo Bộ Y tế)
export async function getClassificationsApi() {
  return DEFAULT_HEALTH_CLASSIFICATIONS;
}

// Lấy danh mục Trạng thái hồ sơ khám (chuẩn hóa ở Frontend)
export async function getStatusesApi() {
  return DEFAULT_RECORD_STATUSES;
}

// Lấy danh sách Cán bộ phục vụ chọn trong hồ sơ khám
export async function getStaffsSelectApi(departmentId = null) {
  let endpoint = `${API_BASE_URL}${healthRecordRouter.getStaffs}`;
  if (departmentId && departmentId !== 'ALL') {
    endpoint += `?departmentId=${departmentId}`;
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return result?.data || [];
}

// Lấy danh sách Bác sĩ kết luận hồ sơ khám
export async function getDoctorsSelectApi(specialtyId = null) {
  let endpoint = `${API_BASE_URL}${healthRecordRouter.getDoctors}`;
  if (specialtyId && specialtyId !== 'ALL') {
    endpoint += `?specialtyId=${specialtyId}`;
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return result?.data || [];
}

// Lấy danh mục Chuyên khoa y tế
export async function getSpecialtiesApi() {
  const endpoint = `${API_BASE_URL}${doctorRouter.getSpecialties}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return result?.data || [];
}

// Lấy chi tiết một hồ sơ khám theo ID
export async function getHealthRecordByIdApi(recordId) {
  const endpoint = `${API_BASE_URL}${healthRecordRouter.getById(recordId)}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Lỗi khi lấy thông tin chi tiết hồ sơ';
    try {
      const err = await response.json();
      errorMessage = parseApiError(err, errorMessage);
    } catch {
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result?.data || null;
}

// Thêm mới hồ sơ khám sức khỏe
export async function createHealthRecordApi(recordData) {
  const endpoint = `${API_BASE_URL}${healthRecordRouter.create}`;

  const response = await fetch(endpoint, {
    method: 'POST',
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
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

// Cập nhật kết luận và thông tin hồ sơ khám
export async function updateHealthRecordApi(recordData) {
  const endpoint = `${API_BASE_URL}${healthRecordRouter.update}`;

  const response = await fetch(endpoint, {
    method: 'PUT',
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
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

// Xóa hồ sơ khám sức khỏe
export async function deleteHealthRecordApi(recordId) {
  const endpoint = `${API_BASE_URL}${healthRecordRouter.delete(recordId)}`;

  const response = await fetch(endpoint, {
    method: ModelMode.DELETE,
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
      // Bỏ qua lỗi parse JSON
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}
