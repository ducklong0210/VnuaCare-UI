//
// Component gốc (Root) khởi tạo toàn bộ cây giao diện ứng dụng VnuaCare
// Bọc AuthProvider (xác thực), NavigationProvider (điều hướng) và hiển thị AppRouter phân quyền trang
//

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
