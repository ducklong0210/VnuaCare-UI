import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Cấu hình Vite tự chuyển tiếp sang https://localhost:44310/api
    proxy: {
      '/api': {
        target: 'https://localhost:44310',
        changeOrigin: true,
        secure: false, // Bỏ qua kiểm tra chứng chỉ SSL tự ký của localhost
      },
    },
  },
})
