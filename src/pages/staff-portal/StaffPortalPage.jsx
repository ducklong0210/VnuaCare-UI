//
// Trang Cổng Tra Cứu Hồ Sơ Sức Khỏe dành riêng cho Cán bộ / Giảng viên (vai trò STAFF)
// Hiển thị trực tiếp lịch sử các đợt khám và toàn bộ chi tiết bệnh án cá nhân ở chế độ chỉ đọc (không vào khung Quản trị)
//

import { useEffect, useState } from 'react';
import { useAuth } from '../../core/contexts/useAuth.js';
import { useNavigation } from '../../core/contexts/useNavigation.js';
import { StaffPortalService } from '../../services/staff/StaffPortalService.js';
import StaffRecordDetail from '../../components/StaffPortal/StaffRecordDetail.jsx';
import { formatDate, getClassificationMeta, getStatusMeta } from '../../utils/helpers.js';
import StaffAccountSection from '../../components/StaffPortal/StaffAccountSection.jsx';
import { IconCheck, IconLogout, IconRecords, IconRefreshCw, IconSearch, IconSettings } from '../../components/SupportAgent/Icons.jsx';
import './StaffPortalPage.css';

function formatGenderLabel(gender) {
  const clean = (gender || '').trim().toUpperCase();
  if (clean === 'NAM' || clean === 'MALE') return 'Nam';
  if (clean === 'NU' || clean === 'NỮ' || clean === 'FEMALE') return 'Nữ';
  if (clean === 'KHAC' || clean === 'KHÁC') return 'Khác';
  return gender || '—';
}

