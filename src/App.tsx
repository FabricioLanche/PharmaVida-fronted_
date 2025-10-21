import './styles/index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/AuthContext'
import { CartProvider } from './hooks/CartContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Productos from './pages/Productos'
import ProductoDetalle from './pages/ProductoDetalle'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import MisCompras from './pages/MisCompras'
import Ofertas from './pages/Ofertas'
import OfertaDetalle from './pages/OfertaDetalle'
import Perfil from './pages/Perfil'
import AdminProductos from './pages/AdminProductos'
import MisRecetas from './pages/MisRecetas'
import RecetaDetalle from './pages/RecetaDetalle'
import AdminRecetas from './pages/AdminRecetas'
import Analitica from './pages/Analitica'
import NotFound from './pages/NotFound'
import { ProtectedRoute } from './hooks/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/ofertas" element={<Ofertas />} />
            <Route path="/oferta/:id" element={<OfertaDetalle />} />
            <Route path="/carrito" element={<Carrito />} />

            {/* Rutas protegidas - Usuario autenticado (CLIENTE o ADMIN) */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'ADMIN']} />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/mis-compras" element={<MisCompras />} />
              <Route path="/recetas" element={<MisRecetas />} />
              <Route path="/receta/:id" element={<RecetaDetalle />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>

            {/* Rutas protegidas - Solo Admin */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/productos" element={<AdminProductos />} />
              <Route path="/admin/recetas" element={<AdminRecetas />} />
              <Route path="/admin/analitica" element={<Analitica />} />
            </Route>

            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
