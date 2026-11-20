// Container chính điều phối phân hệ Quản lý Hồ sơ khám sức khỏe cán bộ
// Quản lý state tìm kiếm, bộ lọc, phân trang, gọi HealthRecordService và kết nối các component con:
//   - HealthRecordFilter     : Thanh tìm kiếm & bộ lọc
//   - HealthRecordTable      : Bảng danh sách hồ sơ & phân trang
//   - HealthRecordFormModal  : Modal Thêm / Sửa thông tin hồ sơ
//   - RecordDetailModal      : Modal điều phối 5 Tab khám chuyên môn

import { useEffect, useState } from 'react';
import { HealthRecordService } from '../../../services/admin/HealthRecordService.js';
import { IconPlus, IconCheck, IconClose, IconAlertTriangle } from '../../SupportAgent/Icons.jsx';
import { ModelMode } from '../../../utils/index.js';
import HealthRecordFilter from './HealthRecordFilter.jsx';
import HealthRecordTable from './HealthRecordTable.jsx';
import HealthRecordFormModal from './HealthRecordFormModal.jsx';
import RecordDetailModal from './RecordDetailModal.jsx';

// Giá trị khởi tạo mặc định của form hồ sơ khám
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

// Chuyển đổi chuỗi ngày từ API sang YYYY-MM-DD cho ô <input type="date">
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