export default function StaffPortalPage() {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();

  // Hai khu vực hiển thị của Cổng Cán bộ: 'RECORDS' (Bệnh án) | 'ACCOUNT' (Tài khoản & Mật khẩu)
  const [activeView, setActiveView] = useState('RECORDS');

  // Dữ liệu hồ sơ cá nhân và danh sách bệnh án của cán bộ
  const [profileInfo, setProfileInfo] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // Chi tiết 5 phần của bệnh án đang chọn
  const [detailBundle, setDetailBundle] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pageError, setPageError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Toast thông báo ngắn gọn
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 1. Tải thông tin cá nhân (/users/me) rồi nạp toàn bộ hồ sơ khám của riêng cán bộ này
  useEffect(() => {
    let isCancelled = false;

    const loadStaffPortalData = async () => {
      setLoadingPage(true);
      setPageError('');

      try {
        const me = await StaffPortalService.getMyProfile();
        if (isCancelled) return;
        setProfileInfo(me);

        if (!me?.staffProfile) {
          setRecords([]);
          setSelectedRecordId(null);
          return;
        }

        const myRecords = await StaffPortalService.getMyHealthRecords(me.staffProfile);
        if (isCancelled) return;

        setRecords(myRecords);
        setSelectedRecordId((currentId) => {
          if (currentId && myRecords.some((rec) => rec.recordId === currentId)) {
            return currentId;
          }
          return myRecords.length > 0 ? myRecords[0].recordId : null;
        });
      } catch (err) {
        if (!isCancelled) {
          setPageError(err.message || 'Không thể tải dữ liệu hồ sơ sức khỏe của bạn.');
        }
      } finally {
        if (!isCancelled) {
          setLoadingPage(false);
        }
      }
    };

    loadStaffPortalData();
    return () => {
      isCancelled = true;
    };
  }, [refreshKey]);

  // 2. Tải chi tiết bệnh án (Kết luận, Sinh tồn, Nội khoa, Chuyên khoa lẻ, CĐHA) mỗi khi đổi đợt khám
  useEffect(() => {
    let isCancelled = false;

    const loadSelectedDetail = async () => {
      if (!selectedRecordId) {
        setDetailBundle(null);
        return;
      }

      setLoadingDetail(true);
      try {
        const bundle = await StaffPortalService.getRecordFullDetail(selectedRecordId);
        if (!isCancelled) {
          setDetailBundle(bundle);
        }
      } catch {
        if (!isCancelled) {
          setDetailBundle(null);
        }
      } finally {
        if (!isCancelled) {
          setLoadingDetail(false);
        }
      }
    };

    loadSelectedDetail();
    return () => {
      isCancelled = true;
    };
  }, [selectedRecordId, refreshKey]);

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  // Lấy thông tin hồ sơ cán bộ và 2 chữ cái viết tắt cho ảnh đại diện mặc định
  const staffProfile = profileInfo?.staffProfile || null;
  const displayName = profileInfo?.fullName || profileInfo?.fullname || staffProfile?.fullName || user?.fullName || user?.fullname || user?.username || 'Cán bộ VNUA';
  const nameParts = displayName.split(' ').filter(Boolean);
  const initials = nameParts.map((part) => part[0]).slice(-2).join('').toUpperCase();

  // Lọc danh sách đợt khám ở cột trái theo từ khóa tìm kiếm
  const filteredRecords = records.filter((rec) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;

    const matchCampaign = (rec.campaignName || '').toLowerCase().includes(keyword);
    const matchSid = (rec.sidCode || '').toLowerCase().includes(keyword);
    const matchGrade = (rec.healthClassification || '').toLowerCase().includes(keyword);
    return matchCampaign || matchSid || matchGrade;
  });

  const selectedRecord = records.find((r) => r.recordId === selectedRecordId) || null;

  return (
    <div className="sp-shell">
      {/* Thông báo nhanh */}
      {toast && (
        <div className="sp-toast" role="status">
          <IconCheck size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Thanh điều hướng độc lập của Cổng Cán bộ (KHÔNG dùng Sidebar Admin) */}
      <header className="sp-topbar">
        <div className="sp-topbar-inner">
          <button
            type="button"
            className="sp-brand-btn"
            onClick={() => navigate('home')}
            title="Về Trang chủ VnuaCare"
          >
            <img src="/logo.png" alt="Logo VnuaCare" className="sp-logo-img" />
            <span className="sp-brand-divider" aria-hidden="true" />
            <span className="sp-brand-meta">
              <strong className="sp-brand-title">VNUACARE</strong>
              <span className="sp-brand-sub">Sổ Sức Khỏe Cán Bộ</span>
            </span>
          </button>

          <nav className="sp-top-nav" aria-label="Điều hướng cổng cán bộ">
            <button
              type="button"
              className={`sp-nav-tab ${activeView === 'RECORDS' ? 'active' : ''}`}
              onClick={() => setActiveView('RECORDS')}
            >
              <IconRecords size={16} />
              <span>Hồ sơ bệnh án</span>
            </button>
            <button
              type="button"
              className={`sp-nav-tab ${activeView === 'ACCOUNT' ? 'active' : ''}`}
              onClick={() => setActiveView('ACCOUNT')}
            >
              <IconSettings size={16} />
              <span>Tài khoản cá nhân</span>
            </button>
          </nav>

          <div className="sp-topbar-actions">
            <button type="button" className="sp-btn sp-btn-ghost" onClick={() => navigate('home')}>
              Trang chủ
            </button>
            <button type="button" className="sp-btn sp-btn-logout" onClick={handleLogout}>
              <IconLogout size={15} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Nội dung chính */}
      <main className="sp-main">
        {/* Thanh tóm tắt thông tin cán bộ đang đăng nhập */}
        <section className="sp-identity-bar" aria-label="Thông tin cán bộ">
          <div className="sp-identity-left">
            <div className="sp-avatar">
              {staffProfile?.avatarUrl ? (
                <img src={staffProfile.avatarUrl} alt={displayName} />
              ) : (
                initials || 'CB'
              )}
            </div>
            <div className="sp-identity-info">
              <h1>{displayName}</h1>
              <div className="sp-identity-meta">
                <span>
                  Mã CB: <strong className="sp-code">{staffProfile?.employeeCode || staffProfile?.staffCode || '—'}</strong>
                </span>
                <span className="sp-dot" aria-hidden="true" />
                <span>Đơn vị: <strong>{staffProfile?.departmentName || 'Chưa cập nhật'}</strong></span>
                {(staffProfile?.academicTitle || staffProfile?.jobTitle) && (
                  <>
                    <span className="sp-dot" aria-hidden="true" />
                    <span>
                      {[staffProfile.academicTitle, staffProfile.jobTitle].filter(Boolean).join(' • ')}
                    </span>
                  </>
                )}
                {staffProfile?.gender && (
                  <>
                    <span className="sp-dot" aria-hidden="true" />
                    <span>{formatGenderLabel(staffProfile.gender)}</span>
                  </>
                )}
                {staffProfile?.dateOfBirth && (
                  <>
                    <span className="sp-dot" aria-hidden="true" />
                    <span className="sp-tabular">NS: {formatDate(staffProfile.dateOfBirth)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="sp-identity-actions">
            <button
              type="button"
              className="sp-btn sp-btn-outline"
              onClick={() => setRefreshKey((currentKey) => currentKey + 1)}
              disabled={loadingPage || loadingDetail}
            >
              <IconRefreshCw size={14} />
              <span>{loadingPage ? 'Đang tải...' : 'Làm mới'}</span>
            </button>
            {activeView === 'RECORDS' && selectedRecord && (
              <button type="button" className="sp-btn sp-btn-primary" onClick={() => window.print()}>
                In bệnh án
              </button>
            )}
          </div>
        </section>

        {/* Lỗi tải dữ liệu cấp trang */}
        {pageError && (
          <div className="sp-error-banner" role="alert">
            <div>
              <strong>Không thể tải hồ sơ bệnh án</strong>
              <p>{pageError}</p>
            </div>
            <button
              type="button"
              className="sp-btn sp-btn-outline"
              onClick={() => setRefreshKey((currentKey) => currentKey + 1)}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* VIEW 1: HỒ SƠ BỆNH ÁN CÁ NHÂN (MASTER - DETAIL) */}
        {activeView === 'RECORDS' && (
          loadingPage ? (
            <section className="sp-state-sheet">
              <h3>Đang tải sổ sức khỏe của bạn...</h3>
              <p>Hệ thống đang đồng bộ danh sách các đợt khám sức khỏe định kỳ từ Trạm Y tế VNUA.</p>
            </section>
          ) : !staffProfile ? (
            <section className="sp-state-sheet">
              <h3>Tài khoản chưa được liên kết hồ sơ cán bộ</h3>
              <p>
                Tài khoản <strong>@{profileInfo?.username || user?.username}</strong> hiện chưa gắn với mã cán bộ trong hệ thống.
                Vui lòng liên hệ Trạm Y tế Học viện Nông nghiệp Việt Nam để hoàn tất liên kết hồ sơ khám sức khỏe.
              </p>
            </section>
          ) : records.length === 0 ? (
            <section className="sp-state-sheet">
              <h3>Chưa có hồ sơ khám sức khỏe nào</h3>
              <p>
                Hệ thống chưa ghi nhận đợt khám định kỳ nào cho mã cán bộ{' '}
                <code className="sp-code">{staffProfile.employeeCode || staffProfile.staffCode || '—'}</code>.
                Kết quả sẽ tự động hiển thị tại đây ngay sau khi Trạm Y tế hoàn tất nhập liệu.
              </p>
            </section>
          ) : (
            <div className="sp-workspace">
              {/* CỘT TRÁI: DANH SÁCH CÁC ĐỢT KHÁM CỦA CÁN BỘ */}
              <aside className="sp-records-rail" aria-label="Danh sách các đợt khám">
                <div className="sp-rail-header">
                  <h2>Lịch sử khám</h2>
                  <span className="sp-rail-count sp-tabular">{records.length} đợt</span>
                </div>

                {records.length > 3 && (
                  <div className="sp-rail-search">
                    <IconSearch size={14} className="sp-rail-search-icon" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm theo đợt khám, mã SID..."
                      aria-label="Tìm kiếm đợt khám"
                    />
                  </div>
                )}

                <ul className="sp-record-list">
                  {filteredRecords.map((rec) => {
                    const isSelected = rec.recordId === selectedRecordId;
                    const classMeta = getClassificationMeta(rec.healthClassification);
                    const statusMeta = getStatusMeta(rec.status);

                    return (
                      <li key={rec.recordId}>
                        <button
                          type="button"
                          className={`sp-record-item ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedRecordId(rec.recordId)}
                          aria-current={isSelected ? 'true' : undefined}
                        >
                          <div className="sp-record-item-top">
                            <span className="sp-record-campaign">{rec.campaignName || 'Đợt khám định kỳ'}</span>
                            <span className="sp-record-date sp-tabular">{formatDate(rec.actualCheckupDate)}</span>
                          </div>
                          <div className="sp-record-item-mid">
                            <code className="sp-code">{rec.sidCode || `HS-${rec.recordId}`}</code>
                          </div>
                          <div className="sp-record-item-foot">
                            <span className={`sp-grade-pill compact tone-${classMeta.tone}`}>{classMeta.label}</span>
                            <span className={`sp-status-pill compact tone-${statusMeta.tone}`}>{statusMeta.label}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}

                  {filteredRecords.length === 0 && (
                    <li className="sp-rail-empty">Không có đợt khám khớp từ khóa &ldquo;{searchTerm}&rdquo;.</li>
                  )}
                </ul>
              </aside>

              {/* CỘT PHẢI: CHI TIẾT BỆNH ÁN ĐẦY ĐỦ */}
              <StaffRecordDetail
                selectedRecord={selectedRecord}
                detailBundle={detailBundle}
                loadingDetail={loadingDetail}
              />
            </div>
          )
        )}

        {/* VIEW 2: THÔNG TIN CÁ NHÂN & ĐỔI MẬT KHẨU */}
        {activeView === 'ACCOUNT' && (
          <StaffAccountSection
            key={`${profileInfo ? 'loaded' : 'loading'}-${refreshKey}`}
            profileInfo={profileInfo}
            onProfileUpdated={() => setRefreshKey((currentKey) => currentKey + 1)}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}
