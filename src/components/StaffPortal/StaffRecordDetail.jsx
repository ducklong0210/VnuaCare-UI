//
// Component hiển thị chi tiết Bệnh án khám sức khỏe ở chế độ chỉ đọc cho Cán bộ / Giảng viên
// Trình bày Kết luận tổng quát của bác sĩ và 4 mục chuyên môn: Sinh tồn, Nội khoa, Chuyên khoa lẻ và CĐHA
//

import { useState } from 'react';
import { CLINICAL_SPECIALTIES_CONFIG } from '../../models/SpecialistExam.js';
import { MODALITY_CONFIG } from '../../models/DiagnosticReport.js';
import {
  normalizeSampleType,
  getLabFlagMeta,
  groupLabResultsByCategory,
  countAbnormalResults,
} from '../../models/LabTest.js';
import { evaluateBmi, evaluateBloodPressure, formatDate, getClassificationMeta, getStatusMeta } from '../../utils/helpers.js';

const CLINICAL_TABS = [
  { key: 'VITAL_SIGNS', label: 'Thể lực & Sinh tồn' },
  { key: 'INTERNAL_MEDICINE', label: 'Khám Nội khoa' },
  { key: 'SPECIALIST_EXAMS', label: 'Chuyên khoa lẻ' },
  { key: 'DIAGNOSTIC_REPORTS', label: 'CĐHA & Thăm dò' },
  { key: 'LAB_TESTS', label: 'Xét nghiệm' },
];

function getSpecialtyDisplayName(code) {
  const normalized = (code || '').trim().toUpperCase();
  const found = CLINICAL_SPECIALTIES_CONFIG.find((c) => c.code === normalized);
  return found ? found.defaultName : code || 'Chuyên khoa';
}

function renderSpecialistFields(exam) {
  const code = (exam.specialtyType || '').trim().toUpperCase();

  if (code === 'EYE') {
    const rows = [
      { label: 'Mắt trái (không kính)', value: exam.visionLeftNoGlass },
      { label: 'Mắt phải (không kính)', value: exam.visionRightNoGlass },
      { label: 'Mắt trái (có kính)', value: exam.visionLeftGlass },
      { label: 'Mắt phải (có kính)', value: exam.visionRightGlass },
    ].filter((r) => r.value);

    return rows.length > 0 ? (
      <div className="sp-kv-grid">
        {rows.map((row) => (
          <div key={row.label} className="sp-kv-item">
            <span className="sp-kv-label">{row.label}</span>
            <span className="sp-kv-value sp-tabular">{row.value}</span>
          </div>
        ))}
      </div>
    ) : null;
  }

  if (code === 'ENT') {
    const rows = [
      { label: 'Tai trái', value: exam.earLeftDesc },
      { label: 'Tai phải', value: exam.earRightDesc },
      { label: 'Mũi', value: exam.noseDesc },
      { label: 'Họng & Thanh quản', value: exam.throatDesc },
    ].filter((r) => r.value);

    return rows.length > 0 ? (
      <div className="sp-kv-grid">
        {rows.map((row) => (
          <div key={row.label} className="sp-kv-item">
            <span className="sp-kv-label">{row.label}</span>
            <span className="sp-kv-value">{row.value}</span>
          </div>
        ))}
      </div>
    ) : null;
  }

  if (code === 'DENTAL') {
    const rows = [
      { label: 'Hàm trên', value: exam.upperJaw },
      { label: 'Hàm dưới', value: exam.lowerJaw },
      { label: 'Công thức răng', value: exam.teethFormula },
    ].filter((r) => r.value);

    return rows.length > 0 ? (
      <div className="sp-kv-grid">
        {rows.map((row) => (
          <div key={row.label} className="sp-kv-item">
            <span className="sp-kv-label">{row.label}</span>
            <span className="sp-kv-value">{row.value}</span>
          </div>
        ))}
      </div>
    ) : null;
  }

  const singleDesc = exam.skinDesc || exam.surgicalDesc || exam.obstetricDesc;
  if (!singleDesc) return null;

  return <p className="sp-prose-block">{singleDesc}</p>;
}

