//
// Container điều phối chính của màn hình Nhật ký gửi Email (chỉ SUPER_ADMIN và HEALTH_ADMIN)
// Gọi EmailService tải danh sách nhật ký, quản lý bộ lọc/phân trang và kết nối EmailFilter, EmailTable, EmailDetailModal, HealthAlertModal
//

import { useEffect, useState } from 'react';
import { EmailService } from '../../../services/admin/EmailService.js';
import { IconCheck, IconMail, IconRefreshCw } from '../../SupportAgent/Icons.jsx';
import EmailFilter from './EmailFilter.jsx';
import EmailTable from './EmailTable.jsx';
import EmailDetailModal from './EmailDetailModal.jsx';
import HealthAlertModal from './HealthAlertModal.jsx';

export default function SearchEmailList() {
  // Dữ liệu danh sách nhật ký email
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bộ lọc tìm kiếm và phân trang
  const [search, setSearch] = useState('');
  const [sentStatus, setSentStatus] = useState('ALL');
  const [referenceType, setReferenceType] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal xem chi tiết email & Modal cảnh báo sức khỏe suy giảm
  const [selectedEmailLog, setSelectedEmailLog] = useState(null);
  const [showHealthAlertModal, setShowHealthAlertModal] = useState(false);

  // Thông báo toast nhanh
  const [toast, setToast] = useState('');
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3500);
  };

  // Tải danh sách nhật ký email mỗi khi bộ lọc, phân trang hoặc refreshKey thay đổi
  useEffect(() => {
    let isCancelled = false;

    const loadEmailLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await EmailService.getEmailLogs({
          textSearch: search,
          sentStatus: sentStatus,
          referenceType: referenceType,
          fromDate: fromDate,
          toDate: toDate,
          pageNumber: pageNumber,
          pageSize: pageSize,
        });

        if (!isCancelled) {
          setEmailLogs(data.items || []);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Không thể tải danh sách nhật ký gửi email');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadEmailLogs();
    return () => {
      isCancelled = true;
    };
  }, [search, sentStatus, referenceType, fromDate, toDate, pageNumber, pageSize, refreshKey]);

  // Đặt lại toàn bộ điều kiện lọc về mặc định
  const handleResetFilter = () => {
    setSearch('');
    setSentStatus('ALL');
    setReferenceType('ALL');
    setFromDate('');
    setToDate('');
    setPageNumber(1);
  };

  // Tính toán các thông số hiển thị phân trang
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromRecord = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const toRecord = Math.min(totalCount, pageNumber * pageSize);

  return (
    <div className="admin-page-container">
      {/* Thông báo toast góc trên */}
      {toast && (
        <div className="admin-toast">
          <IconCheck size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Tiêu đề trang và các nút thao tác */}
      <div className="page-header-row">
        <div>
          <h2 className="main-title">Nhật ký gửi Email</h2>
          <span className="main-desc">
            Theo dõi lịch sử gửi email cảnh báo sức khỏe định kỳ và trạng thái máy chủ SMTP ({totalCount} email)
          </span>
        </div>

        <div className="header-btn-group">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setRefreshKey((currentKey) => currentKey + 1)}
            disabled={loading}
          >
            <IconRefreshCw size={15} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowHealthAlertModal(true)}
          >
            <IconMail size={16} />
            <span>Gửi cảnh báo sức khỏe giảm</span>
          </button>
        </div>
      </div>

      {/* Khối Bộ lọc và Bảng danh sách */}
      <div className="panel-card">
        <EmailFilter
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          sentStatus={sentStatus}
          onStatusChange={(value) => {
            setSentStatus(value);
            setPageNumber(1);
          }}
          referenceType={referenceType}
          onReferenceTypeChange={(value) => {
            setReferenceType(value);
            setPageNumber(1);
          }}
          fromDate={fromDate}
          onFromDateChange={(value) => {
            setFromDate(value);
            setPageNumber(1);
          }}
          toDate={toDate}
          onToDateChange={(value) => {
            setToDate(value);
            setPageNumber(1);
          }}
          onResetFilter={handleResetFilter}
        />

        <EmailTable
          emailLogs={emailLogs}
          loading={loading}
          error={error}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          fromRecord={fromRecord}
          toRecord={toRecord}
          onPageChange={setPageNumber}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPageNumber(1);
          }}
          onViewDetail={setSelectedEmailLog}
        />
      </div>

      {/* Modal xem chi tiết 1 email đã gửi */}
      {selectedEmailLog && (
        <EmailDetailModal
          key={selectedEmailLog.emailLogId}
          emailLog={selectedEmailLog}
          onClose={() => setSelectedEmailLog(null)}
        />
      )}

      {/* Modal lọc và gửi cảnh báo sức khỏe suy giảm */}
      {showHealthAlertModal && (
        <HealthAlertModal
          isOpen={showHealthAlertModal}
          onClose={() => setShowHealthAlertModal(false)}
          onAlertSent={() => setRefreshKey((currentKey) => currentKey + 1)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
