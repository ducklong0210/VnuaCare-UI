import {IconSettings, IconDashboard, IconUsers, IconStaffs, IconDoctors, IconCampaigns, IconRecords } from '../components/SupportAgent/Icons.jsx';




export const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE ',
}

// VAI TRÒ
export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    HEALTH_ADMIN: 'HEALTH_ADMIN',
    DOCTOR: 'DOCTOR',
    STAFF: 'STAFF',
};

export const ROLE_LABELS = {
    SUPER_ADMIN: 'Quản trị cấp cao',
    HEALTH_ADMIN: 'Quản trị y tế',
    DOCTOR: 'Bác sĩ',
    STAFF: 'Cán bộ / Giảng viên',
};

export const ROLE_COLORS = {
    SUPER_ADMIN: 'red',
    HEALTH_ADMIN: 'purple',
    DOCTOR: 'blue',
    STAFF: 'teal',
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
};

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
    { id: 'dashboard', label: 'Bảng điều khiển', Icon: IconDashboard },
    { id: 'records', label: 'Hồ sơ khám cán bộ', Icon: IconRecords },
    { id: 'staffs', label: 'Quản lý nhân viên', Icon: IconStaffs },
    { id: 'doctors', label: 'Quản lý bác sĩ', Icon: IconDoctors },
    // { id: 'campaigns', label: 'Đợt khám sức khỏe', Icon: IconCampaigns },
    { id: 'users', label: 'Quản lý người dùng', Icon: IconUsers },
    { id: 'settings', label: 'Cài đặt', Icon: IconSettings },
];