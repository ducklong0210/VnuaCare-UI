// Component Container quản lý trung tâm dữ liệu và tương tác màn hình Tài khoản
// Điều phối kết nối AccountService, bộ lọc tìm kiếm, bảng tài khoản và các modal quản trị
// Kết hợp các component con: AccountFilter, AccountTable và AccountDetail

import { useEffect, useState } from 'react';
import { AccountService } from '../../../services/admin/AccountService.js';
import { IconPlus, IconCheck, IconClose } from '../../SupportAgent/Icons.jsx';
import AccountFilter from './AccountFilter.jsx';
import AccountTable from './AccountTable.jsx';
import AccountDetail from './AccountDetail.jsx';
import { ROLES } from '../../../utils/index.js';

export default function SearchAccountList() {
    // Dữ liệu danh sách người dùng
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Bộ lọc tìm kiếm & Phân trang
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('ALL');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Thông báo toast
    const [toast, setToast] = useState('');
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    };

    // Quản lý Modal (Thêm / Sửa)
    const [modalMode, setModalMode] = useState(null); // null | ModelMode.CREATE | ModelMode.EDIT
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');
    const [formData, setFormData] = useState({
        userId: null,
        username: '',
        password: '',
        email: '',
        role: ROLES.STAFF,
        isActive: true,
    });

    // Quản lý Modal xác nhận xóa
    const [deletingUser, setDeletingUser] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Tải danh sách người dùng mỗi khi bộ lọc thay đổi hoặc sau khi thêm/sửa/xóa
    useEffect(() => {
        let isCancelled = false;

        const loadUsers = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await AccountService.getAccounts({
                    textSearch: search.trim(),
                    role: role === 'ALL' ? '' : role,
                    pageNumber: pageNumber,
                    pageSize: pageSize,
                });
                if (!isCancelled) {
                    setUsers(data.items || []);
                    setTotalCount(data.totalCount || 0);
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

        loadUsers();

        return () => {
            isCancelled = true;
        };
    }, [search, role, pageNumber, pageSize, refreshKey]);

    // Mở modal tạo mới tài khoản
    const handleOpenCreate = () => {
        setFormData({
            userId: null,
            username: '',
            password: '',
            email: '',
            role: 'STAFF',
            isActive: true,
        });
        setModalError('');
        setModalMode(ModelMode.CREATE);
    };

    // Mở modal sửa tài khoản
    const handleOpenEdit = (user) => {
        setFormData({
            userId: user.userId,
            username: user.username,
            password: '',
            email: user.email || '',
            role: user.role || 'STAFF',
            isActive: Boolean(user.isActive),
        });
        setModalError('');
        setModalMode(ModelMode.EDIT);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setModalMode(null);
        setModalError('');
    };

    // Thay đổi trường form
    const handleFormChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Gửi form Thêm / Sửa
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError('');

        try {
            if (modalMode === ModelMode.CREATE) {
                await AccountService.createAccount({
                    username: formData.username.trim(),
                    password: formData.password,
                    email: formData.email.trim(),
                    role: formData.role,
                });
                showToast('Thêm tài khoản người dùng thành công!');
            } else if (modalMode === ModelMode.EDIT) {
                await AccountService.updateAccount({
                    userId: formData.userId,
                    email: formData.email.trim(),
                    role: formData.role,
                    isActive: formData.isActive,
                });
                showToast('Cập nhật tài khoản người dùng thành công!');
            }

            handleCloseModal();
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            setModalError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    // Mở hộp thoại xác nhận xóa trên màn hình
    const handleOpenDelete = (user) => {
        setDeletingUser({ userId: user.userId, username: user.username });
    };

    // Thực hiện xóa sau khi xác nhận
    const handleConfirmDelete = async () => {
        if (!deletingUser) return;
        setDeleteLoading(true);

        try {
            await AccountService.deleteAccount(deletingUser.userId);
            showToast(`Đã xóa tài khoản "${deletingUser.username}" thành công!`);
            setDeletingUser(null);
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            showToast(err.message || 'Không thể xóa tài khoản này');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Đặt lại bộ lọc
    const handleResetFilter = () => {
        setSearch('');
        setRole('ALL');
        setPageNumber(1);
    };

    // Tính toán phân trang
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const fromRecord = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const toRecord = Math.min(totalCount, pageNumber * pageSize);

    return (
        <div className="admin-page-container">
            {/* Thông báo Toast góc phải */}
            {toast && (
                <div className="admin-toast">
                    <IconCheck size={16} />
                    <span>{toast}</span>
                </div>
            )}

            {/* Tiêu đề trang & Nút thêm tài khoản */}
            <div className="page-header-row">
                <div>
                    <h2 className="main-title">Quản lý người dùng</h2>
                    <span className="main-desc">
                        Danh sách tài khoản và phân quyền hệ thống ({totalCount} tài khoản)
                    </span>
                </div>
                <div className="header-btn-group">
                    <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                        <IconPlus size={16} />
                        <span>Thêm tài khoản</span>
                    </button>
                </div>
            </div>

            {/* Khung nội dung chính */}
            <div className="panel-card">
                <AccountFilter
                    search={search}
                    onSearchChange={(e) => {
                        setSearch(e.target.value);
                        setPageNumber(1);
                    }}
                    role={role}
                    onRoleChange={(e) => {
                        setRole(e.target.value);
                        setPageNumber(1);
                    }}
                    onResetFilter={handleResetFilter}
                />

                <AccountTable
                    users={users}
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

            {/* Modal Thêm / Sửa người dùng */}
            <AccountDetail
                modalMode={modalMode}
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleSubmitForm}
                onClose={handleCloseModal}
                submitting={submitting}
                modalError={modalError}
            />

            {/* Modal Xác nhận Xóa tài khoản */}
            {deletingUser && (
                <div className="modal-backdrop">
                    <div className="modal-card user-delete-modal-card">
                        <div className="modal-head">
                            <span className="modal-title-text user-delete-modal-title">
                                Xác nhận xóa tài khoản
                            </span>
                            <button
                                type="button"
                                className="modal-x"
                                onClick={() => setDeletingUser(null)}
                            >
                                <IconClose size={16} />
                            </button>
                        </div>

                        <div className="modal-content">
                            <p className="user-delete-modal-text">
                                Bạn có chắc chắn muốn xóa tài khoản <strong>&quot;{deletingUser.username}&quot;</strong> không?
                            </p>
                            <p className="user-delete-modal-warn">
                                ⚠ Hành động này sẽ khóa vĩnh viễn tài khoản người dùng này trong hệ thống.
                            </p>
                        </div>

                        <div className="modal-foot">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setDeletingUser(null)}
                                disabled={deleteLoading}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn user-delete-confirm-btn"
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
