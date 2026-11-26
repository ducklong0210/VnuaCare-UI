//
// Modal xem chi tiết một bản ghi Nhật ký gửi Email theo emailLogId
// Hiển thị thông tin gửi, chi tiết lỗi SMTP (nếu thất bại) và khung xem trước nội dung HTML an toàn
//

import { useEffect, useState } from 'react';
import { EmailService } from '../../../services/admin/EmailService.js';
import { formatDate } from '../../../utils/helpers.js';
import { IconClose } from '../../SupportAgent/Icons.jsx';

export default function EmailDetailModal({ emailLog, onClose }) {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tải bản ghi chi tiết từ GET /api/v1/emaillogs/{id} mỗi khi mở modal
  useEffect(() => {
    let isCancelled = false;

    const loadEmailDetail = async () => {
      if (!emailLog?.emailLogId) {
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await EmailService.getEmailLogById(emailLog.emailLogId);
        if (!isCancelled) {
          setDetailData(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Không thể tải chi tiết nội dung email');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadEmailDetail();
    return () => {
      isCancelled = true;
    };
  }, [emailLog]);

  if (!emailLog) {
    return null;
  }

  // Ưu tiên dữ liệu mới nhất từ API GetById, nếu chưa xong thì hiển thị tạm dữ liệu dòng trên bảng
  const activeLog = detailData || emailLog;
  const isSuccess = (activeLog.sentStatus || '').toLowerCase() === 'success';

  return (
    <div className="modal-backdrop">
      <div className="modal-card email-detail-modal-card">
        <div className="modal-head">
          <span className="modal-title-text">Chi tiết nhật ký gửi Email ({activeLog.code || `#${activeLog.emailLogId}`})</span>
          <button type="button" className="modal-x" onClick={onClose}>
            <IconClose size={16} />
          </button>
        </div>

        <div className="modal-content email-detail-body">
          {error && <div className="alert-tag danger">{error}</div>}

          {/* Khối thông tin tóm tắt */}
          <div className="email-meta-grid">
            <div className="email-meta-item">
              <span className="email-meta-label">Mã nhật ký</span>
              <span className="email-meta-value code-font">{activeLog.code || `#${activeLog.emailLogId}`}</span>
            </div>

            <div className="email-meta-item">
              <span className="email-meta-label">Trạng thái gửi</span>
              <div>
                <span className={`email-status-pill ${isSuccess ? 'is-success' : 'is-failed'}`}>
                  {isSuccess ? 'Gửi thành công' : 'Gửi thất bại'}
                </span>
              </div>
            </div>

            <div className="email-meta-item">
              <span className="email-meta-label">Email người nhận</span>
              <span className="email-meta-value">{activeLog.toEmail || '—'}</span>
            </div>

            <div className="email-meta-item">
              <span className="email-meta-label">Thời gian gửi</span>
              <span className="email-meta-value">{formatDate(activeLog.createdDate, true)}</span>
            </div>

            <div className="email-meta-item">
              <span className="email-meta-label">Phân loại nghiệp vụ</span>
              <span className="email-meta-value">
                {activeLog.referenceType || 'System'}
                {activeLog.referenceId > 0 ? ` (ID liên kết: #${activeLog.referenceId})` : ''}
              </span>
            </div>

            <div className="email-meta-item full-row">
              <span className="email-meta-label">Tiêu đề email</span>
              <span className="email-meta-value">{activeLog.subject || '—'}</span>
            </div>
          </div>

          {/* Chi tiết lỗi SMTP khi gửi thất bại */}
          {activeLog.errorMessage && (
            <div className="email-error-box">
              <strong>Chi tiết lỗi từ máy chủ SMTP:</strong>
              <span>{activeLog.errorMessage}</span>
            </div>
          )}

          {/* Xem trước nội dung HTML email đã gửi trong khung iframe cách ly an toàn */}
          <div className="email-preview-wrap">
            <div className="email-preview-header">Nội dung Email đã gửi</div>
            {loading ? (
              <div className="empty-cell">
                <span className="empty-desc">Đang tải nội dung chi tiết...</span>
              </div>
            ) : activeLog.body ? (
              <iframe
                srcDoc={activeLog.body}
                sandbox=""
                title={`Nội dung email ${activeLog.code || activeLog.emailLogId}`}
                className="email-html-frame"
              />
            ) : (
              <div className="empty-cell">
                <span className="empty-desc">Không có nội dung HTML lưu trong bản ghi này.</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
