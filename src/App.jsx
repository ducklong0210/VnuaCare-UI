import AppRouter from './app/AppRouter.jsx'
import { AuthProvider } from './features/auth/context/AuthProvider.jsx'
import { NavigationProvider } from './routers/NavigationProvider.jsx'

function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppRouter />
      </NavigationProvider>
    </AuthProvider>
  )
}

export default App