export default function SearchHealthRecordList() {
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
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedClassification, setSelectedClassification] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Thông báo toast nhanh
  const [toast, setToast] = useState('');
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  // State Modal Thêm / Sửa hồ sơ
  const [modalMode, setModalMode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);

  // State Modal xác nhận xóa hồ sơ
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State Modal 5 Tab khám chuyên môn
  const [viewingRecord, setViewingRecord] = useState(null);

  // 1. Tải các danh mục tra cứu (Lookups) một lần khi mở màn hình
  useEffect(() => {
    let isCancelled = false;

    const loadInitialLookups = async () => {
      try {
        const [
          campaignRes,
          departmentRes,
          classificationRes,
          statusRes,
          staffRes,
          doctorRes,
        ] = await Promise.allSettled([
          HealthRecordService.getCampaigns(),
          HealthRecordService.getDepartments(),
          HealthRecordService.getClassifications(),
          HealthRecordService.getStatuses(),
          HealthRecordService.getStaffs(),
          HealthRecordService.getDoctors(),
        ]);

        if (!isCancelled) {
          if (campaignRes.status === 'fulfilled') setCampaigns(campaignRes.value || []);
          if (departmentRes.status === 'fulfilled') setDepartments(departmentRes.value || []);
          if (classificationRes.status === 'fulfilled') setClassifications(classificationRes.value || []);
          if (statusRes.status === 'fulfilled') setStatuses(statusRes.value || []);
          if (staffRes.status === 'fulfilled') setStaffsList(staffRes.value || []);
          if (doctorRes.status === 'fulfilled') setDoctorsList(doctorRes.value || []);
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

  // 2. Tải danh sách hồ sơ khám khi thay đổi bộ lọc / phân trang
  useEffect(() => {
    let isCancelled = false;

    const loadRecords = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await HealthRecordService.getHealthRecords({
          textSearch: search.trim(),
          campaignId: selectedCampaign,
          departmentId: selectedDepartment,
          status: selectedStatus,
          healthClassification: selectedClassification,
          pageNumber,
          pageSize,
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
  }, [search, selectedCampaign, selectedDepartment, selectedStatus, selectedClassification, pageNumber, pageSize, refreshKey]);

  // Cập nhật từng trường trong form Thêm / Sửa
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Mở modal tạo hồ sơ mới
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

  // Mở modal chỉnh sửa hồ sơ
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

  const handleCloseModal = () => {
    setModalMode(null);
    setModalError('');
  };

  // Lưu biểu mẫu Thêm mới hoặc Cập nhật hồ sơ
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      const commonFields = {
        sidCode: formData.sidCode.trim(),
        actualCheckupDate: formData.actualCheckupDate
          ? new Date(formData.actualCheckupDate).toISOString()
          : new Date().toISOString(),
        medicalHistoryPersonal: formData.medicalHistoryPersonal.trim() || null,
        medicalHistoryFamily: formData.medicalHistoryFamily.trim() || null,
        healthClassification: formData.healthClassification || null,
        generalConclusion: formData.generalConclusion.trim() || null,
        recommendations: formData.recommendations.trim() || null,
        concludedByDoctorId: formData.concludedByDoctorId ? Number(formData.concludedByDoctorId) : 0,
        status: formData.status || 'PENDING',
        reportPdfUrl: formData.reportPdfUrl.trim() || null,
      };

      if (modalMode === ModelMode.CREATE) {
        if (!formData.campaignId) return setModalError('Vui lòng chọn đợt khám sức khỏe');
        if (!formData.staffId) return setModalError('Vui lòng chọn cán bộ khám sức khỏe');
        if (!commonFields.sidCode) return setModalError('Vui lòng nhập mã vạch hồ sơ (SID)');

        await HealthRecordService.createHealthRecord({
          campaignId: Number(formData.campaignId),
          staffId: Number(formData.staffId),
          ...commonFields,
        });
        showToast('Tạo hồ sơ khám mới thành công!');
      } else if (modalMode === ModelMode.EDIT) {
        if (!commonFields.sidCode) return setModalError('Mã vạch hồ sơ (SID) không được để trống');

        await HealthRecordService.updateHealthRecord({
          recordId: formData.recordId,
          ...commonFields,
          concludedAt: new Date().toISOString(),
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

  // Xóa hồ sơ khám
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setDeleteLoading(true);

    try {
      await HealthRecordService.deleteHealthRecord(deletingRecord.recordId);
      showToast(`Đã xóa hồ sơ khám "${deletingRecord.sidCode}" thành công!`);
      setDeletingRecord(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Không thể xóa hồ sơ khám này');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Đặt lại toàn bộ bộ lọc
  const handleResetFilter = () => {
    setSearch('');
    setSelectedCampaign('ALL');
    setSelectedDepartment('ALL');
    setSelectedClassification('ALL');
    setSelectedStatus('ALL');
    setPageNumber(1);
  };

  return (
    <div className="admin-page-container">
      {/* Thông báo toast */}
      {toast && (
        <div className="admin-toast">
          <IconCheck size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Tiêu đề trang & Nút tạo mới */}
      <div className="page-header-row">
        <div>
          <h2 className="main-title">Hồ sơ khám cán bộ</h2>
          <span className="main-desc">
            Quản lý và theo dõi hồ sơ khám sức khỏe định kỳ ({totalCount} hồ sơ)
          </span>
        </div>
        <div className="header-btn-group">
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <IconPlus size={16} />
            <span>Tạo hồ sơ khám</span>
          </button>
        </div>
      </div>

      {/* Khối Bộ lọc + Bảng dữ liệu + Phân trang */}
      <div className="panel-card">
        <HealthRecordFilter
          search={search}
          onSearchChange={(val) => { setSearch(val); setPageNumber(1); }}
          selectedCampaign={selectedCampaign}
          onCampaignChange={(val) => { setSelectedCampaign(val); setPageNumber(1); }}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={(val) => { setSelectedDepartment(val); setPageNumber(1); }}
          selectedClassification={selectedClassification}
          onClassificationChange={(val) => { setSelectedClassification(val); setPageNumber(1); }}
          selectedStatus={selectedStatus}
          onStatusChange={(val) => { setSelectedStatus(val); setPageNumber(1); }}
          campaigns={campaigns}
          departments={departments}
          classifications={classifications}
          statuses={statuses}
          onReset={handleResetFilter}
        />

        <HealthRecordTable
          records={records}
          loading={loading}
          error={error}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPageNumber}
          onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }}
          onViewDetail={setViewingRecord}
          onEdit={handleOpenEdit}
          onDelete={(rec) =>
            setDeletingRecord({
              recordId: rec.recordId,
              sidCode: rec.sidCode,
              staffName: rec.staffName,
            })
          }
        />
      </div>

      {/* Modal Thêm / Sửa thông tin hồ sơ */}
      <HealthRecordFormModal
        modalMode={modalMode}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmitForm}
        onClose={handleCloseModal}
        submitting={submitting}
        modalError={modalError}
        campaigns={campaigns}
        staffsList={staffsList}
        doctorsList={doctorsList}
        classifications={classifications}
        statuses={statuses}
      />

      {/* Modal xác nhận xóa hồ sơ */}
      {deletingRecord && (
        <div className="modal-backdrop">
          <div className="modal-card confirm-modal-card">
            <div className="modal-head">
              <span className="modal-title-text text-danger">Xác nhận xóa hồ sơ khám</span>
              <button
                type="button"
                className="modal-x"
                onClick={() => setDeletingRecord(null)}
                disabled={deleteLoading}
              >
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
                <p className="confirm-sub">
                  Hành động này không thể hoàn tác và sẽ xóa toàn bộ phiếu khám chuyên khoa liên quan.
                </p>
              </div>
            </div>

            <div className="modal-foot">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletingRecord(null)}
                disabled={deleteLoading}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Đang xóa...' : 'Xóa hồ sơ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5 Tab khám chuyên môn */}
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
  );
}
