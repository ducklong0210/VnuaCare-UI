//
// Điểm khởi chạy đầu tiên của ứng dụng React trên trình duyệt
// Nạp CSS toàn cục và gắn component gốc App vào thẻ #root trong index.html
//

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
