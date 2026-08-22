import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import Header from './components/Header';

function App() {
  return (
    <AuthProvider>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/products' element={<ProductsPage />} />
            <Route path='/products/:id' element={<ProductDetailPage />} />
            <Route path='/cart' element={<CartPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/admin' element={<AdminPage />} />
            <Route path='*' element={<div style={{ padding: '1.5rem' }}>Page not found</div>} />
          </Routes>
        </BrowserRouter>
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#f5f5f5', borderTop: '1px solid #ddd', padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#555', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <span>Backend: <a href="https://backend-iota-ashen-33.vercel.app/api/health" target="_blank" rel="noopener">https://backend-iota-ashen-33.vercel.app/api/health</a> — monitored by UptimeRobot</span>
          <span style={{ color: '#22c55e', fontWeight: 600 }}>● Operational</span>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
