// Màn hình Quản lý Hồ sơ khám sức khỏe: Giao diện danh sách hồ sơ cán bộ toàn học viện
// Hỗ trợ tìm kiếm theo tên/mã/SID, lọc nâng cao theo Đợt khám, Khoa phòng, Xếp loại, Trạng thái và phân trang
// Cung cấp các thao tác thêm mới hồ sơ tiếp nhận, chỉnh sửa thông tin hành chính và mở modal khám chuyên môn

import { useEffect, useState } from 'react';
import MainLayout from '../../core/layouts/MainLayout.jsx';
import {
  getHealthRecordFilterApi,
  getCampaignsSelectApi,
  getDepartmentsSelectApi,
  getClassificationsApi,
  getStatusesApi,
  getStaffsSelectApi,
  getDoctorsSelectApi,
  createHealthRecordApi,
  updateHealthRecordApi,
  deleteHealthRecordApi,
} from '../../api/recordApi.js';
import './HealthRecordsPage.css';
import { IconSearch, IconRefreshCw, IconPlus, IconEdit, IconTrash, IconClose, IconCheck, IconAlertTriangle, IconEye } from '../../components/SupportAgent/Icons.jsx';
import RecordDetailModal from '../../components/Admin/HealthRecordManagement/RecordDetailModal.jsx';
import { ModelMode } from '../../utils/index.js';

// Giá trị mặc định của form hồ sơ khám
const INITIAL_FORM = {
  recordId: null,
  campaignId: '',
  staffId: '',
  sidCode: '',
  actualCheckupDate: '',
  medicalHistoryPersonal: '',
  medicalHistoryFamily: '',
  healthClassification: '',
  generalConclusion: '',
  recommendations: '',
  concludedByDoctorId: '',
  status: 'PENDING',
  reportPdfUrl: '',
  staffName: '',
  employeeCode: '',
  departmentName: '',
  campaignName: '',
};

// Định dạng ngày theo định dạng Việt Nam DD/MM/YYYY
function formatDate(dateStr) {
  if (!dateStr || dateStr.startsWith('0001-01-01')) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
}

