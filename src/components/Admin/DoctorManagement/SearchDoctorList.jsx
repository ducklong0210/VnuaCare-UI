// Component Container quản lý trung tâm dữ liệu và tương tác màn hình Bác sĩ
// Điều phối kết nối API, bộ lọc, bảng danh sách và các hộp thoại Modal Thêm/Sửa/Xóa
// Kết hợp các component con: DoctorFilter, DoctorTable và DoctorDetail

import { useEffect, useState } from 'react';
import { DoctorService } from '../../../services/admin/DoctorService.js';
import { IconPlus, IconCheck, IconClose } from '../../SupportAgent/Icons.jsx';
import DoctorFilter from './DoctorFilter.jsx';
import DoctorTable from './DoctorTable.jsx';
import DoctorDetail from './DoctorDetail.jsx';
import { ModelMode } from '../../../utils/index.js'

// Giá trị mặc định ban đầu của form bác sĩ
const INITIAL_FORM = {
    doctorId: null,
    userId: '',
    doctorCode: '',
    fullName: '',
    email: '',
    specialtyId: '',
    licenseNumber: '',
    hospitalName: 'Bệnh viện Đa khoa MEDLATEC',
};

export default function SearchDoctorList() {
    // Dữ liệu danh sách bác sĩ, chuyên khoa và tài khoản người dùng
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Bộ lọc tìm kiếm và phân trang
    const [search, setSearch] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
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

    // Quản lý Modal Thêm / Sửa bác sĩ
    const [modalMode, setModalMode] = useState(null); // null | ModelMode.CREATE | ModelMode.EDIT
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');
    const [formData, setFormData] = useState(INITIAL_FORM);

    // Quản lý Modal xác nhận xóa bác sĩ
    const [deletingDoctor, setDeletingDoctor] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Tải danh mục Chuyên khoa và User (Role: DOCTOR) khi mở màn hình
    useEffect(() => {
        let isCancelled = false;

        const loadInitialData = async () => {
            try {
                const [specialtyResponse, userResponse] = await Promise.allSettled([
                    DoctorService.getSpecialties(),
                    DoctorService.getUserSelect('DOCTOR'),
                ]);
                if (!isCancelled) {
                    if (specialtyResponse.status === 'fulfilled') {
                        setSpecialties(specialtyResponse.value || []);
                    }
                    if (userResponse.status === 'fulfilled') {
                        setUsersList(userResponse.value || []);
                    }
                }
            } catch {
                // Bỏ qua lỗi tải danh mục
            }
        };

        loadInitialData();

        return () => {
            isCancelled = true;
        };
    }, []);

    // Tải danh sách bác sĩ theo bộ lọc và phân trang
    useEffect(() => {
        let isCancelled = false;

        const loadDoctors = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await DoctorService.getDoctors({
                    textSearch: search.trim(),
                    specialtyId: selectedSpecialty,
                    pageNumber: pageNumber,
                    pageSize: pageSize,
                });
                if (!isCancelled) {
                    setDoctors(res.items || []);
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

        loadDoctors();

        return () => {
            isCancelled = true;
        };
    }, [search, selectedSpecialty, pageNumber, pageSize, refreshKey]);

    // Mở form thêm mới bác sĩ
    const handleOpenCreate = async () => {
        try {
            const data = await DoctorService.getUserSelect('DOCTOR');
            setUsersList(data || []);
        } catch {
            // Bỏ qua lỗi tải danh sách user
        }

        setFormData({
            ...INITIAL_FORM,
            specialtyId: specialties[0]?.specialtyId || '',
        });
        setModalError('');
        setModalMode(ModelMode.CREATE);
    };

    // Mở form chỉnh sửa bác sĩ
    const handleOpenEdit = (doc) => {
        setFormData({
            doctorId: doc.doctorId,
            userId: doc.userId || '',
            doctorCode: doc.doctorCode || '',
            fullName: doc.fullName || '',
            email: doc.email || '',
            specialtyId: doc.specialtyId || '',
            licenseNumber: doc.licenseNumber || '',
            hospitalName: doc.hospitalName || 'Bệnh viện Đa khoa MEDLATEC',
        });
        setModalError('');
        setModalMode(ModelMode.EDIT);
    };

    // Đóng modal thêm / sửa
    const handleCloseModal = () => {
        setModalMode(null);
        setModalError('');
    };

    // Thay đổi trường trong form
    const handleFormChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Gửi dữ liệu form Thêm hoặc Sửa lên API
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError('');

        try {
            if (modalMode === ModelMode.CREATE) {
                if (!formData.userId) {
                    setModalError('Vui lòng chọn tài khoản người dùng liên kết (Role: DOCTOR)');
                    setSubmitting(false);
                    return;
                }

                await DoctorService.createDoctor({
                    doctorId: 0,
                    userId: Number(formData.userId),
                    doctorCode: formData.doctorCode.trim(),
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    specialtyId: Number(formData.specialtyId),
                    licenseNumber: formData.licenseNumber.trim(),
                    hospitalName: formData.hospitalName.trim() || 'Bệnh viện Đa khoa MEDLATEC',
                    isActive: true,
                });
                showToast('Thêm bác sĩ mới thành công!');
            } else if (modalMode === ModelMode.EDIT) {
                await DoctorService.updateDoctor({
                    doctorId: formData.doctorId,
                    doctorCode: formData.doctorCode.trim(),
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    specialtyId: Number(formData.specialtyId),
                    licenseNumber: formData.licenseNumber.trim(),
                    hospitalName: formData.hospitalName.trim() || 'Bệnh viện Đa khoa MEDLATEC',
                    isActive: true,
                });
                showToast('Cập nhật thông tin bác sĩ thành công!');
            }

            handleCloseModal();
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            setModalError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    // Mở hộp thoại xác nhận xóa bác sĩ
    const handleOpenDelete = (doc) => {
        setDeletingDoctor({
            doctorId: doc.doctorId,
            doctorCode: doc.doctorCode,
            fullName: doc.fullName,
        });
    };

    // Xác nhận xóa bác sĩ
    const handleConfirmDelete = async () => {
        if (!deletingDoctor) return;
        setDeleteLoading(true);

        try {
            await DoctorService.deleteDoctor(deletingDoctor.doctorId);
            showToast(`Đã xóa bác sĩ "${deletingDoctor.fullName}" thành công!`);
            setDeletingDoctor(null);
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            showToast(err.message || 'Không thể xóa bác sĩ này');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Đặt lại bộ lọc tìm kiếm
    const handleResetFilter = () => {
        setSearch('');
        setSelectedSpecialty('ALL');
        setPageNumber(1);
    };

    // Tính toán hiển thị phân trang
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const fromRecord = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const toRecord = Math.min(totalCount, pageNumber * pageSize);

    return (
        <div className="admin-page-container">
            {/* Thông báo toast thao tác thành công */}
            {toast && (
                <div className="admin-toast">
                    <IconCheck size={16} />
                    <span>{toast}</span>
                </div>
            )}

            {/* Tiêu đề trang & Nút thêm bác sĩ */}
            <div className="page-header-row">
                <div>
                    <h2 className="main-title">Quản lý đội ngũ bác sĩ</h2>
                    <span className="main-desc">
                        Danh sách bác sĩ phụ trách khám sức khỏe cán bộ ({totalCount} bác sĩ)
                    </span>
                </div>
                <div className="header-btn-group">
                    <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                        <IconPlus size={16} />
                        <span>Thêm bác sĩ</span>
                    </button>
                </div>
            </div>

            {/* Khung nội dung chính: Bảng danh sách & Bộ lọc */}
            <div className="panel-card">
                <DoctorFilter
                    search={search}
                    onSearchChange={(e) => {
                        setSearch(e.target.value);
                        setPageNumber(1);
                    }}
                    selectedSpecialty={selectedSpecialty}
                    onSpecialtyChange={(e) => {
                        setSelectedSpecialty(e.target.value);
                        setPageNumber(1);
                    }}
                    specialties={specialties}
                    onResetFilter={handleResetFilter}
                />

                <DoctorTable
                    doctors={doctors}
                    loading={loading}
                    error={error}
                    onOpenEdit={handleOpenEdit}
                    onOpenDelete={handleOpenDelete}
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
                />
            </div>

            {/* Modal Thêm / Sửa Bác sĩ */}
            <DoctorDetail
                modalMode={modalMode}
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleSubmitForm}
                onClose={handleCloseModal}
                submitting={submitting}
                modalError={modalError}
                specialties={specialties}
                usersList={usersList}
                doctors={doctors}
            />

            {/* Modal Xác nhận Xóa bác sĩ */}
            {deletingDoctor && (
                <div className="modal-backdrop">
                    <div className="modal-card doctor-delete-modal-card">
                        <div className="modal-head">
                            <span className="modal-title-text doctor-delete-modal-title">
                                Xác nhận xóa bác sĩ
                            </span>
                            <button
                                type="button"
                                className="modal-x"
                                onClick={() => setDeletingDoctor(null)}
                            >
                                <IconClose size={16} />
                            </button>
                        </div>

                        <div className="modal-content">
                            <p className="doctor-delete-modal-text">
                                Bạn có chắc chắn muốn xóa hồ sơ bác sĩ <strong>&quot;{deletingDoctor.fullName}&quot;</strong> (Mã BS: {deletingDoctor.doctorCode}) không?
                            </p>
                            <p className="doctor-delete-modal-warn">
                                ⚠ Hành động này sẽ khóa hồ sơ và tài khoản của bác sĩ này.
                            </p>
                        </div>

                        <div className="modal-foot">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setDeletingDoctor(null)}
                                disabled={deleteLoading}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn doctor-delete-confirm-btn"
                                onClick={handleConfirmDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
