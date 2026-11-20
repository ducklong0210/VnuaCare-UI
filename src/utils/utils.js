
// Hàm định dạng ngày sang chuẩn Việt Nam DD/MM/YYYY
export function formatDate(dateStr) {
  if (!dateStr || dateStr.startsWith('0001-01-01')) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
}