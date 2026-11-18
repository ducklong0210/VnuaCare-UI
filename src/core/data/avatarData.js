/**
 * Danh sách mẫu ảnh đại diện (avatar) sẵn có cho cán bộ
 * Lưu tại /public/avatars/ để đường dẫn ngắn (/avatars/xxx.svg < 255 ký tự),
 * tránh bị lỗi tràn cột varchar(255) trong CSDL SQL Server.
 */
export const AVATAR_PRESETS = [
  { id: 'bacsi-1', label: 'Bác sĩ Nam', url: '/src/assets/img_avatars/bacsi-1.svg' },
  { id: 'bacsi-2', label: 'Bác sĩ Nữ', url: '/src/assets/img_avatars/bacsi-2.svg' },
  { id: 'nam-1', label: 'Cán bộ Nam 1', url: '/src/assets/img_avatars/nam-1.svg' },
  { id: 'nam-2', label: 'Cán bộ Nam 2', url: '/src/assets/img_avatars/nam-2.svg' },
  { id: 'nu-1', label: 'Cán bộ Nữ 1', url: '/src/assets/img_avatars/nu-1.svg' },
  { id: 'nu-2', label: 'Cán bộ Nữ 2', url: '/src/assets/img_avatars/nu-2.svg' },
];
