// Component gốc (Root): Điểm khởi đầu của toàn bộ cây giao diện ứng dụng
// Thiết lập 2 Provider toàn cục: AuthProvider (xác thực) và NavigationProvider (điều hướng màn hình)
// Render AppRouter đóng vai trò gác cổng an ninh và điều phối các trang

import AppRouter from './app/AppRouter.jsx';
import { AuthProvider } from './core/contexts/AuthProvider.jsx';
import { NavigationProvider } from './core/contexts/NavigationProvider.jsx';

function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppRouter />
      </NavigationProvider>
    </AuthProvider>
  );
}

export default App;
