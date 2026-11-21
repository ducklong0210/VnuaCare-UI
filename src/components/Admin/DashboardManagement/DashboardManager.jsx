//
// Trang quản lý Bảng điều khiển tổng quan (Dashboard)
// Tự động gọi API lấy số liệu thật cho các thẻ KPI, sau đó truyền danh sách hồ sơ xuống biểu đồ và bảng gần đây
//

import { useEffect, useState } from 'react';
import { StaffService } from '../../../services/admin/StaffService.js';
import { DoctorService } from '../../../services/admin/DoctorService.js';
import { HealthRecordService } from '../../../services/admin/HealthRecordService.js';
import { useAuth } from '../../../core/contexts/useAuth.js';
import { useNavigation } from '../../../core/contexts/useNavigation.js';
import { MENU_ITEMS, STAT_CARDS } from '../../../utils/index.js';
import DashboardStatsCharts from './DashboardStatsCharts.jsx';
import DashboardRecentRecords from './DashboardRecentRecords.jsx';
import {
  IconRefreshCw, // Icon mũi tên xoay tròn (nút Làm mới dữ liệu)
} from '../../SupportAgent/Icons.jsx';

export default function DashboardManager() {
  const { user } = useAuth(); // Lấy thông tin tài khoản đang đăng nhập từ AuthContext
  const { navigate } = useNavigation(); // Hàm chuyển trang nội bộ giữa các tab quản trị
  const userRole = (user?.role || '').toUpperCase(); // Chuẩn hóa mã vai trò sang chữ hoa để đối chiếu phân quyền

  // Các chỉ số tổng quan thật lấy từ Backend
  const [totalStaffs, setTotalStaffs] = useState(0); // Tổng số cán bộ trong hệ thống
  const [totalDoctors, setTotalDoctors] = useState(0); // Tổng số bác sĩ trong hệ thống
  const [totalRecords, setTotalRecords] = useState(0); // Tổng số hồ sơ khám sức khỏe
  const [totalCampaigns, setTotalCampaigns] = useState(0); // Tổng số đợt khám sức khỏe

  // Danh sách hồ sơ khám dùng để tính tỷ lệ cho khung thống kê và bảng hồ sơ gần đây
  const [records, setRecords] = useState([]); // Mảng các hồ sơ khám lấy từ Backend

  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(false); // Trạng thái đang tải số liệu tổng quan
  const [refreshKey, setRefreshKey] = useState(0); // Biến đếm tăng thêm khi bấm nút "Làm mới" để kích hoạt gọi lại API

  // Kiểm tra vai trò hiện tại có quyền mở tab đích khi bấm vào thẻ KPI hay không
  const canNavigateTo = (tabId) => {
    const item = MENU_ITEMS.find((m) => m.id === tabId);
    if (!item || !item.roles) return false;
    return item.roles.includes(userRole);
  };

  // Tự động tải số liệu tổng quan từ Backend khi mở trang hoặc khi refreshKey thay đổi
  useEffect(() => {
    // Cờ kiểm soát: chuyển thành true nếu người dùng rời trang trước khi API kịp trả về (tránh cập nhật state lên component đã đóng)
    let isCancelled = false;

    const loadDashboardStats = async () => {
      setLoading(true);

      // Lấy tổng số Cán bộ (chỉ xin pageSize = 1 cho nhẹ vì chỉ cần đọc trường totalCount)
      try {
        const staffRes = await StaffService.getStaffs({ pageNumber: 1, pageSize: 1 });
        if (!isCancelled) setTotalStaffs(staffRes?.totalCount || 0);
      } catch {
        if (!isCancelled) setTotalStaffs(0);
      }

      // Lấy tổng số Bác sĩ (chỉ xin pageSize = 1 cho nhẹ vì chỉ cần đọc trường totalCount)
      try {
        const doctorRes = await DoctorService.getDoctors({ pageNumber: 1, pageSize: 1 });
        if (!isCancelled) setTotalDoctors(doctorRes?.totalCount || 0);
      } catch {
        if (!isCancelled) setTotalDoctors(0);
      }

      // Lấy danh sách và tổng số Hồ sơ khám (xin tối đa 200 bản ghi để tính tỷ lệ thống kê và hiện bảng gần đây)
      try {
        const recordRes = await HealthRecordService.getHealthRecords({ pageNumber: 1, pageSize: 200 });
        if (!isCancelled) {
          setTotalRecords(recordRes?.totalCount || 0); // Lưu tổng số hồ sơ vào thẻ KPI
          setRecords(recordRes?.items || []); // Lưu mảng danh sách hồ sơ để truyền xuống component con
        }
      } catch {
        if (!isCancelled) {
          setTotalRecords(0);
          setRecords([]);
        }
      }

      // Lấy danh sách Đợt khám sức khỏe rồi đếm độ dài mảng để hiển thị tổng số đợt khám
      try {
        const campaignList = await HealthRecordService.getCampaigns();
        if (!isCancelled) setTotalCampaigns(Array.isArray(campaignList) ? campaignList.length : 0);
      } catch {
        if (!isCancelled) setTotalCampaigns(0);
      }

      if (!isCancelled) {
        setLoading(false);
      }
    };

    loadDashboardStats();

    // Hàm dọn dẹp chạy khi component rời màn hình hoặc chuẩn bị chạy lượt useEffect mới
    return () => {
      isCancelled = true;
    };
  }, [refreshKey]);

  // Ánh xạ số liệu thật theo id của từng thẻ khai báo trong STAT_CARDS
  const statsById = {
    staffs: totalStaffs,
    doctors: totalDoctors,
    records: totalRecords,
    campaigns: totalCampaigns,
  };

  return (
    <div className="admin-page-container dashboard-page">
      {/* Thanh tiêu đề và nút làm mới số liệu */}
      <div className="page-header-row">
        <div>
          <h2 className="main-title">Bảng điều khiển tổng quan</h2>
          <span className="main-desc">
            Số liệu thời gian thực từ hệ thống Quản lý Sức khỏe — Học viện Nông nghiệp Việt Nam
          </span>
        </div>

        <div className="header-btn-group">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setRefreshKey((prev) => prev + 1)}
            disabled={loading}
          >
            {/* Icon mũi tên xoay tròn (làm mới) */}
            <IconRefreshCw size={15} />
            <span>{loading ? 'Đang tải...' : 'Làm mới số liệu'}</span>
          </button>
        </div>
      </div>

      {/* Dải thẻ chỉ số tổng quan thật (KPI Cards) */}
      <div className="metrics-strip">
        {STAT_CARDS.map((card) => {
          const CardIcon = card.Icon; // Lấy component icon được cấu hình sẵn trong STAT_CARDS
          const clickable = card.targetTab && canNavigateTo(card.targetTab); // Chỉ cho bấm chuyển trang nếu vai trò hiện tại có quyền

          return (
            <div
              key={card.id}
              className={`metric-box ${card.accentClass} ${clickable ? 'clickable' : ''}`}
              onClick={() => {
                if (clickable) navigate(card.targetTab);
              }}
              title={clickable ? `Mở trang ${card.label.toLowerCase()}` : undefined}
            >
              <div className="metric-top-row">
                <span className="metric-label">{card.label}</span>
                <span className="metric-icon-wrap">
                  <CardIcon size={18} />
                </span>
              </div>
              <div className="metric-num">{loading ? '...' : statsById[card.id] ?? 0}</div>
              <span className="metric-note">{card.note}</span>
            </div>
          );
        })}
      </div>

      {/* Khung thanh tỷ lệ Phân loại sức khỏe và Tiến độ hồ sơ */}
      <DashboardStatsCharts records={records} loading={loading} />

      {/* Bảng hiển thị các hồ sơ khám gần đây nhất */}
      <DashboardRecentRecords
        records={records}
        loading={loading}
        onViewAll={canNavigateTo('records') ? () => navigate('records') : undefined}
      />
    </div>
  );
}