// Chuyển đổi ngày sang YYYY-MM-DD cho ô nhập input date
function toDateInputValue(dateStr) {
  if (!dateStr || dateStr.startsWith('0001-01-01')) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

// Hiển thị nhãn phân loại sức khỏe
function renderClassificationBadge(classification) {
  if (!classification) {
    return <span className="grade-badge grade-none">Chưa xếp loại</span>;
  }
  const clean = classification.trim();
  if (clean.includes('Loại I') && !clean.includes('Loại II') && !clean.includes('Loại III') && !clean.includes('Loại IV') && !clean.includes('Loại V')) {
    return <span className="grade-badge grade-1">Loại I (Rất khỏe)</span>;
  }
  if (clean.includes('Loại II')) {
    return <span className="grade-badge grade-2">Loại II (Khỏe)</span>;
  }
  if (clean.includes('Loại III')) {
    return <span className="grade-badge grade-3">Loại III (Trung bình)</span>;
  }
  if (clean.includes('Loại IV')) {
    return <span className="grade-badge grade-4">Loại IV (Yếu)</span>;
  }
  if (clean.includes('Loại V')) {
    return <span className="grade-badge grade-5">Loại V (Rất yếu)</span>;
  }
  return <span className="grade-badge grade-none">{clean}</span>;
}

// Hiển thị nhãn trạng thái hồ sơ
function renderStatusBadge(status) {
  switch (status) {
    case 'PENDING':
      return <span className="status-pill status-pending">Chờ khám</span>;
    case 'IN_PROGRESS':
      return <span className="status-pill status-in_progress">Đang khám</span>;
    case 'COMPLETED':
      return <span className="status-pill status-completed">Đã kết luận</span>;
    case 'CANCELLED':
      return <span className="status-pill status-cancelled">Đã hủy</span>;
    default:
      return <span className="status-pill status-pending">{status || 'Chờ khám'}</span>;
  }
}

export default function HealthRecordsPage() {
  // Dữ liệu danh sách hồ sơ khám và các danh mục tra cứu
  const [records, setRecords] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [staffsList, setStaffsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);

  // Trạng thái tải dữ liệu và lỗi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bộ lọc tìm kiếm và phân trang
  const [search, setSearch] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedClassification, setSelectedClassification] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Thông báo toast
  const [toast, setToast] = useState('');
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  // Quản lý Modal Thêm / Sửa hồ sơ
  const [modalMode, setModalMode] = useState(null); // null | 'CREATE' | ModelMode.EDIT
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Quản lý Modal xác nhận xóa hồ sơ
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Quản lý Modal xem & nhập chi tiết các phiếu khám chuyên khoa
  const [viewingRecord, setViewingRecord] = useState(null);

  // Tải danh mục đợt khám, phòng ban, phân loại, trạng thái, cán bộ và bác sĩ khi mở trang
  useEffect(() => {
    let isCancelled = false;

    const loadInitialLookups = async () => {
      try {
        const [campRes, deptRes, classRes, statRes, staffRes, docRes] = await Promise.allSettled([
          getCampaignsSelectApi(),
          getDepartmentsSelectApi(),
          getClassificationsApi(),
          getStatusesApi(),
          getStaffsSelectApi(),
          getDoctorsSelectApi(),
        ]);

        if (!isCancelled) {
          if (campRes.status === 'fulfilled') setCampaigns(campRes.value || []);
          if (deptRes.status === 'fulfilled') setDepartments(deptRes.value || []);
          if (classRes.status === 'fulfilled') setClassifications(classRes.value || []);
          if (statRes.status === 'fulfilled') setStatuses(statRes.value || []);
          if (staffRes.status === 'fulfilled') setStaffsList(staffRes.value || []);
          if (docRes.status === 'fulfilled') setDoctorsList(docRes.value || []);
        }
      } catch {
        // Bỏ qua lỗi danh mục nếu chưa sẵn sàng
      }
    };

    loadInitialLookups();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Tải danh sách hồ sơ khám theo bộ lọc và phân trang
  useEffect(() => {
    let isCancelled = false;

    const loadRecords = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getHealthRecordFilterApi({
          textSearch: search.trim(),
          campaignId: selectedCampaign,
          departmentId: selectedDept,
          status: selectedStatus,
          healthClassification: selectedClassification,
          pageNumber: pageNumber,
          pageSize: pageSize,
        });

        if (!isCancelled) {
          setRecords(res.items || []);
          setTotalCount(res.totalCount || 0);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Không thể kết nối đến máy chủ');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadRecords();

    return () => {
      isCancelled = true;
    };
  }, [search, selectedCampaign, selectedDept, selectedStatus, selectedClassification, pageNumber, pageSize, refreshKey]);

  // Mở modal thêm mới hồ sơ khám
  const handleOpenCreate = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultSid = `SID-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setFormData({
      ...INITIAL_FORM,
      sidCode: defaultSid,
      actualCheckupDate: todayStr,
      status: 'PENDING',
    });
    setModalError('');
    setModalMode(ModelMode.CREATE);
  };

  // Mở modal cập nhật kết luận / thông tin hồ sơ
  const handleOpenEdit = (rec) => {
    setFormData({
      recordId: rec.recordId,
      campaignId: rec.campaignId || '',
      staffId: rec.staffId || '',
      sidCode: rec.sidCode || '',
      actualCheckupDate: toDateInputValue(rec.actualCheckupDate),
      medicalHistoryPersonal: rec.medicalHistoryPersonal || '',
      medicalHistoryFamily: rec.medicalHistoryFamily || '',
      healthClassification: rec.healthClassification || '',
      generalConclusion: rec.generalConclusion || '',
      recommendations: rec.recommendations || rec.recommentdations || '',
      concludedByDoctorId: rec.concludedByDoctorId ? String(rec.concludedByDoctorId) : '',
      status: rec.status || 'PENDING',
      reportPdfUrl: rec.reportPdfUrl || '',
      staffName: rec.staffName || '',
      employeeCode: rec.employeeCode || '',
      departmentName: rec.departmentName || '',
      campaignName: rec.campaignName || '',
    });
    setModalError('');
    setModalMode(ModelMode.EDIT);
  };

  // Đóng modal thêm / sửa
  const handleCloseModal = () => {
    setModalMode(null);
    setModalError('');
  };

  // Gửi dữ liệu form Thêm hoặc Sửa lên API
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      if (modalMode === ModelMode.CREATE) {
        if (!formData.campaignId) {
          setModalError('Vui lòng chọn đợt khám sức khỏe');
          setSubmitting(false);
          return;
        }

        if (!formData.staffId) {
          setModalError('Vui lòng chọn cán bộ khám sức khỏe');
          setSubmitting(false);
          return;
        }

        if (!formData.sidCode.trim()) {
          setModalError('Vui lòng nhập mã vạch hồ sơ (SID)');
          setSubmitting(false);
          return;
        }

        await createHealthRecordApi({
          campaignId: Number(formData.campaignId),
          staffId: Number(formData.staffId),
          sidCode: formData.sidCode.trim(),
          actualCheckupDate: formData.actualCheckupDate ? new Date(formData.actualCheckupDate).toISOString() : new Date().toISOString(),
          medicalHistoryPersonal: formData.medicalHistoryPersonal.trim() || null,
          medicalHistoryFamily: formData.medicalHistoryFamily.trim() || null,
          healthClassification: formData.healthClassification || null,
          generalConclusion: formData.generalConclusion.trim() || null,
          recommendations: formData.recommendations.trim() || null,
          concludedByDoctorId: formData.concludedByDoctorId ? Number(formData.concludedByDoctorId) : 0,
          status: formData.status || 'PENDING',
          reportPdfUrl: formData.reportPdfUrl.trim() || null,
        });

        showToast('Tạo hồ sơ khám mới thành công!');
      } else if (modalMode === ModelMode.EDIT) {
        if (!formData.sidCode.trim()) {
          setModalError('Mã vạch hồ sơ (SID) không được để trống');
          setSubmitting(false);
          return;
        }

        await updateHealthRecordApi({
          recordId: formData.recordId,
          sidCode: formData.sidCode.trim(),
          actualCheckupDate: formData.actualCheckupDate ? new Date(formData.actualCheckupDate).toISOString() : new Date().toISOString(),
          medicalHistoryPersonal: formData.medicalHistoryPersonal.trim() || null,
          medicalHistoryFamily: formData.medicalHistoryFamily.trim() || null,
          healthClassification: formData.healthClassification || null,
          generalConclusion: formData.generalConclusion.trim() || null,
          recommendations: formData.recommendations.trim() || null,
          concludedByDoctorId: formData.concludedByDoctorId ? Number(formData.concludedByDoctorId) : 0,
          concludedAt: new Date().toISOString(),
          status: formData.status || 'PENDING',
          reportPdfUrl: formData.reportPdfUrl.trim() || null,
        });

        showToast('Cập nhật hồ sơ khám thành công!');
      }

      handleCloseModal();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setModalError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Mở hộp thoại xác nhận xóa hồ sơ khám
  const handleOpenDelete = (rec) => {
    setDeletingRecord({
      recordId: rec.recordId,
      sidCode: rec.sidCode,
      staffName: rec.staffName,
    });
  };

  // Xác nhận xóa hồ sơ khám
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setDeleteLoading(true);

    try {
      await deleteHealthRecordApi(deletingRecord.recordId);
      showToast(`Đã xóa hồ sơ khám "${deletingRecord.sidCode}" thành công!`);
      setDeletingRecord(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Không thể xóa hồ sơ khám này');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Đặt lại bộ lọc tìm kiếm
  const handleResetFilter = () => {
    setSearch('');
    setSelectedCampaign('ALL');
    setSelectedDept('ALL');
    setSelectedClassification('ALL');
    setSelectedStatus('ALL');
    setPageNumber(1);
  };

  // Tính toán hiển thị phân trang
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromRecord = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const toRecord = Math.min(totalCount, pageNumber * pageSize);

  // Xác định chữ hiển thị trên nút submit
  let submitButtonText = 'Lưu thay đổi';
  if (submitting) {
    submitButtonText = 'Đang xử lý...';
  } else if (modalMode === ModelMode.CREATE) {
    submitButtonText = 'Tạo hồ sơ khám';
  }

  return (
    <MainLayout activeTab="records">
      <div className="admin-page-container">
        {/* Thông báo toast thao tác thành công */}
        {toast && (
          <div className="admin-toast">
            <IconCheck size={16} />
            <span>{toast}</span>
          </div>
        )}

        {/* Tiêu đề trang & Nút thêm hồ sơ khám */}
        <div className="page-header-row">
          <div>
            <h2 className="main-title">Hồ sơ khám cán bộ</h2>
            <span className="main-desc">Quản lý và theo dõi hồ sơ khám sức khỏe định kỳ ({totalCount} hồ sơ)</span>
          </div>
          <div className="header-btn-group">
            <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
              <IconPlus size={16} />
              <span>Tạo hồ sơ khám</span>
            </button>
          </div>
        </div>

        {/* Bảng danh sách & Bộ lọc */}
        <div className="panel-card">
          {/* Thanh tìm kiếm và bộ lọc */}
          <div className="filter-toolbar">
            <div className="search-field">
              <IconSearch size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm mã SID, tên/mã cán bộ, bác sĩ..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNumber(1);
                }}
              />
            </div>

            <select
              className="form-select"
              value={selectedCampaign}
              onChange={(e) => {
                setSelectedCampaign(e.target.value);
                setPageNumber(1);
              }}
            >
              <option value="ALL">Tất cả đợt khám</option>
              {campaigns.map((camp) => (
                <option key={camp.campaignId} value={camp.campaignId}>{camp.campaignName} ({camp.year})</option>
              ))}
            </select>

            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPageNumber(1);
              }}
            >
              <option value="ALL">Tất cả khoa / phòng</option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>{dept.departmentName}</option>
              ))}
            </select>

            <select
              className="form-select"
              value={selectedClassification}
              onChange={(e) => {
                setSelectedClassification(e.target.value);
                setPageNumber(1);
              }}
            >
              <option value="ALL">Tất cả xếp loại SK</option>
              {classifications.map((item) => (
                <option key={item.classificationCode} value={item.classificationCode}>{item.classificationName}</option>
              ))}
            </select>

            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPageNumber(1);
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              {statuses.map((item) => (
                <option key={item.statusCode} value={item.statusCode}>{item.statusName}</option>
              ))}
            </select>

            <button type="button" className="btn-reset" onClick={handleResetFilter} title="Đặt lại bộ lọc">
              <IconRefreshCw size={14} />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* Bảng dữ liệu hồ sơ khám */}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="record-th-sid">Mã SID</th>
                  <th className="record-th-staff">Cán bộ khám</th>
                  <th className="record-th-campaign">Đợt khám</th>
                  <th className="record-th-date">Ngày khám</th>
                  <th className="record-th-grade">Xếp loại SK</th>
                  <th className="record-th-doctor">Bác sĩ kết luận</th>
                  <th className="record-th-status">Trạng thái</th>
                  <th className="record-th-action">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="empty-cell">
                      <div className="empty-wrap">
                        <span className="empty-title">Đang tải dữ liệu hồ sơ khám...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={8} className="empty-cell">
                      <div className="empty-wrap">
                        <span className="empty-title text-danger">Đã xảy ra lỗi</span>
                        <p className="empty-desc">{error}</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && records.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-cell">
                      <div className="empty-wrap">
                        <span className="empty-title">Không có dữ liệu hồ sơ khám nào</span>
                        <p className="empty-desc">Hệ thống chưa tìm thấy hồ sơ phù hợp với bộ lọc hiện tại.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  records.length > 0 &&
                  records.map((rec) => (
                    <tr key={rec.recordId}>
                      <td>
                        <span className="record-sid-badge">{rec.sidCode}</span>
                      </td>
                      <td>
                        <div className="cell-staff">
                          <strong>{rec.staffName || '—'}</strong>
                          <span>{rec.employeeCode || '—'} {rec.departmentName ? `• ${rec.departmentName}` : ''}</span>
                        </div>
                      </td>
                      <td>{rec.campaignName || '—'}</td>
                      <td>{formatDate(rec.actualCheckupDate)}</td>
                      <td>{renderClassificationBadge(rec.healthClassification)}</td>
                      <td>{rec.doctorName || 'Chưa phân công'}</td>
                      <td>{renderStatusBadge(rec.status)}</td>
                      <td className="record-action-cell">
                        <button
                          type="button"
                          className="btn-icon btn-detail"
                          title="Xem & Điền các phiếu khám chuyên khoa"
                          onClick={() => setViewingRecord(rec)}
                        >
                          <IconEye size={14} />
                        </button>
                        <button type="button" className="btn-icon" title="Cập nhật kết luận / thông tin hồ sơ" onClick={() => handleOpenEdit(rec)}>
                          <IconEdit size={14} />
                        </button>
                        <button type="button" className="btn-icon btn-danger" title="Xóa hồ sơ khám" onClick={() => handleOpenDelete(rec)}>
                          <IconTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Thanh phân trang */}
          <div className="table-pagination">
            <div className="pagination-text">
              Hiển thị <strong>{fromRecord}</strong> – <strong>{toRecord}</strong> trên tổng số <strong>{totalCount}</strong> hồ sơ
            </div>

            <div className="record-pagination-wrapper">
              <div className="record-page-size-selector">
                <span>Hiển thị:</span>
                <select
                  className="form-select record-page-size-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1);
                  }}
                >
                  <option value={5}>5 / trang</option>
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>

              <div className="pagination-buttons">
                <button type="button" className="btn-page" disabled={pageNumber <= 1 || loading} onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}>
                  Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageNumber) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="record-pagination-page-item">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="record-pagination-ellipsis">...</span>}
                      <button type="button" className={`btn-page ${p === pageNumber ? 'active' : ''}`} onClick={() => setPageNumber(p)} disabled={loading}>
                        {p}
                      </button>
                    </span>
                  ))}

                <button
                  type="button"
                  className="btn-page"
                  disabled={pageNumber >= totalPages || loading}
                  onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Thêm / Sửa Hồ sơ khám */}
        {modalMode && (
          <div className="modal-backdrop">
            <div className="modal-card record-modal-card">
              <div className="modal-head">
                <span className="modal-title-text">{modalMode === ModelMode.CREATE ? 'Tạo mới hồ sơ khám cán bộ' : 'Cập nhật hồ sơ khám sức khỏe'}</span>
                <button type="button" className="modal-x" onClick={handleCloseModal}>
                  <IconClose size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm}>
                <div className="modal-content record-modal-body">
                  {modalError && <div className="alert-tag danger record-modal-alert">{modalError}</div>}

                  {modalMode === ModelMode.EDIT && (
                    <div className="record-info-banner">
                      <strong>Cán bộ: {formData.staffName} ({formData.employeeCode})</strong>
                      <span>Khoa/Phòng: {formData.departmentName || '—'} | Đợt khám: {formData.campaignName || '—'}</span>
                    </div>
                  )}

                  <div className="record-section-title">Thông tin tiếp nhận</div>

                  {modalMode === ModelMode.CREATE && (
                    <div className="record-form-grid">
                      <div className="form-item">
                        <label className="field-label">Đợt khám sức khỏe *</label>
                        <select
                          className="form-select"
                          value={formData.campaignId}
                          onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                          required
                        >
                          <option value="">-- Chọn đợt khám --</option>
                          {campaigns.map((camp) => (
                            <option key={camp.campaignId} value={camp.campaignId}>{camp.campaignName} ({camp.year})</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-item">
                        <label className="field-label">Cán bộ khám *</label>
                        <select
                          className="form-select"
                          value={formData.staffId}
                          onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                          required
                        >
                          <option value="">-- Chọn cán bộ --</option>
                          {staffsList.map((st) => (
                            <option key={st.staffId} value={st.staffId}>{st.fullName} ({st.staffCode || st.employeeCode}) - {st.departmentName || 'Chưa có phòng'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="record-form-grid">
                    <div className="form-item">
                      <label className="field-label">Mã tiếp nhận / SID *</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Ví dụ: SID-2025-001"
                        value={formData.sidCode}
                        onChange={(e) => setFormData({ ...formData, sidCode: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-item">
                      <label className="field-label">Ngày khám thực tế</label>
                      <input
                        type="date"
                        className="text-input"
                        value={formData.actualCheckupDate}
                        onChange={(e) => setFormData({ ...formData, actualCheckupDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="record-section-title">Tiền sử sức khỏe</div>

                  <div className="record-form-grid">
                    <div className="form-item">
                      <label className="field-label">Tiền sử bệnh bản thân</label>
                      <textarea
                        className="record-textarea"
                        placeholder="Tiền sử dị ứng, phẫu thuật, bệnh mạn tính..."
                        value={formData.medicalHistoryPersonal}
                        onChange={(e) => setFormData({ ...formData, medicalHistoryPersonal: e.target.value })}
                      />
                    </div>

                    <div className="form-item">
                      <label className="field-label">Tiền sử bệnh gia đình</label>
                      <textarea
                        className="record-textarea"
                        placeholder="Gia đình có người mắc tim mạch, tiểu đường..."
                        value={formData.medicalHistoryFamily}
                        onChange={(e) => setFormData({ ...formData, medicalHistoryFamily: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="record-section-title">Kết luận & Phân loại sức khỏe</div>

                  <div className="record-form-grid">
                    <div className="form-item">
                      <label className="field-label">Xếp loại sức khỏe (Bộ Y tế)</label>
                      <select
                        className="form-select"
                        value={formData.healthClassification}
                        onChange={(e) => setFormData({ ...formData, healthClassification: e.target.value })}
                      >
                        <option value="">-- Chưa xếp loại --</option>
                        {classifications.map((item) => (
                          <option key={item.classificationCode} value={item.classificationCode}>{item.classificationName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-item">
                      <label className="field-label">Bác sĩ kết luận hồ sơ</label>
                      <select
                        className="form-select"
                        value={formData.concludedByDoctorId}
                        onChange={(e) => setFormData({ ...formData, concludedByDoctorId: e.target.value })}
                      >
                        <option value="">-- Chọn bác sĩ kết luận --</option>
                        {doctorsList.map((doc) => (
                          <option key={doc.doctorId} value={doc.doctorId}>{doc.fullName} ({doc.doctorCode}) {doc.specialtyName ? `- ${doc.specialtyName}` : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="record-form-full">
                    <label className="field-label">Kết luận chung</label>
                    <textarea
                      className="record-textarea"
                      placeholder="Ghi nhận tóm tắt kết luận của hội đồng khám..."
                      value={formData.generalConclusion}
                      onChange={(e) => setFormData({ ...formData, generalConclusion: e.target.value })}
                    />
                  </div>

                  <div className="record-form-full">
                    <label className="field-label">Lời dặn / Đề xuất điều trị</label>
                    <textarea
                      className="record-textarea"
                      placeholder="Chế độ ăn uống, vận động, khám chuyên sâu nếu có..."
                      value={formData.recommendations}
                      onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    />
                  </div>

                  <div className="record-form-grid">
                    <div className="form-item">
                      <label className="field-label">Trạng thái hồ sơ</label>
                      <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                        {statuses.map((item) => (
                          <option key={item.statusCode} value={item.statusCode}>{item.statusName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-item">
                      <label className="field-label">Đường dẫn file PDF báo cáo</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="https://... hoặc để trống"
                        value={formData.reportPdfUrl}
                        onChange={(e) => setFormData({ ...formData, reportPdfUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-foot">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={submitting}>Hủy bỏ</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitButtonText}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác nhận xóa Hồ sơ khám */}
        {deletingRecord && (
          <div className="modal-backdrop">
            <div className="modal-card confirm-modal-card">
              <div className="modal-head">
                <span className="modal-title-text text-danger">Xác nhận xóa hồ sơ khám</span>
                <button type="button" className="modal-x" onClick={() => setDeletingRecord(null)} disabled={deleteLoading}>
                  <IconClose size={16} />
                </button>
              </div>

              <div className="modal-content confirm-modal-body">
                <div className="confirm-icon-box">
                  <IconAlertTriangle size={32} className="text-danger" />
                </div>
                <div className="confirm-message">
                  <p>
                    Bạn có chắc chắn muốn xóa hồ sơ khám <strong>{deletingRecord.sidCode}</strong>
                    {deletingRecord.staffName ? ` của cán bộ "${deletingRecord.staffName}"` : ''} không?
                  </p>
                  <p className="confirm-sub">Hành động này không thể hoàn tác và sẽ xóa toàn bộ phiếu khám chuyên khoa liên quan.</p>
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setDeletingRecord(null)} disabled={deleteLoading}>
                  Hủy bỏ
                </button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete} disabled={deleteLoading}>{deleteLoading ? 'Đang xóa...' : 'Xóa hồ sơ'}</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal Chi tiết các phiếu khám chuyên khoa */}
        {viewingRecord && (
          <RecordDetailModal
            record={viewingRecord}
            onClose={() => setViewingRecord(null)}
            onRefreshList={() => setRefreshKey((prev) => prev + 1)}
            doctorsList={doctorsList}
            classifications={classifications}
            statuses={statuses}
          />
        )}
      </div>
    </MainLayout>
  );
}