export default function StaffRecordDetail({ selectedRecord, detailBundle, loadingDetail }) {
  const [activeTab, setActiveTab] = useState('VITAL_SIGNS');

  if (!selectedRecord) {
    return (
      <section className="sp-dossier-sheet sp-dossier-empty">
        <h3>Chọn một đợt khám để xem bệnh án</h3>
        <p>Danh sách các đợt khám sức khỏe định kỳ của bạn hiển thị ở cột bên trái.</p>
      </section>
    );
  }

  const mergedRecord = {
    ...selectedRecord,
    ...(detailBundle?.recordDetail || {}),
  };

  const vitalSigns = detailBundle?.vitalSigns || null;
  const internalMedicine = detailBundle?.internalMedicine || null;
  const specialistExams = detailBundle?.specialistExams || [];
  const diagnosticReports = detailBundle?.diagnosticReports || [];
  const labTests = detailBundle?.labTests || [];
  const totalLabIndicators = labTests.reduce((sum, order) => sum + (order.results?.length || 0), 0);

  const classMeta = getClassificationMeta(mergedRecord.healthClassification);
  const statusMeta = getStatusMeta(mergedRecord.status);
  const bmiEval = vitalSigns ? evaluateBmi(vitalSigns.bmi) : null;
  const bpEval = vitalSigns ? evaluateBloodPressure(vitalSigns.systolicBp, vitalSigns.diastolicBp) : null;

  // Kiểm tra hồ sơ đã có dữ liệu kết luận hoặc tiền sử để hiển thị hay chưa
  const hasConclusionInfo = Boolean(mergedRecord.generalConclusion || mergedRecord.recommendations || mergedRecord.medicalHistoryPersonal || mergedRecord.medicalHistoryFamily);

  // Gom 6 hệ cơ quan khám Nội khoa thành mảng để render gọn gàng
  let internalSystems = [];
  if (internalMedicine) {
    internalSystems = [
      { label: 'Hệ Tuần hoàn', value: internalMedicine.circulatoryDesc },
      { label: 'Hệ Hô hấp', value: internalMedicine.respiratoryDesc },
      { label: 'Hệ Tiêu hóa', value: internalMedicine.digestiveDesc },
      { label: 'Thận - Tiết niệu', value: internalMedicine.urinaryDesc },
      { label: 'Cơ - Xương - Khớp', value: internalMedicine.musculoskeletalDesc },
      { label: 'Hệ Thần kinh', value: internalMedicine.neurologicalDesc },
    ];
  }

  return (
    <article className="sp-dossier-sheet">
      {/* 1. ĐẦU BỆNH ÁN: TÊN ĐỢT KHÁM, MÃ SID, NGÀY KHÁM, XẾP LOẠI */}
      <header className="sp-dossier-head">
        <div className="sp-dossier-title-group">
          <div className="sp-dossier-title-row">
            <h2>{mergedRecord.campaignName || 'Hồ sơ khám sức khỏe định kỳ'}</h2>
            <span className={`sp-status-pill tone-${statusMeta.tone}`}>{statusMeta.label}</span>
          </div>

          <div className="sp-dossier-meta">
            <span>
              Mã SID: <code className="sp-code">{mergedRecord.sidCode || '—'}</code>
            </span>
            <span className="sp-dot" aria-hidden="true" />
            <span>
              Ngày khám: <strong className="sp-tabular">{formatDate(mergedRecord.actualCheckupDate)}</strong>
            </span>
            <span className="sp-dot" aria-hidden="true" />
            <span>
              Bác sĩ kết luận: <strong>{mergedRecord.doctorName || mergedRecord.concludedByDoctorName || 'Chưa cập nhật'}</strong>
            </span>
          </div>
        </div>

        <div className="sp-dossier-grade-box">
          <span className="sp-grade-caption">Xếp loại sức khỏe</span>
          <span className={`sp-grade-pill tone-${classMeta.tone}`}>{classMeta.label}</span>
          {mergedRecord.reportPdfUrl && (
            <a
              href={mergedRecord.reportPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sp-pdf-link"
            >
              Mở phiếu PDF
            </a>
          )}
        </div>
      </header>

      {/* 2. KẾT LUẬN TỔNG QUÁT & LỜI DẶN CỦA BÁC SĨ */}
      <section className="sp-summary-section" aria-label="Kết luận tổng quát">
        <h3 className="sp-section-heading">Kết luận tổng quát &amp; Tư vấn bác sĩ</h3>

        {loadingDetail ? (
          <p className="sp-muted-note">Đang tải chi tiết kết luận và phiếu khám chuyên môn...</p>
        ) : hasConclusionInfo ? (
          <div className="sp-summary-grid">
            <div className="sp-summary-block">
              <span className="sp-kv-label">Kết luận chung</span>
              <p className="sp-prose-block">
                {mergedRecord.generalConclusion || 'Chưa có kết luận chung từ bác sĩ.'}
              </p>
            </div>

            <div className="sp-summary-block">
              <span className="sp-kv-label">Lời dặn &amp; Đề nghị theo dõi</span>
              <p className="sp-prose-block">
                {mergedRecord.recommendations || 'Chưa có ghi chú lời dặn thêm.'}
              </p>
            </div>

            {(mergedRecord.medicalHistoryPersonal || mergedRecord.medicalHistoryFamily) && (
              <>
                <div className="sp-summary-block">
                  <span className="sp-kv-label">Tiền sử bệnh bản thân</span>
                  <p className="sp-prose-block">{mergedRecord.medicalHistoryPersonal || 'Không ghi nhận'}</p>
                </div>
                <div className="sp-summary-block">
                  <span className="sp-kv-label">Tiền sử bệnh gia đình</span>
                  <p className="sp-prose-block">{mergedRecord.medicalHistoryFamily || 'Không ghi nhận'}</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="sp-muted-note">
            Bác sĩ chưa cập nhật kết luận tổng thể cho đợt khám này. Bạn vẫn có thể xem các kết quả chuyên khoa đã có bên dưới.
          </p>
        )}
      </section>

      {/* 3. THANH CHỌN 4 NHÓM KẾT QUẢ CHUYÊN MÔN */}
      <div className="sp-clinical-tabs" role="tablist" aria-label="Các mục kết quả khám chuyên môn">
        {CLINICAL_TABS.map((tab) => {
          let countBadge = null;
          if (tab.key === 'SPECIALIST_EXAMS' && specialistExams.length > 0) {
            countBadge = specialistExams.length;
          } else if (tab.key === 'DIAGNOSTIC_REPORTS' && diagnosticReports.length > 0) {
            countBadge = diagnosticReports.length;
          } else if (tab.key === 'LAB_TESTS' && totalLabIndicators > 0) {
            countBadge = totalLabIndicators;
          }

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`sp-clinical-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              {countBadge !== null && <span className="sp-tab-count sp-tabular">{countBadge}</span>}
            </button>
          );
        })}
      </div>

      {/* 4. NỘI DUNG CHI TIẾT CHUYÊN MÔN (CHỈ ĐỌC) */}
      <section className="sp-clinical-body" role="tabpanel">
        {loadingDetail ? (
          <div className="sp-empty-inline">
            <p>Đang nạp dữ liệu phiếu khám chuyên môn...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: THỂ LỰC & SINH TỒN */}
            {activeTab === 'VITAL_SIGNS' && (
              vitalSigns ? (
                <div className="sp-vitals-wrap">
                  <div className="sp-vitals-grid">
                    <div className="sp-vital-cell">
                      <span className="sp-kv-label">Chiều cao</span>
                      <div className="sp-vital-reading sp-tabular">
                        {vitalSigns.heightCm ?? '—'}
                        {vitalSigns.heightCm ? <span className="sp-unit">cm</span> : null}
                      </div>
                    </div>

                    <div className="sp-vital-cell">
                      <span className="sp-kv-label">Cân nặng</span>
                      <div className="sp-vital-reading sp-tabular">
                        {vitalSigns.weightKg ?? '—'}
                        {vitalSigns.weightKg ? <span className="sp-unit">kg</span> : null}
                      </div>
                    </div>

                    <div className="sp-vital-cell">
                      <span className="sp-kv-label">Chỉ số BMI</span>
                      <div className="sp-vital-reading sp-tabular">{vitalSigns.bmi ?? '—'}</div>
                      {bmiEval && <span className={`sp-inline-eval tone-${bmiEval.tone}`}>{bmiEval.text}</span>}
                    </div>

                    <div className="sp-vital-cell">
                      <span className="sp-kv-label">Vòng bụng</span>
                      <div className="sp-vital-reading sp-tabular">
                        {vitalSigns.waistCm ?? '—'}
                        {vitalSigns.waistCm ? <span className="sp-unit">cm</span> : null}
                      </div>
                    </div>

                    <div className="sp-vital-cell">
                      <span className="sp-kv-label">Huyết áp</span>
                      <div className="sp-vital-reading sp-tabular">
                        {vitalSigns.systolicBp || vitalSigns.diastolicBp
                          ? `${vitalSigns.systolicBp || '—'}/${vitalSigns.diastolicBp || '—'}`
                          : '—'}
                        {vitalSigns.systolicBp || vitalSigns.diastolicBp ? <span className="sp-unit">mmHg</span> : null}
                      </div>
                      {bpEval && <span className={`sp-inline-eval tone-${bpEval.tone}`}>{bpEval.text}</span>}
                    </div>

                    <div className="sp-vital-cell">
                      <span className="sp-kv-label">Nhịp tim / Mạch</span>
                      <div className="sp-vital-reading sp-tabular">
                        {vitalSigns.heartRateBpm ?? '—'}
                        {vitalSigns.heartRateBpm ? <span className="sp-unit">lần/phút</span> : null}
                      </div>
                    </div>

                    <div className="sp-vital-cell">
                      <span className="sp-kv-label">Nhịp thở</span>
                      <div className="sp-vital-reading sp-tabular">
                        {vitalSigns.respiratoryRate ?? '—'}
                        {vitalSigns.respiratoryRate ? <span className="sp-unit">lần/phút</span> : null}
                      </div>
                    </div>

                    <div className="sp-vital-cell">
                      <span className="sp-kv-label">Độ bão hòa Oxy (SpO₂)</span>
                      <div className="sp-vital-reading sp-tabular">
                        {vitalSigns.spo2Percent ?? '—'}
                        {vitalSigns.spo2Percent ? <span className="sp-unit">%</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sp-empty-inline">
                  <p>Chưa có dữ liệu đo thể lực &amp; chỉ số sinh tồn cho đợt khám này.</p>
                </div>
              )
            )}

            {/* TAB 2: KHÁM NỘI KHOA */}
            {activeTab === 'INTERNAL_MEDICINE' && (
              internalMedicine ? (
                <div className="sp-internal-wrap">
                  <dl className="sp-def-list">
                    {internalSystems.map((sys) => (
                      <div key={sys.label} className="sp-def-row">
                        <dt>{sys.label}</dt>
                        <dd>{sys.value || 'Chưa ghi nhận bất thường'}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="sp-sub-conclusion">
                    <div>
                      <span className="sp-kv-label">Kết luận Nội khoa</span>
                      <p className="sp-prose-block">{internalMedicine.conclusion || 'Chưa có kết luận chi tiết.'}</p>
                    </div>
                    {internalMedicine.healthClass && (
                      <div className="sp-sub-grade">
                        <span className="sp-kv-label">Phân loại Nội khoa</span>
                        <span className={`sp-grade-pill tone-${getClassificationMeta(internalMedicine.healthClass).tone}`}>
                          {internalMedicine.healthClass}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="sp-empty-inline">
                  <p>Chưa có kết quả khám Nội khoa cho đợt khám này.</p>
                </div>
              )
            )}

            {/* TAB 3: CHUYÊN KHOA LẺ */}
            {activeTab === 'SPECIALIST_EXAMS' && (
              specialistExams.length > 0 ? (
                <div className="sp-exam-list">
                  {specialistExams.map((exam, idx) => {
                    const specName = exam.specialtyName || getSpecialtyDisplayName(exam.specialtyType);
                    const specGrade = exam.healthClass ? getClassificationMeta(exam.healthClass) : null;

                    return (
                      <div key={exam.specialistExamId || `${exam.specialtyType}-${idx}`} className="sp-exam-item">
                        <div className="sp-exam-item-head">
                          <h4>{specName}</h4>
                          {specGrade && (
                            <span className={`sp-grade-pill tone-${specGrade.tone}`}>{specGrade.label}</span>
                          )}
                        </div>

                        {renderSpecialistFields(exam)}

                        <div className="sp-exam-conclusion">
                          <span className="sp-kv-label">Kết luận chuyên khoa:</span>{' '}
                          <span>{exam.conclusion || 'Chưa có kết luận.'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="sp-empty-inline">
                  <p>Chưa có kết quả khám chuyên khoa lẻ (Mắt, TMH, Răng Hàm Mặt, Da liễu, Ngoại, Phụ khoa) cho đợt khám này.</p>
                </div>
              )
            )}

            {/* TAB 4: CHẨN ĐOÁN HÌNH ẢNH & THĂM DÒ CHỨC NĂNG */}
            {activeTab === 'DIAGNOSTIC_REPORTS' && (
              diagnosticReports.length > 0 ? (
                <div className="sp-exam-list">
                  {diagnosticReports.map((report, idx) => {
                    const modality = MODALITY_CONFIG[report.modalityType] || {
                      label: report.modalityType || 'CĐHA',
                      color: '#0f766e',
                      bgColor: '#f0fdfa',
                    };

                    return (
                      <div key={report.reportId || report.clientKey || idx} className="sp-exam-item">
                        <div className="sp-exam-item-head">
                          <div className="sp-report-title-row">
                            <span
                              className="sp-modality-pill"
                              style={{ color: modality.color, backgroundColor: modality.bgColor }}
                            >
                              {modality.label}
                            </span>
                            <h4>{report.examTitle || `Phiếu ${modality.label}`}</h4>
                          </div>
                          {report.performedAt && (
                            <span className="sp-report-date sp-tabular">{formatDate(report.performedAt)}</span>
                          )}
                        </div>

                        {report.techniqueDescription && (
                          <div className="sp-report-technique">
                            <span className="sp-kv-label">Kỹ thuật thực hiện:</span> {report.techniqueDescription}
                          </div>
                        )}

                        {Array.isArray(report.sections) && report.sections.length > 0 && (
                          <div className="sp-findings-list">
                            {report.sections.map((section) => {
                              const validBullets = (section.bullets || []).filter((b) => String(b).trim());
                              if (validBullets.length === 0) return null;
                              return (
                                <div key={section.key || section.title} className="sp-finding-group">
                                  <span className="sp-finding-title">{section.title}</span>
                                  <ul>
                                    {validBullets.map((bullet, bIdx) => (
                                      <li key={bIdx}>{bullet}</li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="sp-exam-conclusion">
                          <span className="sp-kv-label">Kết luận:</span>{' '}
                          <strong>{report.conclusion || 'Chưa có kết luận.'}</strong>
                        </div>

                        {(report.readingDoctorName || report.approvingDoctorName || report.imageUrls) && (
                          <div className="sp-report-footer">
                            {report.readingDoctorName && <span>Bác sĩ đọc: {report.readingDoctorName}</span>}
                            {report.approvingDoctorName && <span>Bác sĩ duyệt: {report.approvingDoctorName}</span>}
                            {report.imageUrls && (
                              <a
                                href={report.imageUrls}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sp-pdf-link"
                              >
                                Xem hình ảnh đính kèm
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="sp-empty-inline">
                  <p>Chưa có phiếu Chẩn đoán hình ảnh &amp; Thăm dò chức năng nào cho đợt khám này.</p>
                </div>
              )
            )}

            {/* TAB 5: XÉT NGHIỆM CẬN LÂM SÀNG (MÁU, NƯỚC TIỂU) */}
            {activeTab === 'LAB_TESTS' && (
              labTests.length > 0 ? (
                <div className="sp-exam-list">
                  {labTests.map((order) => {
                    const sampleLabel = normalizeSampleType(order.sampleType);
                    const abnCount = countAbnormalResults(order.results);
                    const groups = groupLabResultsByCategory(order.results || []);

                    return (
                      <div key={order.orderId} className="sp-exam-item">
                        <div className="sp-exam-item-head">
                          <div className="sp-report-title-row">
                            <span
                              className="sp-modality-pill"
                              style={{
                                color: sampleLabel.includes('TIỂU') ? '#b45309' : '#b91c1c',
                                backgroundColor: sampleLabel.includes('TIỂU') ? '#fef3c7' : '#fee2e2',
                              }}
                            >
                              {sampleLabel}
                            </span>
                            <h4>
                              Phiếu xét nghiệm #{order.orderId}
                              {order.sampleBarcode ? ` (Mã mẫu: ${order.sampleBarcode})` : ''}
                            </h4>
                          </div>
                          {abnCount > 0 ? (
                            <span className="sp-inline-eval tone-danger">{abnCount} chỉ số cần lưu ý</span>
                          ) : (
                            <span className="sp-inline-eval tone-success">Các chỉ số trong ngưỡng chuẩn</span>
                          )}
                        </div>

                        {groups.length === 0 ? (
                          <p className="sp-muted-note">Phiếu chưa có kết quả chỉ số chi tiết.</p>
                        ) : (
                          groups.map((grp) => (
                            <div key={grp.categoryGroup} className="sp-lab-group">
                              <div className="sp-lab-group-title">{grp.meta.label}</div>
                              <div className="sp-lab-table-wrap">
                                <table className="sp-lab-table">
                                  <thead>
                                    <tr>
                                      <th>Mã</th>
                                      <th>Chỉ số</th>
                                      <th className="sp-num-col">Kết quả</th>
                                      <th>Đơn vị</th>
                                      <th>Tham chiếu</th>
                                      <th>Đánh giá</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {grp.items.map((item) => {
                                      const flag = getLabFlagMeta(item.flag);
                                      const isAbn = flag.code !== 'NORMAL';
                                      return (
                                        <tr
                                          key={item.resultId || item.indicatorId}
                                          className={isAbn ? `sp-lab-row-${flag.tone}` : ''}
                                        >
                                          <td className="sp-lab-code">{item.indicatorCode}</td>
                                          <td>{item.indicatorName}</td>
                                          <td className={`sp-num-col sp-tabular ${isAbn ? `sp-lab-val-${flag.tone}` : ''}`}>
                                            <strong>{item.resultValue}</strong>
                                          </td>
                                          <td className="sp-lab-muted">{item.unit || '—'}</td>
                                          <td className="sp-lab-muted sp-tabular">{item.refTextRange || '—'}</td>
                                          <td>
                                            <span className={`sp-lab-flag tone-${flag.tone}`}>{flag.label}</span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="sp-empty-inline">
                  <p>Chưa có kết quả Xét nghiệm cận lâm sàng (Máu, Nước tiểu) cho đợt khám này.</p>
                </div>
              )
            )}
          </>
        )}
      </section>
    </article>
  );
}
