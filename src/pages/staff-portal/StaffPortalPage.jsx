//
// Trang Cổng thông tin dành riêng cho tài khoản Cán bộ / Giảng viên (vai trò STAFF)
// Hiển thị thông tin người dùng đang đăng nhập, nút đăng xuất và khu vực mở rộng tra cứu hồ sơ cá nhân
//

import { useAuth } from '../../core/contexts/useAuth.js';
import { useNavigation } from '../../core/contexts/useNavigation.js';
import { ROLE_LABELS } from '../../utils/index.js';

export default function StaffPortalPage() {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();

  const handleLogout = () => {
    logout();
    navigate('login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Cổng Cán bộ / Giảng viên</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Xin chào: <strong>{user?.fullname || user?.username}</strong> ({ROLE_LABELS[user?.role] || user?.role})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('home')}>
            Về trang chủ
          </button>
          <button type="button" className="btn-header-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Khu vực nội dung trang trắng — sẽ phát triển giao diện xem hồ sơ sức khỏe cá nhân tại đây */}
    </div>
  );
}
