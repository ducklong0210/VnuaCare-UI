import { IconSettings, IconDashboard, IconUsers, IconStaffs, IconDoctors, IconRecords, IconCampaigns } from '../components/SupportAgent/Icons.jsx';




export const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
}

// VAI TRÒ
export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    HEALTH_ADMIN: 'HEALTH_ADMIN',
    DOCTOR: 'DOCTOR',
    STAFF: 'STAFF',
};


export const ROLE_LABELS = {
    [ROLES.SUPER_ADMIN]: 'Quản trị hệ thống',
    [ROLES.HEALTH_ADMIN]: 'Quản trị y tế',
    [ROLES.DOCTOR]: 'Bác sĩ',
    [ROLES.STAFF]: 'Cán bộ / Giảng viên',
};


// 3. TRẠNG THÁI HỒ SƠ KHÁM SỨC KHỎE 
export const RECORD_STATUS = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

export const RECORD_STATUS_LABELS = {
    PENDING: 'Chờ khám',
    IN_PROGRESS: 'Đang khám',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
};

export const RECORD_STATUS_COLORS = {
    PENDING: 'orange',
    IN_PROGRESS: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
};

// XẾP LOẠI SỨC KHỎE CHUẨN BỘ Y TẾ 
export const HEALTH_CLASSIFICATIONS = [
    'Loại I',
    'Loại II',
    'Loại III',
    'Loại IV',
    'Loại V',
];

//  GIỚI TÍNH & MÀU SẮC CHỦ ĐẠO
export const GENDER = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
};
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

export const SystemColors = {
    primary: '#0f766e',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#f59e0b',
    info: '#2563eb',
    dark: '#0f172a',
    muted: '#64748b',
};

export const AVATAR_PRESETS = [
    { id: 'bacsi-1', label: 'Bác sĩ Nam', url: '/src/assets/img_avatars/bacsi-1.svg' },
    { id: 'bacsi-2', label: 'Bác sĩ Nữ', url: '/src/assets/img_avatars/bacsi-2.svg' },
    { id: 'nam-1', label: 'Cán bộ Nam 1', url: '/src/assets/img_avatars/nam-1.svg' },
    { id: 'nam-2', label: 'Cán bộ Nam 2', url: '/src/assets/img_avatars/nam-2.svg' },
    { id: 'nu-1', label: 'Cán bộ Nữ 1', url: '/src/assets/img_avatars/nu-1.svg' },
    { id: 'nu-2', label: 'Cán bộ Nữ 2', url: '/src/assets/img_avatars/nu-2.svg' },
];

export const ModelMode = {
    CREATE: 'CREATE',
    EDIT: 'EDIT',
    DELETE: 'DELETE',
}

export const MENU_ITEMS = [
    { id: 'dashboard', label: 'Bảng điều khiển', Icon: IconDashboard, roles: [ROLES.SUPER_ADMIN, ROLES.HEALTH_ADMIN, ROLES.DOCTOR] },
    { id: 'records', label: 'Hồ sơ khám cán bộ', Icon: IconRecords, roles: [ROLES.SUPER_ADMIN, ROLES.HEALTH_ADMIN, ROLES.DOCTOR] },
    { id: 'staffs', label: 'Quản lý nhân viên', Icon: IconStaffs, roles: [ROLES.SUPER_ADMIN, ROLES.HEALTH_ADMIN] },
    { id: 'doctors', label: 'Quản lý bác sĩ', Icon: IconDoctors, roles: [ROLES.SUPER_ADMIN, ROLES.HEALTH_ADMIN] },
    // { id: 'campaigns', label: 'Đợt khám sức khỏe', Icon: IconCampaigns, roles: [ROLES.SUPER_ADMIN, ROLES.HEALTH_ADMIN] },
    { id: 'users', label: 'Quản lý người dùng', Icon: IconUsers, roles: [ROLES.SUPER_ADMIN] },
    { id: 'settings', label: 'Cài đặt', Icon: IconSettings, roles: [ROLES.SUPER_ADMIN, ROLES.HEALTH_ADMIN, ROLES.DOCTOR] },
];

// Cấu hình tĩnh cho 4 thẻ KPI tổng quan trên Dashboard 
export const STAT_CARDS = [
  {
    id: 'staffs',
    label: 'TỔNG SỐ CÁN BỘ',
    note: 'Cán bộ, giảng viên & nhân viên VNUA',
    Icon: IconStaffs,
    accentClass: 'accent-teal',
    targetTab: 'staffs',
  },
  {
    id: 'doctors',
    label: 'TỔNG SỐ BÁC SĨ',
    note: 'Đội ngũ bác sĩ khám chuyên khoa',
    Icon: IconDoctors,
    accentClass: 'accent-orange',
    targetTab: 'doctors',
  },
  {
    id: 'records',
    label: 'HỒ SƠ KHÁM SỨC KHỎE',
    note: 'Tổng số hồ sơ đã tiếp nhận',
    Icon: IconRecords,
    accentClass: 'accent-blue',
    targetTab: 'records',
  },
  {
    id: 'campaigns',
    label: 'ĐỢT KHÁM SỨC KHỎE',
    note: 'Các đợt khám định kỳ đã cấu hình',
    Icon: IconCampaigns,
    accentClass: 'accent-green',
    targetTab: null,
  },
];