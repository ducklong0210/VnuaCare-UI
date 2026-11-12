import AppRouter from './app/AppRouter.jsx'
// Import AuthProvider để cung cấp thông tin tài khoản cho toàn bộ trang web
import { AuthProvider } from './features/auth/context/AuthProvider.jsx'

function App() {
  return (
    // Bọc AuthProvider ngoài cùng để bất kỳ trang nào bên trong cũng biết ai đang đăng nhập
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
