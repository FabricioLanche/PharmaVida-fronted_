import { useState } from 'react'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { productosService } from '../services/productos_y_ofertas/productosAPI'
import { TIPOS_PRODUCTOS } from '../types/producto.types'

function AdminProductos() {
  // Estados para productos
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    tipo: 'Analgesico',
    precio: 0,
    stock: 0,
    requiere_receta: false,
  })

  const [actualizarProducto, setActualizarProducto] = useState({
    id: 0,
    stock: 0,
  })

  const [eliminarProductoId, setEliminarProductoId] = useState(0)

  // Crear producto
  const handleCrearProducto = async () => {
    try {
      const response = await productosService.createProducto(nuevoProducto)
      alert(`✅ Producto creado: ${JSON.stringify(response.data)}`)
      setNuevoProducto({
        nombre: '',
        tipo: 'Analgesico',
        precio: 0,
        stock: 0,
        requiere_receta: false,
      })
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  // Actualizar stock
  const handleActualizarProducto = async () => {
    try {
      const response = await productosService.updateProducto(actualizarProducto.id, {
        stock: actualizarProducto.stock,
      })
      alert(`✅ Producto actualizado: ${JSON.stringify(response.data)}`)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  // Eliminar producto
  const handleEliminarProducto = async () => {
    try {
      await productosService.deleteProducto(eliminarProductoId)
      alert(`✅ Producto eliminado`)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1>Administración de Productos</h1>

        {/* Crear Producto */}
        <section style={{ marginBottom: '3rem', padding: '1rem', border: '1px solid #ddd' }}>
          <h2>Crear Producto</h2>
          <div>
            <label>Nombre: </label>
            <input
              value={nuevoProducto.nombre}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />

            <label>Tipo: </label>
            <select
              value={nuevoProducto.tipo}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, tipo: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            >
              {TIPOS_PRODUCTOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            <label>Precio: </label>
            <input
              type="number"
              value={nuevoProducto.precio}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />

            <label>Stock: </label>
            <input
              type="number"
              value={nuevoProducto.stock}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: Number(e.target.value) })}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />

            <label>
              <input
                type="checkbox"
                checked={nuevoProducto.requiere_receta}
                onChange={(e) =>
                  setNuevoProducto({ ...nuevoProducto, requiere_receta: e.target.checked })
                }
              />
              {' '}Requiere Receta
            </label>

            <button
              onClick={handleCrearProducto}
              style={{
                display: 'block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Crear Producto
            </button>
          </div>
        </section>

        {/* Actualizar Producto */}
        <section style={{ marginBottom: '3rem', padding: '1rem', border: '1px solid #ddd' }}>
          <h2>Actualizar Stock de Producto</h2>
          <div>
            <label>ID del Producto: </label>
            <input
              type="number"
              value={actualizarProducto.id}
              onChange={(e) =>
                setActualizarProducto({ ...actualizarProducto, id: Number(e.target.value) })
              }
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />

            <label>Nuevo Stock: </label>
            <input
              type="number"
              value={actualizarProducto.stock}
              onChange={(e) =>
                setActualizarProducto({ ...actualizarProducto, stock: Number(e.target.value) })
              }
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />

            <button
              onClick={handleActualizarProducto}
              style={{
                display: 'block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f39c12',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Actualizar Producto
            </button>
          </div>
        </section>

        {/* Eliminar Producto */}
        <section style={{ marginBottom: '3rem', padding: '1rem', border: '1px solid #ddd' }}>
          <h2>Eliminar Producto</h2>
          <div>
            <label>ID del Producto: </label>
            <input
              type="number"
              value={eliminarProductoId}
              onChange={(e) => setEliminarProductoId(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />

            <button
              onClick={handleEliminarProducto}
              style={{
                display: 'block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Eliminar Producto
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default AdminProductos
