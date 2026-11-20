// Tab 3: Khám chuyên khoa lẻ lâm sàng (Mắt, Tai Mũi Họng, Răng Hàm Mặt, Da liễu, Ngoại khoa, Phụ khoa)
// Giao diện 2 cột: menu chọn chuyên khoa bên trái, form nhập kết quả chuyên môn tương ứng bên phải
// Bác sĩ nhập thị lực Snellen, công thức răng, mô tả bệnh lý và xếp loại sức khỏe cho từng chuyên khoa

import { useEffect, useState } from 'react';
import {
  getSpecialistExamsApi,
  createSpecialistExamApi,
  updateSpecialistExamApi,
} from '../../../../api/specialistExamApi.js';
import { getSpecialtiesApi } from '../../../../api/recordApi.js';
import { CLINICAL_SPECIALTIES_CONFIG } from '../../../../models/SpecialistExam.js';
import { IconCheck, IconRefreshCw } from '../../../SupportAgent/Icons.jsx';
const INITIAL_EXAM = {
  specialistExamId: null,
  specialtyType: 'EYE',
  visionLeftNoGlass: '',
  visionRightNoGlass: '',
  visionLeftGlass: '',
  visionRightGlass: '',
  upperJaw: '',
  lowerJaw: '',
  teethFormula: '',
  earLeftDesc: '',
  earRightDesc: '',
  noseDesc: '',
  throatDesc: '',
  skinDesc: '',
  surgicalDesc: '',
  obstetricDesc: '',
  conclusion: '',
  healthClass: '',
  examiningDoctorId: '',
};

