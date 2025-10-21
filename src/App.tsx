import './styles/index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Productos from './pages/Productos'
import ProductoDetalle from './pages/ProductoDetalle'
import Carrito from './pages/Carrito'
import MisCompras from './pages/MisCompras'
import Recetas from './pages/Recetas'
import SubirReceta from './pages/SubirReceta'
import Ofertas from './pages/Ofertas'
import Perfil from './pages/Perfil'
import AdminUsuarios from './pages/AdminUsuarios'
import AdminProductos from './pages/AdminProductos'
import AdminRecetas from './pages/AdminRecetas'
import Analitica from './pages/Analitica'
import NotFound from './pages/NotFound'
import { ProtectedRoute } from './hooks/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/:id" element={<ProductoDetalle />} />
        <Route path="/ofertas" element={<Ofertas />} />

        {/* Rutas protegidas - Usuario autenticado */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/mis-compras" element={<MisCompras />} />
          <Route path="/recetas" element={<Recetas />} />
          <Route path="/subir-receta" element={<SubirReceta />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* Rutas protegidas - Solo Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/productos" element={<AdminProductos />} />
          <Route path="/admin/recetas" element={<AdminRecetas />} />
          <Route path="/admin/analitica" element={<Analitica />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
