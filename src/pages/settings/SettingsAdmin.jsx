//
// Trang Cài đặt tài khoản cá nhân và đổi mật khẩu
// Bọc khung giao diện MainLayout và hiển thị component xử lý chính Settings
//

import MainLayout from "../../core/layouts/MainLayout";
import Settings from "../../components/Admin/SettingManagerment/Settings";


export default function SettingsAdmin(){
    return(
    <MainLayout activeTab="settings">
        <Settings/>
    </MainLayout>
)
}