export default function SpecialistExamsTab({ recordId, doctorsList = [], classifications = [], showToast }) {
  // Danh sách các chuyên khoa lâm sàng đồng bộ từ CSDL
  const [specialtiesList, setSpecialtiesList] = useState(() =>
    CLINICAL_SPECIALTIES_CONFIG.map((item) => ({
      code: item.code,
      specialtyId: item.specialtyId,
      name: item.defaultName,
      desc: item.desc,
    }))
  );

  // Chuyên khoa đang được chọn xem
  const [activeSpecialty, setActiveSpecialty] = useState('EYE'); // Chuỗi mã chuyên khoa đang chọn (EYE, ENT, DENTAL...)
  // Lưu danh sách kết quả của các chuyên khoa đã khám
  const [examsMap, setExamsMap] = useState({}); // Đối tượng ánh xạ { [mãChuyênKhoa]: dữLiệuPhiếuKhám }

  const [loading, setLoading] = useState(false); // Trạng thái đang tải dữ liệu khám chuyên khoa
  const [saving, setSaving] = useState(false); // Trạng thái đang lưu kết quả chuyên khoa
  const [message, setMessage] = useState(''); // Chuỗi thông báo thành công
  const [error, setError] = useState(''); // Chuỗi thông báo lỗi

  // Tải danh mục chuyên khoa từ DB và kết quả khám của hồ sơ
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      if (!recordId) return;
      setLoading(true);
      setError('');

      try {
        const [examsList, dbSpecialties] = await Promise.allSettled([
          getSpecialistExamsApi(recordId),
          getSpecialtiesApi(),
        ]);

        if (!isCancelled) {
          if (examsList.status === 'fulfilled' && Array.isArray(examsList.value)) {
            const map = {};
            examsList.value.forEach((item) => {
              if (item.specialtyType) {
                map[item.specialtyType.toUpperCase()] = item;
              }
            });
            setExamsMap(map);
          }

          if (dbSpecialties.status === 'fulfilled' && Array.isArray(dbSpecialties.value) && dbSpecialties.value.length > 0) {
            setSpecialtiesList((prev) =>
              prev.map((item) => {
                const match = dbSpecialties.value.find(
                  (s) => s.specialtyId === item.specialtyId || (s.specialtyName && s.specialtyName.toLowerCase().includes(item.name.toLowerCase()))
                );
                if (match) {
                  return {
                    ...item,
                    specialtyId: match.specialtyId,
                    name: match.specialtyName,
                  };
                }
                return item;
              })
            );
          }
        }
      } catch {
        if (!isCancelled) {
          setError('Không thể tải danh sách kết quả khám chuyên khoa');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [recordId]);

  // Lấy dữ liệu của chuyên khoa hiện tại
  const currentFormData = examsMap[activeSpecialty] || {
    ...INITIAL_EXAM,
    specialtyType: activeSpecialty,
  };

  // Cập nhật giá trị trường dữ liệu cho chuyên khoa đang mở
  const handleFieldChange = (field, value) => {
    setExamsMap((prev) => {
      const current = prev[activeSpecialty] || { ...INITIAL_EXAM, specialtyType: activeSpecialty };
      return {
        ...prev,
        [activeSpecialty]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  // Khi chuyển đổi chuyên khoa
  const handleSelectSpecialty = (specCode) => {
    setActiveSpecialty(specCode);
    setMessage('');
    setError('');
  };

  // Lưu kết quả của chuyên khoa đang chọn
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        recordId: Number(recordId),
        specialtyType: activeSpecialty,
        specialistExamId: currentFormData.specialistExamId ? Number(currentFormData.specialistExamId) : undefined,
        visionLeftNoGlass: (currentFormData.visionLeftNoGlass || '').trim() || null,
        visionRightNoGlass: (currentFormData.visionRightNoGlass || '').trim() || null,
        visionLeftGlass: (currentFormData.visionLeftGlass || '').trim() || null,
        visionRightGlass: (currentFormData.visionRightGlass || '').trim() || null,
        upperJaw: (currentFormData.upperJaw || '').trim() || null,
        lowerJaw: (currentFormData.lowerJaw || '').trim() || null,
        teethFormula: (currentFormData.teethFormula || '').trim() || null,
        earLeftDesc: (currentFormData.earLeftDesc || '').trim() || null,
        earRightDesc: (currentFormData.earRightDesc || '').trim() || null,
        noseDesc: (currentFormData.noseDesc || '').trim() || null,
        throatDesc: (currentFormData.throatDesc || '').trim() || null,
        skinDesc: (currentFormData.skinDesc || '').trim() || null,
        surgicalDesc: (currentFormData.surgicalDesc || '').trim() || null,
        obstetricDesc: (currentFormData.obstetricDesc || '').trim() || null,
        conclusion: (currentFormData.conclusion || '').trim() || null,
        healthClass: currentFormData.healthClass || null,
        examiningDoctorId: currentFormData.examiningDoctorId ? Number(currentFormData.examiningDoctorId) : null,
      };

      if (currentFormData.specialistExamId) {
        await updateSpecialistExamApi(payload);
      } else {
        await createSpecialistExamApi(payload);
      }

      // Tải lại danh sách sau khi lưu thành công
      const updatedList = await getSpecialistExamsApi(recordId);
      const map = {};
      updatedList.forEach((item) => {
        if (item.specialtyType) {
          map[item.specialtyType.toUpperCase()] = item;
        }
      });
      setExamsMap(map);

      const successText = 'Đã lưu kết quả khám chuyên khoa thành công!';
      setMessage(successText);
      if (showToast) showToast(successText);
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu kết quả khám chuyên khoa');
    } finally {
      setSaving(false);
    }
  };

  const activeSpecObj = specialtiesList.find((s) => s.code === activeSpecialty) || specialtiesList[0];
  const submitText = saving ? 'Đang lưu kết quả...' : currentFormData.specialistExamId ? 'Cập nhật kết quả' : 'Lưu kết quả khám';

  // Lọc bác sĩ theo chuyên khoa đang chọn dựa trên dữ liệu bảng vc_specialties
  const relevantDoctors = doctorsList.filter((doc) => doc.specialtyId === activeSpecObj?.specialtyId);
  const otherDoctors = doctorsList.filter((doc) => doc.specialtyId !== activeSpecObj?.specialtyId);

  if (loading) {
    return (
      <div className="tab-pane-loading">
        <IconRefreshCw size={24} className="spin-icon" />
        <span>Đang tải kết quả khám các chuyên khoa...</span>
      </div>
    );
  }

  return (
    <div className="specialist-exams-layout">
      {/* Cột danh mục các chuyên khoa lẻ bên trái */}
      <div className="specialty-sidebar">
        <div className="specialty-sidebar-title">DANH MỤC CHUYÊN KHOA</div>
        <div className="specialty-nav-list">
          {specialtiesList.map((spec) => {
            const examData = examsMap[spec.code];
            const isCompleted = Boolean(examData && (examData.conclusion || examData.healthClass));
            const isCurrent = activeSpecialty === spec.code;

            return (
              <button
                key={spec.code}
                type="button"
                className={`specialty-nav-btn ${isCurrent ? 'active' : ''}`}
                onClick={() => handleSelectSpecialty(spec.code)}
              >
                <div className="specialty-btn-info">
                  <span className="specialty-btn-name">{spec.name}</span>
                  <span className={`specialty-btn-status ${isCompleted ? 'completed' : ''}`}>{isCompleted ? (examData.healthClass ? `✓ Đã khám: ${examData.healthClass}` : '✓ Đã có kết quả') : 'Chưa khám'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vùng form nhập kết quả của chuyên khoa được chọn */}
      <form className="specialty-form-area" onSubmit={handleSubmit}>
        <div className="tab-pane-header">
          <div>
            <h3 className="tab-pane-title">Phiếu Kết Quả: {activeSpecObj?.name}</h3>
            <p className="tab-pane-desc">{activeSpecObj?.desc}</p>
          </div>
        </div>

        {error && <div className="alert-tag danger mb-12">{error}</div>}
        {message && (
          <div className="alert-tag success mb-12">
            <IconCheck size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Khám Mắt */}
        {activeSpecialty === 'EYE' && (
          <div className="exam-section-block">
            <div className="exam-block-title">Đo thị lực mắt (Thước thử Snellen)</div>
            <div className="exam-grid-2">
              <div className="form-item">
                <label className="field-label">Thị lực mắt không kính</label>
                <div className="eye-grid">
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Mắt trái (ví dụ: 10/10)"
                    value={currentFormData.visionLeftNoGlass || ''}
                    onChange={(e) => handleFieldChange('visionLeftNoGlass', e.target.value)}
                  />
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Mắt phải (ví dụ: 10/10)"
                    value={currentFormData.visionRightNoGlass || ''}
                    onChange={(e) => handleFieldChange('visionRightNoGlass', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-item">
                <label className="field-label">Thị lực mắt có kính (nếu cận/viễn)</label>
                <div className="eye-grid">
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Mắt trái có kính"
                    value={currentFormData.visionLeftGlass || ''}
                    onChange={(e) => handleFieldChange('visionLeftGlass', e.target.value)}
                  />
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Mắt phải có kính"
                    value={currentFormData.visionRightGlass || ''}
                    onChange={(e) => handleFieldChange('visionRightGlass', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Khám Răng Hàm Mặt */}
        {activeSpecialty === 'DENTAL' && (
          <div className="exam-section-block">
            <div className="exam-block-title">Khám Răng - Hàm - Mặt</div>
            <div className="exam-grid-2">
              <div className="form-item">
                <label className="field-label">Khám hàm trên</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Ví dụ: Răng đều, không sâu, vôi răng độ 1..."
                  value={currentFormData.upperJaw || ''}
                  onChange={(e) => handleFieldChange('upperJaw', e.target.value)}
                />
              </div>

              <div className="form-item">
                <label className="field-label">Khám hàm dưới</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Ví dụ: Răng khôn mọc lệch nhẹ, không viêm..."
                  value={currentFormData.lowerJaw || ''}
                  onChange={(e) => handleFieldChange('lowerJaw', e.target.value)}
                />
              </div>
            </div>

            <div className="form-item mt-12">
              <label className="field-label">Công thức răng bất thường (nếu có)</label>
              <input
                type="text"
                className="text-input"
                placeholder="Ví dụ: R18 mọc lệch, R46 trám Composite"
                value={currentFormData.teethFormula || ''}
                onChange={(e) => handleFieldChange('teethFormula', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Khám Tai Mũi Họng */}
        {activeSpecialty === 'ENT' && (
          <div className="exam-section-block">
            <div className="exam-block-title">Khám Tai - Mũi - Họng</div>
            <div className="exam-grid-2">
              <div className="form-item">
                <label className="field-label">Tai trái</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Màng nhĩ sáng, không viêm, thính lực tốt..."
                  value={currentFormData.earLeftDesc || ''}
                  onChange={(e) => handleFieldChange('earLeftDesc', e.target.value)}
                />
              </div>

              <div className="form-item">
                <label className="field-label">Tai phải</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Màng nhĩ sáng, không sẹo..."
                  value={currentFormData.earRightDesc || ''}
                  onChange={(e) => handleFieldChange('earRightDesc', e.target.value)}
                />
              </div>

              <div className="form-item">
                <label className="field-label">Khám Mũi</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Niêm mạc hồng, vách ngăn thẳng, không cuốn phù nề..."
                  value={currentFormData.noseDesc || ''}
                  onChange={(e) => handleFieldChange('noseDesc', e.target.value)}
                />
              </div>

              <div className="form-item">
                <label className="field-label">Khám Họng & Thanh quản</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Amidan không quá phát, niêm mạc họng bình thường..."
                  value={currentFormData.throatDesc || ''}
                  onChange={(e) => handleFieldChange('throatDesc', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Khám Da liễu */}
        {activeSpecialty === 'DERMATOLOGY' && (
          <div className="exam-section-block">
            <div className="exam-block-title">Khám Da liễu</div>
            <div className="form-item">
              <label className="field-label">Mô tả tổn thương ngoài da</label>
              <textarea
                className="record-textarea"
                placeholder="Da toàn thân bình thường, không nấm, không ban sẩn dị ứng..."
                value={currentFormData.skinDesc || ''}
                onChange={(e) => handleFieldChange('skinDesc', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Khám Ngoại khoa */}
        {activeSpecialty === 'SURGERY' && (
          <div className="exam-section-block">
            <div className="exam-block-title">Khám Ngoại khoa tổng quát</div>
            <div className="form-item">
              <label className="field-label">Mô tả khám ngoại khoa</label>
              <textarea
                className="record-textarea"
                placeholder="Vận động chi tốt, không teo cơ, không thoát vị bẹn, không trĩ..."
                value={currentFormData.surgicalDesc || ''}
                onChange={(e) => handleFieldChange('surgicalDesc', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Khám Sản - Phụ khoa */}
        {activeSpecialty === 'OBSTETRICS' && (
          <div className="exam-section-block">
            <div className="exam-block-title">Khám Sản - Phụ khoa (Dành cho cán bộ nữ)</div>
            <div className="form-item">
              <label className="field-label">Mô tả khám phụ khoa</label>
              <textarea
                className="record-textarea"
                placeholder="Khám phụ khoa định kỳ: Âm đạo, cổ tử cung bình thường, tuyến vú mềm không u cục..."
                value={currentFormData.obstetricDesc || ''}
                onChange={(e) => handleFieldChange('obstetricDesc', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Đánh giá và kết luận của Bác sĩ chuyên khoa */}
        <div className="exam-section-block mt-16">
          <div className="exam-block-title">Đánh giá & Kết luận của Bác sĩ chuyên khoa</div>

          <div className="form-item mb-12">
            <label className="field-label">Kết luận chẩn đoán chuyên khoa</label>
            <textarea
              className="record-textarea"
              placeholder="Ghi rõ kết luận chuyên môn của bác sĩ..."
              value={currentFormData.conclusion || ''}
              onChange={(e) => handleFieldChange('conclusion', e.target.value)}
            />
          </div>

          <div className="exam-grid-2">
            <div className="form-item">
              <label className="field-label">Xếp loại sức khỏe chuyên khoa</label>
              <select className="form-select" value={currentFormData.healthClass || ''} onChange={(e) => handleFieldChange('healthClass', e.target.value)}>
                <option value="">-- Chọn xếp loại --</option>
                {classifications.map((item) => (
                  <option key={item.classificationCode} value={item.classificationCode}>{item.classificationName}</option>
                ))}
              </select>
            </div>

            <div className="form-item">
              <label className="field-label">Bác sĩ chuyên khoa khám</label>
              <select
                className="form-select"
                value={currentFormData.examiningDoctorId || ''}
                onChange={(e) => handleFieldChange('examiningDoctorId', e.target.value)}
              >
                <option value="">-- Chọn bác sĩ --</option>
                {relevantDoctors.length > 0 && (
                  <optgroup label={`Bác sĩ chuyên khoa ${activeSpecObj?.name}`}>
                    {relevantDoctors.map((doc) => (
                      <option key={doc.doctorId} value={doc.doctorId}>{doc.fullName} ({doc.doctorCode})</option>
                    ))}
                  </optgroup>
                )}
                {otherDoctors.length > 0 && (
                  <optgroup label="Bác sĩ chuyên khoa khác">
                    {otherDoctors.map((doc) => (
                      <option key={doc.doctorId} value={doc.doctorId}>{doc.fullName} ({doc.doctorCode}) {doc.specialtyName ? `- ${doc.specialtyName}` : ''}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="tab-pane-footer">
          <button type="submit" className="btn btn-primary" disabled={saving}>{submitText}</button>
        </div>
      </form>
    </div>
  );
}
