
import MainLayout from "../../core/layouts/MainLayout";
import Settings from "../../components/Admin/SettingManagerment/Settings";


export default function SettingsAdmin(){
    return(
    <MainLayout activeTab="settings">
        <Settings/>
    </MainLayout>
)
}
